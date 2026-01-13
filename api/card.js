// Vercel Serverless Function - OGP Card for Social Media Sharing

import { parseOrgs } from '../src/utils/params.js';

export default function handler(req, res) {
  const { username = 'yujiteshima', orgs, months = '6', demo } = req.query;
  const organizations = parseOrgs(orgs);
  const monthsNum = Math.min(Math.max(parseInt(months) || 6, 1), 12);

  // Build the graph image URL
  const baseUrl = `https://${req.headers.host}`;
  const params = new URLSearchParams();
  params.set('username', username);
  params.set('months', monthsNum.toString());
  params.set('format', 'png');
  if (orgs) params.set('orgs', orgs);
  if (demo === 'true') params.set('demo', 'true');

  const imageUrl = `${baseUrl}/api/graph?${params.toString()}`;
  const pageUrl = `${baseUrl}/api/card?${req.url.split('?')[1] || ''}`;
  const title = `OSS Contributions - ${username}`;
  const description = `Contributions to ${organizations.map(o => o.label).join(', ')}`;

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>

  <!-- Open Graph -->
  <meta property="og:type" content="website" />
  <meta property="og:title" content="${title}" />
  <meta property="og:description" content="${description}" />
  <meta property="og:image" content="${imageUrl}" />
  <meta property="og:url" content="${pageUrl}" />

  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${title}" />
  <meta name="twitter:description" content="${description}" />
  <meta name="twitter:image" content="${imageUrl}" />
</head>
<body>
  <img src="${imageUrl}" alt="${title}" style="max-width: 100%;" />
</body>
</html>`;

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate');
  res.status(200).send(html);
}
