#!/usr/bin/env node
// Search Semantic Scholar for papers and insert into Supabase
// Usage: node search-papers.mjs "query" [--tag TAG] [--limit N]

import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://jofskdvhfapxfwjxaxho.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpvZnNrZHZoZmFweGZ3anhheGhvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDU3MzEwOSwiZXhwIjoyMDg2MTQ5MTA5fQ.SQTs3rOzB4r9eY2jAEQmigyKGlzyekXV9QIphSfu_2g'
)

const query = process.argv[2]
const tagFlag = process.argv.indexOf('--tag')
const tag = tagFlag > -1 ? process.argv[tagFlag + 1] : null
const limitFlag = process.argv.indexOf('--limit')
const limit = limitFlag > -1 ? parseInt(process.argv[limitFlag + 1]) : 10

if (!query) {
  console.error('Usage: node search-papers.mjs "query" [--tag TAG] [--limit N]')
  process.exit(1)
}

async function searchSemanticScholar(q, n) {
  const url = `https://api.semanticscholar.org/graph/v1/paper/search?query=${encodeURIComponent(q)}&limit=${n}&fields=title,authors,year,abstract,url,citationCount,externalIds`
  const res = await fetch(url)
  if (!res.ok) {
    console.error(`Semantic Scholar error: ${res.status}`)
    return []
  }
  const data = await res.json()
  return data.data || []
}

async function checkExisting(title) {
  const { data } = await supabase
    .from('papers')
    .select('id')
    .ilike('title', title)
    .limit(1)
  return data && data.length > 0
}

async function insertPaper(paper, tags) {
  const authors = paper.authors?.map(a => a.name).join(', ') || null
  const doi = paper.externalIds?.DOI || null
  const year = paper.year || null

  const record = {
    title: paper.title,
    authors,
    year,
    source: null,
    url: paper.url || null,
    doi,
    tags: tags || [],
    summary: paper.abstract ? paper.abstract.substring(0, 500) : null,
    relevance_notes: null,
    review_status: 'unread',
  }

  const { data, error } = await supabase.from('papers').insert(record).select()
  if (error) {
    console.error(`  ❌ Failed to insert: ${error.message}`)
    return null
  }
  return data[0]
}

async function main() {
  console.log(`🔍 Searching: "${query}" (limit: ${limit})`)
  console.log()

  const results = await searchSemanticScholar(query, limit)
  console.log(`Found ${results.length} results from Semantic Scholar\n`)

  let inserted = 0
  let skipped = 0

  for (const paper of results) {
    const exists = await checkExisting(paper.title)
    if (exists) {
      console.log(`  ⏭️  Already exists: ${paper.title}`)
      skipped++
      continue
    }

    const tags = tag ? [tag] : []
    const result = await insertPaper(paper, tags)
    if (result) {
      console.log(`  ✅ Added: ${paper.title} (${paper.year}) [${paper.citationCount} citations]`)
      inserted++
    }

    // Rate limit: Semantic Scholar allows ~1 req/sec without key
    await new Promise(r => setTimeout(r, 200))
  }

  console.log(`\n📊 Results: ${inserted} new papers added, ${skipped} already existed`)
}

main().catch(console.error)
