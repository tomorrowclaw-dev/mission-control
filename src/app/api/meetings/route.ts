import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('meeting_analysis')
      .select('*')
      .order('meeting_date', { ascending: false })
      .limit(50)

    if (error) throw error
    return NextResponse.json(data)
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error('Failed to fetch meeting analysis:', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
