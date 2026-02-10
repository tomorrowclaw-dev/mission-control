'use client'

import { useState, useEffect } from 'react'
import { format, parseISO } from 'date-fns'
import { ChevronDown, ChevronRight, Mic } from 'lucide-react'

interface Meeting {
  id: string
  title: string
  date: string
  content: string
}

export default function MeetingNotes() {
  const [meetings, setMeetings] = useState<Meeting[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/notion/meetings')
        if (res.ok) {
          const data = await res.json()
          setMeetings(data.meetings || [])
          if (data.meetings?.length > 0) {
            setExpandedId(data.meetings[0].id)
          }
        }
      } catch (err) {
        console.error('Failed to load meetings:', err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  if (loading) {
    return (
      <div className="card-glass p-12 text-center">
        <div className="animate-pulse text-zinc-500 text-sm font-mono">Loading meetings...</div>
      </div>
    )
  }

  if (meetings.length === 0) {
    return (
      <div className="card-glass p-12 text-center">
        <div className="w-16 h-16 rounded-2xl bg-zinc-800/50 border border-zinc-700/50 flex items-center justify-center text-3xl mx-auto">
          🎙️
        </div>
        <h3 className="font-display text-xl mt-5">Meeting Notes</h3>
        <p className="text-sm text-zinc-500 mt-2 max-w-sm mx-auto leading-relaxed">
          No meeting notes yet. Send Plaud transcripts to Clyde and they&apos;ll appear here — auto-summarized with action items.
        </p>
        <div className="mt-6 inline-flex items-center gap-2 text-[11px] text-zinc-600 font-mono bg-zinc-800/30 rounded-full px-4 py-2 border border-zinc-800">
          <span className="w-1.5 h-1.5 rounded-full bg-green-500/50" />
          Advisor meetings: every other Wednesday
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {meetings.map((meeting) => {
        const isExpanded = expandedId === meeting.id
        return (
          <div key={meeting.id} className="card-glass overflow-hidden transition-all">
            <button
              onClick={() => setExpandedId(isExpanded ? null : meeting.id)}
              className="w-full flex items-center gap-4 p-5 text-left hover:bg-white/[0.02] transition-colors"
            >
              <div className="w-8 h-8 rounded-lg bg-violet-500/10 border border-violet-500/20 flex items-center justify-center shrink-0">
                <Mic size={14} className="text-violet-400" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-body text-sm text-zinc-200 truncate">{meeting.title}</div>
                <div className="text-[11px] text-zinc-500 font-mono mt-0.5">
                  {format(parseISO(meeting.date), 'EEEE, MMMM d, yyyy')}
                </div>
              </div>
              <div className="text-zinc-600 shrink-0">
                {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
              </div>
            </button>
            {isExpanded && (
              <div className="px-5 pb-5 border-t border-zinc-800/30">
                <div className="mt-4 text-sm text-zinc-400 leading-relaxed whitespace-pre-wrap font-body">
                  {meeting.content || 'No content available.'}
                </div>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
