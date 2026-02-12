import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.SUPABASE_SERVICE_ROLE_KEY || ''
  )
}

export async function GET() {
  try {
    const { data, error } = await getSupabase()
      .from('activity_log')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100)

    if (error) {
      if (error.code === 'PGRST205') {
        return NextResponse.json([])
      }
      throw error
    }

    return NextResponse.json(data || [])
  } catch (err) {
    console.error('Activity feed error:', err)
    return NextResponse.json([])
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { crew, emoji, action, detail, station, metadata } = body

    if (!crew || !action) {
      return NextResponse.json({ error: 'crew and action are required' }, { status: 400 })
    }

    const { data, error } = await getSupabase()
      .from('activity_log')
      .insert({ crew, emoji, action, detail, station, metadata })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(data)
  } catch (err) {
    console.error('Activity log insert error:', err)
    return NextResponse.json({ error: 'Failed to log activity' }, { status: 500 })
  }
}
