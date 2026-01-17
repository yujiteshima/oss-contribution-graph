# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

OSS Contribution Graph is a Vercel serverless application that displays GitHub contributions from multiple open-source organizations in a single SVG graph. Users embed this as an image in their GitHub Profile README.

## Commands

```bash
npm start            # Start local Vercel dev server
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

## OGP Implementation Plan

Goal: Display contribution graph as OGP image when sharing URL on X (Twitter).

### Technical Approach

**PNG Conversion: resvg-js**
- Rust-based SVG renderer compiled to WebAssembly
- Works in Vercel Serverless Functions
- Fast (tens of milliseconds)
- Requires explicit font loading

**Font Handling**
- Bundle font file (TTF/OTF) in project (e.g., `src/png/fonts/`)
- Use Noto Sans or Inter for text rendering
- Emoji (🌈) in title: Remove or replace with text alternative

**SVG Simplification for PNG**
- Remove interactive features (tooltips via `<title>`, hover effects)
- These don't work in static images

### API Design

| Endpoint | Purpose | Response |
|----------|---------|----------|
| `/api/graph?format=svg` | Embeddable SVG (default) | `image/svg+xml` |
| `/api/graph?format=png` | Static image for OGP | `image/png` |
| `/api/card` | OGP HTML with meta tags | `text/html` |

### OGP Meta Tags (api/card.js)

```html
<meta property="og:image" content="https://domain/api/graph?format=png&..." />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:image" content="https://domain/api/graph?format=png&..." />
```

### Dependencies

- `@resvg/resvg-js` - SVG to PNG conversion

### Development & Testing Flow

#### Step 1: Unit Tests
Run PNG conversion tests to verify the module works correctly:
```bash
npm test
# or for a single file
npx vitest tests/png/converter.test.js
```

#### Step 2: Local Browser Check
Start local dev server and verify PNG renders correctly:
```bash
npm start
# Then open in browser:
# http://localhost:3000/api/graph?demo=true&format=png
```

#### Step 3: Deploy to Vercel
Deploy to preview environment:
```bash
vercel
# or for production
npm run deploy
```

#### Step 4: OGP Validation
Test OGP meta tags using external validators:
- Twitter Card Validator: https://cards-dev.twitter.com/validator
- Facebook Debugger: https://developers.facebook.com/tools/debug/

Enter the `/api/card` URL to check if OGP image is recognized.

#### Step 5: Post to X (Twitter)
Final verification by actually posting to X.

**Note:** X caches OGP images aggressively. To force refresh:
- Add a cache-busting parameter (e.g., `&v=2`)
- Or wait a few hours for cache to expire
