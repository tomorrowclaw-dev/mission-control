'use client'

import { useState } from 'react'
import { ContentIdea } from '@/lib/types'

const PLATFORM_ICONS: Record<string, string> = {
  twitter: '🐦',
  linkedin: '💼',
  both: '📢',
}

const CATEGORY_STYLES: Record<string, string> = {
  'ai-tools': 'bg-violet-500/10 text-violet-400 border-violet-500/20',
  'thesis-insights': 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  'industry': 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  'personal-brand': 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  'tutorial': 'bg-rose-500/10 text-rose-400 border-rose-500/20',
}

const STATUS_STYLES: Record<string, string> = {
  idea: 'bg-zinc-700/30 text-zinc-400 border-zinc-600/30',
  drafted: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  scheduled: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  posted: 'bg-green-500/10 text-green-400 border-green-500/20',
}

type Filter = 'all' | 'idea' | 'drafted' | 'posted'

export default function ContentIdeas({ ideas }: { ideas: ContentIdea[] }) {
  const [filter, setFilter] = useState<Filter>('all')

  const filtered = filter === 'all'
    ? ideas
    : ideas.filter(i => i.status === filter)

  const filters: { key: Filter; label: string; count: number }[] = [
    { key: 'all', label: 'All', count: ideas.length },
    { key: 'idea', label: 'Ideas', count: ideas.filter(i => i.status === 'idea').length },
    { key: 'drafted', label: 'Drafted', count: ideas.filter(i => i.status === 'drafted').length },
    { key: 'posted', label: 'Posted', count: ideas.filter(i => i.status === 'posted').length },
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

  // Group by week
  const grouped = filtered.reduce<Record<string, ContentIdea[]>>((acc, idea) => {
    const week = idea.week_of || 'Unscheduled'
    if (!acc[week]) acc[week] = []
    acc[week].push(idea)
    return acc
  }, {})

  return (
    <div className="space-y-6">
      {/* Filter tabs */}
      <div className="flex items-center gap-2">
        {filters.map(f => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
              filter === f.key
                ? 'bg-zinc-800/80 text-white border border-zinc-700/50 shadow-lg shadow-black/20'
                : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/30 border border-transparent'
            }`}
          >
            {f.label}
            <span className="ml-1.5 text-[10px] font-mono opacity-60">{f.count}</span>
          </button>
        ))}
        <div className="flex-1" />
        <div className="flex items-center gap-3 text-[11px] font-mono">
          <span className="text-zinc-600">🐦 {ideas.filter(i => i.platform === 'twitter').length}</span>
          <span className="text-zinc-600">💼 {ideas.filter(i => i.platform === 'linkedin').length}</span>
          <span className="text-zinc-600">📢 {ideas.filter(i => i.platform === 'both').length}</span>
        </div>
      </div>

      {/* Ideas grouped by week */}
      {Object.entries(grouped).map(([week, weekIdeas]) => (
        <div key={week}>
          <div className="text-[10px] uppercase tracking-[0.15em] text-zinc-500 font-mono mb-3">
            {week === 'Unscheduled' ? 'Unscheduled' : `Week of ${new Date(week + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`}
          </div>
          <div className="grid gap-3">
            {weekIdeas.map(idea => (
              <div key={idea.id} className="card-glass p-5 group hover:border-zinc-700/60 transition-all">
                <div className="flex items-start gap-4">
                  {/* Platform icon */}
                  <div className="w-10 h-10 rounded-xl bg-zinc-800/50 border border-zinc-700/40 flex items-center justify-center text-lg shrink-0">
                    {PLATFORM_ICONS[idea.platform] || '📝'}
                  </div>

                  <div className="flex-1 min-w-0">
                    {/* Title */}
                    <h3 className="text-sm font-medium text-zinc-200 leading-snug">{idea.title}</h3>

                    {/* Hook preview */}
                    {idea.hook && (
                      <p className="text-[12px] text-zinc-500 mt-1.5 leading-relaxed line-clamp-2 italic">
                        &ldquo;{idea.hook}&rdquo;
                      </p>
                    )}

                    {/* Tags */}
                    <div className="flex items-center gap-2 mt-3 flex-wrap">
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${CATEGORY_STYLES[idea.category] || 'bg-zinc-800 text-zinc-400 border-zinc-700'}`}>
                        {idea.category.replace('-', ' ')}
                      </span>
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${STATUS_STYLES[idea.status] || ''}`}>
                        {idea.status}
                      </span>
                      <span className="text-[10px] font-mono text-zinc-600">
                        {idea.platform === 'twitter' ? 'X / Twitter' : idea.platform === 'linkedin' ? 'LinkedIn' : 'X + LinkedIn'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
