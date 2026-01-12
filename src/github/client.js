const GITHUB_GRAPHQL_API = 'https://api.github.com/graphql';

// Call GitHub API
export async function fetchGitHub(query, variables, token) {
  const response = await fetch(GITHUB_GRAPHQL_API, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query, variables }),
  });

  if (!response.ok) {
    throw new Error(`GitHub API error: ${response.status}`);
  }

  return response.json();
}
