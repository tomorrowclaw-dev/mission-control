'use client'

import { useState, useCallback, useRef, useEffect, useMemo, ReactNode } from 'react'

interface SearchResult {
  id: string
  type: 'paper' | 'activity' | 'task' | 'milestone' | 'writing'
  title: string
  snippet: string
  date: string | null
  meta?: string
  icon: string
  url?: string | null
}

type GroupedResults = Record<string, SearchResult[]>

const CATEGORY_META: Record<string, { label: string; icon: string; color: string }> = {
  paper:     { label: 'Papers',    icon: '📄', color: 'text-blue-400 bg-blue-500/10 border-blue-500/20' },
  milestone: { label: 'Timeline',  icon: '◆',  color: 'text-violet-400 bg-violet-500/10 border-violet-500/20' },
  writing:   { label: 'Writing',   icon: '✍️', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
  activity:  { label: 'Activity',  icon: '🫧', color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20' },
  task:      { label: 'Tasks',     icon: '📝', color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' },
}

function highlightText(text: string, query: string): ReactNode {
  if (!query.trim() || !text) return text
  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const regex = new RegExp(`(${escaped})`, 'gi')
  const parts = text.split(regex)
  if (parts.length === 1) return text
  return (
    <>
      {parts.map((part, i) =>
        regex.test(part) ? (
          <mark key={i} className="bg-indigo-500/25 text-indigo-300 rounded-sm px-0.5">{part}</mark>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </>
  )
}

export default function GlobalSearch() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const debounceRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        inputRef.current?.focus()
      }
      if (e.key === 'Escape') {
        inputRef.current?.blur()
        setQuery('')
        setResults([])
        setSearched(false)
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [])

  const doSearch = useCallback(async (q: string) => {
    if (!q.trim()) {
      setResults([])
      setSearched(false)
      return
    }
    setLoading(true)
    setSearched(true)
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`)
      if (!res.ok) throw new Error('Search failed')
      setResults(await res.json())
    } catch {
      setResults([])
    } finally {
      setLoading(false)
    }
  }, [])

  const handleChange = useCallback((val: string) => {
    setQuery(val)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (!val.trim()) {
      setResults([])
      setSearched(false)
      return
    }
    debounceRef.current = setTimeout(() => doSearch(val), 300)
  }, [doSearch])

  const grouped: GroupedResults = useMemo(() => {
    const g: GroupedResults = {}
    for (const r of results) {
      ;(g[r.type] ??= []).push(r)
    }
    return g
  }, [results])

  const totalCount = results.length
  const categoryOrder = ['paper', 'milestone', 'writing', 'activity', 'task']

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-sm">🔍</div>
        <div>
          <h2 className="font-display text-lg">Global Search</h2>
          <p className="text-[10px] text-zinc-600 font-mono tracking-wide mt-0.5">papers · timeline · writing · activity · tasks</p>
        </div>
      </div>

      <div className="relative group">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 transition-colors group-focus-within:text-indigo-400">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
          </svg>
        </div>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => handleChange(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && doSearch(query)}
          placeholder="Search across your entire thesis workspace..."
          className="w-full pl-11 pr-24 py-3.5 bg-zinc-900/50 border border-zinc-800 rounded-xl text-sm text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-indigo-500/40 focus:ring-1 focus:ring-indigo-500/20 focus:bg-zinc-900/70 transition-all"
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
          {loading && (
            <div className="w-4 h-4 border-2 border-indigo-500/30 border-t-indigo-400 rounded-full animate-spin" />
          )}
          <kbd className="text-[9px] px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-500 border border-zinc-700 font-mono">⌘K</kbd>
          {query && (
            <button
              onClick={() => { setQuery(''); setResults([]); setSearched(false) }}
              className="text-[9px] px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-500 border border-zinc-700 font-mono hover:text-zinc-300 hover:border-zinc-600 transition-colors"
            >ESC</button>
          )}
        </div>
      </div>

      {searched && !loading && totalCount === 0 && (
        <div className="text-center py-12">
          <div className="text-3xl mb-3 opacity-40">∅</div>
          <div className="text-sm text-zinc-500">No results for &ldquo;<span className="text-zinc-400">{query}</span>&rdquo;</div>
          <div className="text-[11px] text-zinc-600 mt-1">Try broader terms or check spelling</div>
        </div>
      )}

      {totalCount > 0 && (
        <div className="space-y-5 mt-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-zinc-500 font-mono uppercase tracking-wider">
              {totalCount} result{totalCount !== 1 ? 's' : ''} across {Object.keys(grouped).length} categor{Object.keys(grouped).length !== 1 ? 'ies' : 'y'}
            </span>
          </div>

          {categoryOrder.filter(c => grouped[c]).map((cat) => {
            const meta = CATEGORY_META[cat] || CATEGORY_META.activity
            const items = grouped[cat]
            return (
              <div key={cat} className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className={`text-[9px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded border ${meta.color}`}>
                    {meta.icon} {meta.label}
                  </span>
                  <div className="flex-1 h-px bg-zinc-800/50" />
                  <span className="text-[10px] text-zinc-600 font-mono">{items.length}</span>
                </div>

                {items.map((r, i) => (
                  <div
                    key={r.id}
                    className="card p-4 hover:bg-zinc-800/50 transition-all animate-in cursor-default group/card relative overflow-hidden"
                    style={{ animationDelay: `${i * 30}ms` }}
                  >
                    <div className={`absolute left-0 top-0 bottom-0 w-0.5 ${
                      cat === 'paper' ? 'bg-blue-500/40' :
                      cat === 'milestone' ? 'bg-violet-500/40' :
                      cat === 'writing' ? 'bg-emerald-500/40' :
                      cat === 'activity' ? 'bg-indigo-500/40' :
                      'bg-amber-500/40'
                    } opacity-0 group-hover/card:opacity-100 transition-opacity`} />

                    <div className="flex items-start gap-3">
                      <span className="text-lg mt-0.5 shrink-0">{r.icon}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-medium text-zinc-200">
                            {highlightText(r.title, query)}
                          </span>
                        </div>
                        {r.snippet && (
                          <div className="text-[11px] text-zinc-500 mt-1 line-clamp-2 leading-relaxed">
                            {highlightText(r.snippet, query)}
                          </div>
                        )}
                        <div className="flex items-center gap-3 mt-2">
                          {r.date && <span className="text-[10px] text-zinc-600 font-mono">{r.date}</span>}
                          {r.meta && <span className="text-[10px] text-zinc-600">{highlightText(r.meta, query)}</span>}
                          {r.url && (
                            <a href={r.url} target="_blank" rel="noopener noreferrer" className="text-[10px] text-indigo-400/60 hover:text-indigo-400 transition-colors font-mono">
                              ↗ open
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )
          })}
        </div>
      )}

      {!searched && (
        <div className="text-center py-16 space-y-4">
          <div className="relative inline-block">
            <div className="text-4xl opacity-20">◉</div>
            <div className="absolute inset-0 flex items-center justify-center text-2xl">🔍</div>
          </div>
          <div>
            <div className="text-sm text-zinc-400 font-body">Search across your entire thesis workspace</div>
            <div className="text-[11px] text-zinc-600 mt-1">Papers, milestones, chapters, activity log, and tasks</div>
          </div>
          <div className="flex flex-wrap justify-center gap-2 mt-6 max-w-md mx-auto">
            {['RAG pipeline', 'trust calibration', 'Chapter 3', 'defense', 'school safety', 'Shneiderman', 'DSR'].map(term => (
              <button
                key={term}
                onClick={() => handleChange(term)}
                className="text-[11px] px-3 py-1.5 rounded-full bg-zinc-800/40 text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800/80 border border-zinc-700/30 hover:border-zinc-600/50 transition-all duration-200"
              >
                {term}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
