import type { Metadata, Viewport } from 'next';

export const metadata: Metadata = {
  title: 'Subscribe',
  description: 'Get the most important AI news, tools, and breakthroughs delivered to your inbox every morning. Free forever.',
};

// Override the global cream theme-color for /subscribe.
// The subscribe page uses a black hero background — this makes iOS Safari's
// chrome (status bar tint + URL bar bleed) go black to match.
export const viewport: Viewport = {
  themeColor: '#000000',
};

export default function SubscribeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
