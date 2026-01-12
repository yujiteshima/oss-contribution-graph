import { fetchGitHub } from './client.js';
import { ORG_ID_QUERY, CONTRIBUTION_QUERY } from './queries.js';

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
