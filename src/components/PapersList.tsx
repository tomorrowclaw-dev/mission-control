'use client'

import { useMemo, useState } from 'react'
import { ChevronDown, Search } from 'lucide-react'
import { Paper } from '@/lib/types'

interface PapersListProps {
  papers: Paper[]
}

type PaperFilter = 'all' | 'unread' | 'reviewed' | 'cited'

const tagColors: Record<string, string> = {
  'TTF': 'bg-purple-500/12 text-purple-400 border-purple-500/20',
  'DSR': 'bg-blue-500/12 text-blue-400 border-blue-500/20',
  'RAG': 'bg-emerald-500/12 text-emerald-400 border-emerald-500/20',
  'trust': 'bg-amber-500/12 text-amber-400 border-amber-500/20',
  'scaffolding': 'bg-pink-500/12 text-pink-400 border-pink-500/20',
  'K-12': 'bg-red-500/12 text-red-400 border-red-500/20',
  'school-safety': 'bg-red-500/12 text-red-400 border-red-500/20',
  'methodology': 'bg-blue-500/12 text-blue-400 border-blue-500/20',
  'kernel-theory': 'bg-purple-500/12 text-purple-400 border-purple-500/20',
  'evaluation': 'bg-teal-500/12 text-teal-400 border-teal-500/20',
  'usability': 'bg-teal-500/12 text-teal-400 border-teal-500/20',
  'SUS': 'bg-teal-500/12 text-teal-400 border-teal-500/20',
  'human-AI': 'bg-amber-500/12 text-amber-400 border-amber-500/20',
  'calibration': 'bg-amber-500/12 text-amber-400 border-amber-500/20',
  'architecture': 'bg-emerald-500/12 text-emerald-400 border-emerald-500/20',
  'education': 'bg-pink-500/12 text-pink-400 border-pink-500/20',
  'theory': 'bg-zinc-500/12 text-zinc-400 border-zinc-500/20',
  'domain': 'bg-red-500/12 text-red-400 border-red-500/20',
  'risk-assessment': 'bg-red-500/12 text-red-400 border-red-500/20',
  'AI': 'bg-indigo-500/12 text-indigo-400 border-indigo-500/20',
}

const statusStyles: Record<NonNullable<Paper['review_status']> | 'unread', string> = {
  unread: 'bg-zinc-500/12 text-zinc-400 border-zinc-500/20',
  reading: 'bg-amber-500/12 text-amber-400 border-amber-500/20',
  reviewed: 'bg-blue-500/12 text-blue-400 border-blue-500/20',
  cited: 'bg-green-500/12 text-green-400 border-green-500/20',
}

const normalizeFilterStatus = (status: Paper['review_status']): Exclude<PaperFilter, 'all'> => {
  if (status === 'reviewed') return 'reviewed'
  if (status === 'cited') return 'cited'
  return 'unread'
}

