import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase-server'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const pollId = searchParams.get('poll')
  const answer = searchParams.get('answer')
  const sid = searchParams.get('sid')
  const returnTo = searchParams.get('returnTo') || '/'

  // Validate
  if (!pollId || !answer || !sid) {
    return NextResponse.json({ error: 'Missing poll, answer, or sid' }, { status: 400 })
  }

  // Don't process if sid is the literal merge tag (not replaced by Beehiiv)
  if (sid.includes('{{') || sid.includes('subscriber_id')) {
    return NextResponse.redirect(new URL(`/poll/results?poll=${pollId}&answer=${encodeURIComponent(answer)}&error=invalid_subscriber&returnTo=${encodeURIComponent(returnTo)}`, req.url))
  }

  const supabase = createServerClient()

  // Check if this subscriber already voted on this poll
  const { data: existingVote } = await supabase
    .from('poll_votes')
    .select('answer')
    .eq('poll_id', pollId)
    .eq('subscriber_id', sid)
    .single()

  if (existingVote) {
    // Already voted — redirect to results showing their original answer
    return NextResponse.redirect(
      new URL(`/poll/results?poll=${pollId}&sid=${sid}&answer=${encodeURIComponent(existingVote.answer)}&already_voted=true&returnTo=${encodeURIComponent(returnTo)}`, req.url)
    )
  }

  // Insert the vote (first time only)
  const { error } = await supabase
    .from('poll_votes')
    .insert({ poll_id: pollId, subscriber_id: sid, answer })

  if (error) {
    console.error('Vote error:', error)
    return NextResponse.redirect(new URL(`/poll/results?poll=${pollId}&answer=${encodeURIComponent(answer)}&error=vote_failed&returnTo=${encodeURIComponent(returnTo)}`, req.url))
  }

  // Redirect to results page
  return NextResponse.redirect(
    new URL(`/poll/results?poll=${pollId}&sid=${sid}&answer=${encodeURIComponent(answer)}&returnTo=${encodeURIComponent(returnTo)}`, req.url)
  )
}
