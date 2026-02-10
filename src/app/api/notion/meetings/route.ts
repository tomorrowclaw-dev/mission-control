import { NextResponse } from 'next/server'

const NOTION_DB_ID = '3004b298-1cd6-819a-9e2c-c25925f89b20'
const NOTION_API_KEY = process.env.NOTION_API_KEY
const NOTION_VERSION = '2022-06-28'

export async function GET() {
  if (!NOTION_API_KEY) {
    return NextResponse.json({ error: 'Missing Notion API Key' }, { status: 500 })
  }

  try {
    const response = await fetch(`https://api.notion.com/v1/databases/${NOTION_DB_ID}/query`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${NOTION_API_KEY}`,
        'Notion-Version': NOTION_VERSION,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sorts: [{ property: 'Date', direction: 'descending' }],
        page_size: 50,
      }),
      next: { revalidate: 300 },
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Notion API Error:', errorText)
      return NextResponse.json({ error: 'Failed to fetch meetings' }, { status: response.status })
    }

    const data = await response.json()
    const meetings = await Promise.all(data.results.map(async (page: any) => {
      const title = page.properties?.Name?.title?.[0]?.plain_text
        || page.properties?.Title?.title?.[0]?.plain_text
        || 'Untitled Meeting'

      const date = page.properties?.Date?.date?.start || page.created_time

      // Fetch page content
      let content = ''
      try {
        const blocksRes = await fetch(`https://api.notion.com/v1/blocks/${page.id}/children?page_size=100`, {
          headers: {
            'Authorization': `Bearer ${NOTION_API_KEY}`,
            'Notion-Version': NOTION_VERSION,
          },
        })
        if (blocksRes.ok) {
          const blocksData = await blocksRes.json()
          content = extractText(blocksData.results)
        }
      } catch {
        // Skip content if fetch fails
      }

      return { id: page.id, title, date, content }
    }))

    return NextResponse.json({ meetings })
  } catch (error) {
    console.error('Server Error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

function extractText(blocks: any[]): string {
  return blocks.map((block: any) => {
    const type = block.type
    const richText = block[type]?.rich_text
    if (richText) {
      return richText.map((t: any) => t.plain_text).join('')
    }
    return ''
  }).filter(Boolean).join('\n')
}
