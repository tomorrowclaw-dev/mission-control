import { NextResponse } from 'next/server'
import { NotionPage, NotionTitleProperty, NotionDateProperty } from '@/types/notion'

const NOTION_DB_ID = '3044b298-1cd6-8114-87ea-d90a9d0a0e08'
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
        sorts: [{ property: 'Created', direction: 'descending' }],
        page_size: 30,
      }),
      next: { revalidate: 300 },
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Notion API Error:', errorText)
      return NextResponse.json({ error: 'Failed to fetch briefs' }, { status: response.status })
    }

    const data = await response.json()
    const briefs = await Promise.all(data.results.map(async (page: NotionPage) => {
      const nameProp = page.properties.Name as NotionTitleProperty | undefined
      const titleProp = page.properties.Title as NotionTitleProperty | undefined
      const title = nameProp?.title?.[0]?.plain_text
        || titleProp?.title?.[0]?.plain_text
        || 'Untitled Brief'
      
      const created = page.created_time
      const dateProp = page.properties.Date as NotionDateProperty | undefined
      const date = dateProp?.date?.start || created

      // Fetch page content (blocks)
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

    return NextResponse.json({ briefs })
  } catch (error) {
    console.error('Server Error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

interface NotionBlock {
  type: string;
  [key: string]: unknown;
}

interface RichTextItem {
  plain_text: string;
}

function extractText(blocks: NotionBlock[]): string {
  return blocks.map((block: NotionBlock) => {
    const type = block.type
    const blockData = block[type] as { rich_text?: RichTextItem[] }
    const richText = blockData?.rich_text
    if (richText) {
      return richText.map((t: RichTextItem) => t.plain_text).join('')
    }
    return ''
  }).filter(Boolean).join('\n')
}
