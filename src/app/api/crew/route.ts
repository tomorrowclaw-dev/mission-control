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
      .from('crew_status')
      .select('*')
      .order('agent_id')

    if (error) throw error
    return NextResponse.json(data || [])
  } catch (err) {
    console.error('Crew status error:', err)
    return NextResponse.json([])
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json()
    const { agent_id, status, task, role } = body

    if (!agent_id) {
      return NextResponse.json({ error: 'agent_id is required' }, { status: 400 })
    }

    const update: Record<string, unknown> = { last_active: new Date().toISOString() }
    if (status) update.status = status
    if (task !== undefined) update.task = task
    if (role) update.role = role

    const { data, error } = await getSupabase()
      .from('crew_status')
      .update(update)
      .eq('agent_id', agent_id)
      .select()
      .single()

    if (error) throw error
    return NextResponse.json(data)
  } catch (err) {
    console.error('Crew status update error:', err)
    return NextResponse.json({ error: 'Failed to update crew status' }, { status: 500 })
  }
}
