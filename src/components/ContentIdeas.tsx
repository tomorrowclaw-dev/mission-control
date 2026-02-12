'use client'

import { useMemo, useState } from 'react'
import { ContentIdea } from '@/lib/types'

const PLATFORM_LABELS: Record<ContentIdea['platform'], string> = {
  twitter: 'X / Twitter',
  linkedin: 'LinkedIn',
  both: 'X + LinkedIn',
}

const PLATFORM_ICONS: Record<ContentIdea['platform'], string> = {
  twitter: '🐦',
  linkedin: '💼',
  both: '📢',
}

const CATEGORY_STYLES: Record<ContentIdea['category'], string> = {
  'ai-tools': 'bg-violet-500/10 text-violet-400 border-violet-500/20',
  'thesis-insights': 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  'industry': 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  'personal-brand': 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  'tutorial': 'bg-rose-500/10 text-rose-400 border-rose-500/20',
}

const STATUS_STYLES: Record<ContentIdea['status'], { pill: string; rail: string }> = {
  idea: { pill: 'bg-zinc-700/30 text-zinc-400 border-zinc-600/30', rail: 'bg-zinc-500/80' },
  drafted: { pill: 'bg-blue-500/10 text-blue-400 border-blue-500/20', rail: 'bg-blue-400' },
  scheduled: { pill: 'bg-amber-500/10 text-amber-400 border-amber-500/20', rail: 'bg-amber-400' },
  posted: { pill: 'bg-green-500/10 text-green-400 border-green-500/20', rail: 'bg-green-400' },
}

type Filter = 'all' | ContentIdea['status']

export default function ContentIdeas({ ideas }: { ideas: ContentIdea[] }) {
  const [filter, setFilter] = useState<Filter>('all')

  const filtered = filter === 'all' ? ideas : ideas.filter((idea) => idea.status === filter)

  const filters: { key: Filter; label: string; count: number }[] = [
    { key: 'all', label: 'All', count: ideas.length },
    { key: 'idea', label: 'Ideas', count: ideas.filter((idea) => idea.status === 'idea').length },
    { key: 'drafted', label: 'Drafted', count: ideas.filter((idea) => idea.status === 'drafted').length },
    { key: 'scheduled', label: 'Scheduled', count: ideas.filter((idea) => idea.status === 'scheduled').length },
    { key: 'posted', label: 'Posted', count: ideas.filter((idea) => idea.status === 'posted').length },
  ]

  if (ideas.length === 0) {
    return (
      <div className="card-glass p-12 text-center">
        <div className="w-16 h-16 rounded-2xl bg-zinc-800/50 border border-zinc-700/50 flex items-center justify-center text-3xl mx-auto">
          ✍️
        </div>
        <h3 className="font-display text-xl mt-5">Content Ideas</h3>
        <p className="text-sm text-zinc-500 mt-2 max-w-sm mx-auto leading-relaxed">
          Your social media content pipeline will appear here. Clyde generates weekly posting ideas for Twitter/X and LinkedIn.
        </p>
        <div className="mt-6 inline-flex items-center gap-2 text-[11px] text-zinc-600 font-mono bg-zinc-800/30 rounded-full px-4 py-2 border border-zinc-800">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500/50" />
          Waiting for content_ideas table setup
        </div>
      </div>
    )
  }

  const grouped = filtered.reduce<Record<string, ContentIdea[]>>((acc, idea) => {
    const week = idea.week_of || 'Unscheduled'
    if (!acc[week]) acc[week] = []
    acc[week].push(idea)
    return acc
  }, {})

  const sortedGroups = useMemo(
    () =>
      Object.entries(grouped).sort(([left], [right]) => {
        if (left === 'Unscheduled') return 1
        if (right === 'Unscheduled') return -1
        return right.localeCompare(left)
      }),
    [grouped]
  )

  return (
    <div className="space-y-6">
      <div className="card-glass p-4">
        <div className="flex items-center gap-2 flex-wrap">
          {filters.map((item) => (
            <button
              key={item.key}
              onClick={() => setFilter(item.key)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold tracking-wide transition-all border ${
                filter === item.key
                  ? 'bg-indigo-500/15 text-indigo-300 border-indigo-500/35'
                  : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/30 border-zinc-700/20'
              }`}
            >
              {item.label}
              <span className="ml-1.5 text-[10px] font-mono opacity-70">{item.count}</span>
            </button>
          ))}
          <div className="flex-1" />
          <div className="flex items-center gap-3 text-[11px] font-mono text-zinc-500">
            <span>🐦 {ideas.filter((idea) => idea.platform === 'twitter').length}</span>
            <span>💼 {ideas.filter((idea) => idea.platform === 'linkedin').length}</span>
            <span>📢 {ideas.filter((idea) => idea.platform === 'both').length}</span>
          </div>
        </div>
      </div>

      {sortedGroups.map(([week, weekIdeas]) => (
        <section key={week} className="card-glass p-4 sm:p-5 space-y-3">
          <div className="flex items-center justify-between gap-3">
            <div className="text-[10px] uppercase tracking-[0.15em] text-zinc-500 font-mono">
              {week === 'Unscheduled'
                ? 'Unscheduled'
                : `Week of ${new Date(`${week}T12:00:00`).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`}
            </div>
            <span className="text-[10px] font-mono text-zinc-600">{weekIdeas.length} items</span>
          </div>

          <div className="grid gap-3">
            {weekIdeas.map((idea) => (
              <article key={idea.id} className="relative overflow-hidden rounded-xl border border-zinc-700/40 bg-zinc-900/30 p-4 hover:border-zinc-600/60 transition-all">
                <div className={`absolute left-0 top-0 bottom-0 w-1 ${STATUS_STYLES[idea.status].rail}`} />

                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-zinc-800/50 border border-zinc-700/40 flex items-center justify-center text-lg shrink-0">
                    {PLATFORM_ICONS[idea.platform]}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="text-sm font-medium text-zinc-200 leading-snug">{idea.title}</h3>
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border shrink-0 ${STATUS_STYLES[idea.status].pill}`}>
                        {idea.status}
                      </span>
                    </div>

                    {idea.hook && (
                      <p className="text-[12px] text-zinc-500 mt-1.5 leading-relaxed italic">
                        &ldquo;{idea.hook}&rdquo;
                      </p>
                    )}

                    <div className="flex items-center gap-2 mt-3 flex-wrap">
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${CATEGORY_STYLES[idea.category]}`}>
                        {idea.category.replace('-', ' ')}
                      </span>
                      <span className="text-[10px] font-mono text-zinc-600">{PLATFORM_LABELS[idea.platform]}</span>
                      {idea.scheduled_for && (
                        <span className="text-[10px] font-mono text-amber-400/80">
                          Schedules {new Date(`${idea.scheduled_for}T12:00:00`).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}
