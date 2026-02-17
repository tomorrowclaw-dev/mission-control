'use client'

import { useState, useEffect } from 'react'
import { format, formatDistanceToNow } from 'date-fns'

interface ActivityEntry {
  id: number
  timestamp: string
  agent: string
  action: string
  details: string | null
  status: string | null
}

const crewEmoji: Record<string, string> = {
  'clyde': '🐙',
  'flick': '⚡',
  'reno': '🔧',
  'bear': '💪',
  'quinn': '📚',
}

const crewColors: Record<string, string> = {
  'clyde': 'text-violet-400 bg-violet-500/10 border-violet-500/20',
  'flick': 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20',
  'reno': 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
  'bear': 'text-orange-400 bg-orange-500/10 border-orange-500/20',
  'quinn': 'text-rose-400 bg-rose-500/10 border-rose-500/20',
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
    const interval = setInterval(load, 30000)
    return () => clearInterval(interval)
  }, [])

  const filtered = filter === 'all' 
    ? activities 
    : activities.filter(a => a.agent === filter)

  const agents = ['all', ...new Set(activities.map(a => a.agent))]

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

  const grouped = filtered.reduce<Record<string, ActivityEntry[]>>((acc, a) => {
    const day = format(new Date(a.timestamp), 'yyyy-MM-dd')
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

      <div className="flex items-center gap-1.5 flex-wrap">
        {agents.map(c => (
          <button
            key={c}
            onClick={() => setFilter(c)}
            className={`px-3 py-1.5 rounded-lg text-[11px] font-medium transition-all ${
              filter === c
                ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/30 border border-transparent'
            }`}
          >
            {c === 'all' ? 'All' : `${crewEmoji[c] || '🤖'} ${c.charAt(0).toUpperCase() + c.slice(1)}`}
          </button>
        ))}
      </div>

      <div className="space-y-6">
        {Object.entries(grouped).map(([date, entries]) => (
          <div key={date}>
            <div className="text-[10px] uppercase tracking-[0.2em] text-zinc-500 font-mono mb-3 sticky top-16 bg-[var(--background)] py-1 z-10">
              {format(new Date(date), 'EEEE, MMMM d')}
            </div>
            <div className="space-y-1 border-l-2 border-zinc-800/50 ml-2 pl-4">
              {entries.map((a, idx) => {
                const colors = crewColors[a.agent] || 'text-zinc-400 bg-zinc-500/10 border-zinc-500/20'
                const emoji = crewEmoji[a.agent] || '🤖'
                return (
                  <div
                    key={a.id}
                    className="group flex items-start gap-3 py-2 animate-in"
                    style={{ animationDelay: `${idx * 30}ms` }}
                  >
                    <div className="relative -ml-[22px] mt-1.5">
                      <div className={`w-2.5 h-2.5 rounded-full border ${colors}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-lg leading-none">{emoji}</span>
                        <span className={`text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded border ${colors}`}>
                          {a.agent}
                        </span>
                        {a.status && (
                          <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded ${
                            a.status === 'success' ? 'text-emerald-400 bg-emerald-500/10' :
                            a.status === 'error' ? 'text-red-400 bg-red-500/10' :
                            'text-zinc-500 bg-zinc-500/10'
                          }`}>{a.status}</span>
                        )}
                        <span className="text-[10px] text-zinc-600 font-mono ml-auto">
                          {formatDistanceToNow(new Date(a.timestamp), { addSuffix: true })}
                        </span>
                      </div>
                      <div className="text-sm text-zinc-300 mt-0.5">{a.action}</div>
                      {a.details && (
                        <div className="text-[11px] text-zinc-500 mt-0.5 truncate group-hover:text-zinc-400 transition-colors">
                          {a.details}
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
          No activity recorded yet. The crew will start logging actions here.
        </div>
      )}
    </div>
  )
}
