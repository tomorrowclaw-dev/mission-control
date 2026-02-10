'use client'

import { useState, useEffect } from 'react'
import { format, parseISO } from 'date-fns'
import { ChevronDown, ChevronRight, Newspaper } from 'lucide-react'

interface Brief {
  id: string
  title: string
  date: string
  content: string
}

export default function DailyBriefs() {
  const [briefs, setBriefs] = useState<Brief[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/notion/briefs')
        if (res.ok) {
          const data = await res.json()
          setBriefs(data.briefs || [])
          // Auto-expand the latest
          if (data.briefs?.length > 0) {
            setExpandedId(data.briefs[0].id)
          }
        }
      } catch (err) {
        console.error('Failed to load briefs:', err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  if (loading) {
    return (
      <div className="card-glass p-12 text-center">
        <div className="animate-pulse text-zinc-500 text-sm font-mono">Loading briefs...</div>
      </div>
    )
  }

  if (briefs.length === 0) {
    return (
      <div className="card-glass p-12 text-center">
        <div className="w-16 h-16 rounded-2xl bg-zinc-800/50 border border-zinc-700/50 flex items-center justify-center text-3xl mx-auto">
          📰
        </div>
        <h3 className="font-display text-xl mt-5">Daily Briefs</h3>
        <p className="text-sm text-zinc-500 mt-2 max-w-sm mx-auto leading-relaxed">
          No briefs archived yet. Clyde sends a daily morning brief that gets saved here.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {briefs.map((brief) => {
        const isExpanded = expandedId === brief.id
        return (
          <div key={brief.id} className="card-glass overflow-hidden transition-all">
            <button
              onClick={() => setExpandedId(isExpanded ? null : brief.id)}
              className="w-full flex items-center gap-4 p-5 text-left hover:bg-white/[0.02] transition-colors"
            >
              <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center shrink-0">
                <Newspaper size={14} className="text-indigo-400" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-body text-sm text-zinc-200 truncate">{brief.title}</div>
                <div className="text-[11px] text-zinc-500 font-mono mt-0.5">
                  {format(parseISO(brief.date), 'EEEE, MMMM d, yyyy')}
                </div>
              </div>
              <div className="text-zinc-600 shrink-0">
                {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
              </div>
            </button>
            {isExpanded && (
              <div className="px-5 pb-5 border-t border-zinc-800/30">
                <div className="mt-4 text-sm text-zinc-400 leading-relaxed whitespace-pre-wrap font-body">
                  {brief.content || 'No content available.'}
                </div>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
