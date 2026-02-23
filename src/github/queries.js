// Query to fetch organization ID
export const ORG_ID_QUERY = `
query($login: String!) {
  organization(login: $login) {
    id
  }
}
`;

// Query to discover organizations the user has contributed to
export const CONTRIBUTED_ORGS_QUERY = `
query($username: String!, $from: DateTime!, $to: DateTime!) {
  user(login: $username) {
    contributionsCollection(from: $from, to: $to) {
      commitContributionsByRepository(maxRepositories: 100) {
        repository {
          isPrivate
          owner {
            __typename
            login
            ... on Organization {
              id
            }
          }
        }
        contributions {
          totalCount
        }
      }
    }
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
