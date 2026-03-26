import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase-server'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { poll_id, subscriber_id, feedback } = body

    if (!poll_id || !subscriber_id || !feedback) {
      return NextResponse.json({ error: 'Missing poll_id, subscriber_id, or feedback' }, { status: 400 })
    }

    const supabase = createServerClient()

    const { error } = await supabase
      .from('poll_feedback')
      .insert({ poll_id, subscriber_id, feedback })

    if (error) {
      console.error('Feedback error:', error)
      return NextResponse.json({ error: 'Failed to save feedback' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}
