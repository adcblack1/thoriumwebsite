'use server'

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { subscribeNewsletter } = await request.json()
    const cookieStore = await cookies()

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return cookieStore.getAll() },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              )
            } catch { /* Server Component */ }
          },
        },
      }
    )

    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const email = user.email
    if (!email) {
      return NextResponse.json({ error: 'No email found' }, { status: 400 })
    }

    // ── Fast path: check/create subscriber first ──

    // Check if subscriber record already exists
    const { data: existingSub } = await supabase
      .from('subscribers')
      .select('*')
      .eq('email', email)
      .single()

    let subscriberRecord = existingSub
    let isNewSubscriber = false

    if (!existingSub) {
      isNewSubscriber = true
      // Create new subscriber record
      const { data: newSub, error: insertErr } = await supabase
        .from('subscribers')
        .insert({
          email,
          child_newsletters: ['thorium-valley', 'the-catalyst', 'the-lab'],
        })
        .select('*')
        .single()

      if (insertErr) {
        console.error('Subscriber insert error:', insertErr)
      } else {
        subscriberRecord = newSub
      }
    }

    // Check if survey is complete
    const surveyComplete = subscriberRecord &&
      subscriberRecord.first_name &&
      subscriberRecord.main_goal &&
      subscriberRecord.seniority &&
      subscriberRecord.job_function &&
      subscriberRecord.industry &&
      subscriberRecord.company_size &&
      subscriberRecord.ai_tools && (subscriberRecord.ai_tools as string[]).length > 0

    // ── Fire Beehiiv sync in background (don't await — don't block redirect) ──
    const BEEHIIV_API_KEY = process.env.BEEHIIV_API_KEY
    const BEEHIIV_PUBLICATION_ID = process.env.BEEHIIV_PUBLICATION_ID

    const beehiivSync = async () => {
      let beehiivSubscriberId: string | null = null

      if (subscribeNewsletter && BEEHIIV_API_KEY && BEEHIIV_PUBLICATION_ID) {
        try {
          const beehiivRes = await fetch(
            `https://api.beehiiv.com/v2/publications/${BEEHIIV_PUBLICATION_ID}/subscriptions`,
            {
              method: 'POST',
              headers: {
                Authorization: `Bearer ${BEEHIIV_API_KEY}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                email,
                reactivate_existing: true,
                send_welcome_email: false,
                utm_source: 'website_signin',
              }),
            }
          )
          if (beehiivRes.ok) {
            const beehiivData = await beehiivRes.json()
            beehiivSubscriberId = beehiivData?.data?.id || null
          }
        } catch (err) {
          console.error('Beehiiv subscribe error:', err)
        }
      }

      // If we didn't get a subscriber ID from subscribing, try to look them up
      if (!beehiivSubscriberId && BEEHIIV_API_KEY && BEEHIIV_PUBLICATION_ID) {
        try {
          const lookupRes = await fetch(
            `https://api.beehiiv.com/v2/publications/${BEEHIIV_PUBLICATION_ID}/subscriptions?email=${encodeURIComponent(email)}`,
            {
              headers: { Authorization: `Bearer ${BEEHIIV_API_KEY}` },
            }
          )
          if (lookupRes.ok) {
            const lookupData = await lookupRes.json()
            if (lookupData?.data?.length > 0) {
              beehiivSubscriberId = lookupData.data[0].id
            }
          }
        } catch (err) {
          console.error('Beehiiv lookup error:', err)
        }
      }

      if (!beehiivSubscriberId) {
        beehiivSubscriberId = `supabase-${user.id}`
      }

      // Update profiles table with Beehiiv ID
      await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          email,
          beehiiv_subscriber_id: beehiivSubscriberId,
          updated_at: new Date().toISOString(),
        })
        .then(({ error }) => {
          if (error) console.error('Profile upsert error:', error)
        })
    }

    // Fire and forget — don't block the response
    beehiivSync().catch(err => console.error('Background beehiiv sync error:', err))

    return NextResponse.json({
      success: true,
      subscriber_id: `supabase-${user.id}`,
      supabase_subscriber_id: subscriberRecord?.id || null,
      survey_complete: !!surveyComplete,
      is_new: isNewSubscriber,
      subscriber_data: subscriberRecord || null,
    })
  } catch (err) {
    console.error('Sync subscriber error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
