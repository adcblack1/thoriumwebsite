import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';

// Real Inter — scoped to /subscribe ONLY. The rest of the site keeps its
// existing system-font stack. We expose Inter as a CSS variable that the
// `.subscribe-root` wrapper (see globals.css) consumes, so every non-heading
// element inside the funnel renders in real Inter. Headings stay Times.
const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter-real',
});

export const metadata: Metadata = {
  title: 'Subscribe',
  description: 'Get the most important AI news, tools, and breakthroughs delivered to your inbox every morning. Free forever.',
};

// Override the global theme-color for /subscribe.
// The subscribe flow uses a navy (#002f5b) background — this makes iOS Safari's
// chrome (status bar tint + URL bar bleed) go navy to match.
export const viewport: Viewport = {
  themeColor: '#002f5b',
};

export default function SubscribeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className={`${inter.variable} subscribe-root`}>{children}</div>;
}
