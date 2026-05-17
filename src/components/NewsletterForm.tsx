'use client';

import { useActionState, useEffect } from 'react';
import { subscribeAction } from '@/app/actions/subscribe';
import { trackLead, setAdvancedMatching } from '@/lib/meta-pixel';

interface NewsletterFormProps {
  className?: string;
}

export function NewsletterForm({ className = '' }: NewsletterFormProps) {
  const [state, formAction, isPending] = useActionState(subscribeAction, null);

  useEffect(() => {
    if (state?.success) {
      // Grab email from the form for advanced matching
      const emailInput = document.querySelector<HTMLInputElement>('input[name="email"]');
      if (emailInput?.value) setAdvancedMatching(emailInput.value);
    }
  }, [state?.success]);

  return (
    <form action={formAction} className={className}>
      <div className="flex border-2 border-[#1b1b1b]">
        <input
          type="email"
          name="email"
          placeholder="Your email address"
          required
          disabled={isPending}
          className="flex-1 px-4 py-3 bg-[#ffffff] text-[#1b1b1b] placeholder-[#1b1b1b]/50 focus:outline-none disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={isPending}
          className="px-6 py-3 bg-white text-[#1b1b1b] font-medium border-l-2 border-[#1b1b1b] hover:bg-[#1b1b1b] hover:text-white transition-colors disabled:opacity-50"
        >
          {isPending ? 'Subscribing...' : 'Subscribe Free'}
        </button>
      </div>

      {state?.error && (
        <p className="text-[#1b1b1b] text-sm mt-2">{state.error}</p>
      )}
      {state?.success && (
        <p className="text-[#5170ff] text-sm mt-2">Check your inbox to confirm!</p>
      )}
    </form>
  );
}
