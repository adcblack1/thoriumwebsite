import Image from 'next/image';
import Link from 'next/link';
import type { Newsletter } from '@/lib/beehiiv';

interface NewsletterCardProps {
  newsletter: Newsletter;
  priority?: boolean;
}

export function NewsletterCard({ newsletter, priority = false }: NewsletterCardProps) {
  return (
    <Link href={`/newsletter/${newsletter.slug}`} className="group block no-underline">
      {/* Thumbnail */}
      <div className="relative aspect-[16/9] overflow-hidden bg-[#1b1b1b]/5 mb-4">
        {newsletter.thumbnail_url ? (
          <Image
            src={newsletter.thumbnail_url}
            alt={newsletter.title}
            fill
            priority={priority}
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-[#1b1b1b]/30">
            No image
          </div>
        )}
        {/* Category Tag */}
        <span className="absolute top-3 left-3 bg-[#5170ff] text-white text-xs font-medium px-2 py-1">
          Newsletter
        </span>
      </div>

      {/* Content */}
      <h3 className="text-[#1b1b1b] font-bold text-lg mb-2 group-hover:text-[#5170ff] transition-colors line-clamp-2">
        {newsletter.title}
      </h3>
      {newsletter.subtitle && (
        <p className="text-[#1b1b1b]/60 text-sm mb-2 line-clamp-2">
          {newsletter.subtitle}
        </p>
      )}
      <time className="text-[#1b1b1b]/50 text-sm">
        {new Date(newsletter.published_at).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        })}
      </time>
    </Link>
  );
}
