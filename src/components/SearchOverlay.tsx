'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Search, X } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

interface SearchResult {
    id: string;
    slug: string;
    title: string;
    subtitle?: string;
    thumbnail_url?: string;
}

// All searchable articles — same as mock data in beehiiv.ts
const ARTICLES: SearchResult[] = [
    { id: '1', slug: 'openai-announces-gpt-5-preview', title: 'OpenAI Announces GPT-5 Preview with Breakthrough Reasoning Capabilities', subtitle: 'The next generation model shows significant improvements in complex reasoning, coding, and multimodal understanding.', thumbnail_url: '/thumb-1.avif' },
    { id: '2', slug: 'anthropic-claude-enterprise', title: 'Anthropic Launches Claude Enterprise for Large Organizations', subtitle: 'New enterprise tier offers enhanced security, custom model fine-tuning, and dedicated support.', thumbnail_url: '/thumb-2.avif' },
    { id: '3', slug: 'google-gemini-2-launch', title: 'Google Unveils Gemini 2.0 with Revolutionary Agent Capabilities', subtitle: 'The new model can autonomously browse the web, write code, and complete complex multi-step tasks.', thumbnail_url: '/thumb-3.avif' },
    { id: '4', slug: 'meta-llama-4-open-source', title: 'Meta Releases Llama 4: The Most Powerful Open Source Model Yet', subtitle: 'Benchmarks show Llama 4 matching proprietary models while remaining fully open source.', thumbnail_url: '/thumb-4.avif' },
    { id: '5', slug: 'ai-regulation-update-2026', title: 'EU AI Act Takes Effect: What Companies Need to Know', subtitle: 'Compliance deadlines approaching for high-risk AI systems as enforcement begins.', thumbnail_url: '/thumb-5.webp' },
    { id: '6', slug: 'ai-agents-enterprise-adoption', title: 'AI Agents Go Mainstream: Fortune 500 Companies Lead Adoption', subtitle: 'Survey shows 70% of large enterprises now deploying autonomous AI agents in production.', thumbnail_url: '/thumb-6.avif' },
    { id: '7', slug: 'nvidia-blackwell-ultra-announcement', title: 'NVIDIA Announces Blackwell Ultra: 5x Performance Increase', subtitle: 'Next-gen GPUs promise to accelerate AI training and inference to new heights.', thumbnail_url: '/thumb-7.avif' },
    { id: '8', slug: 'ai-healthcare-breakthrough', title: 'AI System Achieves Human-Level Diagnosis Across 50 Conditions', subtitle: 'Stanford study shows AI matching expert physicians in diagnostic accuracy.', thumbnail_url: '/thumb-8.avif' },
    { id: '9', slug: 'apple-ai-strategy-2026', title: "Apple's AI Strategy Revealed: On-Device Intelligence Takes Center Stage", subtitle: 'Privacy-focused approach prioritizes local processing over cloud-based AI.', thumbnail_url: '/thumb-9.avif' },
    { id: '10', slug: 'coding-assistants-comparison', title: 'The State of AI Coding Assistants: Which Tool Leads in 2026?', subtitle: 'Comprehensive comparison of GitHub Copilot, Claude Code, and emerging competitors.', thumbnail_url: '/thumb-10.avif' },
];

interface SearchOverlayProps {
    isOpen: boolean;
    onClose: () => void;
}

