import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

interface SearchResult {
  id: string
  type: 'paper' | 'activity' | 'task' | 'memory'
  title: string
  snippet: string
  date: string | null
  meta?: string
  icon: string
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const q = searchParams.get('q')?.trim()

  if (!q) {
    return NextResponse.json([])
  }

  const results: SearchResult[] = []
  const searchTerm = `%${q}%`

  // 1. Search papers
  try {
    const { data: papers } = await supabase
      .from('papers')
      .select('id, title, authors, year, summary, tags, review_status')
      .or(`title.ilike.${searchTerm},summary.ilike.${searchTerm},authors.ilike.${searchTerm},relevance_notes.ilike.${searchTerm}`)
      .limit(10)

    if (papers) {
      for (const p of papers) {
        results.push({
          id: `paper-${p.id}`,
          type: 'paper',
          title: p.title,
          snippet: p.summary || '',
          date: p.year ? String(p.year) : null,
          meta: `${p.authors} · ${p.review_status || 'unread'}`,
          icon: '📄',
        })
      }
    }
  } catch (err) {
    console.error('Paper search error:', err)
  }

  // 2. Search activity log
  try {
    const { data: activities } = await supabase
      .from('activity_log')
      .select('id, created_at, crew, emoji, action, detail, station')
      .or(`action.ilike.${searchTerm},detail.ilike.${searchTerm},crew.ilike.${searchTerm}`)
      .order('created_at', { ascending: false })
      .limit(10)

    if (activities) {
      for (const a of activities) {
        results.push({
          id: `activity-${a.id}`,
          type: 'activity',
          title: a.action,
          snippet: a.detail || '',
          date: a.created_at ? new Date(a.created_at).toLocaleDateString() : null,
          meta: `${a.crew} @ ${a.station || 'unknown'}`,
          icon: a.emoji || '🫧',
        })
      }
    }
  } catch (err) {
    // Table might not exist yet
    console.error('Activity search error:', err)
  }

  // 3. Search Notion tasks (via our existing API)
  try {
    const notionRes = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL ? request.url.split('/api')[0] : ''}/api/notion/tasks`)
    if (notionRes.ok) {
      const tasks = await notionRes.json()
      const matchedTasks = (tasks.mainTasks || []).concat(tasks.backloggedTasks || [])
        .filter((t: { text: string }) => t.text.toLowerCase().includes(q.toLowerCase()))

      for (const t of matchedTasks.slice(0, 5)) {
        results.push({
          id: `task-${t.text.slice(0, 20)}`,
          type: 'task',
          title: t.text,
          snippet: t.checked ? 'Completed' : 'Open',
          date: null,
          meta: t.checked ? '✅ Done' : '⬜ Open',
          icon: t.checked ? '✅' : '📝',
        })
      }
    }
  } catch (err) {
    console.error('Task search error:', err)
  }

  return NextResponse.json(results)
}
