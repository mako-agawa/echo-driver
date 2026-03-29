# Echo Driver

個人情報発信サイト。個人開発・ブログ・音楽プラグイン・オリジナル音源を掲載。

## プロジェクト構成

```
echo-driver/
├── api/   # バックエンド（Hono + Cloudflare Workers）
└── web/   # フロントエンド（Astro + Cloudflare Pages）
```

---

## スタックと方針

| レイヤー | 技術 | 備考 |
|---|---|---|
| フロントエンド | Astro | 静的サイト生成 |
| バックエンド | Hono on Cloudflare Workers | |
| ブログ管理 | Notion Database | 記事を Notion で書く |
| DB | Turso（予定） | 必要になれば追加 |
| ファイルストレージ | Cloudflare R2（予定） | 音楽ファイル配信用 |
| CSS | Tailwind v4 | @tailwindcss/vite 使用 |
| パッケージマネージャ | bun | Workers ランタイムは V8 |

---

## api/（Hono + Cloudflare Workers）

### デプロイ先
`https://echo-driver.mako-agawa.workers.dev`

### エンドポイント
- `GET /api/posts` — Published=true の記事一覧
- `GET /api/posts/:slug` — 記事本文（Markdown）

### 環境変数
- `NOTION_TOKEN` — `.dev.vars` に記述（Git 管理外）/ 本番は `wrangler secret put`
- `NOTION_DB_ID` — `wrangler.jsonc` の vars に記述（`332ab3583f2f8064a174df17e84d197f`）

### Notion DB プロパティ
| プロパティ | タイプ |
|---|---|
| Title | Title |
| Slug | Text |
| Published | Checkbox |
| Date | Date |
| Tags | Multi-select |

### 実装方針
- `@notionhq/client` は Workers 環境と非互換 → native fetch で Notion API を直接呼ぶ
- ブロック → Markdown 変換も自前実装（`blocksToMarkdown`）

---

## web/（Astro）

### デザイン
- Stitch（Google）で生成したデザインをベースに移植
- ダークテーマ、Tailwind v4 カスタムテーマ
- フォント: Epilogue（headline）/ Manrope（body）/ Space Grotesk（label）

### ページ構成
- `/` — Hero / Bento Grid / Manifesto
- `/blog` — 記事一覧（Hono API から取得）
- `/blog/[slug]` — 記事本文（ビルド時に静的生成）

### API 取得方針
Astro のビルド時に Hono Workers を fetch して静的ページを生成。
