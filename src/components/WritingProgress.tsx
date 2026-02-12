'use client'

import { useEffect, useState } from 'react'
import { WritingSection } from '@/lib/types'

interface WritingProgressProps {
  sections: WritingSection[]
}

export default function WritingProgress({ sections }: WritingProgressProps) {
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setLoaded(true), 80)
    return () => clearTimeout(timer)
  }, [])

  const totalTarget = sections.reduce((sum, s) => sum + (s.target_word_count || 0), 0)
  const totalCurrent = sections.reduce((sum, s) => sum + s.current_word_count, 0)
  const overallPercent = totalTarget > 0 ? (totalCurrent / totalTarget) * 100 : 0

  const statusColor = (status: string) => {
    switch (status) {
      case 'complete': return { bar: 'bg-green-500', dot: 'bg-green-400 shadow-green-500/40', label: 'text-green-400' }
      case 'in_progress': return { bar: 'bg-blue-500', dot: 'bg-blue-400 shadow-blue-500/40 animate-pulse', label: 'text-blue-400' }
      default: return { bar: 'bg-zinc-700', dot: 'bg-zinc-600', label: 'text-zinc-500' }
    }
  }

  const statusLabel = (status: string) => {
    switch (status) {
      case 'complete': return 'Done'
      case 'in_progress': return 'Writing'
      default: return 'Pending'
    }
  }

  return (
    <div className="space-y-6">
      {/* Overall progress hero */}
      <div className="text-center pb-6 border-b border-zinc-800/50">
        <div className="font-mono text-4xl font-bold text-indigo-400">
          {totalCurrent.toLocaleString()}
        </div>
        <div className="text-[11px] uppercase tracking-[0.2em] text-zinc-500 mt-1">
          of {totalTarget.toLocaleString()} words
        </div>
        <div className="mt-4 max-w-md mx-auto">
          <div className="h-2 bg-zinc-800/80 rounded-full overflow-hidden">
            <div
              className={`h-full bg-gradient-to-r from-indigo-600 to-indigo-400 rounded-full progress-bar ${overallPercent > 50 ? 'bar-glow-indigo' : ''}`}
              style={{ width: `${loaded ? overallPercent : 0}%` }}
            />
          </div>
          <div className="text-[11px] text-zinc-500 font-mono mt-1.5">{overallPercent.toFixed(1)}% complete</div>
        </div>
      </div>

      {/* Per-section breakdown */}
      <div className="space-y-3">
        {sections.map((section, idx) => {
          const colors = statusColor(section.status)
          const percent = section.target_word_count
            ? (section.current_word_count / section.target_word_count) * 100
            : 0
          const clampedPercent = Math.min(percent, 100)

          return (
            <div
              key={section.id}
              className="flex items-center gap-4 group animate-in"
              style={{ animationDelay: `${idx * 60}ms` }}
            >
              <div className={`w-2.5 h-2.5 rounded-full shrink-0 shadow-sm ${colors.dot}`} />
              <span className="text-sm flex-1 min-w-0 truncate text-zinc-300 group-hover:text-zinc-100 transition-colors">
                {section.title}
              </span>
              <span className={`text-[10px] font-semibold uppercase tracking-wider shrink-0 ${colors.label}`}>
                {statusLabel(section.status)}
              </span>
              {section.target_word_count ? (
                <>
                  <div className="w-24 h-1.5 bg-zinc-800/80 rounded-full overflow-hidden shrink-0">
                    <div
                      className={`h-full rounded-full progress-bar ${colors.bar} ${clampedPercent > 50 ? 'bar-glow' : ''}`}
                      style={{ width: `${loaded ? clampedPercent : 0}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-zinc-500 font-mono w-14 text-right shrink-0">
                    {section.current_word_count > 0 ? `${(section.current_word_count / 1000).toFixed(1)}k` : '—'}/{(section.target_word_count / 1000).toFixed(0)}k
                  </span>
                </>
              ) : (
                <span className="text-[10px] text-zinc-600 font-mono w-[152px] text-right shrink-0">—</span>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
