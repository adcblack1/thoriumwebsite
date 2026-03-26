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
  const [pendingVote, setPendingVote] = useState(false)

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

  const doVote = useCallback(async () => {
    const sid = await getSubscriberId()
    if (sid) {
      window.location.href = `/api/poll/vote?poll=${pollId}&answer=${encodeURIComponent(answer)}&sid=${encodeURIComponent(sid)}`
    } else {
      // Need to sign in first
      setPendingVote(true)
      setShowSignIn(true)
    }
  }, [pollId, answer, getSubscriberId])

  // After sign-in modal closes, check if we now have a subscriber ID
  useEffect(() => {
    if (!showSignIn && pendingVote) {
      setPendingVote(false)
      // Short delay to allow sync to complete
      const timer = setTimeout(async () => {
        const sid = await getSubscriberId()
        if (sid) {
          window.location.href = `/api/poll/vote?poll=${pollId}&answer=${encodeURIComponent(answer)}&sid=${encodeURIComponent(sid)}`
        }
      }, 1500)
      return () => clearTimeout(timer)
    }
  }, [showSignIn, pendingVote, pollId, answer, getSubscriberId])

  return (
    <>
      <a
        href="#"
        onClick={(e) => { e.preventDefault(); doVote() }}
        style={style}
        className={className}
      >
        {children}
      </a>
      <SignInModal isOpen={showSignIn} onClose={() => setShowSignIn(false)} />
    </>
  )
}
