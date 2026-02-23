# OSS Contribution Graph

[English](README.md) | [日本語](README.ja.md)

A tool that displays contributions to multiple OSS projects in a single color-coded graph. Simply embed it in your GitHub Profile README.

## Preview

![OSS Contribution Graph](https://oss-contribution-graph.vercel.app/api/graph?demo=true)

## Quick Start

Add the following to your GitHub Profile README. Just replace `YOUR_USERNAME` with your GitHub username:

```markdown
![OSS Contributions](https://oss-contribution-graph.vercel.app/api/graph?username=YOUR_USERNAME&auto=true)
```

With `auto=true`, the tool automatically detects organizations you've contributed to via the GitHub API — no manual configuration needed.

### Want to specify organizations manually?

```markdown
![OSS Contributions](https://oss-contribution-graph.vercel.app/api/graph?username=YOUR_USERNAME&orgs=react,vuejs,kubernetes)
```

### Combine auto-detection with manual additions

```markdown
![OSS Contributions](https://oss-contribution-graph.vercel.app/api/graph?username=YOUR_USERNAME&auto=true&orgs=extra-org)
```

## Parameters

| Parameter | Description | Default | Example |
|-----------|-------------|---------|---------|
| `username` | GitHub username | - | `yujiteshima` |
| `auto` | Auto-detect contributed organizations | `false` | `true` |
| `orgs` | Organization settings (comma-separated) | - | `rails,vuejs,kubernetes` |
| `exclude` | Exclude organizations in auto mode (comma-separated) | - | `my-company,work-org` |
| `months` | Display period (1-12) | `6` | `3`, `6`, `12` |
| `format` | Output format | `svg` | `svg`, `png` |
| `demo` | Demo mode | `false` | `true` |

### orgs Parameter Format

**Preset colors (Recommended)** - Just specify organization names:

```
?orgs=rails,vuejs,kubernetes
```

Supported presets include: `vercel`, `vuejs`, `react`, `angular`, `kubernetes`, `docker`, `rails`, `django`, `fastapi`, `nodejs`, `rust-lang`, `golang`, `tensorflow`, `pytorch`, `opencv`, `cupy`, `htmx`, and more.

Aliases are also supported: `k8s` → kubernetes, `go` → golang, `vue` → vuejs, etc.

**Custom colors** - Specify color and label manually:

```
organization:color(6-digit HEX):label
```

Examples:
- `rails:CC0000:Rails` - Display Rails contributions in red with label "Rails"
- `hotwired:1a1a1a:Hotwire` - Display Hotwire contributions in black
- `honojs:E36002:Hono` - Display Hono contributions in orange

**Mixed** - Combine presets and custom:

```
?orgs=rails,vuejs,custom:FFFFFF:My Org
```

## Customization Examples

### Auto-Detection (Simplest)

```markdown
![OSS Contributions](https://oss-contribution-graph.vercel.app/api/graph?username=YOUR_USERNAME&auto=true)
```

### Auto-Detection with Exclusions

```markdown
![OSS Contributions](https://oss-contribution-graph.vercel.app/api/graph?username=YOUR_USERNAME&auto=true&exclude=my-company)
```

### Using Preset Colors

```markdown
![OSS Contributions](https://oss-contribution-graph.vercel.app/api/graph?username=YOUR_USERNAME&orgs=rails,vuejs,kubernetes&months=6)
```

### Custom Colors

```markdown
![OSS Contributions](https://oss-contribution-graph.vercel.app/api/graph?username=YOUR_USERNAME&orgs=rails:CC0000:Rails,hotwired:1a1a1a:Hotwire,honojs:E36002:Hono&months=6)
```

### 3-Month Display

```markdown
![OSS Contributions](https://oss-contribution-graph.vercel.app/api/graph?username=YOUR_USERNAME&orgs=rails&months=3)
```

### PNG Output (for social media sharing)

```markdown
![OSS Contributions](https://oss-contribution-graph.vercel.app/api/graph?username=YOUR_USERNAME&orgs=rails,vuejs&format=png)
```

### OGP Card (for X/Twitter link preview)

Use `/api/card` endpoint for OGP meta tags:

```
https://oss-contribution-graph.vercel.app/api/card?username=YOUR_USERNAME&orgs=rails,vuejs
```

### Demo Mode (Test without token)

```markdown
![OSS Contributions](https://oss-contribution-graph.vercel.app/api/graph?demo=true)
```

## Self-Hosting

If you prefer to host your own instance:

### 1. Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yujiteshima/oss-contribution-graph)

### 2. Set Environment Variables

Configure the following environment variable in the Vercel dashboard:

| Variable | Description |
|----------|-------------|
| `GITHUB_TOKEN` | GitHub Personal Access Token (read:user, read:org scopes) |

### 3. Embed in README.md

Replace the domain with your own deployment URL:

```markdown
![OSS Contributions](https://your-deployment.vercel.app/api/graph?username=YOUR_USERNAME&auto=true)
```

## Local Development

```bash
# Install dependencies
npm install

# Set environment variable
export GITHUB_TOKEN=your_github_token

# Start development server
npm run dev
```

## Required GitHub Token Scopes

- `read:user` - Read user information
- `read:org` - Read organization information (required for fetching organization IDs)

## How It Works

1. Fetch organization ID via GitHub GraphQL API
2. In auto mode, detect organizations from `commitContributionsByRepository`
3. Filter contributions per organization using `contributionsCollection(organizationID: $orgId)`
4. Merge data from multiple organizations
5. Output as SVG image

## Feedback & Contributions

If you find this tool useful, please consider giving it a star! It helps others discover the project.

Have ideas for new features or found a bug? Feel free to open an [issue](https://github.com/yujiteshima/oss-contribution-graph/issues). All feedback and feature requests are welcome!

## License

MIT

## Credits

Inspired by:
- [github-readme-stats](https://github.com/anuraghazra/github-readme-stats)
- [github-readme-activity-graph](https://github.com/Ashutosh00710/github-readme-activity-graph)
