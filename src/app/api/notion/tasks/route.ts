import { NextResponse } from 'next/server'

const NOTION_PAGE_ID = '2924b298-1cd6-80f8-9a47-fcbdca993d82'
const NOTION_API_KEY = process.env.NOTION_API_KEY
const NOTION_VERSION = '2022-06-28'

export async function GET() {
  if (!NOTION_API_KEY) {
    return NextResponse.json({ error: 'Missing Notion API Key' }, { status: 500 })
  }

  try {
    // Fetch blocks from the page
    const response = await fetch(`https://api.notion.com/v1/blocks/${NOTION_PAGE_ID}/children?page_size=100`, {
      headers: {
        'Authorization': `Bearer ${NOTION_API_KEY}`,
        'Notion-Version': NOTION_VERSION,
        'Content-Type': 'application/json',
      },
      next: { revalidate: 60 } // Revalidate every 60 seconds
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Notion API Error:', errorText)
      return NextResponse.json({ error: 'Failed to fetch Notion data' }, { status: response.status })
    }

    const data = await response.json()
    const tasks = parseTasks(data.results)
    
    return NextResponse.json({ tasks })
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

function parseTasks(blocks: NotionBlock[]) {
  const tasks = []
  let currentSection: 'main' | 'backlog' | null = null

  for (const block of blocks) {
    // Check for headers
    if (block.type === 'heading_2') {
      const heading2Data = block.heading_2 as { rich_text?: RichTextItem[] }
      const text = heading2Data?.rich_text?.map((t: RichTextItem) => t.plain_text).join('').toLowerCase() || ''
      if (text.includes('main tasks')) {
        currentSection = 'main'
      } else if (text.includes('backlogged tasks')) {
        currentSection = 'backlog'
      } else {
        currentSection = null
      }
    } 
    // Check for to-do items
    else if (block.type === 'to_do' && currentSection) {
      const todoData = block.to_do as { rich_text?: RichTextItem[], checked?: boolean }
      const text = todoData?.rich_text?.map((t: RichTextItem) => t.plain_text).join('') || ''
      if (text) {
        tasks.push({
          id: block.id,
          text,
          isChecked: todoData?.checked || false,
          section: currentSection
        })
      }
    }
  }

  return tasks
}
