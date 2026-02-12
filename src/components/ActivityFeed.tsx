'use client'

import { useState, useEffect } from 'react'
import { format, formatDistanceToNow } from 'date-fns'

interface ActivityEntry {
  id: string
  created_at: string
  crew: string
  emoji: string
  action: string
  detail: string | null
  station: string | null
}

const crewColors: Record<string, string> = {
  'Clyde': 'text-violet-400 bg-violet-500/10 border-violet-500/20',
  'Sonnet': 'text-red-400 bg-red-500/10 border-red-500/20',
  'GLM Flash': 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20',
  'Qwen Coder': 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
  'System': 'text-zinc-400 bg-zinc-500/10 border-zinc-500/20',
}

export default function ActivityFeed() {
  const [activities, setActivities] = useState<ActivityEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>('all')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/activity')
        if (!res.ok) throw new Error('Failed to fetch')
        const data = await res.json()
        setActivities(data)
      } catch (err) {
        setError('Could not load activity feed')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    load()
    // Poll every 30s
    const interval = setInterval(load, 30000)
    return () => clearInterval(interval)
  }, [])

  const filtered = filter === 'all' 
    ? activities 
    : activities.filter(a => a.crew === filter)

  const crews = ['all', ...new Set(activities.map(a => a.crew))]

  if (loading) {
    return (
      <div className="card-glass p-8 text-center">
        <div className="text-zinc-500 text-sm animate-pulse">Loading activity feed...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="card-glass p-8 text-center">
        <div className="text-zinc-500 text-sm">{error}</div>
        <div className="text-[11px] text-zinc-600 mt-2">Make sure the activity_log table exists in Supabase</div>
      </div>
    )
  }

  // Group by date
  const grouped = filtered.reduce<Record<string, ActivityEntry[]>>((acc, a) => {
    const day = format(new Date(a.created_at), 'yyyy-MM-dd')
    if (!acc[day]) acc[day] = []
    acc[day].push(a)
    return acc
  }, {})

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-sm">📋</div>
        <h2 className="font-display text-lg">Activity Feed</h2>
        <div className="flex-1" />
        <span className="text-[11px] text-zinc-600 font-mono">{activities.length} events</span>
      </div>

      {/* Crew filter */}
      <div className="flex items-center gap-1.5 flex-wrap">
        {crews.map(c => (
          <button
            key={c}
            onClick={() => setFilter(c)}
            className={`px-3 py-1.5 rounded-lg text-[11px] font-medium transition-all ${
              filter === c
                ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/30 border border-transparent'
            }`}
          >
            {c === 'all' ? 'All' : c}
          </button>
        ))}
      </div>

      {/* Timeline */}
      <div className="space-y-6">
        {Object.entries(grouped).map(([date, entries]) => (
          <div key={date}>
            <div className="text-[10px] uppercase tracking-[0.2em] text-zinc-500 font-mono mb-3 sticky top-16 bg-[var(--background)] py-1 z-10">
              {format(new Date(date), 'EEEE, MMMM d')}
            </div>
            <div className="space-y-1 border-l-2 border-zinc-800/50 ml-2 pl-4">
              {entries.map((a, idx) => {
                const colors = crewColors[a.crew] || crewColors['System']
                return (
                  <div
                    key={a.id}
                    className="group flex items-start gap-3 py-2 animate-in"
                    style={{ animationDelay: `${idx * 30}ms` }}
                  >
                    {/* Timeline dot */}
                    <div className="relative -ml-[22px] mt-1.5">
                      <div className={`w-2.5 h-2.5 rounded-full border ${colors}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-lg leading-none">{a.emoji}</span>
                        <span className={`text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded border ${colors}`}>
                          {a.crew}
                        </span>
                        {a.station && (
                          <span className="text-[9px] text-zinc-600 font-mono">@ {a.station}</span>
                        )}
                        <span className="text-[10px] text-zinc-600 font-mono ml-auto">
                          {formatDistanceToNow(new Date(a.created_at), { addSuffix: true })}
                        </span>
                      </div>
                      <div className="text-sm text-zinc-300 mt-0.5">{a.action}</div>
                      {a.detail && (
                        <div className="text-[11px] text-zinc-500 mt-0.5 truncate group-hover:text-zinc-400 transition-colors">
                          {a.detail}
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12 text-zinc-600 text-sm">
          No activity recorded yet. Clyde will start logging actions here.
        </div>
      )}
    </div>
  )
}
