'use client'

import { useEffect } from 'react'
import { useSearchParams } from 'next/navigation'

/**
 * Handles post-OAuth subscriber sync.
 * After Google sign-in, the auth callback redirects with ?sync=true.
 * This component detects that param and calls the sync-subscriber API.
 */
export function AuthSyncHandler() {
  const searchParams = useSearchParams()

  useEffect(() => {
    const shouldSync = searchParams.get('sync') === 'true'
    if (!shouldSync) return

    const doSync = async () => {
      const subscribeNewsletter = localStorage.getItem('tv_subscribe_newsletter') !== 'false'
      try {
        const res = await fetch('/api/auth/sync-subscriber', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ subscribeNewsletter }),
        })
        if (res.ok) {
          const data = await res.json()
          if (data.subscriber_id) {
            localStorage.setItem('tv_subscriber_id', data.subscriber_id)
          }
        }
      } catch { /* silently fail */ }

      // Clean up localStorage and URL
      localStorage.removeItem('tv_subscribe_newsletter')
      const url = new URL(window.location.href)
      url.searchParams.delete('sync')
      window.history.replaceState({}, '', url.toString())
    }

    doSync()
  }, [searchParams])

  return null
}
