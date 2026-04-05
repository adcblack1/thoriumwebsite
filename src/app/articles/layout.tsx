import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'All Articles',
  description: 'Daily AI news and analysis for professionals who need to stay ahead. Read the latest articles from Thorium Valley.',
};

export default function ArticlesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
