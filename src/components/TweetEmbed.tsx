'use client'

import { useEffect, useRef } from 'react'

interface TweetEmbedProps {
  tweetUrl: string
}

declare global {
  interface Window {
    twttr?: {
      widgets: {
        load: (el?: HTMLElement) => void
        createTweet: (tweetId: string, el: HTMLElement, options?: Record<string, unknown>) => Promise<HTMLElement>
      }
    }
  }
}

export function TweetEmbed({ tweetUrl }: TweetEmbedProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current) return

    // Extract tweet ID from URL
    const match = tweetUrl.match(/status\/(\d+)/)
    if (!match) return
    const tweetId = match[1]

    const loadTweet = () => {
      if (window.twttr?.widgets && containerRef.current) {
        // Clear any previous content
        containerRef.current.innerHTML = ''
        window.twttr.widgets.createTweet(tweetId, containerRef.current, {
          theme: 'light',
          align: 'center',
          dnt: true,
          conversation: 'none',
        })
      }
    }

    // Load Twitter widget script if not already loaded
    if (!document.querySelector('script[src*="platform.twitter.com"]')) {
      const script = document.createElement('script')
      script.src = 'https://platform.twitter.com/widgets.js'
      script.async = true
      script.onload = loadTweet
      document.head.appendChild(script)
    } else if (window.twttr?.widgets) {
      loadTweet()
    } else {
      // Script is loading, wait for it
      const interval = setInterval(() => {
        if (window.twttr?.widgets) {
          clearInterval(interval)
          loadTweet()
        }
      }, 200)
      return () => clearInterval(interval)
    }
  }, [tweetUrl])

  return (
    <div
      ref={containerRef}
      style={{
        margin: '16px 0',
        minHeight: '200px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      {/* Fallback while loading */}
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
    </div>
  )
}
