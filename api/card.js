// Vercel Serverless Function - OGP Card for X (Twitter) link preview

export default async function handler(req, res) {
  const { username = 'yujiteshima', orgs, months = '6', demo } = req.query;

  // Build the image URL with same parameters
  // Use http for localhost, https for production
  const host = req.headers.host;
  const protocol = host.includes('localhost') ? 'http' : 'https';
  const baseUrl = `${protocol}://${host}`;
  const params = new URLSearchParams();
  params.set('username', username);
  if (orgs) params.set('orgs', orgs);
  params.set('months', months);
  params.set('format', 'png');
  if (demo === 'true') params.set('demo', 'true');

  const imageUrl = `${baseUrl}/api/graph?${params.toString()}`;
  const pageUrl = `${baseUrl}/api/card?${req.url.split('?')[1] || ''}`;
  const title = `OSS Contributions - ${username}`;
  const description = `GitHub contributions to open source organizations`;

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${title}</title>
  <meta property="og:title" content="${title}">
  <meta property="og:description" content="${description}">
  <meta property="og:image" content="${imageUrl}">
  <meta property="og:url" content="${pageUrl}">
  <meta property="og:type" content="website">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${title}">
  <meta name="twitter:description" content="${description}">
  <meta name="twitter:image" content="${imageUrl}">
</head>
<body>
  <h1>${title}</h1>
  <img src="${imageUrl}" alt="OSS Contribution Graph">
  <p><a href="${imageUrl}">View PNG</a></p>
</body>
</html>`;

  res.setHeader('Content-Type', 'text/html');
  res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate');
  res.status(200).send(html);
}
