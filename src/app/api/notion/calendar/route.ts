import { NextResponse } from 'next/server'

const NOTION_DB_ID = '3004b298-1cd6-8193-8efe-f7d116dd8ce4'
const NOTION_API_KEY = process.env.NOTION_API_KEY
const NOTION_VERSION = '2022-06-28'

export async function GET() {
  if (!NOTION_API_KEY) {
    return NextResponse.json({ error: 'Missing Notion API Key' }, { status: 500 })
  }

  try {
    const now = new Date()
    const twoWeeksAgo = new Date(now)
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14)

    const response = await fetch(`https://api.notion.com/v1/databases/${NOTION_DB_ID}/query`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${NOTION_API_KEY}`,
        'Notion-Version': NOTION_VERSION,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        filter: {
          property: 'Date',
          date: { on_or_after: twoWeeksAgo.toISOString().split('T')[0] },
        },
        sorts: [{ property: 'Date', direction: 'ascending' }],
        page_size: 100,
      }),
      next: { revalidate: 120 },
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Notion API Error:', errorText)
      return NextResponse.json({ error: 'Failed to fetch calendar' }, { status: response.status })
    }

    const data = await response.json()
    const events = data.results.map((page: any) => {
      const title = page.properties?.Name?.title?.[0]?.plain_text
        || page.properties?.Title?.title?.[0]?.plain_text
        || 'Untitled Event'

      const dateObj = page.properties?.Date?.date
      const start = dateObj?.start || page.created_time
      const end = dateObj?.end || null

      const tags = page.properties?.Tags?.multi_select?.map((t: any) => t.name) || []

      return { id: page.id, title, start, end, tags }
    })

    return NextResponse.json({ events })
  } catch (error) {
    console.error('Server Error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
