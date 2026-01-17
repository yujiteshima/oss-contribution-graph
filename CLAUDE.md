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

- [x] [#1](https://github.com/yujiteshima/oss-contribution-graph/issues/1) Add PNG output support for social media sharing
- [ ] [#2](https://github.com/yujiteshima/oss-contribution-graph/issues/2) Add theme support (dark mode and custom color schemes)
- [ ] [#3](https://github.com/yujiteshima/oss-contribution-graph/issues/3) Add option to hide or customize graph title
- [ ] [#4](https://github.com/yujiteshima/oss-contribution-graph/issues/4) Add support for specifying individual repositories
- [ ] [#5](https://github.com/yujiteshima/oss-contribution-graph/issues/5) Publish as npm package
- [ ] [#6] プリセットカラー対応（主要OSSプロジェクト）
- [ ] [#7] アイコン表示対応（ハイブリッド方式）
- [ ] [#8] 自動組織検出（貢献のある組織を自動取得）
- [ ] [#9] 凡例の折り返し対応
- [ ] [#10] 統計情報表示（PR数、マージ数、OPEN PR数など）

## プリセットカラー実装計画

### 背景・目的

現在、組織の色指定は `?orgs=vercel:000000:Vercel` のように手動でHEXカラーを指定する必要がある。
主要なOSSプロジェクトのブランドカラーをプリセットとして保持し、簡単に指定できるようにする。

### 使用例

```
# 現在の指定方法（変更なし）
?orgs=vercel:000000:Vercel,facebook:0081FB:React

# プリセット使用時（新機能）
?orgs=vercel,react,kubernetes
```

### プリセット対象（初期）

| 組織名 | カラー | 出典 |
|--------|--------|------|
| vercel | `#000000` | ブランドガイドライン |
| react / facebook | `#61DAFB` | ロゴ色 |
| vuejs | `#42B883` | ロゴ色 |
| angular | `#DD0031` | ロゴ色 |
| kubernetes | `#326CE5` | ロゴ色 |
| nodejs | `#339933` | ロゴ色 |
| rust-lang | `#DEA584` | ロゴ色 |
| golang | `#00ADD8` | ロゴ色 |
| microsoft | `#00A4EF` | ロゴ色 |
| google | `#4285F4` | ロゴ色 |
| aws | `#FF9900` | ロゴ色 |
| docker | `#2496ED` | ロゴ色 |
| tensorflow | `#FF6F00` | ロゴ色 |
| pytorch | `#EE4C2C` | ロゴ色 |

### 実装方針

1. `src/presets/organizations.js` を作成
2. `parseOrgs` 関数でプリセット解決を追加
3. カラー指定がない場合はプリセットを参照、なければデフォルト色

## アイコン表示実装計画（ハイブリッド方式）

### 背景・目的

OSSプロジェクトの種類が多くなると、色だけでは判別が難しくなる。
アイコンを表示することで視認性を向上させる。

### 採用方式: ハイブリッド方式

複数プロジェクトが重複するセルの表現方法として「ハイブリッド方式」を採用。

```
┌──┐
│◯│ ← 最も貢献が多い組織のアイコン（白抜き）
└──┘
 ↑ 背景色は全組織のグラデーション（現在の実装を維持）
```

**特徴:**
- 背景: 現在のグラデーション表示を維持（複数組織の存在を色で表現）
- 前景: その日で最も貢献数が多い組織のアイコンを白抜きで表示
- ツールチップ: 従来通り全組織の詳細を表示

### 使用例

```
# カラーモード（デフォルト、現在の動作）
?orgs=vercel,react&style=color

# アイコンモード（新機能）
?orgs=vercel,react&style=icon
```

### アイコン取得方法

Simple Icons (https://simpleicons.org/) のサブセットをプリセットとして同梱。
- SVG形式で `src/presets/icons/` に配置
- ライセンス: CC0 1.0 Universal

### 実装フェーズ

**フェーズ1: プリセットカラー**
1. `src/presets/organizations.js` 作成
2. `parseOrgs` でプリセット解決
3. テスト追加

**フェーズ2: アイコン対応**
1. `src/presets/icons/` にSVGアイコン配置
2. `style` パラメータ追加
3. SVG生成時にアイコン埋め込みロジック追加
4. 複数組織重複時は最大貢献組織のアイコンを表示

**フェーズ3: 拡張（将来）**
- カスタムアイコンURL指定
- アイコンサイズ調整オプション

## 自動組織検出実装計画

### 背景・目的

現在はURLで組織を手動指定する必要がある（`?orgs=vercel,react`）。
ユーザーが貢献した組織を自動検出し、設定不要で表示できるようにする。

### 使用例

```
# 自動検出モード（新機能）
?username=yujiteshima&auto=true

# 特定組織のみ除外
?username=yujiteshima&auto=true&exclude=my-company

# 自動検出 + 手動追加の併用
?username=yujiteshima&auto=true&orgs=extra-org
```

### GitHub GraphQL API

```graphql
query($username: String!, $from: DateTime!, $to: DateTime!) {
  user(login: $username) {
    contributionsCollection(from: $from, to: $to) {
      commitContributionsByRepository {
        repository {
          owner {
            login
            ... on Organization {
              id
              name
            }
          }
          name
        }
        contributions {
          totalCount
        }
      }
    }
  }
}
```

### 実現可能性: 高い

**メリット:**
- URL設定が大幅に簡略化
- 新しい貢献先が自動で表示される

**制約:**
- プライベートリポジトリは取得不可（メンバーでない組織）
- API Rate Limit（5000 req/hour）に注意
- 組織数が多い場合のパフォーマンス考慮が必要

### 実装方針

1. `src/github/queries.js` に自動検出用クエリ追加
2. `src/github/contributions.js` に `getContributedOrganizations` 関数追加
3. `api/graph.js` で `auto=true` パラメータ処理
4. プリセットカラーと連携（検出した組織にプリセット色を適用）

## 凡例折り返し実装計画

### 背景・目的

組織数が多くなるとSVGの幅を超えて凡例が見切れる。
自動折り返しで全ての凡例を表示可能にする。

### 現在の問題

```
[React] [Vue] [Angular] [Kubernetes] [Docker] [Node.js]... (はみ出す)
```

### 改善後

```
[React] [Vue] [Angular] [Kubernetes]
[Docker] [Node.js] [Rust] [Go]
```

### 実現可能性: 高い

### 実装方針

1. `src/svg/generator.js` の凡例生成ロジックを修正
2. SVG幅に基づいて自動改行位置を計算
3. 凡例の高さを動的に調整（組織数に応じてSVG全体の高さも変更）

### パラメータ

```
# 凡例の最大列数を指定（オプション）
?legendCols=4
```

## 凡例表示名のリポジトリ名対応

### 背景・目的

現在は組織名がそのまま表示される。
リポジトリ単位で貢献を追跡する場合、リポジトリ名を表示したい。

### 使用例

```
# 組織名表示（現在のデフォルト）
凡例: [facebook] [vercel]

# リポジトリ名表示（新機能）
凡例: [react] [next.js] [turborepo]
```

### 実現可能性: 高い

自動組織検出と組み合わせることで、リポジトリ単位のデータを保持できる。

### 実装方針

1. 内部データ構造をリポジトリ単位に拡張
2. `?groupBy=repo` パラメータで切り替え（デフォルトは `org`）
3. 凡例表示名はリポジトリ名を使用

## 統計情報表示実装計画

### 背景・目的

貢献グラフに加えて、詳細な統計情報を表示したい。
- 各OSSへの総コントリビュート数
- PR作成数、マージ数
- 現在OPENなPR数

### 使用例

```
# 統計情報を含める
?stats=true

# 統計情報のみ（グラフなし）
?statsOnly=true
```

### 表示イメージ

```
┌─────────────────────────────────────────────────────┐
│ 🌈 OSS Contributions - yujiteshima                   │
├─────────────────────────────────────────────────────┤
│ [カレンダーグラフ]                                    │
├─────────────────────────────────────────────────────┤
│ 📊 Statistics (Last 6 months)                        │
│                                                      │
│ Repository      Commits  PRs  Merged  Open          │
│ ─────────────────────────────────────────           │
│ vercel/next.js      45    12     10     2           │
│ facebook/react      23     5      5     0           │
│ vuejs/core          12     3      2     1           │
│ ─────────────────────────────────────────           │
│ Total              80    20     17     3           │
└─────────────────────────────────────────────────────┘
```

### GitHub GraphQL API

```graphql
query($username: String!, $from: DateTime!, $to: DateTime!) {
  user(login: $username) {
    contributionsCollection(from: $from, to: $to) {
      totalCommitContributions
      totalPullRequestContributions
      totalPullRequestReviewContributions
      totalIssueContributions

      commitContributionsByRepository(maxRepositories: 100) {
        repository {
          owner { login }
          name
        }
        contributions { totalCount }
      }

      pullRequestContributionsByRepository(maxRepositories: 100) {
        repository {
          owner { login }
          name
        }
        contributions { totalCount }
      }
    }

    # 現在OPENなPR（組織フィルタなし）
    pullRequests(states: OPEN, first: 100, orderBy: {field: CREATED_AT, direction: DESC}) {
      totalCount
      nodes {
        repository {
          owner { login }
          name
        }
        merged
        state
      }
    }
  }
}
```

### 実現可能性

| 統計項目 | 実現可能性 | 備考 |
|---------|-----------|------|
| コミット数 | **高** | `commitContributionsByRepository` |
| PR作成数 | **高** | `pullRequestContributionsByRepository` |
| マージ数 | **中** | 別クエリで `merged: true` フィルタ必要 |
| OPEN PR数 | **高** | `pullRequests(states: OPEN)` |
| Issue数 | **高** | `issueContributionsByRepository` |
| レビュー数 | **高** | `pullRequestReviewContributions` |

### 実装方針

1. `src/github/queries.js` に統計用クエリ追加
2. `src/github/stats.js` を新規作成
3. `src/svg/stats.js` で統計テーブルSVG生成
4. `src/svg/generator.js` でグラフと統計を結合
5. PNG出力時も統計テーブルを含める

### 実装フェーズ

**フェーズ1: 基本統計**
- コミット数、PR数の取得と表示

**フェーズ2: 詳細統計**
- マージ数、OPEN PR数の追加
- リポジトリ別の内訳表示

**フェーズ3: 拡張**
- Issue数、レビュー数の追加
- 期間比較（前月比など）

## 実装優先順位（推奨）

| 優先度 | 機能 | 理由 |
|--------|------|------|
| 1 | プリセットカラー (#6) | 基盤機能、他の機能の前提 |
| 2 | 自動組織検出 (#8) | UX大幅改善、URL設定不要に |
| 3 | 凡例折り返し (#9) | 自動検出と組み合わせで必須 |
| 4 | 統計情報表示 (#10) | 差別化機能、価値が高い |
| 5 | アイコン表示 (#7) | Nice to have |
| 6 | テーマサポート (#2) | Nice to have |

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

### Vercel Font Loading Issue - Analysis & Solutions

**Problem:** PNG renders correctly on local development but text doesn't appear on Vercel deployment. The font file is not being loaded properly in the serverless environment.

**Root Causes:**
1. Vercel serverless functions have no system fonts - resvg falls back to nothing
2. `process.cwd()` returns unpredictable paths in serverless environment
3. Without `loadSystemFonts: false`, resvg may attempt to load non-existent system fonts
4. File bundling may not work as expected with `vercel.json` `includeFiles`

---

#### Solution 1: Base64 Font Embedding in SVG (Recommended)

**Approach:** Embed the font directly in the SVG using `@font-face` with Base64 data URL.

**Pros:**
- Most robust - font travels with the SVG itself
- No file system access required
- Works in any environment (Vercel, AWS Lambda, etc.)
- Completely eliminates path resolution issues

**Cons:**
- Increases SVG size significantly (~400KB for Noto Sans)
- Slight performance overhead for encoding

**Implementation:**
```javascript
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load and encode font at module initialization
const fontPath = join(__dirname, 'fonts', 'NotoSans-Regular.ttf');
const fontBuffer = readFileSync(fontPath);
const fontBase64 = fontBuffer.toString('base64');

function embedFontInSvg(svg) {
  const fontFaceCss = `
    @font-face {
      font-family: 'Noto Sans';
      src: url(data:font/truetype;base64,${fontBase64}) format('truetype');
    }
  `;
  // Inject into SVG <style> or <defs>
  return svg.replace('<style>', `<style>${fontFaceCss}`);
}

export function convertSvgToPng(svg, scale = 2) {
  const svgWithFont = embedFontInSvg(svg);
  const resvg = new Resvg(svgWithFont, {
    font: {
      loadSystemFonts: false,
      defaultFontFamily: 'Noto Sans',
    },
    fitTo: { mode: 'zoom', value: scale },
  });
  return resvg.render().asPng();
}
```

---

#### Solution 2: import.meta.url + loadSystemFonts: false

**Approach:** Use `import.meta.url` for reliable path resolution and explicitly disable system font loading.

**Pros:**
- Simpler than Base64 embedding
- Smaller bundle size
- Standard ES Module pattern

**Cons:**
- Still depends on Vercel file bundling working correctly
- Need to verify `vercel.json` `includeFiles` configuration

**Implementation:**
```javascript
import { Resvg } from '@resvg/resvg-js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const fontPath = join(__dirname, 'fonts', 'NotoSans-Regular.ttf');
const fontData = readFileSync(fontPath);

export function convertSvgToPng(svg, scale = 2) {
  const resvg = new Resvg(svg, {
    font: {
      fontBuffers: [fontData],
      loadSystemFonts: false,  // Critical: prevents fallback attempts
      defaultFontFamily: 'Noto Sans',
    },
    fitTo: { mode: 'zoom', value: scale },
  });
  return resvg.render().asPng();
}
```

**vercel.json:**
```json
{
  "functions": {
    "api/**/*.js": {
      "includeFiles": "src/png/fonts/**"
    }
  }
}
```

**Debug tip:** Add `readdirSync` logging to verify file existence:
```javascript
import { readdirSync } from 'fs';
console.log('Files in fonts dir:', readdirSync(join(__dirname, 'fonts')));
```

---

#### Solution 3: @resvg/resvg-wasm

**Approach:** Use the WebAssembly version instead of native Node.js bindings.

**Pros:**
- Pure WebAssembly - no native dependencies
- More portable across environments
- May handle paths more predictably

**Cons:**
- Different API (async initialization)
- Potentially slightly slower than native version
- Less mature than resvg-js

**Implementation:**
```javascript
import { Resvg, initWasm } from '@resvg/resvg-wasm';
import { readFileSync } from 'fs';

// Initialize WASM (once at startup)
await initWasm(fetch('https://unpkg.com/@aspect/resvg-wasm/index_bg.wasm'));

export async function convertSvgToPng(svg, fontBuffer, scale = 2) {
  const resvg = new Resvg(svg, {
    font: {
      fontBuffers: [fontBuffer],
      loadSystemFonts: false,
    },
    fitTo: { mode: 'zoom', value: scale },
  });
  return resvg.render().asPng();
}
```

---

#### Recommended Strategy

1. **First attempt:** Solution 2 (import.meta.url + loadSystemFonts: false)
   - Simplest change from current implementation
   - Add debug logging to verify file paths on Vercel

2. **If Solution 2 fails:** Solution 1 (Base64 embedding)
   - Most reliable approach
   - Eliminates all file system dependencies

3. **If performance is critical:** Consider Solution 3 (resvg-wasm)
   - Better cross-platform compatibility
   - Worth exploring if native bindings cause issues

**Key checklist for any solution:**
- [ ] Set `loadSystemFonts: false` explicitly
- [ ] Ensure SVG `font-family` matches font name exactly ("Noto Sans")
- [ ] Use `import.meta.url` for ES Module path resolution
- [ ] Test with debug logging on Vercel preview deployment
