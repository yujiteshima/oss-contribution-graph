# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

OSS Contribution Graph is a Vercel serverless application that displays GitHub contributions from multiple open-source organizations in a single SVG graph. Users embed this as an image in their GitHub Profile README.

## Commands

```bash
npm run dev          # Start local Vercel dev server
npm test             # Run tests in watch mode
npm run test:run     # Run tests once (used in CI)
npm run test:coverage # Generate coverage report
npm run deploy       # Deploy to Vercel production
```

## Architecture

The application follows a clear data flow:

```
HTTP Request → api/graph.js → GitHub API (or demo data) → SVG generation → Response
```

**Key modules:**

- `api/graph.js` - Single Vercel serverless endpoint, handles HTTP request/response
- `src/github/` - GitHub GraphQL API integration (client, queries, contribution parsing)
- `src/svg/` - SVG generation (colors/blending, grid structure, complete SVG output)
- `src/utils/` - Date range calculation and URL parameter parsing
- `src/demo/` - Fake contribution data for testing without GitHub token

**API endpoint:** `/api/graph`

Query parameters: `username`, `orgs` (format: `org:HEX_COLOR:LABEL`), `months` (1-12), `demo`, `debug`

## Key Technical Details

- ES modules (`"type": "module"`)
- No production dependencies - uses native fetch API
- GitHub GraphQL API requires `GITHUB_TOKEN` env var with `read:user, read:org` scopes
- SVG output includes hover effects, tooltips, and gradient fills for multi-org contribution days
- Cell size scales based on display months (12px for 1-3 months, 10px for 4-8, 7px for 9-12)

## Testing

Tests use Vitest with fake timers (mock date: 2024-06-15). Run a single test file:

```bash
npx vitest tests/utils/date.test.js
```

## Roadmap

- [ ] [#1](https://github.com/yujiteshima/oss-contribution-graph/issues/1) Add PNG output support for social media sharing
- [ ] [#2](https://github.com/yujiteshima/oss-contribution-graph/issues/2) Add theme support (dark mode and custom color schemes)
- [ ] [#3](https://github.com/yujiteshima/oss-contribution-graph/issues/3) Add option to hide or customize graph title
- [ ] [#4](https://github.com/yujiteshima/oss-contribution-graph/issues/4) Add support for specifying individual repositories
- [ ] [#5](https://github.com/yujiteshima/oss-contribution-graph/issues/5) Publish as npm package
