'use client'

import { useEffect, useRef, useState } from 'react'

interface TweetEmbedProps {
  tweetUrl: string
}

export function TweetEmbed({ tweetUrl }: TweetEmbedProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const [height, setHeight] = useState(0) // Start at 0, grow when tweet loads
  const [visible, setVisible] = useState(true)

  const match = tweetUrl.match(/status\/(\d+)/)
  if (!match) return null
  const tweetId = match[1]

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>

    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== 'https://platform.twitter.com') return
      try {
        const data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data
        if (data['twttr.embed']?.method === 'twttr.private.resize') {
          const params = data['twttr.embed'].params
          if (params?.[0]?.height) {
            // Tweet loaded — set height and clear timeout
            setHeight(params[0].height)
            clearTimeout(timeoutId)
          }
        }
      } catch { /* not our message */ }
    }

    window.addEventListener('message', handleMessage)

    // If no resize event after 4 seconds, tweet doesn't exist — hide it
    timeoutId = setTimeout(() => {
      if (height === 0) {
        setVisible(false)
      }
    }, 4000)

    return () => {
      window.removeEventListener('message', handleMessage)
      clearTimeout(timeoutId)
    }
  }, [tweetId])

  if (!visible) return null

  return (
    <div style={{
      margin: height > 0 ? '12px 0' : '0',
      display: 'flex',
      justifyContent: 'center',
      overflow: 'hidden',
      transition: 'height 0.3s ease, margin 0.3s ease',
    }}>
      <iframe
        ref={iframeRef}
        src={`https://platform.twitter.com/embed/Tweet.html?id=${tweetId}&dnt=true&theme=light&hideThread=true&hideCard=false`}
        style={{
          border: 'none',
          borderRadius: '12px',
          maxWidth: '550px',
          width: '100%',
          height: height > 0 ? `${height}px` : '0px',
          overflow: 'hidden',
          transition: 'height 0.3s ease',
        }}
        scrolling="no"
        allowFullScreen
      />
    </div>
  )
}
