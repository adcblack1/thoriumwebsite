'use client'

import { useEffect, useRef, useState } from 'react'

interface TweetEmbedProps {
  tweetUrl: string
}

export function TweetEmbed({ tweetUrl }: TweetEmbedProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const [height, setHeight] = useState(500)

  const match = tweetUrl.match(/status\/(\d+)/)
  if (!match) return null
  const tweetId = match[1]

  // Auto-resize iframe based on Twitter's postMessage events
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== 'https://platform.twitter.com') return
      try {
        const data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data
        if (data['twttr.embed']?.method === 'twttr.private.resize') {
          const params = data['twttr.embed'].params
          if (params?.[0]?.height && iframeRef.current) {
            const src = iframeRef.current.src
            if (src.includes(tweetId)) {
              setHeight(params[0].height)
            }
          }
        }
      } catch { /* not our message */ }
    }

    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [tweetId])

  return (
    <div style={{ margin: '12px 0', display: 'flex', justifyContent: 'center' }}>
      <iframe
        ref={iframeRef}
        src={`https://platform.twitter.com/embed/Tweet.html?id=${tweetId}&dnt=true&theme=light`}
        style={{
          border: 'none',
          borderRadius: '12px',
          maxWidth: '550px',
          width: '100%',
          height: `${height}px`,
          overflow: 'hidden',
        }}
        scrolling="no"
        allowFullScreen
      />
    </div>
  )
}
