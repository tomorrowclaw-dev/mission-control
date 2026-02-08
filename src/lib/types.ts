export interface Milestone {
  id: string
  title: string
  description: string | null
  phase: 'build' | 'data-collection' | 'analysis' | 'writing' | 'defense'
  due_date: string
  week_start: string | null
  week_end: string | null
  status: 'not_started' | 'in_progress' | 'complete' | 'blocked'
  priority: 'critical' | 'important' | 'normal'
  advisor_deliverable: boolean
  notes: string | null
  created_at: string
  updated_at: string
}

export interface WritingSection {
  id: string
  title: string
  chapter_order: number
  status: 'not_started' | 'in_progress' | 'complete'
  target_word_count: number | null
  current_word_count: number
  due_date: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

export interface Paper {
  id: string
  title: string
  authors: string | null
  year: number | null
  source: string | null
  url: string | null
  doi: string | null
  tags: string[]
  summary: string | null
  key_arguments: string | null
  relevance_notes: string | null
  pdf_path: string | null
  cited_in: string[]
  review_status: 'unread' | 'reading' | 'reviewed' | 'cited' | null
  created_at: string
  updated_at: string
}

export interface MeetingNote {
  id: string
  meeting_date: string
  title: string | null
  attendees: string[]
  raw_transcript: string | null
  summary: string | null
  action_items: ActionItem[]
  advisor_feedback: string | null
  created_at: string
  updated_at: string
}

export interface ActionItem {
  task: string
  assignee: string
  due_date: string | null
  done: boolean
}

export interface AdvisorFeedback {
  id: string
  meeting_note_id: string | null
  feedback: string
  section: string | null
  addressed: boolean
  addressed_date: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

export interface Reminder {
  id: string
  title: string
  description: string | null
  due_date: string
  recurring: 'daily' | 'weekly' | 'biweekly' | null
  milestone_id: string | null
  dismissed: boolean
  created_at: string
}

export const PHASE_LABELS: Record<Milestone['phase'], string> = {
  'build': '🔧 System Build',
  'data-collection': '📊 Data Collection',
  'analysis': '📈 Analysis',
  'writing': '✍️ Writing',
  'defense': '🎓 Defense',
}

export const STATUS_COLORS: Record<Milestone['status'], string> = {
  'not_started': 'bg-gray-500',
  'in_progress': 'bg-blue-500',
  'complete': 'bg-green-500',
  'blocked': 'bg-red-500',
}

export const PRIORITY_LABELS: Record<Milestone['priority'], string> = {
  'critical': '🔴 Critical',
  'important': '🟡 Important',
  'normal': '🟢 Normal',
}
