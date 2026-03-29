# Echo Driver

Personal portfolio site — software engineering, music plugins, and original tracks.

![screenshot](docs/screenshot.png)

**Live:** https://echo-driver-web.pages.dev

---

## Stack

| | Tech |
|---|---|
| Frontend | Astro + Tailwind v4 → Cloudflare Pages |
| Backend | Hono → Cloudflare Workers |
| CMS | Notion Database |

## Structure

```
echo-driver/
├── api/   # Hono + Cloudflare Workers
└── web/   # Astro
```

## Development

```bash
# API
cd api && bun run dev

# Web
cd web && bun run dev
```
