'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase'
import { SignInModal } from '@/components/SignInModal'

interface VoteButtonProps {
  pollId: string
  answer: string
  children: React.ReactNode
  style?: React.CSSProperties
  className?: string
}

export function VoteButton({ pollId, answer, children, style, className }: VoteButtonProps) {
  const [showSignIn, setShowSignIn] = useState(false)

  const getSubscriberId = useCallback(async (): Promise<string | null> => {
    // 1. Check localStorage cache
    const cached = localStorage.getItem('tv_subscriber_id')
    if (cached) return cached

    // 2. Check if user is signed in
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      // Fetch profile to get beehiiv_subscriber_id
      const { data: profile } = await supabase
        .from('profiles')
        .select('beehiiv_subscriber_id')
        .eq('id', user.id)
        .single()

      if (profile?.beehiiv_subscriber_id) {
        localStorage.setItem('tv_subscriber_id', profile.beehiiv_subscriber_id)
        return profile.beehiiv_subscriber_id
      }

      // If profile exists but no beehiiv_subscriber_id yet, sync it
      try {
        const res = await fetch('/api/auth/sync-subscriber', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ subscribeNewsletter: false }),
        })
        if (res.ok) {
          const data = await res.json()
          if (data.subscriber_id) {
            localStorage.setItem('tv_subscriber_id', data.subscriber_id)
            return data.subscriber_id
          }
        }
      } catch { /* continue */ }
    }

    return null
  }, [])

  const navigateToVote = useCallback((sid: string) => {
    // Pass current page URL so results page can redirect back
    const returnTo = encodeURIComponent(window.location.pathname)
    window.location.href = `/api/poll/vote?poll=${pollId}&answer=${encodeURIComponent(answer)}&sid=${encodeURIComponent(sid)}&returnTo=${returnTo}`
  }, [pollId, answer])

  const doVote = useCallback(async () => {
    const sid = await getSubscriberId()
    if (sid) {
      navigateToVote(sid)
    } else {
      // Save pending vote to localStorage so it survives page reload after sign-in
      localStorage.setItem('tv_pending_vote', JSON.stringify({ pollId, answer }))
      setShowSignIn(true)
    }
  }, [pollId, answer, getSubscriberId, navigateToVote])

  // On mount: check if there's a pending vote from before sign-in
  useEffect(() => {
    const pending = localStorage.getItem('tv_pending_vote')
    if (!pending) return

    const { pollId: pendingPollId, answer: pendingAnswer } = JSON.parse(pending)
    
    // Only process if this button matches the pending vote
    if (pendingPollId !== pollId || pendingAnswer !== answer) return

    const tryVote = async () => {
      const sid = await getSubscriberId()
      if (sid) {
        localStorage.removeItem('tv_pending_vote')
        const returnTo = encodeURIComponent(window.location.pathname)
        window.location.href = `/api/poll/vote?poll=${pendingPollId}&answer=${encodeURIComponent(pendingAnswer)}&sid=${encodeURIComponent(sid)}&returnTo=${returnTo}`
      }
    }

    // Wait a bit for auth sync to complete after sign-in reload
    const timer = setTimeout(tryVote, 2000)
    return () => clearTimeout(timer)
  }, [pollId, answer, getSubscriberId])

  return (
    <>
      <a
        href="#"
        onClick={(e) => { e.preventDefault(); doVote() }}
        style={{ ...style, cursor: 'pointer' }}
        className={className}
      >
        {children}
      </a>
      <SignInModal isOpen={showSignIn} onClose={() => setShowSignIn(false)} />
    </>
  )
}
