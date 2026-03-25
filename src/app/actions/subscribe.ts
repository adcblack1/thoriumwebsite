'use server';

import { z } from 'zod';

const emailSchema = z.string().email('Please enter a valid email address');

const BEEHIIV_API_KEY = process.env.BEEHIIV_API_KEY;
const BEEHIIV_PUBLICATION_ID = process.env.BEEHIIV_PUBLICATION_ID;

export async function subscribeAction(
  prevState: { success?: boolean; error?: string } | null,
  formData: FormData
) {
  const email = formData.get('email');

  const result = emailSchema.safeParse(email);
  if (!result.success) {
    return { error: result.error.issues[0].message };
  }

  // If Beehiiv is not configured, just return success for demo purposes
  if (!BEEHIIV_API_KEY || !BEEHIIV_PUBLICATION_ID) {
    console.log('Beehiiv not configured. Email collected:', result.data);
    return { success: true };
  }

  try {
    const response = await fetch(
      `https://api.beehiiv.com/v2/publications/${BEEHIIV_PUBLICATION_ID}/subscriptions`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${BEEHIIV_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: result.data,
          reactivate_existing: true,
          send_welcome_email: true,
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Subscription failed');
    }

    return { success: true };
  } catch (error) {
    console.error('Subscribe error:', error);
    return { error: 'Something went wrong. Please try again.' };
  }
}
