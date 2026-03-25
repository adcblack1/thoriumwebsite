"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { subscribeAction } from "@/app/actions/subscribe"
import { trackLead } from "@/lib/meta-pixel"

interface SubscribeFormProps {
    variant?: "hero" | "footer" | "navbar"
    className?: string
    redirectOnSuccess?: boolean
}

export function SubscribeForm({ variant = "hero", className = "", redirectOnSuccess = false }: SubscribeFormProps) {
    const [email, setEmail] = useState("")
    const [loading, setLoading] = useState(false)
    const [succeeded, setSucceeded] = useState(false)
    const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
    const router = useRouter()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setMessage(null)

        try {
            const formData = new FormData()
            formData.append("email", email)

            const result = await subscribeAction(null, formData)

            if (result?.error) {
                setMessage({ type: "error", text: result.error })
                setLoading(false)
            } else if (result?.success) {
                setEmail("")
                setLoading(false)
                setSucceeded(true)
                // Fire Meta Pixel Lead event
                trackLead();
                if (redirectOnSuccess) {
                    setTimeout(() => router.push("/"), 2000)
                }
            } else {
                setMessage({ type: "error", text: "Something went wrong. Please try again." })
                setLoading(false)
            }
        } catch {
            setMessage({ type: "error", text: "Something went wrong. Please try again." })
            setLoading(false)
        }
    }

    if (variant === "hero") {
        return (
            <div className={`w-full max-w-md ${className}`}>
                <form onSubmit={handleSubmit}>
                    <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-3 sm:px-4 py-2.5 sm:py-3 border border-white/20">
                        <input
                            type="email"
                            name="email"
                            placeholder="Work Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="flex-1 min-w-0 bg-transparent text-white placeholder:text-white/60 outline-none text-sm sm:text-base"
                            required
                            disabled={loading}
                        />
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-3 sm:px-6 py-2 rounded-full bg-white text-[#1b1b1b] text-sm sm:text-base font-medium hover:bg-white/90 transition-colors whitespace-nowrap disabled:opacity-50 shrink-0"
                        >
                            {succeeded ? "Subscribed!" : loading ? "..." : "Subscribe"}
                        </button>
                    </div>
                </form>
                {message && (
                    <p className={`mt-3 text-sm text-center ${message.type === "success" ? "text-green-300" : "text-red-300"}`}>
                        {message.text}
                    </p>
                )}
            </div>
        )
    }

    if (variant === "footer") {
        return (
            <div className={`w-full ${className}`}>
                <form onSubmit={handleSubmit}>
                    <div className="flex items-center gap-1.5 sm:gap-2 bg-white/10 backdrop-blur-sm rounded-full px-3 sm:px-4 py-2.5 sm:py-3 border border-white/20">
                        <input
                            type="email"
                            name="email"
                            placeholder="Work Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="flex-1 bg-transparent text-white placeholder:text-white/60 outline-none text-base min-w-0"
                            required
                            disabled={loading}
                        />
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-4 sm:px-6 py-2 rounded-full bg-white text-[#1b1b1b] text-base font-medium hover:bg-white/90 transition-colors disabled:opacity-50 shrink-0"
                        >
                            {succeeded ? "Subscribed!" : loading ? "..." : "Subscribe"}
                        </button>
                    </div>
                </form>
                {message && (
                    <p className={`mt-3 text-sm ${message.type === "success" ? "text-green-300" : "text-red-300"}`}>
                        {message.text}
                    </p>
                )}
            </div>
        )
    }

    // Navbar variant (default for other sections)
    return (
        <div className={`w-full ${className}`}>
            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                <input
                    type="email"
                    name="email"
                    placeholder="Work Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 bg-[#ffffff] border-2 border-[#1b1b1b] text-[#1b1b1b] placeholder:text-[#1b1b1b]/50 outline-none text-sm focus:border-[#5170ff] transition-colors"
                    required
                    disabled={loading}
                />
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full px-6 py-3 bg-[#1b1b1b] text-white text-sm font-medium hover:bg-[#1b1b1b]/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                    {succeeded ? "Subscribed!" : loading ? "Subscribing..." : "Subscribe Free"}
                    {!loading && !succeeded && (
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                    )}
                </button>
            </form>
            {message && (
                <p className={`mt-2 text-xs text-center ${message.type === "success" ? "text-[#5170ff]" : "text-[#1b1b1b]"}`}>
                    {message.text}
                </p>
            )}
        </div>
    )
}
