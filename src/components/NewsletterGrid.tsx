import { NewsletterCard } from './NewsletterCard';
import type { Newsletter } from '@/lib/beehiiv';

interface NewsletterGridProps {
  newsletters: Newsletter[];
}

export function NewsletterGrid({ newsletters }: NewsletterGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
      {newsletters.map((newsletter, index) => (
        <div
          key={newsletter.id}
          className="animate-fade-up"
          style={{ animationDelay: `${index * 100}ms` }}
        >
          <NewsletterCard newsletter={newsletter} priority={index < 3} />
        </div>
      ))}
    </div>
  );
}
