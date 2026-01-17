# OSS Contribution Graph

[English](README.md) | [日本語](README.ja.md)

A tool that displays contributions to multiple OSS projects in a single color-coded graph. Simply embed it in your GitHub Profile README.

## Preview

![OSS Contribution Graph](https://oss-contribution-graph.vercel.app/api/graph?demo=true)

## Usage

### 1. Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/oss-contribution-graph)

### 2. Set Environment Variables

Configure the following environment variable in the Vercel dashboard:

| Variable | Description |
|----------|-------------|
| `GITHUB_TOKEN` | GitHub Personal Access Token (read:user scope) |

### 3. Embed in README.md

```markdown
![OSS Contributions](https://your-deployment.vercel.app/api/graph?username=YOUR_USERNAME&orgs=rails:CC0000:Rails,hotwired:1a1a1a:Hotwire&months=6)
```

## Parameters

| Parameter | Description | Default | Example |
|-----------|-------------|---------|---------|
| `username` | GitHub username | `yujiteshima` | `yujiteshima` |
| `orgs` | Organization settings (comma-separated) | rails, hotwired | `rails,vuejs,kubernetes` |
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

### Using Preset Colors (Simple)

```markdown
![OSS Contributions](https://your-app.vercel.app/api/graph?username=yujiteshima&orgs=rails,vuejs,kubernetes&months=6)
```

### Rails + Hotwire + Hono (Custom Colors)

```markdown
![OSS Contributions](https://your-app.vercel.app/api/graph?username=yujiteshima&orgs=rails:CC0000:Rails,hotwired:1a1a1a:Hotwire,honojs:E36002:Hono&months=6)
```

### 3-Month Display

```markdown
![OSS Contributions](https://your-app.vercel.app/api/graph?username=yujiteshima&orgs=rails&months=3)
```

### PNG Output (for social media sharing)

```markdown
![OSS Contributions](https://your-app.vercel.app/api/graph?username=yujiteshima&orgs=rails,vuejs&format=png)
```

### OGP Card (for X/Twitter link preview)

Use `/api/card` endpoint for OGP meta tags:

```
https://your-app.vercel.app/api/card?username=yujiteshima&orgs=rails,vuejs
```

### Demo Mode (Test without token)

```markdown
![OSS Contributions](https://your-app.vercel.app/api/graph?demo=true)
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
2. Filter contributions per organization using `contributionsCollection(organizationID: $orgId)`
3. Merge data from multiple organizations
4. Output as SVG image

## License

MIT

## Credits

Inspired by:
- [github-readme-stats](https://github.com/anuraghazra/github-readme-stats)
- [github-readme-activity-graph](https://github.com/Ashutosh00710/github-readme-activity-graph)
