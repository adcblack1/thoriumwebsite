'use client'

import { useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'

/**
 * Handles post-OAuth subscriber sync.
 * After Google sign-in, the auth callback redirects with ?sync=true.
 * This component detects that param, calls the sync-subscriber API,
 * and redirects to /subscribe if the survey isn't complete.
 */
export function AuthSyncHandler() {
  const searchParams = useSearchParams()
  const router = useRouter()

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

          // If survey is incomplete, redirect to /subscribe with their data pre-loaded
          if (!data.survey_complete && data.supabase_subscriber_id) {
            const subData = data.subscriber_data || {}
            const formData = {
              email: subData.email || '',
              first_name: subData.first_name || '',
              main_goal: subData.main_goal || '',
              seniority: subData.seniority || '',
              job_function: subData.job_function || '',
              industry: subData.industry || '',
              company_size: subData.company_size || '',
              ai_tools: subData.ai_tools || [],
              child_newsletters: subData.child_newsletters || ['the-catalyst', 'the-lab'],
            }

            // Figure out which step they should resume at
            // Step 2 = newsletters, 3 = name, 4 = goal, 5 = role, 6 = industry, 7 = ai tools
            let resumeStep = 2 // Always start at newsletter selection for new users
            if (!data.is_new && subData.email) {
              // Returning subscriber — skip to where they left off
              if (!subData.first_name) resumeStep = 3
              else if (!subData.main_goal) resumeStep = 4
              else if (!subData.seniority || !subData.job_function) resumeStep = 5
              else if (!subData.industry || !subData.company_size) resumeStep = 6
              else if (!subData.ai_tools || subData.ai_tools.length === 0) resumeStep = 7
              else resumeStep = 8
            }

            localStorage.setItem('tv_subscribe_progress', JSON.stringify({
              formData,
              step: resumeStep,
              subscriberId: data.supabase_subscriber_id,
            }))
            router.push(`/subscribe?step=${resumeStep}`)
            return
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
  }, [searchParams, router])

  return null
}

