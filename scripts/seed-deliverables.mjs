import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://jofskdvhfapxfwjxaxho.supabase.co'
const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpvZnNrZHZoZmFweGZ3anhheGhvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDU3MzEwOSwiZXhwIjoyMDg2MTQ5MTA5fQ.SQTs3rOzB4r9eY2jAEQmigyKGlzyekXV9QIphSfu_2g'

const supabase = createClient(SUPABASE_URL, SERVICE_KEY)

const deliverables = [
  { week: 1, start: '2026-02-10', title: 'Introduction draft', desc: 'Problem statement, research questions, significance of the study', ch: 'Ch 1', status: 'in_progress' },
  { week: 2, start: '2026-02-17', title: 'Literature Review pt 1', desc: 'K-12 risk assessment landscape, expertise gap in school safety', ch: 'Ch 2' },
  { week: 3, start: '2026-02-24', title: 'Literature Review pt 2', desc: 'Task-Technology Fit theory, trust calibration, RAG & scaffolding', ch: 'Ch 2' },
  { week: 4, start: '2026-03-02', title: 'Literature Review pt 3', desc: 'AI in education, Design Science Research foundations', ch: 'Ch 2' },
  { week: 5, start: '2026-03-09', title: 'Methodology draft', desc: 'DSR framework, three design cycles, evaluation design & instruments', ch: 'Ch 3' },
  { week: 6, start: '2026-03-16', title: 'Design & Development pt 1', desc: 'System architecture, RAG pipeline, technology stack decisions', ch: 'Ch 4' },
  { week: 7, start: '2026-03-23', title: 'Design & Development pt 2', desc: 'UI/UX design, scaffolding features, citation grounding mechanisms', ch: 'Ch 4' },
  { week: 8, start: '2026-03-30', title: 'Data collection progress', desc: 'Usability study protocol, participant recruitment update', ch: null },
  { week: 9, start: '2026-04-06', title: 'Evaluation pt 1', desc: 'Participant demographics, raw results, SUS scores', ch: 'Ch 5' },
  { week: 10, start: '2026-04-13', title: 'Evaluation pt 2', desc: 'TTF analysis, performance metrics, qualitative findings', ch: 'Ch 5' },
  { week: 11, start: '2026-04-20', title: 'Results synthesis', desc: 'Complete results with data visualizations and statistical analysis', ch: 'Ch 5' },
  { week: 12, start: '2026-04-27', title: 'Discussion pt 1', desc: 'Findings mapped to research questions, implications for practice', ch: 'Ch 6' },
  { week: 13, start: '2026-05-04', title: 'Discussion pt 2', desc: 'Limitations, future work, DSR contributions to knowledge', ch: 'Ch 6' },
  { week: 14, start: '2026-05-11', title: 'Conclusion + revised Introduction', desc: 'Final conclusion draft, revised introduction reflecting complete study', ch: 'Ch 1 & 7' },
  { week: 15, start: '2026-05-18', title: 'Full draft assembly', desc: 'All chapters integrated into cohesive document', ch: 'All' },
  { week: 16, start: '2026-05-25', title: 'Advisor review period', desc: 'Buffer week for comprehensive advisor review', ch: null },
  { week: 17, start: '2026-06-01', title: 'Revisions round 1', desc: 'Address advisor feedback, strengthen weak sections', ch: 'All' },
  { week: 18, start: '2026-06-08', title: 'Revisions round 2', desc: 'Final revisions, abstract, front matter, references check', ch: 'All' },
  { week: 19, start: '2026-06-15', title: 'Final polished draft', desc: 'Submission-quality thesis delivered to advisor', ch: 'All' },
  { week: 20, start: '2026-06-22', title: 'Committee copies & defense prep', desc: 'Distribute to committee, prepare defense presentation', ch: null },
]

async function seed() {
  console.log('Clearing existing deliverables...')
  const { error: deleteError } = await supabase.from('advisor_deliverables').delete().neq('id', '00000000-0000-0000-0000-000000000000')
  if (deleteError) console.error('Error clearing:', deleteError)

  console.log('Inserting deliverables...')
  for (const d of deliverables) {
    const { error } = await supabase.from('advisor_deliverables').insert({
      week_number: d.week,
      week_start: d.start,
      title: d.title,
      description: d.desc,
      chapter: d.ch,
      status: d.status || 'upcoming'
    })
    if (error) {
      console.error(`Error inserting week ${d.week}:`, error)
    } else {
      console.log(`Inserted week ${d.week}`)
    }
  }
  console.log('Done!')
}

seed()
