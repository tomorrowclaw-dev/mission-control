'use client'

import { useState, useEffect } from 'react'
import { formatDistanceToNow } from 'date-fns'

interface CrewMember {
  agent_id: string
  name: string
  role: string | null
  status: string
  task: string | null
  last_active: string | null
}

const crewEmoji: Record<string, string> = {
  'clyde': '🐙',
  'flick': '⚡',
  'reno': '🔧',
  'bear': '💪',
  'quinn': '📚',
}

const statusStyles: Record<string, { dot: string; label: string; bg: string }> = {
  'active': { dot: 'bg-emerald-400 shadow-emerald-400/50 shadow-sm animate-pulse', label: 'text-emerald-400', bg: 'border-emerald-500/20' },
  'idle': { dot: 'bg-zinc-500', label: 'text-zinc-500', bg: 'border-zinc-700/30' },
  'sleeping': { dot: 'bg-indigo-400/50', label: 'text-indigo-400/60', bg: 'border-indigo-500/10' },
  'error': { dot: 'bg-red-400 animate-pulse', label: 'text-red-400', bg: 'border-red-500/20' },
}

export default function CrewStatus() {
  const [crew, setCrew] = useState<CrewMember[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/crew')
        if (!res.ok) throw new Error('Failed to fetch')
        setCrew(await res.json())
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    load()
    const interval = setInterval(load, 15000)
    return () => clearInterval(interval)
  }, [])

  if (loading) {
    return (
      <div className="card-glass p-6">
        <div className="text-zinc-500 text-sm animate-pulse">Loading crew...</div>
      </div>
    )
  }

  const activeCount = crew.filter(c => c.status === 'active').length

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-8 h-8 rounded-lg bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-sm">🚀</div>
        <h2 className="font-display text-lg">Crew Status</h2>
        <div className="flex-1" />
        <span className="text-[11px] font-mono">
          <span className="text-emerald-400">{activeCount}</span>
          <span className="text-zinc-600">/{crew.length} active</span>
        </span>
      </div>

      <div className="grid gap-2">
        {crew.map(member => {
          const style = statusStyles[member.status] || statusStyles['idle']
          const emoji = crewEmoji[member.agent_id] || '🤖'

          return (
            <div
              key={member.agent_id}
              className={`flex items-center gap-3 p-3 rounded-xl border bg-zinc-900/30 backdrop-blur-sm transition-all hover:bg-zinc-800/40 ${style.bg}`}
            >
              <span className="text-xl">{emoji}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-zinc-200">{member.name}</span>
                  <div className={`w-2 h-2 rounded-full ${style.dot}`} />
                  <span className={`text-[10px] uppercase tracking-wider font-medium ${style.label}`}>
                    {member.status}
                  </span>
                </div>
                <div className="text-[11px] text-zinc-500 mt-0.5">
                  {member.task ? (
                    <span className="text-zinc-400">{member.task}</span>
                  ) : (
                    <span>{member.role || 'No role assigned'}</span>
                  )}
                </div>
              </div>
              {member.last_active && (
                <span className="text-[9px] text-zinc-600 font-mono whitespace-nowrap">
                  {formatDistanceToNow(new Date(member.last_active), { addSuffix: true })}
                </span>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
