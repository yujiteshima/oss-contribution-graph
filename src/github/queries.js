// Query to fetch organization ID
export const ORG_ID_QUERY = `
query($login: String!) {
  organization(login: $login) {
    id
  }
}
`;

// Query to fetch contribution data
export const CONTRIBUTION_QUERY = `
query($username: String!, $from: DateTime!, $to: DateTime!, $orgId: ID) {
  user(login: $username) {
    contributionsCollection(from: $from, to: $to, organizationID: $orgId) {
      contributionCalendar {
        totalContributions
        weeks {
          contributionDays {
            contributionCount
            date
          }
        }
      }
    }
  }
}
`;
