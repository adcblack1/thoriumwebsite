'use client'

interface TweetEmbedProps {
  tweetUrl: string
}

/**
 * Renders an X/Twitter post as a static styled blockquote.
 * No JavaScript widget — just clean HTML that works everywhere.
 */
export function TweetEmbed({ tweetUrl }: TweetEmbedProps) {
  // Extract username from URL
  const match = tweetUrl.match(/(?:x\.com|twitter\.com)\/([^/]+)\/status/)
  const username = match ? `@${match[1]}` : 'X'

  return (
    <blockquote
      style={{
        margin: '12px 0',
        padding: '14px 18px',
        borderLeft: '4px solid #5170ff',
        backgroundColor: '#f8f9fa',
        borderRadius: '0 8px 8px 0',
        fontSize: '14px',
        fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', system-ui, sans-serif",
        lineHeight: '1.5',
      }}
    >
      <a
        href={tweetUrl}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          color: '#5170ff',
          textDecoration: 'none',
          fontWeight: 600,
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
        }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style={{ flexShrink: 0 }}>
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
        {username}
      </a>
      <span style={{ color: '#666', marginLeft: '8px' }}>
        — <a href={tweetUrl} target="_blank" rel="noopener noreferrer" style={{ color: '#5170ff', textDecoration: 'none' }}>View on X →</a>
      </span>
    </blockquote>
  )
}