export default function PapersList({ papers }: PapersListProps) {
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<PaperFilter>('all')
  const [expandedIds, setExpandedIds] = useState<Record<string, boolean>>({})

  const filterCounts = useMemo(
    () => ({
      all: papers.length,
      unread: papers.filter((paper) => normalizeFilterStatus(paper.review_status) === 'unread').length,
      reviewed: papers.filter((paper) => normalizeFilterStatus(paper.review_status) === 'reviewed').length,
      cited: papers.filter((paper) => normalizeFilterStatus(paper.review_status) === 'cited').length,
    }),
    [papers]
  )

  const filteredPapers = useMemo(() => {
    const loweredQuery = query.trim().toLowerCase()

    return papers.filter((paper) => {
      const passesFilter = filter === 'all' || normalizeFilterStatus(paper.review_status) === filter

      if (!passesFilter) return false
      if (!loweredQuery) return true

      const haystack = [
        paper.title,
        paper.authors,
        paper.source,
        paper.summary,
        paper.key_arguments,
        paper.relevance_notes,
        ...paper.tags,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()

      return haystack.includes(loweredQuery)
    })
  }, [papers, filter, query])

  const filters: { key: PaperFilter; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'unread', label: 'Unread' },
    { key: 'reviewed', label: 'Reviewed' },
    { key: 'cited', label: 'Cited' },
  ]

  const toggleExpanded = (paperId: string) => {
    setExpandedIds((current) => ({
      ...current,
      [paperId]: !current[paperId],
    }))
  }

  return (
    <div className="space-y-4">
      <div className="card-glass p-3 sm:p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <label className="relative flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search title, author, source, tags..."
              className="w-full rounded-xl border border-zinc-700/60 bg-zinc-900/40 pl-9 pr-3 py-2.5 text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20"
            />
          </label>
          <div className="flex items-center gap-2 flex-wrap">
            {filters.map((item) => (
              <button
                key={item.key}
                onClick={() => setFilter(item.key)}
                className={`px-3 py-2 rounded-lg text-xs font-semibold tracking-wide border transition-all ${
                  filter === item.key
                    ? 'bg-indigo-500/15 text-indigo-300 border-indigo-500/35'
                    : 'bg-zinc-800/40 text-zinc-500 border-zinc-700/50 hover:text-zinc-300 hover:border-zinc-600/70'
                }`}
              >
                {item.label}
                <span className="ml-1.5 font-mono text-[10px] opacity-70">{filterCounts[item.key]}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {filteredPapers.length === 0 && (
        <div className="card-glass p-8 text-center text-sm text-zinc-500">
          No papers match your search/filter.
        </div>
      )}

      <div className="grid gap-3">
        {filteredPapers.map((paper, idx) => {
          const status = paper.review_status || 'unread'
          const abstract = paper.summary || paper.key_arguments
          const isExpanded = Boolean(expandedIds[paper.id])

          return (
            <div
              key={paper.id}
              className="card p-5 relative overflow-hidden card-shine group animate-in"
              style={{ animationDelay: `${idx * 45}ms` }}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="font-display text-[15px] leading-snug text-zinc-200 group-hover:text-white transition-colors">
                      {paper.title}
                    </h4>
                    <span
                      className={`text-[9px] px-1.5 py-0.5 rounded-full font-semibold uppercase tracking-wider border shrink-0 ${statusStyles[status]}`}
                    >
                      {status}
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-500 mt-1.5 font-mono">
                    {paper.authors} {paper.year && `(${paper.year})`}
                    {paper.source && <span className="text-zinc-600"> · {paper.source}</span>}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {paper.doi && (
                    <a
                      href={`https://doi.org/${paper.doi}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[10px] px-2 py-1 rounded-md bg-zinc-800/50 text-zinc-500 hover:text-indigo-400 hover:bg-indigo-500/10 border border-zinc-700/50 hover:border-indigo-500/30 transition-all font-mono"
                    >
                      DOI ↗
                    </a>
                  )}
                  {abstract && (
                    <button
                      onClick={() => toggleExpanded(paper.id)}
                      className="text-[10px] px-2 py-1 rounded-md bg-zinc-800/50 text-zinc-400 hover:text-zinc-200 border border-zinc-700/50 hover:border-zinc-600/80 transition-all font-mono inline-flex items-center gap-1"
                    >
                      Abstract
                      <ChevronDown size={12} className={`transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                    </button>
                  )}
                </div>
              </div>

              {isExpanded && abstract && (
                <div className="mt-3 rounded-xl border border-zinc-700/40 bg-zinc-900/35 px-3 py-2.5 text-[12px] text-zinc-400 leading-relaxed">
                  {abstract}
                </div>
              )}

              {paper.relevance_notes && (
                <p className="text-[11px] text-indigo-400/70 mt-2.5 leading-relaxed pl-3 border-l-2 border-indigo-500/20">
                  {paper.relevance_notes}
                </p>
              )}

              <div className="flex flex-wrap gap-1.5 mt-3">
                {paper.tags.map((tag) => (
                  <span
                    key={tag}
                    className={`text-[9px] px-2 py-0.5 rounded-full font-semibold uppercase tracking-wider border ${
                      tagColors[tag] || 'bg-zinc-700/30 text-zinc-400 border-zinc-600/30'
                    }`}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
