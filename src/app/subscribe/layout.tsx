import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Subscribe',
  description: 'Get the most important AI news, tools, and breakthroughs delivered to your inbox every morning. Free forever.',
};

export default function SubscribeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
