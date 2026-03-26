import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase-server'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const pollId = searchParams.get('poll')
  const answer = searchParams.get('answer')
  const sid = searchParams.get('sid')

  // Validate
  if (!pollId || !answer || !sid) {
    return NextResponse.json({ error: 'Missing poll, answer, or sid' }, { status: 400 })
  }

  // Don't process if sid is the literal merge tag (not replaced by Beehiiv)
  if (sid.includes('{{') || sid.includes('subscriber_id')) {
    return NextResponse.redirect(new URL(`/poll/results?poll=${pollId}&answer=${encodeURIComponent(answer)}&error=invalid_subscriber`, req.url))
  }

  const supabase = createServerClient()

  // Upsert the vote (update if subscriber already voted)
  const { error } = await supabase
    .from('poll_votes')
    .upsert(
      { poll_id: pollId, subscriber_id: sid, answer },
      { onConflict: 'poll_id,subscriber_id' }
    )

  if (error) {
    console.error('Vote error:', error)
    return NextResponse.redirect(new URL(`/poll/results?poll=${pollId}&answer=${encodeURIComponent(answer)}&error=vote_failed`, req.url))
  }

  // Redirect to results page
  return NextResponse.redirect(
    new URL(`/poll/results?poll=${pollId}&sid=${sid}&answer=${encodeURIComponent(answer)}`, req.url)
  )
}
