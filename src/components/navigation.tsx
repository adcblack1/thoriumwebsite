"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import Image from "next/image"
import { X, Menu, Search, LogOut } from "lucide-react"
import { usePathname } from "next/navigation"
import { SearchOverlay } from "@/components/SearchOverlay"
import { SignInModal } from "@/components/SignInModal"
import { createClient } from "@/lib/supabase"
import type { User } from "@supabase/supabase-js"

interface NavigationProps {
    variant?: "hero" | "scrolled"
    scrolledTheme?: "white" | "blue"
    scrollThreshold?: number
    heroBorder?: boolean
    heroTheme?: "light" | "dark"
}

export function Navigation({ variant = "hero", scrolledTheme = "white", scrollThreshold, heroBorder = false, heroTheme = "light" }: NavigationProps) {
    const isHeroDark = heroTheme === "dark"
    const isBlueScrolled = scrolledTheme === "blue"
    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const [isSearchOpen, setIsSearchOpen] = useState(false)
    const [isSignInOpen, setIsSignInOpen] = useState(false)
    const [isScrolled, setIsScrolled] = useState(variant === "scrolled")
    const [scrollProgress, setScrollProgress] = useState(0)
    const [suppressTransition, setSuppressTransition] = useState(false)
    const [categories, setCategories] = useState<string[]>([])
    const [user, setUser] = useState<User | null>(null)
    const [profileOpenId, setProfileOpenId] = useState<string | null>(null)
    const profileRef = useRef<HTMLDivElement>(null)
    const pathname = usePathname()

    // Track auth state
    useEffect(() => {
        const supabase = createClient()
        supabase.auth.getUser().then(({ data }) => setUser(data.user ?? null))
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null)
        })
        return () => subscription.unsubscribe()
    }, [])

    // Close profile dropdown on outside click
    useEffect(() => {
        const handleClick = (e: MouseEvent) => {
            // Check if click target is inside ANY profile dropdown
            const target = e.target as HTMLElement
            if (target.closest('[data-profile-dropdown]')) return
            setProfileOpenId(null)
        }
        document.addEventListener('mousedown', handleClick)
        return () => document.removeEventListener('mousedown', handleClick)
    }, [])

    const handleSignOut = async (e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()
        try {
            const supabase = createClient()
            await supabase.auth.signOut({ scope: 'global' })
        } catch (err) {
            console.error('Sign out error:', err)
        }
        // Also hit server route to clear cookies
        try {
            await fetch('/api/auth/signout', { method: 'POST' })
        } catch {}
        // Manually clear all supabase cookies as fallback
        document.cookie.split(';').forEach(c => {
            const name = c.trim().split('=')[0]
            if (name.startsWith('sb-')) {
                document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`
            }
        })
        setUser(null)
        setProfileOpenId(null)
        window.location.href = '/'
    }

    const userInitial = user?.email ? user.email[0].toUpperCase() : '?'
    const userEmail = user?.email || ''

    // Fetch categories from DB
    useEffect(() => {
        fetch('/api/categories')
            .then(r => r.json())
            .then(cats => setCategories(cats))
            .catch(() => { })
    }, [])

    // Determine if we're on an article/newsletter detail page
    const isArticlePage = pathname.startsWith('/newsletter/') || pathname.startsWith('/articles/')

    // Reset scrolled state on page navigation — suppress transition so it's instant
    // Use a ref to block the scroll handler during navigation (Lenis smooth-scrolls to top)
    const isNavigatingRef = useRef(false)
    useEffect(() => {
        if (variant !== "scrolled") {
            isNavigatingRef.current = true
            setSuppressTransition(true)
            setIsScrolled(false)
            setScrollProgress(0)
            // Keep blocking for 800ms to cover Lenis scroll-to-top animation
            const timer = setTimeout(() => {
                isNavigatingRef.current = false
                setSuppressTransition(false)
            }, 800)
            return () => clearTimeout(timer)
        }
    }, [pathname, variant])

    useEffect(() => {
        // For scrolled variant, always show scrolled navbar
        if (variant === "scrolled") {
            setIsScrolled(true)
            return
        }

        const handleScroll = () => {
            // Skip scroll handling during page navigation
            if (isNavigatingRef.current) return
            const baseThreshold = scrollThreshold !== undefined ? scrollThreshold : window.innerHeight * 0.8
            // Mobile gets a lower threshold only on article/newsletter pages (where scrollThreshold is explicitly set)
            const threshold = (scrollThreshold !== undefined && window.innerWidth < 1024) ? baseThreshold * 0.5 : baseThreshold
            setIsScrolled(window.scrollY > threshold)

            // Calculate reading progress for article/newsletter pages
            // Only start tracking AFTER the navbar has fully come down
            if (isArticlePage && window.scrollY > threshold) {
                const article = document.querySelector('article') || document.querySelector('.nl-shell-wrap')
                if (article) {
                    const articleTop = (article as HTMLElement).offsetTop
                    const articleBottom = articleTop + (article as HTMLElement).offsetHeight
                    const scrollTop = window.scrollY
                    const viewportHeight = window.innerHeight
                    // Start progress from when navbar is fully visible
                    const start = Math.max(articleTop - viewportHeight, threshold)
                    const end = articleBottom - viewportHeight
                    const progress = end > start ? Math.min(Math.max(((scrollTop - start) / (end - start)) * 100, 0), 100) : 0
                    setScrollProgress(progress)
                } else {
                    // Fallback: use full document, offset by threshold
                    const scrollTop = window.scrollY - threshold
                    const docHeight = document.documentElement.scrollHeight - window.innerHeight - threshold
                    const progress = docHeight > 0 ? Math.min(Math.max((scrollTop / docHeight) * 100, 0), 100) : 0
                    setScrollProgress(progress)
                }
            } else if (isArticlePage) {
                setScrollProgress(0)
            }
        }

        window.addEventListener("scroll", handleScroll)
        return () => window.removeEventListener("scroll", handleScroll)
    }, [variant, isArticlePage, scrollThreshold])

    const handleLogoClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
        if (pathname === "/") {
            e.preventDefault()
            window.scrollTo({ top: 0, behavior: "smooth" })
        }
        setIsMenuOpen(false)
    }

    return (
        <>
            {/* Hero State Navbar - Desktop */}
            <nav
                className={`hidden lg:flex flex-col absolute top-0 left-0 right-0 z-30`}
            >
                <div className={`w-full max-w-7xl mx-auto px-6 pt-14 pb-4 flex items-center justify-between`}>
                    {/* Left - Hamburger + Search */}
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className={`p-2 transition-colors rounded ${isHeroDark ? 'hover:bg-[#1b1b1b]/10' : 'hover:bg-white/10'}`}
                            aria-label="Menu"
                        >
                            <Menu className={`w-6 h-6 ${isHeroDark ? 'text-[#1b1b1b]' : 'text-white'}`} />
                        </button>
                        <button
                            onClick={() => setIsSearchOpen(true)}
                            className={`p-2 transition-colors rounded ${isHeroDark ? 'hover:bg-[#1b1b1b]/10' : 'hover:bg-white/10'}`}
                            aria-label="Search"
                        >
                            <Search className={`w-5 h-5 ${isHeroDark ? 'text-[#1b1b1b]' : 'text-white'}`} />
                        </button>
                    </div>

                    {/* Center - Logo above 4 Nav Links */}
                    <div className="absolute left-1/2 -translate-x-1/2 flex flex-col items-center gap-6">
                        <Link href="/" onClick={handleLogoClick}>
                            <Image
                                src={isHeroDark ? "/Transparent Black Text Logo New.png" : "/Transparent White Text Logo New.png"}
                                alt="Thorium Valley"
                                width={280}
                                height={80}
                                className="cursor-pointer hover:opacity-80 transition-opacity"
                            />
                            <h1 className="sr-only">Thorium Valley</h1>
                        </Link>
                        <div className="flex items-center gap-8">
                            <Link
                                href="/newsletter"
                                className="text-base font-normal transition-all hover:opacity-70 relative group"
                                style={{ color: isHeroDark ? '#1b1b1b' : 'white' }}
                            >
                                Newsletter
                                <span className={`absolute bottom-0 left-0 w-0 h-0.5 ${isHeroDark ? 'bg-[#1b1b1b]' : 'bg-white'} group-hover:w-full transition-all duration-300`} />
                            </Link>
                            <Link
                                href="/articles"
                                className="text-base font-normal transition-all hover:opacity-70 relative group"
                                style={{ color: isHeroDark ? '#1b1b1b' : 'white' }}
                            >
                                Articles
                                <span className={`absolute bottom-0 left-0 w-0 h-0.5 ${isHeroDark ? 'bg-[#1b1b1b]' : 'bg-white'} group-hover:w-full transition-all duration-300`} />
                            </Link>
                            <Link
                                href="mailto:sponsors@thoriumvalley.com"
                                className="text-base font-normal transition-all hover:opacity-70 relative group"
                                style={{ color: isHeroDark ? '#1b1b1b' : 'white' }}
                            >
                                Partnerships
                                <span className={`absolute bottom-0 left-0 w-0 h-0.5 ${isHeroDark ? 'bg-[#1b1b1b]' : 'bg-white'} group-hover:w-full transition-all duration-300`} />
                            </Link>
                            <Link
                                href="/about"
                                className="text-base font-normal transition-all hover:opacity-70 relative group"
                                style={{ color: isHeroDark ? '#1b1b1b' : 'white' }}
                            >
                                About
                                <span className={`absolute bottom-0 left-0 w-0 h-0.5 ${isHeroDark ? 'bg-[#1b1b1b]' : 'bg-white'} group-hover:w-full transition-all duration-300`} />
                            </Link>
                        </div>
                    </div>

                    {/* Right - Buttons */}
                    <div className="flex items-center gap-3">
                        {user ? (
                            <div className="relative" ref={profileRef} data-profile-dropdown>
                                <button onClick={() => setProfileOpenId(profileOpenId === 'hero-desktop' ? null : 'hero-desktop')} className={`w-10 h-10 rounded-full flex items-center justify-center text-base font-semibold transition-all ${isHeroDark ? 'bg-[#5170ff] text-white hover:bg-[#5170ff]/80' : 'bg-white text-[#5170ff] hover:bg-white/80'}`}>
                                    {userInitial}
                                </button>
                                {profileOpenId === 'hero-desktop' && (
                                    <div className="absolute right-0 top-12 w-56 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50">
                                        <div className="px-4 py-2 border-b border-gray-100">
                                            <p className="text-xs text-gray-400 font-inter">Signed in as</p>
                                            <p className="text-sm text-[#1b1b1b] font-inter font-medium truncate">{userEmail}</p>
                                        </div>
                                        <button onClick={handleSignOut} className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-[#1b1b1b] hover:bg-gray-50 font-inter">
                                            <LogOut className="w-4 h-4" /> Sign out
                                        </button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <>
                                <button onClick={() => setIsSignInOpen(true)} className={`px-5 py-2 rounded-full text-base font-medium transition-all duration-300 whitespace-nowrap ${isHeroDark ? 'bg-transparent hover:bg-[#1b1b1b]/10 text-[#1b1b1b] border border-transparent' : 'bg-white/10 hover:bg-white/20 text-white border border-white/20'}`}>
                                    <span className="relative z-10">Sign in</span>
                                </button>
                                <Link href="/subscribe">
                                    <button className={`px-5 py-2 rounded-full text-base font-medium whitespace-nowrap ${isHeroDark ? 'bg-[#5170ff] text-white border border-[#5170ff] hover:bg-[#5170ff]/90' : 'bg-white text-[#1b1b1b] border border-gray-200 hover:bg-gray-50'}`}>
                                        <span className="relative z-10">Subscribe</span>
                                    </button>
                                </Link>
                            </>
                        )}
                    </div>
                </div>
                {heroBorder && <div className={`w-full border-b mt-12 ${isHeroDark ? 'border-[#1b1b1b]/15' : 'border-white/30'}`} />}
            </nav>

            {/* Scrolled State Navbar - Desktop */}
            <nav
                className={`hidden lg:flex fixed left-0 right-0 z-40 ${suppressTransition ? 'transition-none' : 'transition-all duration-1000 ease-out'} ${isBlueScrolled ? 'bg-[#5170ff] border-b border-white/30' : 'bg-white border-b border-gray-200'} ${isScrolled ? "top-0" : "-top-36"}
                    }`}
            >
                <div className="w-full max-w-7xl mx-auto px-6 py-6 flex items-center">
                    {/* Left - Hamburger + Search */}
                    <div className="flex items-center gap-4 flex-1">
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className={`p-2 transition-colors rounded ${isBlueScrolled ? 'hover:bg-white/10' : 'hover:bg-[#1b1b1b]/10'}`}
                            aria-label="Menu"
                        >
                            <Menu className={`w-6 h-6 ${isBlueScrolled ? 'text-white' : 'text-[#1b1b1b]'}`} />
                        </button>
                        <button
                            onClick={() => setIsSearchOpen(true)}
                            className={`p-2 transition-colors rounded ${isBlueScrolled ? 'hover:bg-white/10' : 'hover:bg-[#1b1b1b]/10'}`}
                            aria-label="Search"
                        >
                            <Search className={`w-5 h-5 ${isBlueScrolled ? 'text-white' : 'text-[#1b1b1b]'}`} />
                        </button>
                    </div>

                    {/* Center - Logo only */}
                    <div className="absolute left-1/2 -translate-x-1/2">
                        <Link href="/" onClick={handleLogoClick}>
                            <Image
                                src={isBlueScrolled ? "/Transparent White Logo.png" : "/Transparent Black Logo.png"}
                                alt="Thorium Valley"
                                width={80}
                                height={80}
                                className="cursor-pointer hover:opacity-80 transition-opacity"
                            />
                        </Link>
                    </div>

                    {/* Right - Buttons */}
                    <div className="flex items-center gap-3 flex-1 justify-end">
                        {user ? (
                            <div className="relative" ref={profileRef} data-profile-dropdown>
                                <button onClick={() => setProfileOpenId(profileOpenId === 'scrolled-desktop' ? null : 'scrolled-desktop')} className={`w-10 h-10 rounded-full flex items-center justify-center text-base font-semibold transition-all ${isBlueScrolled ? 'bg-white text-[#5170ff] hover:bg-white/80' : 'bg-[#5170ff] text-white hover:bg-[#5170ff]/80'}`}>
                                    {userInitial}
                                </button>
                                {profileOpenId === 'scrolled-desktop' && (
                                    <div className="absolute right-0 top-12 w-56 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50">
                                        <div className="px-4 py-2 border-b border-gray-100">
                                            <p className="text-xs text-gray-400 font-inter">Signed in as</p>
                                            <p className="text-sm text-[#1b1b1b] font-inter font-medium truncate">{userEmail}</p>
                                        </div>
                                        <button onClick={handleSignOut} className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-[#1b1b1b] hover:bg-gray-50 font-inter">
                                            <LogOut className="w-4 h-4" /> Sign out
                                        </button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <>
                                <button onClick={() => setIsSignInOpen(true)} className={`px-5 py-2 rounded-full text-base font-medium transition-all duration-300 bg-transparent border-transparent whitespace-nowrap ${isBlueScrolled ? 'text-white hover:bg-white/10' : 'text-[#1b1b1b] hover:bg-[#1b1b1b]/10'}`}>
                                    <span className="relative z-10">Sign in</span>
                                </button>
                                <Link href="/subscribe">
                                    <button className={`px-5 py-2 rounded-full text-base font-medium whitespace-nowrap ${isBlueScrolled ? 'bg-white text-[#5170ff] hover:bg-white/90 border border-white' : 'bg-[#5170ff] text-white border border-[#5170ff] hover:bg-[#5170ff]/90'}`}>
                                        <span className="relative z-10">Subscribe</span>
                                    </button>
                                </Link>
                            </>
                        )}
                    </div>
                </div>
                {/* Reading Progress Bar */}
                {isArticlePage && (
                    <div className={`absolute bottom-0 left-0 right-0 h-[2px] ${isBlueScrolled ? 'bg-white/20' : 'bg-gray-200'}`}>
                        <div
                            className={`h-full ${isBlueScrolled ? 'bg-white' : 'bg-[#5170ff]'}`}
                            style={{ width: `${scrollProgress}%` }}
                        />
                    </div>
                )}
            </nav>

            {/* Mobile Hero Navbar - Transparent with white elements */}
            <nav
                className={`lg:hidden absolute top-0 left-0 right-0 z-30 ${heroBorder ? (isHeroDark ? 'border-b border-[#1b1b1b]/15' : 'border-b border-white/30') : ''}`}
            >
                <div className={`px-4 ${heroBorder ? 'pt-4 pb-4' : 'pt-4 pb-3'} flex items-center justify-between`}>
                    {/* Left - Menu and Search */}
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className={`p-1.5 transition-colors ${isHeroDark ? 'hover:bg-[#1b1b1b]/10' : 'hover:bg-white/10'}`}
                            aria-label="Menu"
                        >
                            <Menu className={`w-6 h-6 ${isHeroDark ? 'text-[#1b1b1b]' : 'text-white'}`} />
                        </button>
                        <button
                            onClick={() => setIsSearchOpen(true)}
                            className={`p-1.5 transition-colors ${isHeroDark ? 'hover:bg-[#1b1b1b]/10' : 'hover:bg-white/10'}`}
                            aria-label="Search"
                        >
                            <Search className={`w-6 h-6 ${isHeroDark ? 'text-[#1b1b1b]' : 'text-white'}`} />
                        </button>
                    </div>

                    {/* Right - Buttons */}
                    <div className="flex items-center gap-2">
                        {user ? (
                            <div className="relative" ref={profileRef} data-profile-dropdown>
                                <button onClick={() => setProfileOpenId(profileOpenId === 'hero-mobile' ? null : 'hero-mobile')} className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold transition-all ${isHeroDark ? 'bg-[#5170ff] text-white hover:bg-[#5170ff]/80' : 'bg-white text-[#5170ff] hover:bg-white/80'}`}>
                                    {userInitial}
                                </button>
                                {profileOpenId === 'hero-mobile' && (
                                    <div className="absolute right-0 top-11 w-56 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50">
                                        <div className="px-4 py-2 border-b border-gray-100">
                                            <p className="text-xs text-gray-400 font-inter">Signed in as</p>
                                            <p className="text-sm text-[#1b1b1b] font-inter font-medium truncate">{userEmail}</p>
                                        </div>
                                        <button onClick={handleSignOut} className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-[#1b1b1b] hover:bg-gray-50 font-inter">
                                            <LogOut className="w-4 h-4" /> Sign out
                                        </button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <>
                                <button onClick={() => setIsSignInOpen(true)} className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full transition-all duration-300 text-base font-medium border whitespace-nowrap ${isHeroDark ? 'bg-transparent hover:bg-[#1b1b1b]/10 text-[#1b1b1b] border-transparent' : 'bg-white/10 backdrop-blur-md hover:bg-white/20 text-white border-white/20'}`}>
                                    Sign in
                                </button>
                                <Link href="/subscribe">
                                    <button className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full transition-all text-base font-medium whitespace-nowrap ${isHeroDark ? 'bg-[#5170ff] text-white border border-[#5170ff] hover:bg-[#5170ff]/90' : 'bg-white hover:bg-gray-50 text-[#1b1b1b] border border-white'}`}>
                                        Subscribe
                                    </button>
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </nav>

            {/* Mobile Scrolled State Navbar */}
            <nav
                className={`lg:hidden fixed left-0 right-0 z-40 ${suppressTransition ? 'transition-none' : 'transition-all duration-1000 ease-out'} ${isBlueScrolled ? 'bg-[#5170ff] border-b border-white/20' : 'bg-white border-b border-gray-200'} ${isScrolled ? "top-0" : "-top-20"}
                    }`}
            >
                <div className="px-4 py-3 flex items-center justify-between">
                    {/* Left - Menu and Search */}
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className={`p-1.5 transition-colors ${isBlueScrolled ? 'hover:bg-white/10' : 'hover:bg-[#1b1b1b]/10'}`}
                            aria-label="Menu"
                        >
                            <Menu className={`w-5 h-5 ${isBlueScrolled ? 'text-white' : 'text-[#1b1b1b]'}`} />
                        </button>
                        <button
                            onClick={() => setIsSearchOpen(true)}
                            className={`p-1.5 transition-colors ${isBlueScrolled ? 'hover:bg-white/10' : 'hover:bg-[#1b1b1b]/10'}`}
                            aria-label="Search"
                        >
                            <Search className={`w-5 h-5 ${isBlueScrolled ? 'text-white' : 'text-[#1b1b1b]'}`} />
                        </button>
                    </div>

                    {/* Right - Buttons */}
                    <div className="flex items-center gap-2">
                        {user ? (
                            <div className="relative" ref={profileRef} data-profile-dropdown>
                                <button onClick={() => setProfileOpenId(profileOpenId === 'scrolled-mobile' ? null : 'scrolled-mobile')} className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold transition-all ${isBlueScrolled ? 'bg-white text-[#5170ff] hover:bg-white/80' : 'bg-[#5170ff] text-white hover:bg-[#5170ff]/80'}`}>
                                    {userInitial}
                                </button>
                                {profileOpenId === 'scrolled-mobile' && (
                                    <div className="absolute right-0 top-11 w-56 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50">
                                        <div className="px-4 py-2 border-b border-gray-100">
                                            <p className="text-xs text-gray-400 font-inter">Signed in as</p>
                                            <p className="text-sm text-[#1b1b1b] font-inter font-medium truncate">{userEmail}</p>
                                        </div>
                                        <button onClick={handleSignOut} className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-[#1b1b1b] hover:bg-gray-50 font-inter">
                                            <LogOut className="w-4 h-4" /> Sign out
                                        </button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <>
                                <button onClick={() => setIsSignInOpen(true)} className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full transition-all duration-300 text-base font-medium border whitespace-nowrap ${isBlueScrolled ? 'bg-transparent hover:bg-white/10 text-white border-transparent' : 'bg-transparent hover:bg-[#1b1b1b]/10 text-[#1b1b1b] border-transparent'}`}>
                                    Sign in
                                </button>
                                <Link href="/subscribe">
                                    <button className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full transition-all text-base font-medium whitespace-nowrap ${isBlueScrolled ? 'bg-white text-[#5170ff] hover:bg-white/90 border border-white' : 'bg-[#5170ff] hover:bg-[#5170ff]/90 text-white border border-[#5170ff]'}`}>
                                        Subscribe
                                    </button>
                                </Link>
                            </>
                        )}
                    </div>
                </div>
                {/* Reading Progress Bar - Mobile */}
                {isArticlePage && (
                    <div className={`absolute bottom-0 left-0 right-0 h-[2px] ${isBlueScrolled ? 'bg-white/20' : 'bg-gray-200'}`}>
                        <div
                            className={`h-full ${isBlueScrolled ? 'bg-white' : 'bg-[#5170ff]'}`}
                            style={{ width: `${scrollProgress}%` }}
                        />
                    </div>
                )}
            </nav>

            {/* Full Screen Menu - Blue Background */}
            <div
                className={`fixed inset-0 z-50 transform transition-transform duration-300 ease-in-out ${isMenuOpen ? "translate-x-0" : "-translate-x-full"
                    }`}
                onClick={() => setIsMenuOpen(false)}
            >
                <div className="h-full w-full lg:w-96 bg-[#1b1b1b] text-white flex flex-col" onClick={(e) => e.stopPropagation()}>
                    {/* Header - Thorium Valley + X - Dark background */}
                    <div className="flex items-center justify-center px-6 py-3 bg-[#1b1b1b] border-b-2 border-[#5170ff] relative">
                        <Link href="/" onClick={() => setIsMenuOpen(false)}>
                            <Image
                                src="/Transparent White Logo.png"
                                alt="Thorium Valley"
                                width={50}
                                height={50}
                                className="cursor-pointer hover:opacity-80 transition-opacity"
                            />
                        </Link>
                        <button
                            onClick={() => setIsMenuOpen(false)}
                            className="absolute right-6 p-2 hover:bg-white/10 transition-colors rounded"
                            aria-label="Close menu"
                        >
                            <X className="w-6 h-6 text-white" />
                        </button>
                    </div>

                    {/* Main Content */}
                    <div className={`flex-1 flex flex-col px-6 py-4`}>
                        {/* Subscribe, Sign In (or Profile), Newsletter, Articles */}
                        <div className="space-y-2 pb-4">
                            {user ? (
                                null
                            ) : (
                                <>
                                    <Link
                                        href="/subscribe"
                                        className="block text-2xl font-medium text-white hover:!text-[#5170ff] transition-colors"
                                        onClick={() => setIsMenuOpen(false)}
                                    >
                                        Subscribe
                                    </Link>
                                    <button
                                        className="block text-2xl font-medium text-white hover:!text-[#5170ff] transition-colors text-left"
                                        onClick={() => { setIsMenuOpen(false); setIsSignInOpen(true) }}
                                    >
                                        Sign In
                                    </button>
                                </>
                            )}
                            <Link
                                href="/newsletter"
                                className="block text-2xl font-medium text-white hover:!text-[#5170ff] transition-colors"
                                onClick={() => setIsMenuOpen(false)}
                            >
                                Newsletter
                            </Link>
                            <Link
                                href="/articles"
                                className="block text-2xl font-medium text-white hover:!text-[#5170ff] transition-colors"
                                onClick={() => setIsMenuOpen(false)}
                            >
                                Articles
                            </Link>
                        </div>

                        {/* Categories Section - 2-col on mobile, single col on desktop */}
                        <div className="border-t-2 border-[#5170ff] pt-4 pb-4">
                            <div className="flex flex-col gap-0">
                                {categories.map((category) => (
                                    <Link
                                        key={category}
                                        href={`/articles?category=${encodeURIComponent(category)}`}
                                        className="block py-1 text-white/80 text-lg lg:text-xl font-medium hover:!text-[#5170ff] transition-colors duration-150"
                                        onClick={() => setIsMenuOpen(false)}
                                    >
                                        {category.charAt(0) + category.slice(1).toLowerCase()}
                                    </Link>
                                ))}
                            </div>
                        </div>

                        {/* Large Spacer - pushes bottom content down */}
                        <div className="flex-grow" />

                        {/* Bottom Section - Links inline */}
                        <div className="pt-4 pb-3 border-b-2 border-[#5170ff] flex flex-wrap lg:flex-col gap-x-5 gap-y-1 lg:gap-y-2">
                            <Link
                                href="mailto:sponsors@thoriumvalley.com"
                                className="text-lg text-white/60 font-medium hover:!text-[#5170ff] transition-colors"
                                onClick={() => setIsMenuOpen(false)}
                            >
                                Partnerships
                            </Link>
                            <Link
                                href="/about"
                                className="text-lg text-white/60 font-medium hover:!text-[#5170ff] transition-colors"
                                onClick={() => setIsMenuOpen(false)}
                            >
                                About
                            </Link>

                        </div>

                        {/* Socials - at very bottom */}
                        <div className="pt-3 pb-2">
                            <div className="flex items-center gap-4">
                                <a
                                    href="https://instagram.com/thoriumvalley"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-2 hover:bg-white/10 transition-colors rounded"
                                    aria-label="Instagram"
                                >
                                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                                    </svg>
                                </a>
                                <a
                                    href="https://x.com/ThoriumValley"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-2 hover:bg-white/10 transition-colors rounded"
                                    aria-label="X (Twitter)"
                                >
                                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                                    </svg>
                                </a>
                                <a
                                    href="https://linkedin.com/company/thoriumvalley"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-2 hover:bg-white/10 transition-colors rounded"
                                    aria-label="LinkedIn"
                                >
                                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                                    </svg>
                                </a>
                                <a
                                    href="mailto:hello@thoriumvalley.com"
                                    className="p-2 hover:bg-white/10 transition-colors rounded"
                                    aria-label="Email"
                                >
                                    <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {isMenuOpen && (
                <div className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm" />
            )}

            <SearchOverlay isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
            <SignInModal isOpen={isSignInOpen} onClose={() => setIsSignInOpen(false)} />
        </>
    )
}
