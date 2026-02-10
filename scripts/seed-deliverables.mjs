import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import { resolve } from 'path'

dotenv.config({ path: resolve(process.cwd(), '.env.local') })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

const deliverables = [
  // Phase 1: Writing & Building (Weeks 1-5)
  {
    week_number: 1, week_start: '2026-02-09', title: 'Introduction full draft (Ch.1)',
    description: 'Ch.1 Introduction — problem statement, research gap, objectives, RQs. RAG Pipeline: ingest FEMA/CPTED docs, chunking strategy, Pinecone setup.',
    chapter: 'Ch.1', status: 'upcoming'
  },
  {
    week_number: 2, week_start: '2026-02-16', title: 'Lit Review sections 1-2 draft',
    description: 'Lit Review §1-2: Expertise Gap in K-12 + TTF in the AI Era. RAG Pipeline: test retrieval quality, refine embeddings, validate on sample queries.',
    chapter: 'Ch.2', status: 'upcoming'
  },
  {
    week_number: 3, week_start: '2026-02-23', title: 'Complete Lit Review draft (Ch.2)',
    description: 'Lit Review §3-4: AI Scaffolding & RAG + Trust Calibration. Agent Engineering: system prompt design, expert persona, RAG integration.',
    chapter: 'Ch.2', status: 'upcoming'
  },
  {
    week_number: 4, week_start: '2026-03-02', title: 'Methodology full draft (Ch.3)',
    description: 'Ch.3 Methodology — DSR framework, three cycles, evaluation design. UI Build: citation engine, confidence indicators, assessment form interface.',
    chapter: 'Ch.3', status: 'upcoming'
  },
  {
    week_number: 5, week_start: '2026-03-09', title: '★ Chs. 1-3 finalized; artifact ready for study',
    description: 'Revise & polish Intro, Lit Review, Methodology based on advisor feedback. Full integration testing; end-to-end system validation; study prep (scenarios, Gold Standard).',
    chapter: 'Ch.1-3', status: 'upcoming'
  },
  // Phase 2: Evaluation Study (Weeks 6-8)
  {
    week_number: 6, week_start: '2026-03-16', title: 'Ch.4 outline + study session progress update',
    description: 'Begin Ch.4 Artifact Design — document system architecture, RAG pipeline, agent design. Run experiment sessions: control group (static form) + treatment group (AI Expert).',
    chapter: 'Ch.4', status: 'upcoming'
  },
  {
    week_number: 7, week_start: '2026-03-23', title: 'Ch.4 draft + study data collection complete',
    description: 'Continue Ch.4 — UI design decisions, trust scaffolding features, screenshots. Complete remaining sessions; collect all survey data (TTF, trust scales) + accuracy scores.',
    chapter: 'Ch.4', status: 'upcoming'
  },
  {
    week_number: 8, week_start: '2026-03-30', title: '★ Ch.4 final + analysis results tables/figures',
    description: 'Finalize Ch.4 Artifact Design chapter. Data analysis: compare TTF scores, trust measures, assessment accuracy vs. Gold Standard.',
    chapter: 'Ch.4', status: 'upcoming'
  },
  // Phase 3: Results & Discussion (Weeks 9-12)
  {
    week_number: 9, week_start: '2026-04-06', title: 'Results chapter draft (Ch.5)',
    description: 'Ch.5 Results — statistical findings, comparison tables, participant demographics. Generate final visualizations (charts, graphs) for results chapter.',
    chapter: 'Ch.5', status: 'upcoming'
  },
  {
    week_number: 10, week_start: '2026-04-13', title: 'Discussion: findings interpretation + TTF implications',
    description: 'Ch.6 Discussion — interpret findings through TTF lens, artifact contributions. Supplementary analysis if needed; address any data gaps.',
    chapter: 'Ch.6', status: 'upcoming'
  },
  {
    week_number: 11, week_start: '2026-04-20', title: 'Complete Discussion chapter draft (Ch.6)',
    description: 'Ch.6 cont\'d — theoretical contributions, practical implications, limitations, future work. Clean up codebase, document for reproducibility.',
    chapter: 'Ch.6', status: 'upcoming'
  },
  {
    week_number: 12, week_start: '2026-04-27', title: '★ Complete thesis draft submitted to committee',
    description: 'Full thesis assembly — abstract, table of contents, references, appendices, formatting. Final artifact documentation and appendix materials.',
    chapter: 'All', status: 'upcoming'
  },
  // Phase 4: Review & Revisions (Weeks 13-16)
  {
    week_number: 13, week_start: '2026-05-04', title: 'Self-review pass; prep revision tracking doc',
    description: 'Buffer week — committee reviewing; work on any sections that need strengthening.',
    chapter: null, status: 'upcoming'
  },
  {
    week_number: 14, week_start: '2026-05-11', title: 'Polished figures/tables; tightened prose',
    description: 'Buffer week — committee reviewing; refine figures/tables, tighten arguments.',
    chapter: null, status: 'upcoming'
  },
  {
    week_number: 15, week_start: '2026-05-18', title: 'Revised draft addressing major feedback',
    description: 'Incorporate committee feedback — major structural/content revisions.',
    chapter: null, status: 'upcoming'
  },
  {
    week_number: 16, week_start: '2026-05-25', title: '★ Final revised thesis submitted to committee',
    description: 'Incorporate committee feedback — minor edits, formatting, citation cleanup.',
    chapter: null, status: 'upcoming'
  },
  // Phase 5: Defense Prep (Weeks 17-18)
  {
    week_number: 17, week_start: '2026-06-01', title: 'Defense slide deck draft',
    description: 'Build defense presentation (20-25 slides); draft talking points.',
    chapter: null, status: 'upcoming'
  },
  {
    week_number: 18, week_start: '2026-06-08', title: '★ Final thesis + defense presentation ready',
    description: 'Practice defense; incorporate any final committee notes; submit final document.',
    chapter: null, status: 'upcoming'
  },
]

async function seed() {
  console.log('Clearing existing deliverables...')
  const { error: deleteError } = await supabase.from('advisor_deliverables').delete().neq('id', '00000000-0000-0000-0000-000000000000')
  if (deleteError) {
    console.error('Delete error:', deleteError.message)
  }

  console.log('Inserting 18-week timeline...')
  const { data, error } = await supabase.from('advisor_deliverables').insert(deliverables).select()
  if (error) {
    console.error('Insert error:', error.message)
    process.exit(1)
  }
  console.log(`✅ Seeded ${data.length} deliverables`)
}

seed()
