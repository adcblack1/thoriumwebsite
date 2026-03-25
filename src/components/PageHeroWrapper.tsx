'use client';

import { useState, useEffect, ReactNode } from 'react';
import { Navigation } from '@/components/navigation';

interface PageHeroWrapperProps {
    children: ReactNode;
    title: string;
    subtitle?: string;
    breadcrumb?: ReactNode;
    tag?: string;
    date?: string;
}

export function PageHeroWrapper({
    children,
    title,
    subtitle,
    breadcrumb,
    tag,
    date
}: PageHeroWrapperProps) {
    const [isScrolled, setIsScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > window.innerHeight * 0.8);
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        handleScroll();

        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <>
            <Navigation scrollThreshold={150} heroBorder heroTheme="dark" scrolledTheme="blue" />
            {/* Compact white header - below navbar */}
            <section className="bg-white pt-40 lg:pt-48 pb-12 lg:pb-16">
                <div className="max-w-[800px] mx-auto px-6 text-center">
                    {breadcrumb && (
                        <div className="mb-6 text-[#1b1b1b]/50">
                            {breadcrumb}
                        </div>
                    )}

                    {tag && (
                        <span className="bg-[#5170ff] text-white text-xs font-medium px-3 py-1 inline-block mb-4">
                            {tag}
                        </span>
                    )}

                    <h1
                        className="font-times text-3xl lg:text-5xl xl:text-6xl font-bold mb-6 text-[#1b1b1b] max-w-4xl mx-auto"
                        style={{ letterSpacing: '-0.05em' }}
                    >
                        {title}
                    </h1>

                    {subtitle && (
                        <p className="text-lg lg:text-xl max-w-2xl mx-auto font-inter text-[#1b1b1b]/70 mb-4">
                            {subtitle}
                        </p>
                    )}

                    {date && (
                        <time className="text-sm block text-[#1b1b1b]/50">
                            {date}
                        </time>
                    )}
                </div>
            </section>

            {/* Page content */}
            {children}
        </>
    );
}
