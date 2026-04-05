import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Newsletter',
  description: 'Browse the Thorium Valley newsletter archive. Every AI update, insight, and breakdown — all in one place.',
};

export default function NewsletterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
