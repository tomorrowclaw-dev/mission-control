'use client'

import { useState, useMemo } from 'react'
import { Search, Filter, RotateCw, Check, Eye, BookOpen } from 'lucide-react'
import { Paper } from '@/lib/types'

interface PapersListProps {
  papers: Paper[]
}

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

type SortOption = 'date' | 'title' | 'relevance' | 'status'
type FilterOption = 'all' | 'unread' | 'reading' | 'reviewed' | 'cited'

export default function PapersList({ papers }: PapersListProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<SortOption>('date')
  const [filterBy, setFilterBy] = useState<FilterOption>('all')
  const [expandedPaper, setExpandedPaper] = useState<string | null>(null)

  // Mock function to simulate status updates
  const handleStatusUpdate = (paperId: string, newStatus: string) => {
    console.log(`Updating paper ${paperId} to status: ${newStatus}`)
    // In a real app, this would make an API call to update the status
  }

  // Filter and sort papers
  const filteredAndSortedPapers = useMemo(() => {
    let filtered = papers.filter(paper => {
      // Search filter
      const matchesSearch = searchQuery === '' || 
        paper.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (paper.authors || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        paper.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))

      // Status filter
      const matchesFilter = filterBy === 'all' || 
        (!paper.review_status && filterBy === 'unread') ||
        (paper.review_status === filterBy)

      return matchesSearch && matchesFilter
    })

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'title':
          return a.title.localeCompare(b.title)
        case 'date':
          return (b.year || 0) - (a.year || 0)
        case 'status':
          const statusOrder = { 'unread': 0, 'reading': 1, 'reviewed': 2, 'cited': 3 }
          const aStatus = a.review_status || 'unread'
          const bStatus = b.review_status || 'unread'
          return statusOrder[bStatus as keyof typeof statusOrder] - statusOrder[aStatus as keyof typeof statusOrder]
        case 'relevance':
          // Sort by relevance notes presence, then alphabetically
          if (a.relevance_notes && !b.relevance_notes) return -1
          if (!a.relevance_notes && b.relevance_notes) return 1
          return a.title.localeCompare(b.title)
        default:
          return 0
      }
    })

    return filtered
  }, [papers, searchQuery, sortBy, filterBy])

  const statusCounts = useMemo(() => {
    const counts = { all: papers.length, unread: 0, reading: 0, reviewed: 0, cited: 0 }
    papers.forEach(paper => {
      const status = paper.review_status || 'unread'
      counts[status as keyof typeof counts]++
    })
    return counts
  }, [papers])

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case 'cited': return <Check className="w-3 h-3" />
      case 'reviewed': return <Eye className="w-3 h-3" />
      case 'reading': return <BookOpen className="w-3 h-3" />
      default: return <div className="w-3 h-3 rounded-full bg-zinc-600" />
    }
  }

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'cited': return 'bg-green-500/12 text-green-400 border-green-500/20'
      case 'reviewed': return 'bg-blue-500/12 text-blue-400 border-blue-500/20'
      case 'reading': return 'bg-amber-500/12 text-amber-400 border-amber-500/20'
      default: return 'bg-zinc-500/12 text-zinc-400 border-zinc-500/20'
    }
  }

  return (
    <div className="space-y-4">
      {/* Enhanced filters and search */}
      <div className="space-y-3">
        {/* Search bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <input
            type="text"
            placeholder="Search papers, authors, or tags..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-zinc-800/50 border border-zinc-700/50 text-sm text-zinc-200 placeholder-zinc-500 focus:border-indigo-500/50 focus:bg-zinc-800/70 transition-all"
          />
        </div>

        {/* Filter tabs and sort */}
        <div className="flex flex-col sm:flex-row gap-3 justify-between">
          <div className="flex flex-wrap gap-1">
            {Object.entries(statusCounts).map(([status, count]) => (
              <button
                key={status}
                onClick={() => setFilterBy(status as FilterOption)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
                  filterBy === status
                    ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                    : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/30 border border-transparent'
                }`}
              >
                {status === 'all' ? 'All' : status.charAt(0).toUpperCase() + status.slice(1)} ({count})
              </button>
            ))}
          </div>
          
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            className="px-3 py-1.5 rounded-lg bg-zinc-800/50 border border-zinc-700/50 text-xs text-zinc-300 focus:border-indigo-500/50 transition-all"
          >
            <option value="date">Sort by Date</option>
            <option value="title">Sort by Title</option>
            <option value="status">Sort by Status</option>
            <option value="relevance">Sort by Relevance</option>
          </select>
        </div>

        {/* Results count */}
        <div className="text-xs text-zinc-500 font-mono">
          Showing {filteredAndSortedPapers.length} of {papers.length} papers
          {searchQuery && ` matching "${searchQuery}"`}
        </div>
      </div>

      {/* Papers grid */}
      <div className="grid gap-3">
        {filteredAndSortedPapers.map((paper, idx) => {
          const isExpanded = expandedPaper === paper.id
          
          return (
            <div
              key={paper.id}
              className="card p-5 relative overflow-hidden card-shine group animate-in hover:border-zinc-600/50 transition-all duration-300"
              style={{ animationDelay: `${idx * 50}ms` }}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-start gap-3 mb-2">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <h4 className="font-display text-[15px] leading-snug text-zinc-200 group-hover:text-white transition-colors">
                        {paper.title}
                      </h4>
                      
                      {/* Interactive status badge */}
                      <div className="relative group/status">
                        <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-semibold uppercase tracking-wider border shrink-0 cursor-pointer transition-all ${getStatusColor(paper.review_status || "unread")}`}>
                          <span className="flex items-center gap-1">
                            {getStatusIcon(paper.review_status || "unread")}
                            {paper.review_status || 'unread'}
                          </span>
                        </span>
                        
                        {/* Quick status update dropdown */}
                        <div className="absolute top-full left-0 mt-1 bg-zinc-900 border border-zinc-700 rounded-lg p-1 space-y-1 opacity-0 group-hover/status:opacity-100 pointer-events-none group-hover/status:pointer-events-auto transition-opacity z-10 min-w-24">
                          {['unread', 'reading', 'reviewed', 'cited'].map((status) => (
                            <button
                              key={status}
                              onClick={() => handleStatusUpdate(paper.id, status)}
                              className="block w-full text-left px-2 py-1 text-xs text-zinc-300 hover:bg-zinc-800 rounded transition-colors"
                            >
                              {status.charAt(0).toUpperCase() + status.slice(1)}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <p className="text-[11px] text-zinc-500 font-mono">
                    {paper.authors} {paper.year && `(${paper.year})`}
                    {paper.source && <span className="text-zinc-600"> · {paper.source}</span>}
                  </p>
                </div>
                
                <div className="flex items-center gap-2 shrink-0">
                  {/* Expand/collapse button */}
                  <button
                    onClick={() => setExpandedPaper(isExpanded ? null : paper.id)}
                    className="p-1 rounded-md bg-zinc-800/50 text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/70 transition-all"
                  >
                    <RotateCw className={`w-3 h-3 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                  </button>
                  
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
                </div>
              </div>

              {/* Expandable content */}
              <div className={`overflow-hidden transition-all duration-300 ${isExpanded ? 'max-h-96 mt-3' : 'max-h-0'}`}>
                {paper.summary && (
                  <p className="text-[12px] text-zinc-400 leading-relaxed mb-3">{paper.summary}</p>
                )}

                {paper.relevance_notes && (
                  <p className="text-[11px] text-indigo-400/60 leading-relaxed pl-3 border-l-2 border-indigo-500/20 mb-3">
                    {paper.relevance_notes}
                  </p>
                )}
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-1.5 mt-3">
                {paper.tags.slice(0, isExpanded ? undefined : 5).map((tag) => (
                  <button
                    key={tag}
                    onClick={() => setSearchQuery(tag)}
                    className={`text-[9px] px-2 py-0.5 rounded-full font-semibold uppercase tracking-wider border transition-all hover:scale-105 cursor-pointer ${
                      tagColors[tag] || 'bg-zinc-700/30 text-zinc-400 border-zinc-600/30'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
                
                {!isExpanded && paper.tags.length > 5 && (
                  <button
                    onClick={() => setExpandedPaper(paper.id)}
                    className="text-[9px] px-2 py-0.5 rounded-full bg-zinc-700/30 text-zinc-500 border border-zinc-600/30 hover:text-zinc-400 transition-colors"
                  >
                    +{paper.tags.length - 5} more
                  </button>
                )}
              </div>
            </div>
          )
        })}
        
        {filteredAndSortedPapers.length === 0 && (
          <div className="text-center py-12">
            <div className="text-zinc-500 text-sm mb-2">No papers found</div>
            <button
              onClick={() => {
                setSearchQuery('')
                setFilterBy('all')
              }}
              className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
            >
              Clear filters
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