export function SearchOverlay({ isOpen, onClose }: SearchOverlayProps) {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<SearchResult[]>([]);
    const inputRef = useRef<HTMLInputElement>(null);

    // Focus input when overlay opens
    useEffect(() => {
        if (isOpen) {
            setQuery('');
            setResults([]);
            setTimeout(() => inputRef.current?.focus(), 100);
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => { document.body.style.overflow = ''; };
    }, [isOpen]);

    // Close on Escape
    useEffect(() => {
        const handleKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        if (isOpen) window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    }, [isOpen, onClose]);

    // Search logic
    const handleSearch = useCallback((value: string) => {
        setQuery(value);
        if (value.trim().length < 2) {
            setResults([]);
            return;
        }
        const q = value.toLowerCase();
        const filtered = ARTICLES.filter(
            a => a.title.toLowerCase().includes(q) ||
                (a.subtitle && a.subtitle.toLowerCase().includes(q))
        );
        setResults(filtered);
    }, []);

    // Highlight matching text
    const highlight = (text: string, q: string) => {
        if (!q || q.length < 2) return text;
        const idx = text.toLowerCase().indexOf(q.toLowerCase());
        if (idx === -1) return text;
        return (
            <>
                {text.slice(0, idx)}
                <mark className="bg-[#5170ff]/20 text-[#1b1b1b] rounded-sm px-0.5">{text.slice(idx, idx + q.length)}</mark>
                {text.slice(idx + q.length)}
            </>
        );
    };

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm"
            onClick={onClose}
        >
            <div
                className="w-full max-w-2xl mx-auto mt-24 lg:mt-32 px-4"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Search input */}
                <div className="bg-white rounded-xl shadow-2xl overflow-hidden">
                    <div className="flex items-center px-5 py-4 border-b border-[#1b1b1b]/10">
                        <Search className="w-5 h-5 text-[#1b1b1b]/30 mr-3 flex-shrink-0" />
                        <input
                            ref={inputRef}
                            type="text"
                            value={query}
                            onChange={(e) => handleSearch(e.target.value)}
                            placeholder="Search articles..."
                            className="flex-1 text-lg text-[#1b1b1b] placeholder:text-[#1b1b1b]/30 bg-transparent outline-none"
                        />
                        <button
                            onClick={onClose}
                            className="p-1.5 hover:bg-[#1b1b1b]/5 rounded-lg transition-colors ml-2"
                        >
                            <X className="w-5 h-5 text-[#1b1b1b]/40" />
                        </button>
                    </div>

                    {/* Results */}
                    {query.length >= 2 && (
                        <div className="max-h-[60vh] overflow-y-auto">
                            {results.length === 0 ? (
                                <div className="px-5 py-12 text-center">
                                    <p className="text-[#1b1b1b]/40 text-base">
                                        No articles found for &ldquo;{query}&rdquo;
                                    </p>
                                </div>
                            ) : (
                                <div>
                                    <div className="px-5 py-2">
                                        <span className="text-xs text-[#1b1b1b]/40 uppercase tracking-wider font-semibold">
                                            {results.length} result{results.length !== 1 ? 's' : ''}
                                        </span>
                                    </div>
                                    {results.map((article) => (
                                        <Link
                                            key={article.id}
                                            href={`/newsletter/${article.slug}`}
                                            onClick={onClose}
                                        >
                                            <div className="flex items-start gap-4 px-5 py-4 hover:bg-[#f8f8f8] transition-colors cursor-pointer border-t border-[#1b1b1b]/5">
                                                {article.thumbnail_url && (
                                                    <div className="w-16 h-12 relative rounded overflow-hidden flex-shrink-0 bg-[#1b1b1b]/5">
                                                        <Image
                                                            src={article.thumbnail_url}
                                                            alt=""
                                                            fill
                                                            className="object-cover"
                                                        />
                                                    </div>
                                                )}
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="font-times font-bold text-[#1b1b1b] text-base leading-snug line-clamp-2">
                                                        {highlight(article.title, query)}
                                                    </h4>
                                                    {article.subtitle && (
                                                        <p className="text-[#1b1b1b]/50 text-sm mt-1 line-clamp-1">
                                                            {highlight(article.subtitle, query)}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Shortcut hint */}
                    {query.length < 2 && (
                        <div className="px-5 py-4 text-center">
                            <p className="text-[#1b1b1b]/30 text-sm">
                                Type at least 2 characters to search
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
