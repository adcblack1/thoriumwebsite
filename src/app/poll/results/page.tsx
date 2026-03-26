'use client'

import { useSearchParams } from 'next/navigation'
import { useEffect, useState, Suspense } from 'react'
import { createClient } from '@/lib/supabase'

const ACCENT = '#5170ff'
const SANS = "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text', system-ui, sans-serif"

interface PollData {
  id: string
  type: 'poll' | 'game'
  question: string
  options: string[]
  correct_answer: string | null
}

interface VoteResult {
  answer: string
  count: number
  pct: number
}

function PollResultsContent() {
  const searchParams = useSearchParams()
  const pollId = searchParams.get('poll')
  const sid = searchParams.get('sid')
  const userAnswer = searchParams.get('answer')
  const error = searchParams.get('error')
  const returnTo = searchParams.get('returnTo') || '/'
  const alreadyVoted = searchParams.get('already_voted') === 'true'

  const [poll, setPoll] = useState<PollData | null>(null)
  const [results, setResults] = useState<VoteResult[]>([])
  const [feedback, setFeedback] = useState('')
  const [feedbackSent, setFeedbackSent] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!pollId) return

    async function fetchData() {
      const supabase = createClient()

      // Fetch poll
      const { data: pollData } = await supabase
        .from('polls')
        .select('*')
        .eq('id', pollId)
        .single()

      if (!pollData) { setLoading(false); return }
      setPoll(pollData as PollData)

      // Fetch vote counts
      const { data: votes } = await supabase
        .from('poll_votes')
        .select('answer')
        .eq('poll_id', pollId)

      if (votes) {
        const totalVotes = votes.length
        const counts: Record<string, number> = {}
        const options = (pollData.options as string[]) || []
        options.forEach(opt => { counts[opt] = 0 })
        votes.forEach((v: { answer: string }) => { counts[v.answer] = (counts[v.answer] || 0) + 1 })

        const res: VoteResult[] = options.map(opt => ({
          answer: opt,
          count: counts[opt] || 0,
          pct: totalVotes > 0 ? Math.round(((counts[opt] || 0) / totalVotes) * 1000) / 10 : 0,
        }))
        setResults(res)
      }

      setLoading(false)
    }

    fetchData()
  }, [pollId])

  const handleFeedback = async () => {
    if (!feedback.trim() || !pollId || !sid) return

    try {
      await fetch('/api/poll/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ poll_id: pollId, subscriber_id: sid, feedback: feedback.trim() }),
      })
      setFeedbackSent(true)
    } catch {
      // silently fail
    }
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', fontFamily: SANS }}>
        <p style={{ color: '#999', fontSize: '16px' }}>Loading...</p>
      </div>
    )
  }

  if (!poll) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', fontFamily: SANS }}>
        <p style={{ color: '#999', fontSize: '16px' }}>Poll not found.</p>
      </div>
    )
  }

  const isGame = poll.type === 'game'
  const isCorrect = isGame && poll.correct_answer === userAnswer

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'flex-start',
      minHeight: '100vh',
      backgroundColor: '#f8f8f8',
      padding: '40px 16px',
      fontFamily: SANS,
    }}>
      <div style={{
        width: '100%',
        maxWidth: '640px',
        backgroundColor: '#fff',
        borderRadius: '12px',
        border: '1px solid #e0e0e0',
        padding: '40px 32px',
        boxShadow: '0 2px 16px rgba(0,0,0,0.06)',
      }}>
        {/* Status icon */}
        <div style={{ textAlign: 'center', marginBottom: '8px' }}>
          {error ? (
            <div style={{ fontSize: '32px', color: '#e53e3e' }}>⚠️</div>
          ) : isGame ? (
            <div style={{ fontSize: '32px', color: isCorrect ? '#38a169' : '#e53e3e' }}>
              {isCorrect ? '✅' : '❌'}
            </div>
          ) : (
            <div style={{ fontSize: '32px', color: '#38a169' }}>✅</div>
          )}
        </div>

        {/* Status text */}
        <p style={{
          textAlign: 'center',
          fontSize: '20px',
          fontWeight: 600,
          color: '#2A2A2A',
          margin: '0 0 24px',
        }}>
          {error
            ? 'Something went wrong.'
            : isGame
              ? (isCorrect ? 'You are correct!' : 'You are incorrect!')
              : 'Your response has been recorded.'
          }
        </p>

        {/* Poll question + results */}
        <div style={{
          border: '1px solid #e0e0e0',
          borderRadius: '8px',
          padding: '20px',
          marginBottom: '24px',
        }}>
          <p style={{
            fontSize: '17px',
            fontWeight: 700,
            color: '#2A2A2A',
            margin: '0 0 16px',
            lineHeight: '1.4',
          }}>
            {poll.question}
          </p>

          {alreadyVoted && (
            <p style={{ fontFamily: SANS, fontSize: '14px', color: '#e67e22', margin: '0 0 12px', padding: '10px 14px', backgroundColor: '#fef9e7', borderRadius: '8px', border: '1px solid #f9e79f' }}>
              You&apos;ve already voted on this poll. Your original answer is shown below.
            </p>
          )}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {results.map((r) => {
              const isUserChoice = r.answer === userAnswer
              const isCorrectOption = isGame && r.answer === poll.correct_answer

              return (
                <div key={r.answer} style={{ position: 'relative' }}>
                  <div style={{
                    position: 'relative',
                    backgroundColor: '#f0f0f0',
                    borderRadius: '6px',
                    overflow: 'hidden',
                    height: '40px',
                    border: isUserChoice ? `2px solid ${ACCENT}` : '1px solid #e0e0e0',
                  }}>
                    {/* Fill bar */}
                    <div style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      height: '100%',
                      width: `${r.pct}%`,
                      backgroundColor: isUserChoice ? `${ACCENT}22` : '#e8e8e8',
                      borderRadius: '6px',
                      transition: 'width 0.5s ease',
                    }} />
                    {/* Label */}
                    <div style={{
                      position: 'relative',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      height: '100%',
                      padding: '0 12px',
                      zIndex: 1,
                    }}>
                      <span style={{
                        fontSize: '15px',
                        fontWeight: isUserChoice ? 600 : 400,
                        color: '#2A2A2A',
                      }}>
                        {r.answer}
                        <span style={{ color: '#999', fontSize: '13px', marginLeft: '8px' }}>
                          ({r.pct}%)
                        </span>
                      </span>
                      <span style={{ fontSize: '14px' }}>
                        {isGame
                          ? (isCorrectOption ? '✓' : (isUserChoice && !isCorrectOption ? '✗' : ''))
                          : (isUserChoice ? '✓' : '')
                        }
                      </span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Additional feedback */}
        {sid && !feedbackSent && (
          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              fontSize: '15px',
              fontWeight: 600,
              color: '#2A2A2A',
              marginBottom: '8px',
            }}>
              Additional feedback
            </label>
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Elaborate on your answer, or just leave some general feedback..."
              style={{
                width: '100%',
                minHeight: '120px',
                padding: '12px',
                fontSize: '15px',
                fontFamily: SANS,
                border: '1px solid #d0d0d0',
                borderRadius: '8px',
                resize: 'vertical',
                outline: 'none',
                boxSizing: 'border-box',
                color: '#2A2A2A',
              }}
            />
          </div>
        )}

        {feedbackSent && (
          <p style={{ fontSize: '14px', color: '#38a169', marginBottom: '20px' }}>
            Thanks for your feedback!
          </p>
        )}

        {/* Continue button */}
        <button
          onClick={async () => {
            if (feedback.trim() && !feedbackSent && sid) {
              await handleFeedback()
            }
            window.location.href = returnTo.startsWith('/') ? returnTo : '/'
          }}
          style={{
            display: 'block',
            width: '100%',
            padding: '14px 0',
            backgroundColor: ACCENT,
            color: '#fff',
            fontSize: '16px',
            fontWeight: 600,
            fontFamily: SANS,
            textAlign: 'center',
            textDecoration: 'none',
            borderRadius: '8px',
            border: 'none',
            cursor: 'pointer',
            boxSizing: 'border-box',
          }}
        >
          Continue
        </button>
      </div>
    </div>
  )
}

export default function PollResultsPage() {
  return (
    <Suspense fallback={
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', fontFamily: SANS }}>
        <p style={{ color: '#999', fontSize: '16px' }}>Loading...</p>
      </div>
    }>
      <PollResultsContent />
    </Suspense>
  )
}
