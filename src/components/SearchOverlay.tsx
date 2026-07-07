'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Search, X } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

interface SearchResult {
    slug: string;
    title: string;
    subtitle?: string;
    category?: string;
    thumbnail_url?: string;
}

interface SearchOverlayProps {
    isOpen: boolean;
    onClose: () => void;
}

export function SearchOverlay({ isOpen, onClose }: SearchOverlayProps) {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<SearchResult[]>([]);
    const [loading, setLoading] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    // Guards stale responses when a slower query resolves after a newer one
    const requestSeq = useRef(0);

    // Debounced server-side search — queries Supabase across title/subtitle/category
    // instead of prefetching every article body (~2 MB) to filter client-side.
    useEffect(() => {
        const q = query.trim();
        if (q.length < 2) {
            setResults([]);
            setLoading(false);
            return;
        }
        setLoading(true);
        const seq = ++requestSeq.current;
        const t = setTimeout(() => {
            fetch(`/api/search?q=${encodeURIComponent(q)}`)
                .then(res => res.json())
                .then(json => {
                    if (seq !== requestSeq.current) return; // stale
                    setResults(json.data || []);
                    setLoading(false);
                })
                .catch(() => {
                    if (seq !== requestSeq.current) return;
                    setResults([]);
                    setLoading(false);
                });
        }, 250);
        return () => clearTimeout(t);
    }, [query]);

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

    const handleSearch = useCallback((value: string) => {
        setQuery(value);
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
                    {query.trim().length >= 2 && (
                        <div className="max-h-[60vh] overflow-y-auto">
                            {loading && results.length === 0 ? (
                                <div className="px-5 py-12 text-center">
                                    <p className="text-[#1b1b1b]/40 text-base">Searching&hellip;</p>
                                </div>
                            ) : results.length === 0 ? (
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
                                            key={article.slug}
                                            href={`/articles/${article.slug}`}
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
                                                    {(article.subtitle || article.category) && (
                                                        <p className="text-[#1b1b1b]/50 text-sm mt-1 line-clamp-1">
                                                            {highlight(article.subtitle || article.category || '', query)}
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
