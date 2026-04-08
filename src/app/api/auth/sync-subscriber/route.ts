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

    let beehiivSubscriberId: string | null = null

    // Subscribe to Beehiiv if checkbox was checked
    const BEEHIIV_API_KEY = process.env.BEEHIIV_API_KEY
    const BEEHIIV_PUBLICATION_ID = process.env.BEEHIIV_PUBLICATION_ID

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
              send_welcome_email: false, // They're already on the site
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

    // Fall back to Supabase user ID if Beehiiv isn't configured
    if (!beehiivSubscriberId) {
      beehiivSubscriberId = `supabase-${user.id}`
    }

    // Update profiles table
    const { error: profileError } = await supabase
      .from('profiles')
      .upsert({
        id: user.id,
        email,
        beehiiv_subscriber_id: beehiivSubscriberId,
        updated_at: new Date().toISOString(),
      })

    if (profileError) {
      console.error('Profile upsert error:', profileError)
    }

    // ── Also upsert into subscribers table so survey data is connected ──
    // Extract first name from Google profile if available
    const firstName = user.user_metadata?.full_name?.split(' ')[0] || user.user_metadata?.name?.split(' ')[0] || ''

    // Check if subscriber record already exists
    const { data: existingSub } = await supabase
      .from('subscribers')
      .select('*')
      .eq('email', email)
      .single()

    let subscriberRecord = existingSub

    if (!existingSub) {
      // Create new subscriber record
      const { data: newSub, error: insertErr } = await supabase
        .from('subscribers')
        .insert({
          email,
          first_name: firstName,
          child_newsletters: ['the-catalyst', 'the-lab'],
        })
        .select('*')
        .single()

      if (insertErr) {
        console.error('Subscriber insert error:', insertErr)
      } else {
        subscriberRecord = newSub
      }
    } else if (!existingSub.first_name && firstName) {
      // Backfill first name from Google if missing
      await supabase
        .from('subscribers')
        .update({ first_name: firstName, updated_at: new Date().toISOString() })
        .eq('id', existingSub.id)
      subscriberRecord = { ...existingSub, first_name: firstName }
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

    return NextResponse.json({
      success: true,
      subscriber_id: beehiivSubscriberId,
      supabase_subscriber_id: subscriberRecord?.id || null,
      survey_complete: !!surveyComplete,
      subscriber_data: subscriberRecord || null,
    })
  } catch (err) {
    console.error('Sync subscriber error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

