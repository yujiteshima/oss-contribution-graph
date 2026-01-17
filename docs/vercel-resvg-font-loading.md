# Vercel Serverless環境でresvg-jsのフォントが表示されない問題を解決するまでの試行錯誤

## はじめに

Vercel Serverless Functions上でresvg-jsを使ってSVGをPNGに変換する際、ローカル環境では正常に表示されるテキストが、Vercel上では全く表示されないという問題に遭遇しました。

この記事では、6つのPRを経て最終的に解決に至るまでの試行錯誤と、得られた知見をまとめます。

## 環境

- `@resvg/resvg-js`: v2.6.2
- フォント: Noto Sans Regular (TTF)
- ES Modules (`"type": "module"`)
- Vercel Serverless Functions (Node.js)

## 問題の症状

- ローカル環境: SVG→PNG変換時にテキストが正しく表示される
- Vercel環境: テキストが全く表示されない（グラフの四角形は表示される）

## 試行錯誤の経緯

### PR #15: process.cwd()でフォントパス解決

**アプローチ:** `process.cwd()`を使ってフォントファイルのパスを解決

```javascript
const fontPath = join(process.cwd(), 'src/png/fonts', 'NotoSans-Regular.ttf');
```

**結果:** ❌ 失敗

**原因:** Vercelのサーバーレス環境では`process.cwd()`が予測不能なパスを返すため、フォントファイルが見つからない。

---

### PR #16: loadSystemFonts: false を追加

**アプローチ:** `import.meta.url`でパス解決し、`loadSystemFonts: false`を追加

```javascript
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const fontPath = join(__dirname, 'fonts', 'NotoSans-Regular.ttf');

const resvg = new Resvg(svg, {
  font: {
    fontBuffers: [fontData],
    loadSystemFonts: false,
    defaultFontFamily: 'Noto Sans',
  },
});
```

**結果:** ❌ 失敗

**原因:** `fontBuffers`でBufferを渡す方式がVercel環境で正しく動作しなかった。

---

### PR #17: Base64フォント埋め込み

**アプローチ:** フォントをBase64エンコードしてSVGの`@font-face`に埋め込み

```javascript
const fontBase64 = fontBuffer.toString('base64');

function embedFontInSvg(svg) {
  const fontFaceCss = `
    @font-face {
      font-family: 'Noto Sans';
      src: url(data:font/truetype;base64,${fontBase64}) format('truetype');
    }
    text { font-family: 'Noto Sans', sans-serif; }
  `;
  return svg.replace('<style>', `<style>${fontFaceCss}`);
}
```

**結果:** ❌ 失敗

**原因:** resvgはSVG内の`@font-face`をパースするが、CSS経由の`font-family`指定を正しく適用しなかった。

---

### PR #18: SVGの`<text>`要素にfont-family属性を追加

**アプローチ:** 各`<text>`要素に直接`font-family`属性を追加

```javascript
const title = `<text font-family="'Noto Sans', sans-serif" ...>Title</text>`;
```

**結果:** ❌ 失敗

**原因:** フォント自体がresvgに渡されていなかった。Base64埋め込みだけでは不十分。

---

### PR #19: fontBuffersを追加

**アプローチ:** `fontBuffers`オプションを追加

```javascript
const resvg = new Resvg(svgWithFont, {
  font: {
    fontBuffers: [fontBuffer],
    loadSystemFonts: false,
    defaultFontFamily: 'Noto Sans',
  },
});
```

**結果:** ❌ 失敗

**原因:** `fontBuffers`はVercel環境で動作しない。メモリ上のBufferを渡す方式に問題があった。

---

### PR #20: fontFilesを使用 ✅

**アプローチ:** `fontBuffers`を`fontFiles`に変更

```javascript
const resvg = new Resvg(svgWithFont, {
  font: {
    fontFiles: [fontPath],  // パスを直接指定
    loadSystemFonts: false,
    defaultFontFamily: 'Noto Sans',
  },
});
```

**結果:** ✅ 成功！

---

## なぜfontFilesで動いたのか

