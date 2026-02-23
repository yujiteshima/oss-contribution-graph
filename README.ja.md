# OSS Contribution Graph

[English](README.md) | [日本語](README.ja.md)

複数のOSSプロジェクトへの貢献を色分けして1つのグラフに表示するツールです。
GitHub Profile READMEに貼り付けるだけで使えます。

## プレビュー

![OSS Contribution Graph](https://oss-contribution-graph.vercel.app/api/graph?demo=true)

## クイックスタート

以下をGitHub Profile READMEに追加してください。`YOUR_USERNAME` を自分のGitHubユーザー名に置き換えるだけでOKです：

```markdown
![OSS Contributions](https://oss-contribution-graph.vercel.app/api/graph?username=YOUR_USERNAME&auto=true)
```

`auto=true` を指定すると、GitHub APIを通じて貢献のある組織を自動検出します。手動での設定は不要です。

### 組織を手動で指定したい場合

```markdown
![OSS Contributions](https://oss-contribution-graph.vercel.app/api/graph?username=YOUR_USERNAME&orgs=react,vuejs,kubernetes)
```

### 自動検出 + 手動追加の併用

```markdown
![OSS Contributions](https://oss-contribution-graph.vercel.app/api/graph?username=YOUR_USERNAME&auto=true&orgs=extra-org)
```

## パラメータ

| パラメータ | 説明 | デフォルト | 例 |
|-----------|------|-----------|-----|
| `username` | GitHubユーザー名 | - | `yujiteshima` |
| `auto` | 貢献のある組織を自動検出 | `false` | `true` |
| `orgs` | 組織設定 (カンマ区切り) | - | `rails,vuejs,kubernetes` |
| `exclude` | 自動検出から除外する組織 (カンマ区切り) | - | `my-company,work-org` |
| `months` | 表示期間 (1-12) | `6` | `3`, `6`, `12` |
| `format` | 出力形式 | `svg` | `svg`, `png` |
| `demo` | デモモード | `false` | `true` |

### orgs パラメータの形式

**プリセットカラー（推奨）** - 組織名を指定するだけ:

```
?orgs=rails,vuejs,kubernetes
```

対応プリセット: `vercel`, `vuejs`, `react`, `angular`, `kubernetes`, `docker`, `rails`, `django`, `fastapi`, `nodejs`, `rust-lang`, `golang`, `tensorflow`, `pytorch`, `opencv`, `cupy`, `htmx` など

エイリアスも使用可能: `k8s` → kubernetes, `go` → golang, `vue` → vuejs など

**カスタムカラー** - 色とラベルを手動指定:

```
組織名:色(6桁HEX):ラベル
```

例:
- `rails:CC0000:Rails` - railsの貢献を赤色で表示、ラベルは「Rails」
- `hotwired:1a1a1a:Hotwire` - hotwiredの貢献を黒色で表示
- `honojs:E36002:Hono` - honojsの貢献をオレンジで表示

**混在** - プリセットとカスタムの組み合わせ:

```
?orgs=rails,vuejs,custom:FFFFFF:My Org
```

## カスタマイズ例

### 自動検出（最も簡単）

```markdown
![OSS Contributions](https://oss-contribution-graph.vercel.app/api/graph?username=YOUR_USERNAME&auto=true)
```

### 自動検出 + 特定組織を除外

```markdown
![OSS Contributions](https://oss-contribution-graph.vercel.app/api/graph?username=YOUR_USERNAME&auto=true&exclude=my-company)
```

### プリセットカラーを使用

```markdown
![OSS Contributions](https://oss-contribution-graph.vercel.app/api/graph?username=YOUR_USERNAME&orgs=rails,vuejs,kubernetes&months=6)
```

### カスタムカラー

```markdown
![OSS Contributions](https://oss-contribution-graph.vercel.app/api/graph?username=YOUR_USERNAME&orgs=rails:CC0000:Rails,hotwired:1a1a1a:Hotwire,honojs:E36002:Hono&months=6)
```

### 3ヶ月表示

```markdown
![OSS Contributions](https://oss-contribution-graph.vercel.app/api/graph?username=YOUR_USERNAME&orgs=rails&months=3)
```

### PNG出力（SNS共有用）

```markdown
![OSS Contributions](https://oss-contribution-graph.vercel.app/api/graph?username=YOUR_USERNAME&orgs=rails,vuejs&format=png)
```

### OGPカード（X/Twitterリンクプレビュー用）

`/api/card` エンドポイントでOGPメタタグを取得:

```
https://oss-contribution-graph.vercel.app/api/card?username=YOUR_USERNAME&orgs=rails,vuejs
```

### デモモード（トークンなしで動作確認）

```markdown
![OSS Contributions](https://oss-contribution-graph.vercel.app/api/graph?demo=true)
```

## セルフホスティング

自分でホスティングしたい場合：

### 1. デプロイ

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yujiteshima/oss-contribution-graph)

### 2. 環境変数を設定

Vercelのダッシュボードで以下の環境変数を設定:

| 変数名 | 説明 |
|--------|------|
| `GITHUB_TOKEN` | GitHub Personal Access Token (read:user, read:org スコープ) |

### 3. README.mdに貼り付け

ドメインを自分のデプロイURLに置き換えてください：

```markdown
![OSS Contributions](https://your-deployment.vercel.app/api/graph?username=YOUR_USERNAME&auto=true)
```

## ローカル開発

```bash
# 依存関係をインストール
npm install

# 環境変数を設定
export GITHUB_TOKEN=your_github_token

# 開発サーバーを起動
npm run dev
```

## 必要なGitHub Token スコープ

- `read:user` - ユーザー情報の読み取り
- `read:org` - 組織情報の読み取り（組織IDの取得に必要）

## 仕組み

1. GitHub GraphQL APIで組織IDを取得
2. 自動検出モードでは `commitContributionsByRepository` から貢献のある組織を検出
3. `contributionsCollection(organizationID: $orgId)` で組織ごとの貢献をフィルタリング
4. 複数組織のデータをマージ
5. SVG画像として出力

## フィードバック & コントリビューション

このツールが役に立ったら、ぜひスターをお願いします！より多くの方にプロジェクトを知ってもらう助けになります。

新機能のアイデアやバグの報告は、お気軽に [Issue](https://github.com/yujiteshima/oss-contribution-graph/issues) を作成してください。フィードバックや機能拡張のご意見をお待ちしています！

## ライセンス

MIT

## クレジット

インスピレーション:
- [github-readme-stats](https://github.com/anuraghazra/github-readme-stats)
- [github-readme-activity-graph](https://github.com/Ashutosh00710/github-readme-activity-graph)
