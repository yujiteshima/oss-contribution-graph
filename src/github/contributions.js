import { fetchGitHub } from './client.js';
import { ORG_ID_QUERY, CONTRIBUTION_QUERY, CONTRIBUTED_ORGS_QUERY } from './queries.js';

// Fetch organization ID
export async function getOrgId(orgName, token) {
  try {
    const result = await fetchGitHub(ORG_ID_QUERY, { login: orgName }, token);
    return result.data?.organization?.id || null;
  } catch (e) {
    console.error(`Failed to get org ID for ${orgName}:`, e);
    return null;
  }
}

// Detect organizations the user has contributed to
export async function detectContributedOrganizations(username, from, to, token) {
  try {
    const result = await fetchGitHub(CONTRIBUTED_ORGS_QUERY, {
      username,
      from: from.toISOString(),
      to: to.toISOString(),
    }, token);

    const repos = result.data?.user?.contributionsCollection?.commitContributionsByRepository;
    if (!repos) return [];

    const orgMap = new Map();
    for (const repo of repos) {
      if (repo.repository.isPrivate) continue;
      const owner = repo.repository.owner;
      if (owner.__typename !== 'Organization') continue;

      const login = owner.login;
      const id = owner.id;
      const count = repo.contributions.totalCount;

      if (orgMap.has(login)) {
        orgMap.get(login).totalContributions += count;
      } else {
        orgMap.set(login, { login, id, totalContributions: count });
      }
    }

    return Array.from(orgMap.values())
      .sort((a, b) => b.totalContributions - a.totalContributions);
  } catch (e) {
    console.error('Failed to detect contributed organizations:', e);
    return [];
  }
}

// Fetch contribution data
export async function getContributions(username, orgId, from, to, token) {
  try {
    const result = await fetchGitHub(CONTRIBUTION_QUERY, {
      username,
      from: from.toISOString(),
      to: to.toISOString(),
      orgId,
    }, token);

    const calendar = result.data?.user?.contributionsCollection?.contributionCalendar;
    if (!calendar) return {};

    const data = {};
    calendar.weeks.forEach(week => {
      week.contributionDays.forEach(day => {
        if (day.contributionCount > 0) {
          data[day.date] = day.contributionCount;
        }
      });
    });

    return data;
  } catch (e) {
    console.error(`Failed to get contributions:`, e);
    return {};
  }
}
