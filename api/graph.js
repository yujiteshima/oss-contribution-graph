// Vercel Serverless Function - OSS Contribution Graph SVG/PNG Generator

import { getDateRange } from '../src/utils/date.js';
import { parseOrgs, parseFormat, parseAuto, parseExclude, buildOrganizations } from '../src/utils/params.js';
import { getOrgId, getContributions, detectContributedOrganizations } from '../src/github/contributions.js';
import { generateGridData } from '../src/svg/grid.js';
import { generateSVG } from '../src/svg/generator.js';
import { generateDemoData } from '../src/demo/data.js';
import { convertSvgToPng } from '../src/png/converter.js';

// Main handler
export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate');

  const { username = 'yujiteshima', orgs, months = '6', format, demo, debug, auto, exclude } = req.query;
  const monthsNum = Math.min(Math.max(parseInt(months) || 6, 1), 12);
  const outputFormat = parseFormat(format);
  const isAuto = parseAuto(auto);
  const excludeList = parseExclude(exclude);
  const token = process.env.GITHUB_TOKEN;

  // Resolve organizations
  let organizations;

  if (demo === 'true' || !token) {
    if (isAuto) {
      // Demo mode with auto: use a representative set of presets
      const demoOrgs = parseOrgs('rails,vuejs,kubernetes');
      if (orgs) {
        const manualOrgs = parseOrgs(orgs);
        const manualNames = new Set(manualOrgs.map(o => o.name.toLowerCase()));
        organizations = [
          ...manualOrgs,
          ...demoOrgs.filter(o => !manualNames.has(o.name.toLowerCase())),
        ];
      } else {
        organizations = demoOrgs;
      }
    } else {
      organizations = parseOrgs(orgs);
    }
  } else if (isAuto) {
    const { from, to } = getDateRange(monthsNum);
    const detectedOrgs = await detectContributedOrganizations(username, from, to, token);
    const manualOrgs = orgs ? parseOrgs(orgs) : [];
    organizations = buildOrganizations(detectedOrgs, manualOrgs, excludeList);
  } else {
    organizations = parseOrgs(orgs);
  }

  // Debug mode
  if (debug === 'true') {
    res.setHeader('Content-Type', 'application/json');
    return res.status(200).json({
      hasToken: !!token,
      tokenLength: token?.length || 0,
      tokenPrefix: token?.substring(0, 4) || 'none',
      username,
      organizations: organizations.map(o => ({ name: o.name, hasId: !!o.id })),
      isAuto,
      excludeList,
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
      // Use pre-fetched id from auto-detection when available
      const orgId = org.id || await getOrgId(org.name, token);
      if (orgId) {
        contributionData[org.name] = await getContributions(username, orgId, from, to, token);
      } else {
        contributionData[org.name] = {};
      }
    }
  }

  const gridData = generateGridData(contributionData, organizations, monthsNum);

  if (outputFormat === 'png') {
    const svg = generateSVG(gridData, organizations, monthsNum, username, { forPng: true });
    const png = convertSvgToPng(svg);
    res.setHeader('Content-Type', 'image/png');
    res.status(200).send(png);
  } else {
    const svg = generateSVG(gridData, organizations, monthsNum, username);
    res.setHeader('Content-Type', 'image/svg+xml');
    res.status(200).send(svg);
  }
}
