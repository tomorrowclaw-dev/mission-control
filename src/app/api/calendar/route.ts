import { NextResponse } from 'next/server'

// ─── Types ───
type MeetingCategory = 'thesis' | 'work' | 'meeting' | 'personal'

interface MeetingEvent {
  id: string
  title: string
  start: string // ISO datetime
  end: string   // ISO datetime
  category: MeetingCategory
  description?: string
}

// Mock data based on James's actual schedule
const MOCK_MEETINGS: MeetingEvent[] = [
  // Monday Feb 17
  {
    id: '1',
    title: 'James | Angie',
    start: '2026-02-17T10:00:00',
    end: '2026-02-17T11:00:00',
    category: 'personal',
    description: 'Weekly sync with Angie'
  },
  {
    id: '2',
    title: 'Technology & Innovation Studio',
    start: '2026-02-17T12:00:00',
    end: '2026-02-17T13:00:00',
    category: 'work',
    description: 'TIS team meeting'
  },
  // Tuesday Feb 18
  {
    id: '3',
    title: 'HRA 2.0',
    start: '2026-02-18T10:00:00',
    end: '2026-02-18T11:00:00',
    category: 'work',
    description: 'HRA project standup'
  },
  {
    id: '4',
    title: 'NCITE Huddle',
    start: '2026-02-18T12:30:00',
    end: '2026-02-18T13:00:00',
    category: 'meeting',
    description: 'NCITE team daily huddle'
  },
  // Wednesday Feb 19
  {
    id: '5',
    title: 'Technology & Innovation Studio',
    start: '2026-02-19T12:00:00',
    end: '2026-02-19T13:00:00',
    category: 'work',
    description: 'TIS team meeting'
  },
  {
    id: '6',
    title: 'T*Lab Leadership',
    start: '2026-02-19T13:30:00',
    end: '2026-02-19T14:00:00',
    category: 'meeting',
    description: 'T*Lab leadership sync'
  },
  {
    id: '7',
    title: 'Thesis Meeting',
    start: '2026-02-19T14:00:00',
    end: '2026-02-19T15:00:00',
    category: 'thesis',
    description: 'Thesis advisor meeting'
  },
  // Thursday Feb 20
  {
    id: '8',
    title: 'James | Angie Touchbase',
    start: '2026-02-20T10:30:00',
    end: '2026-02-20T11:00:00',
    category: 'personal',
    description: 'Quick touchbase with Angie'
  },
  // Friday Feb 21 - nothing scheduled
]

export async function GET() {
  try {
    return NextResponse.json({ events: MOCK_MEETINGS })
  } catch (error) {
    console.error('Calendar API error:', error)
    return NextResponse.json({ error: 'Failed to fetch calendar' }, { status: 500 })
  }
}
