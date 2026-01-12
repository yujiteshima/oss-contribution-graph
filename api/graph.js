// Vercel Serverless Function - OSS Contribution Graph SVG Generator

import { getDateRange } from '../src/utils/date.js';
import { parseOrgs } from '../src/utils/params.js';
import { getOrgId, getContributions } from '../src/github/contributions.js';
import { generateGridData } from '../src/svg/grid.js';
import { generateSVG } from '../src/svg/generator.js';
import { generateDemoData } from '../src/demo/data.js';

// Main handler
export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate');

  const { username = 'yujiteshima', orgs, months = '6', demo, debug } = req.query;
  const monthsNum = Math.min(Math.max(parseInt(months) || 6, 1), 12);
  const organizations = parseOrgs(orgs);
  const token = process.env.GITHUB_TOKEN;

  // Debug mode
  if (debug === 'true') {
    res.setHeader('Content-Type', 'application/json');
    return res.status(200).json({
      hasToken: !!token,
      tokenLength: token?.length || 0,
      tokenPrefix: token?.substring(0, 4) || 'none',
      username,
      organizations: organizations.map(o => o.name),
    });
  }

  let contributionData;

  if (demo === 'true' || !token) {
    // Demo mode or no token available
    contributionData = generateDemoData(organizations, monthsNum);
  } else {
    // Fetch actual GitHub data
    contributionData = {};
    const { from, to } = getDateRange(monthsNum);

    for (const org of organizations) {
      const orgId = await getOrgId(org.name, token);
      if (orgId) {
        contributionData[org.name] = await getContributions(username, orgId, from, to, token);
      } else {
        contributionData[org.name] = {};
      }
    }
  }

  const gridData = generateGridData(contributionData, organizations, monthsNum);
  const svg = generateSVG(gridData, organizations, monthsNum, username);

  res.setHeader('Content-Type', 'image/svg+xml');
  res.status(200).send(svg);
}