### fontBuffers vs fontFiles

| オプション | 動作 | Vercel対応 |
|-----------|------|-----------|
| `fontBuffers` | メモリ上のBufferデータを渡す | ❌ |
| `fontFiles` | ファイルパスを渡し、resvgが内部でファイルを読み込む | ✅ |

Vercel環境では、`fontFiles`でパスを指定し、`vercel.json`の`includeFiles`でフォントファイルをバンドルすることで、resvgが正しくフォントファイルにアクセスできました。

### 必要だった設定

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

## 最終的に必要だった要素

| 要素 | 必要性 | 説明 |
|------|--------|------|
| `fontFiles: [fontPath]` | ✅ 必須 | resvgにフォントファイルのパスを渡す |
| `loadSystemFonts: false` | ✅ 必須 | システムフォントを探さない |
| `defaultFontFamily: 'Noto Sans'` | ✅ 必須 | デフォルトフォントを指定 |
| `vercel.json`の`includeFiles` | ✅ 必須 | フォントファイルをバンドル |
| SVGの`<text>`に`font-family`属性 | ✅ 必須 | 各テキスト要素にフォント指定 |
| Base64フォント埋め込み | ❌ 不要 | fontFilesを使えば不要 |

## 最終的なコード

### converter.js（最小限の実装）

```javascript
import { Resvg } from '@resvg/resvg-js';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const fontPath = join(__dirname, 'fonts', 'NotoSans-Regular.ttf');

export function convertSvgToPng(svg, scale = 2) {
  const resvg = new Resvg(svg, {
    font: {
      fontFiles: [fontPath],
      loadSystemFonts: false,
      defaultFontFamily: 'Noto Sans',
    },
    fitTo: {
      mode: 'zoom',
      value: scale,
    },
  });

  return resvg.render().asPng();
}
```

### SVG生成（font-family属性が必要）

```javascript
const title = `<text x="40" y="18" font-size="14" font-family="'Noto Sans', sans-serif">Title</text>`;
```

### vercel.json

```json
{
  "functions": {
    "api/**/*.js": {
      "includeFiles": "src/png/fonts/**"
    }
  }
}
```

## 学んだこと

### 1. ローカルとVercelの環境差異

ローカル環境ではOSのシステムフォントが利用可能なため、フォント設定が不完全でもフォールバックで表示されることがある。Vercel Serverless環境にはシステムフォントが存在しないため、明示的なフォント設定が必須。

### 2. resvgのfontBuffersとfontFilesの違い

- `fontBuffers`: メモリ上のBufferを渡す（Vercelで動作しない）
- `fontFiles`: ファイルパスを渡す（Vercelで動作する）

ドキュメントだけでは分からない環境依存の挙動があるため、実際にデプロイしてテストすることが重要。

### 3. 複数の設定が組み合わさって初めて動作する

フォント表示には以下のすべてが必要：
- resvgへのフォント設定（`fontFiles`）
- SVG側のフォント指定（`font-family`属性）
- Vercelへのファイルバンドル設定（`includeFiles`）

どれか1つでも欠けると動作しない。

### 4. デバッグのコツ

- Vercelのプレビューデプロイを活用して、本番環境に近い状態でテスト
- `readdirSync`などでファイルの存在確認ログを出力
- 段階的に設定を追加して、どの組み合わせで動作するか確認

## まとめ

Vercel Serverless環境でresvg-jsを使う場合、`fontFiles`オプションでフォントファイルのパスを指定し、`vercel.json`でファイルをバンドルすることが重要です。`fontBuffers`は動作しないため注意が必要です。

また、SVG側の`<text>`要素に`font-family`属性を明示的に指定することも忘れずに。

この問題の解決には6つのPRと多くの試行錯誤が必要でしたが、結果として得られた知見は貴重なものでした。同じ問題に遭遇した方の参考になれば幸いです。

## 参考リンク

- [resvg-js GitHub](https://github.com/nicedoc/resvg-js)
- [Vercel Functions Configuration](https://vercel.com/docs/functions/configuring-functions)
