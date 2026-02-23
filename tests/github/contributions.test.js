import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../../src/github/client.js', () => ({
  fetchGitHub: vi.fn(),
}));

import { fetchGitHub } from '../../src/github/client.js';
import { detectContributedOrganizations } from '../../src/github/contributions.js';

describe('detectContributedOrganizations', () => {
  const from = new Date('2024-01-01');
  const to = new Date('2024-06-15');

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns organizations sorted by contribution count', async () => {
    fetchGitHub.mockResolvedValue({
      data: {
        user: {
          contributionsCollection: {
            commitContributionsByRepository: [
              {
                repository: { isPrivate: false, owner: { __typename: 'Organization', login: 'rails', id: 'O_abc' } },
                contributions: { totalCount: 10 },
              },
              {
                repository: { isPrivate: false, owner: { __typename: 'Organization', login: 'vuejs', id: 'O_def' } },
                contributions: { totalCount: 30 },
              },
            ],
          },
        },
      },
    });

    const result = await detectContributedOrganizations('user', from, to, 'token');
    expect(result).toHaveLength(2);
    expect(result[0].login).toBe('vuejs');
    expect(result[0].totalContributions).toBe(30);
    expect(result[0].id).toBe('O_def');
    expect(result[1].login).toBe('rails');
    expect(result[1].totalContributions).toBe(10);
  });

  it('deduplicates organizations across multiple repos', async () => {
    fetchGitHub.mockResolvedValue({
      data: {
        user: {
          contributionsCollection: {
            commitContributionsByRepository: [
              {
                repository: { isPrivate: false, owner: { __typename: 'Organization', login: 'rails', id: 'O_abc' } },
                contributions: { totalCount: 5 },
              },
              {
                repository: { isPrivate: false, owner: { __typename: 'Organization', login: 'rails', id: 'O_abc' } },
                contributions: { totalCount: 8 },
              },
            ],
          },
        },
      },
    });

    const result = await detectContributedOrganizations('user', from, to, 'token');
    expect(result).toHaveLength(1);
    expect(result[0].login).toBe('rails');
    expect(result[0].totalContributions).toBe(13);
  });

  it('filters out personal repos (User owners)', async () => {
    fetchGitHub.mockResolvedValue({
      data: {
        user: {
          contributionsCollection: {
            commitContributionsByRepository: [
              {
                repository: { isPrivate: false, owner: { __typename: 'User', login: 'someuser' } },
                contributions: { totalCount: 50 },
              },
              {
                repository: { isPrivate: false, owner: { __typename: 'Organization', login: 'rails', id: 'O_abc' } },
                contributions: { totalCount: 10 },
              },
            ],
          },
        },
      },
    });

    const result = await detectContributedOrganizations('user', from, to, 'token');
    expect(result).toHaveLength(1);
    expect(result[0].login).toBe('rails');
  });

  it('filters out private repositories', async () => {
    fetchGitHub.mockResolvedValue({
      data: {
        user: {
          contributionsCollection: {
            commitContributionsByRepository: [
              {
                repository: { isPrivate: true, owner: { __typename: 'Organization', login: 'my-company', id: 'O_priv' } },
                contributions: { totalCount: 100 },
              },
              {
                repository: { isPrivate: false, owner: { __typename: 'Organization', login: 'rails', id: 'O_abc' } },
                contributions: { totalCount: 10 },
              },
            ],
          },
        },
      },
    });

    const result = await detectContributedOrganizations('user', from, to, 'token');
    expect(result).toHaveLength(1);
    expect(result[0].login).toBe('rails');
  });

  it('returns empty array on API error', async () => {
    fetchGitHub.mockRejectedValue(new Error('API error'));
    const result = await detectContributedOrganizations('user', from, to, 'token');
    expect(result).toEqual([]);
  });

  it('returns empty array when no contribution data', async () => {
    fetchGitHub.mockResolvedValue({
      data: { user: { contributionsCollection: { commitContributionsByRepository: [] } } },
    });
    const result = await detectContributedOrganizations('user', from, to, 'token');
    expect(result).toEqual([]);
  });

  it('returns empty array when response structure is missing', async () => {
    fetchGitHub.mockResolvedValue({ data: { user: null } });
    const result = await detectContributedOrganizations('user', from, to, 'token');
    expect(result).toEqual([]);
  });
});
