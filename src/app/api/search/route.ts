import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.SUPABASE_SERVICE_ROLE_KEY || ''
  )
}

interface SearchResult {
  id: string
  type: 'paper' | 'activity' | 'task' | 'milestone' | 'writing'
  title: string
  snippet: string
  date: string | null
  meta?: string
  icon: string
  url?: string | null
}

const PHASE_ICONS: Record<string, string> = {
  build: '🔧',
  'data-collection': '📊',
  analysis: '📈',
  writing: '✍️',
  defense: '🎓',
}

const STATUS_LABELS: Record<string, string> = {
  not_started: 'Not Started',
  in_progress: 'In Progress',
  complete: 'Complete',
  blocked: 'Blocked',
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const q = searchParams.get('q')?.trim()

  if (!q) return NextResponse.json([])

  const results: SearchResult[] = []
  const searchTerm = `%${q}%`

  // 1. Search papers
  try {
    const { data: papers } = await getSupabase()
      .from('papers')
      .select('id, title, authors, year, summary, tags, review_status, url')
      .or(`title.ilike.${searchTerm},summary.ilike.${searchTerm},authors.ilike.${searchTerm},relevance_notes.ilike.${searchTerm},key_arguments.ilike.${searchTerm}`)
      .limit(10)

    if (papers) {
      for (const p of papers) {
        results.push({
          id: `paper-${p.id}`,
          type: 'paper',
          title: p.title,
          snippet: p.summary || '',
          date: p.year ? String(p.year) : null,
          meta: [p.authors, p.review_status || 'unread'].filter(Boolean).join(' · '),
          icon: '📄',
          url: p.url,
        })
      }
    }
  } catch (err) {
    console.error('Paper search error:', err)
  }

  // 2. Search milestones
  try {
    const { data: milestones } = await getSupabase()
      .from('milestones')
      .select('id, title, description, phase, due_date, status, priority, notes')
      .or(`title.ilike.${searchTerm},description.ilike.${searchTerm},notes.ilike.${searchTerm}`)
      .order('due_date', { ascending: true })
      .limit(8)

    if (milestones) {
      for (const m of milestones) {
        results.push({
          id: `milestone-${m.id}`,
          type: 'milestone',
          title: m.title,
          snippet: m.description || m.notes || '',
          date: m.due_date ? new Date(m.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : null,
          meta: `${PHASE_ICONS[m.phase] || '◆'} ${m.phase} · ${STATUS_LABELS[m.status] || m.status}`,
          icon: m.status === 'complete' ? '✅' : m.status === 'blocked' ? '🚫' : '◆',
        })
      }
    }
  } catch (err) {
    console.error('Milestone search error:', err)
  }

  // 3. Search writing sections
  try {
    const { data: sections } = await getSupabase()
      .from('writing_sections')
      .select('id, title, chapter_order, status, current_word_count, target_word_count, notes, due_date')
      .or(`title.ilike.${searchTerm},notes.ilike.${searchTerm}`)
      .order('chapter_order', { ascending: true })
      .limit(8)

    if (sections) {
      for (const s of sections) {
        const pct = s.target_word_count ? Math.round((s.current_word_count / s.target_word_count) * 100) : 0
        results.push({
          id: `writing-${s.id}`,
          type: 'writing',
          title: s.title,
          snippet: s.notes || `${s.current_word_count.toLocaleString()} / ${(s.target_word_count || 0).toLocaleString()} words (${pct}%)`,
          date: s.due_date ? new Date(s.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : null,
          meta: `Ch. ${s.chapter_order} · ${STATUS_LABELS[s.status] || s.status} · ${pct}%`,
          icon: s.status === 'complete' ? '✅' : s.status === 'in_progress' ? '✏️' : '📖',
        })
      }
    }
  } catch (err) {
    console.error('Writing search error:', err)
  }

  // 4. Search activity log
  try {
    const { data: activities } = await getSupabase()
      .from('activity_log')
      .select('id, created_at, crew, emoji, action, detail, station')
      .or(`action.ilike.${searchTerm},detail.ilike.${searchTerm},crew.ilike.${searchTerm}`)
      .order('created_at', { ascending: false })
      .limit(8)

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
    console.error('Activity search error:', err)
  }

  // 5. Search Notion tasks
  try {
    const baseUrl = new URL(request.url).origin
    const notionRes = await fetch(`${baseUrl}/api/notion/tasks`)
    if (notionRes.ok) {
      const tasks = await notionRes.json()
      const lowerQ = q.toLowerCase()
      const matched = (tasks.mainTasks || []).concat(tasks.backloggedTasks || [])
        .filter((t: { text: string }) => t.text.toLowerCase().includes(lowerQ))
        .slice(0, 5)

      for (const t of matched) {
        results.push({
          id: `task-${t.text.slice(0, 30).replace(/\s/g, '-')}`,
          type: 'task',
          title: t.text,
          snippet: t.checked ? 'Completed' : 'Open task',
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
