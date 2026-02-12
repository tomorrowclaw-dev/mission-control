'use client'

import { useState, useCallback, useRef, useEffect } from 'react'

interface SearchResult {
  id: string
  type: 'paper' | 'activity' | 'task' | 'memory'
  title: string
  snippet: string
  date: string | null
  meta?: string
  icon: string
}

export default function GlobalSearch() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  // Keyboard shortcut: Cmd+K to focus
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

  const search = useCallback(async () => {
    if (!query.trim()) return
    setLoading(true)
    setSearched(true)
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`)
      if (!res.ok) throw new Error('Search failed')
      const data = await res.json()
      setResults(data)
    } catch (err) {
      console.error(err)
      setResults([])
    } finally {
      setLoading(false)
    }
  }, [query])

  const typeColors: Record<string, string> = {
    paper: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
    activity: 'text-violet-400 bg-violet-500/10 border-violet-500/20',
    task: 'text-green-400 bg-green-500/10 border-green-500/20',
    memory: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-sm">🔍</div>
        <h2 className="font-display text-lg">Global Search</h2>
      </div>

      {/* Search input */}
      <div className="relative">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
          </svg>
        </div>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && search()}
          placeholder="Search papers, activities, tasks, memories..."
          className="w-full pl-11 pr-20 py-3.5 bg-zinc-900/50 border border-zinc-800 rounded-xl text-sm text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-indigo-500/40 focus:ring-1 focus:ring-indigo-500/20 transition-all"
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
          <kbd className="text-[9px] px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-500 border border-zinc-700 font-mono">⌘K</kbd>
          {query && (
            <kbd className="text-[9px] px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-500 border border-zinc-700 font-mono cursor-pointer" onClick={() => { setQuery(''); setResults([]); setSearched(false) }}>ESC</kbd>
          )}
        </div>
      </div>

      {/* Results */}
      {loading && (
        <div className="text-center py-8 text-zinc-500 text-sm animate-pulse">Searching...</div>
      )}

      {searched && !loading && results.length === 0 && (
        <div className="text-center py-8 text-zinc-600 text-sm">
          No results for &ldquo;{query}&rdquo;
        </div>
      )}

      {results.length > 0 && (
        <div className="space-y-2">
          <div className="text-[10px] text-zinc-500 font-mono uppercase tracking-wider">
            {results.length} results
          </div>
          {results.map((r, i) => {
            const colors = typeColors[r.type] || typeColors.memory
            return (
              <div
                key={r.id}
                className="card p-4 hover:bg-zinc-800/50 transition-all animate-in cursor-default"
                style={{ animationDelay: `${i * 40}ms` }}
              >
                <div className="flex items-start gap-3">
                  <span className="text-lg mt-0.5">{r.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-medium text-zinc-200">{r.title}</span>
                      <span className={`text-[9px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded border ${colors}`}>
                        {r.type}
                      </span>
                    </div>
                    <div className="text-[11px] text-zinc-500 mt-1 line-clamp-2">{r.snippet}</div>
                    <div className="flex items-center gap-3 mt-1.5">
                      {r.date && <span className="text-[10px] text-zinc-600 font-mono">{r.date}</span>}
                      {r.meta && <span className="text-[10px] text-zinc-600">{r.meta}</span>}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {!searched && (
        <div className="text-center py-12 space-y-3">
          <div className="text-2xl">🔍</div>
          <div className="text-sm text-zinc-500">Search across your entire workspace</div>
          <div className="flex flex-wrap justify-center gap-2 mt-4">
            {['RAG', 'trust calibration', 'daily brief', 'TTF', 'school safety'].map(term => (
              <button
                key={term}
                onClick={() => { setQuery(term); }}
                className="text-[11px] px-2.5 py-1 rounded-full bg-zinc-800/50 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 border border-zinc-700/50 transition-all"
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
