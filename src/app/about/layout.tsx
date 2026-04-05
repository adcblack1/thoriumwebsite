import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About',
  description: 'Learn about Thorium Valley — a free daily AI newsletter started at Stanford, keeping professionals ahead on artificial intelligence.',
};

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
