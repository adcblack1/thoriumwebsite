'use client'

import { useState } from 'react'

interface TweetEmbedProps {
  tweetUrl: string
}

/**
 * Renders an X/Twitter post using Twitter's iframe embed.
 * Shows the full tweet content — text, media, likes, date — just like iframely.
 */
export function TweetEmbed({ tweetUrl }: TweetEmbedProps) {
  const [loaded, setLoaded] = useState(false)

  // Extract tweet ID from URL
  const match = tweetUrl.match(/status\/(\d+)/)
  if (!match) return null
  const tweetId = match[1]

  return (
    <div style={{ margin: '12px 0', display: 'flex', justifyContent: 'center' }}>
      <iframe
        src={`https://platform.twitter.com/embed/Tweet.html?id=${tweetId}&dnt=true&theme=light`}
        style={{
          border: 'none',
          borderRadius: '12px',
          maxWidth: '550px',
          width: '100%',
          height: loaded ? '300px' : '0px',
          overflow: 'hidden',
          transition: 'height 0.3s ease',
        }}
        loading="lazy"
        allowFullScreen
        onLoad={() => setLoaded(true)}
      />
      {!loaded && (
        <a
          href={tweetUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            color: '#5170ff',
            textDecoration: 'none',
            fontSize: '14px',
            fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', system-ui, sans-serif",
          }}
        >
          View post on X →
        </a>
      )}
    </div>
  )
}
