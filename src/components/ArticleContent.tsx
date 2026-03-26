'use client'

import { TweetEmbed } from './TweetEmbed'

interface ArticleContentProps {
  html: string
  className?: string
}

/**
 * Renders article HTML content with automatic tweet embeds.
 * Detects any <a href="https://x.com/.../status/..."> or twitter.com links
 * and inserts a TweetEmbed after the paragraph containing them.
 */
export function ArticleContent({ html, className }: ArticleContentProps) {
  // Split HTML into paragraphs/blocks
  const blockPattern = /(<(?:p|div|blockquote)[^>]*>[\s\S]*?<\/(?:p|div|blockquote)>)/gi
  const blocks = html.split(blockPattern).filter(Boolean)

  // Pattern to find x.com or twitter.com status links
  const tweetLinkPattern = /href="(https?:\/\/(?:x\.com|twitter\.com)\/[^"]*\/status\/\d+[^"]*)"/g

  const elements: { type: 'html' | 'tweet'; content: string }[] = []

  for (const block of blocks) {
    elements.push({ type: 'html', content: block })

    // Check if this block contains any tweet links
    const tweetUrls: string[] = []
    let match: RegExpExecArray | null
    tweetLinkPattern.lastIndex = 0
    while ((match = tweetLinkPattern.exec(block)) !== null) {
      // Clean the URL (remove ref_src params etc)
      const url = match[1].split('?')[0]
      if (!tweetUrls.includes(url)) {
        tweetUrls.push(url)
      }
    }

    // Add tweet embeds after this block (max 1 per paragraph to avoid clutter)
    if (tweetUrls.length > 0) {
      elements.push({ type: 'tweet', content: tweetUrls[0] })
    }
  }

  // If no tweets found, just render the HTML directly (fast path)
  const hasTweets = elements.some(e => e.type === 'tweet')
  if (!hasTweets) {
    return <div className={className} dangerouslySetInnerHTML={{ __html: html }} />
  }

  return (
    <div className={className}>
      {elements.map((el, i) => {
        if (el.type === 'tweet') {
          return <TweetEmbed key={`tweet-${i}`} tweetUrl={el.content} />
        }
        return <span key={`html-${i}`} dangerouslySetInnerHTML={{ __html: el.content }} />
      })}
    </div>
  )
}
