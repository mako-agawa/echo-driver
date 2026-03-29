import { Hono } from 'hono'

type Bindings = {
  NOTION_TOKEN: string
  NOTION_DB_ID: string
}

const NOTION_VERSION = '2022-06-28'

async function notionFetch(path: string, token: string, body?: object) {
  const res = await fetch(`https://api.notion.com/v1${path}`, {
    method: body ? 'POST' : 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      'Notion-Version': NOTION_VERSION,
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  })
  return res.json() as Promise<any>
}

function blocksToMarkdown(blocks: any[]): string {
  return blocks.map((block) => {
    const type = block.type
    const b = block[type]
    const text = (b?.rich_text ?? []).map((t: any) => t.plain_text).join('')

    switch (type) {
      case 'heading_1': return `# ${text}`
      case 'heading_2': return `## ${text}`
      case 'heading_3': return `### ${text}`
      case 'paragraph': return text
      case 'bulleted_list_item': return `- ${text}`
      case 'numbered_list_item': return `1. ${text}`
      case 'code': return `\`\`\`${b.language ?? ''}\n${text}\n\`\`\``
      case 'quote': return `> ${text}`
      case 'divider': return '---'
      default: return text
    }
  }).join('\n\n')
}

const app = new Hono<{ Bindings: Bindings }>()


app.get('/api/posts', async (c) => {
  const data = await notionFetch(`/databases/${c.env.NOTION_DB_ID}/query`, c.env.NOTION_TOKEN, {
    filter: { property: 'Published', checkbox: { equals: true } },
    sorts: [{ property: 'Date', direction: 'descending' }],
  })

  const posts = data.results.map((page: any) => ({
    id: page.id,
    title: page.properties.Title.title[0]?.plain_text ?? '',
    slug: page.properties.Slug.rich_text[0]?.plain_text ?? '',
    date: page.properties.Date.date?.start ?? '',
    tags: page.properties.Tags.multi_select.map((t: any) => t.name),
  }))

  return c.json(posts)
})

app.get('/api/posts/:slug', async (c) => {
  const slug = c.req.param('slug')

  const data = await notionFetch(`/databases/${c.env.NOTION_DB_ID}/query`, c.env.NOTION_TOKEN, {
    filter: { property: 'Slug', rich_text: { equals: slug } },
  })

  if (data.results.length === 0) {
    return c.json({ error: 'Not found' }, 404)
  }

  const page = data.results[0]
  const blocksData = await notionFetch(`/blocks/${page.id}/children`, c.env.NOTION_TOKEN)
  const content = blocksToMarkdown(blocksData.results)

  return c.json({
    id: page.id,
    title: page.properties.Title.title[0]?.plain_text ?? '',
    slug: page.properties.Slug.rich_text[0]?.plain_text ?? '',
    date: page.properties.Date.date?.start ?? '',
    tags: page.properties.Tags.multi_select.map((t: any) => t.name),
    content,
  })
})

export default app
