'use client'

import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { createClient } from '@/lib/supabase'

interface SignInModalProps {
    isOpen: boolean
    onClose: () => void
}

export function SignInModal({ isOpen, onClose }: SignInModalProps) {
    const [email, setEmail] = useState('')
    const [otp, setOtp] = useState('')
    const [step, setStep] = useState<'email' | 'otp'>('email')
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [subscribeNewsletter, setSubscribeNewsletter] = useState(true)

    // Lock body scroll when modal is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden'
        } else {
            document.body.style.overflow = ''
        }
        return () => { document.body.style.overflow = '' }
    }, [isOpen])

    // Reset state when modal closes
    useEffect(() => {
        if (!isOpen) {
            setEmail('')
            setOtp('')
            setStep('email')
            setError(null)
            setIsLoading(false)
        }
    }, [isOpen])

    const handleSendOtp = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        setError(null)

        try {
            const supabase = createClient()
            const { error } = await supabase.auth.signInWithOtp({
                email,
                options: {
                    shouldCreateUser: true,
                },
            })

            if (error) throw error
            setStep('otp')
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Failed to send code. Please try again.')
        } finally {
            setIsLoading(false)
        }
    }

    const syncSubscriber = async (subscribe: boolean) => {
        try {
            const res = await fetch('/api/auth/sync-subscriber', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ subscribeNewsletter: subscribe }),
            })
            if (res.ok) {
                const data = await res.json()
                if (data.subscriber_id) {
                    localStorage.setItem('tv_subscriber_id', data.subscriber_id)
                }

                // If survey is incomplete, redirect to /subscribe
                if (!data.survey_complete && data.supabase_subscriber_id) {
                    const subData = data.subscriber_data || {}
                    const formData = {
                        email: subData.email || '',
                        first_name: subData.first_name || '',
                        main_goal: subData.main_goal || '',
                        seniority: subData.seniority || '',
                        job_function: subData.job_function || '',
                        industry: subData.industry || '',
                        company_size: subData.company_size || '',
                        ai_tools: subData.ai_tools || [],
                        child_newsletters: subData.child_newsletters || ['thorium-valley', 'the-catalyst', 'the-lab'],
                    }

                    let resumeStep = 2
                    if (!data.is_new && subData.email) {
                        if (!subData.first_name) resumeStep = 3
                        else if (!subData.main_goal) resumeStep = 4
                        else if (!subData.seniority || !subData.job_function) resumeStep = 5
                        else if (!subData.industry || !subData.company_size) resumeStep = 6
                        else if (!subData.ai_tools || subData.ai_tools.length === 0) resumeStep = 7
                        else resumeStep = 8
                    }

                    localStorage.setItem('tv_subscribe_progress', JSON.stringify({
                        formData,
                        step: resumeStep,
                        subscriberId: data.supabase_subscriber_id,
                    }))
                    window.location.href = `/subscribe?step=${resumeStep}`
                    return
                }
            }
        } catch { /* silently fail */ }
    }

    const handleVerifyOtp = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        setError(null)

        try {
            const supabase = createClient()
            const { error } = await supabase.auth.verifyOtp({
                email,
                token: otp,
                type: 'email',
            })

            if (error) {
                if (error.message?.toLowerCase().includes('otp') || error.message?.toLowerCase().includes('token')) {
                    setError('Invalid code. Please check and try again.')
                    return
                }
                throw error
            }
            await syncSubscriber(subscribeNewsletter)
            onClose()
            window.location.reload()
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
        } finally {
            setIsLoading(false)
        }
    }

    const handleGoogleSignIn = async () => {
        setIsLoading(true)
        setError(null)

        try {
            // Store newsletter preference for after redirect
            localStorage.setItem('tv_subscribe_newsletter', subscribeNewsletter ? 'true' : 'false')
            const supabase = createClient()
            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: `${window.location.origin}/auth/callback`,
                },
            })

            if (error) throw error
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Failed to sign in with Google.')
            setIsLoading(false)
        }
    }

    if (!isOpen) return null

    return (
        <div
            className="fixed inset-0 z-[100] flex items-center justify-center p-4"
            onClick={onClose}
        >
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

            {/* Modal */}
            <div
                className="relative bg-white rounded-2xl w-full max-w-[420px] p-8 md:p-10 shadow-2xl animate-in fade-in zoom-in-95 duration-200"
                style={{ fontFamily: "var(--font-inter), 'Inter', -apple-system, BlinkMacSystemFont, 'SF Pro Display', system-ui, sans-serif" }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 transition-colors"
                    aria-label="Close"
                >
                    <X className="w-5 h-5 text-[#1b1b1b]/60" />
                </button>

                {/* Logo */}
                <div className="flex justify-center mb-8">
                    <img
                        src="/Transparent Black Logo.png"
                        alt="Thorium Valley"
                        className="h-14 w-auto"
                    />
                </div>

                {step === 'email' ? (
                    <>
                        {/* Email Form */}
                        <form onSubmit={handleSendOtp} className="space-y-4">
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                disabled={isLoading}
                                placeholder="you@example.com"
                                className="w-full px-5 py-3.5 rounded-full border border-gray-200 bg-white text-[#1b1b1b] placeholder-gray-400 text-base focus:outline-none focus:ring-2 focus:ring-[#5170ff]/30 focus:border-[#5170ff] transition-all disabled:opacity-50"
                            />

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full py-3.5 rounded-full bg-[#5170ff] text-white text-base font-semibold hover:bg-[#4060ee] active:scale-[0.98] transition-all disabled:opacity-50 disabled:hover:bg-[#5170ff]"
                            >
                                {isLoading ? 'Sent!' : 'One Time Password'}
                            </button>
                        </form>

                        {/* Divider */}
                        <div className="flex items-center gap-4 my-6">
                            <div className="flex-1 h-px bg-gray-200" />
                            <span className="text-sm text-gray-400 font-medium">or</span>
                            <div className="flex-1 h-px bg-gray-200" />
                        </div>

                        {/* Google Sign In */}
                        <button
                            onClick={handleGoogleSignIn}
                            disabled={isLoading}
                            className="w-full flex items-center justify-center gap-3 py-3.5 rounded-full border border-gray-200 bg-white text-[#1b1b1b] text-base font-medium hover:bg-gray-50 active:scale-[0.98] transition-all disabled:opacity-50"
                        >
                            <svg className="w-5 h-5" viewBox="0 0 24 24">
                                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                            </svg>
                            Sign in with Google
                        </button>
                    </>
                ) : (
                    <>
                        {/* OTP Verification */}
                        <p className="text-center text-gray-500 text-sm mb-6">
                            We sent a one-time code to <strong className="text-[#1b1b1b]">{email}</strong>
                        </p>

                        <form onSubmit={handleVerifyOtp} className="space-y-4">
                            <input
                                type="text"
                                value={otp}
                                onChange={(e) => { setOtp(e.target.value.replace(/\D/g, '').slice(0, 6)); setError(null) }}
                                required
                                disabled={isLoading}
                                placeholder="Enter 6-digit code"
                                className="w-full px-5 py-3.5 rounded-full border border-gray-200 bg-white text-[#1b1b1b] placeholder-gray-400 text-base text-center tracking-[0.3em] font-mono focus:outline-none focus:ring-2 focus:ring-[#5170ff]/30 focus:border-[#5170ff] transition-all disabled:opacity-50"
                                maxLength={6}
                                autoFocus
                            />

                            <button
                                type="submit"
                                disabled={isLoading || otp.length !== 6}
                                className="w-full py-3.5 rounded-full bg-[#5170ff] text-white text-base font-semibold hover:bg-[#4060ee] active:scale-[0.98] transition-all disabled:opacity-50 disabled:hover:bg-[#5170ff]"
                            >
                                {isLoading ? 'Verifying...' : 'Verify'}
                            </button>
                        </form>

                        <button
                            onClick={() => { setStep('email'); setOtp(''); setError(null) }}
                            className="block mx-auto mt-4 text-sm text-[#5170ff] hover:underline"
                        >
                            Use a different email
                        </button>
                    </>
                )}

                {/* Newsletter Subscribe Checkbox */}
                <label className="flex items-start gap-3 mt-5 cursor-pointer select-none group">
                    <div className="relative flex-shrink-0 mt-0.5">
                        <input
                            type="checkbox"
                            checked={subscribeNewsletter}
                            onChange={(e) => setSubscribeNewsletter(e.target.checked)}
                            className="sr-only peer"
                        />
                        <div className="w-[18px] h-[18px] rounded border border-gray-300 bg-white peer-checked:bg-[#5170ff] peer-checked:border-[#5170ff] transition-all flex items-center justify-center group-hover:border-[#5170ff]/50">
                            {subscribeNewsletter && (
                                <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                </svg>
                            )}
                        </div>
                    </div>
                    <span className="text-[13px] text-gray-500 leading-snug">
                        Subscribe to the Thorium Valley newsletter for free weekly AI insights
                    </span>
                </label>

                {/* Error Message */}
                {error && (
                    <p className="mt-4 text-center text-sm text-red-500">
                        {error}
                    </p>
                )}

                {/* Footer */}
                <p className="mt-6 text-center text-xs text-gray-400">
                    By continuing, you agree to our{' '}
                    <a href="/terms" className="text-[#5170ff] hover:underline">Terms</a>
                    {' '}and{' '}
                    <a href="/privacy" className="text-[#5170ff] hover:underline">Privacy</a>
                    {' '}policy
                </p>
            </div>
        </div>
    )
}
