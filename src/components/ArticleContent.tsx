'use client'

import { TweetEmbed } from './TweetEmbed'

interface ArticleContentProps {
  html: string
  className?: string
}

/**
 * Renders article HTML content with tweet embeds.
 * Detects <div class="tweet-embed" data-tweet-url="..."></div> in the HTML
 * and replaces them with interactive TweetEmbed components.
 */
export function ArticleContent({ html, className }: ArticleContentProps) {
  // Split HTML by tweet embed markers
  const tweetPattern = /<div\s+class="tweet-embed"\s+data-tweet-url="([^"]+)"[^>]*><\/div>/g
  const parts: { type: 'html' | 'tweet'; content: string }[] = []
  
  let lastIndex = 0
  let match: RegExpExecArray | null

  while ((match = tweetPattern.exec(html)) !== null) {
    // Add HTML before the tweet
    if (match.index > lastIndex) {
      parts.push({ type: 'html', content: html.slice(lastIndex, match.index) })
    }
    // Add the tweet
    parts.push({ type: 'tweet', content: match[1] })
    lastIndex = match.index + match[0].length
  }

  // Add remaining HTML
  if (lastIndex < html.length) {
    parts.push({ type: 'html', content: html.slice(lastIndex) })
  }

  // If no tweets found, just render the HTML directly
  if (parts.length === 1 && parts[0].type === 'html') {
    return <div className={className} dangerouslySetInnerHTML={{ __html: html }} />
  }

  return (
    <div className={className}>
      {parts.map((part, i) => {
        if (part.type === 'tweet') {
          return <TweetEmbed key={`tweet-${i}`} tweetUrl={part.content} />
        }
        return <div key={`html-${i}`} dangerouslySetInnerHTML={{ __html: part.content }} />
      })}
    </div>
  )
}
