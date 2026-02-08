import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'

const supabase = createClient(
  'https://jofskdvhfapxfwjxaxho.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpvZnNrZHZoZmFweGZ3anhheGhvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDU3MzEwOSwiZXhwIjoyMDg2MTQ5MTA5fQ.SQTs3rOzB4r9eY2jAEQmigyKGlzyekXV9QIphSfu_2g'
)

const sql = readFileSync('supabase/migrations/001_initial_schema.sql', 'utf-8')

// Split into individual statements
const statements = sql.split(';').map(s => s.trim()).filter(s => s.length > 0 && !s.startsWith('--'))

for (const stmt of statements) {
  console.log(`Running: ${stmt.substring(0, 60)}...`)
  const { error } = await supabase.rpc('', {}).then(() => ({})).catch(() => ({}))
}

// Use the SQL endpoint directly
const res = await fetch('https://jofskdvhfapxfwjxaxho.supabase.co/rest/v1/', {
  headers: {
    'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpvZnNrZHZoZmFweGZ3anhheGhvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDU3MzEwOSwiZXhwIjoyMDg2MTQ5MTA5fQ.SQTs3rOzB4r9eY2jAEQmigyKGlzyekXV9QIphSfu_2g'
  }
})
console.log('API status:', res.status)
console.log('Tables:', await res.text())
