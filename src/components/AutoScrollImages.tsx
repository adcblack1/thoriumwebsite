'use client'

import React from 'react'
import { motion } from 'framer-motion'

const IMAGES = [
    '/thumbnails/feb11-1.png',
    '/thumbnails/feb11-2.png',
    '/thumbnails/feb11-3.png',
    '/thumbnails/feb12-1.png',
    '/thumbnails/feb12-2.png',
    '/thumbnails/feb12-3.png',
]

function clamp(value: number, [min, max]: [number, number]): number {
    return Math.min(Math.max(value, min), max)
}

const FRAME_OFFSET = -30
const FRAMES_VISIBLE_LENGTH = 3
const BUFFER_SIZE = 8
const AUTO_INTERVAL = 2500 // ms between auto-advances

interface AutoScrollImagesProps {
    /** Start from a different point in the image array */
    offset?: number
}

export function AutoScrollImages({ offset = 0 }: AutoScrollImagesProps) {
    const [currentIndex, setCurrentIndex] = React.useState(offset)

    // Auto-advance every few seconds
    React.useEffect(() => {
        const timer = setInterval(() => {
            setCurrentIndex((prev) => prev + 1)
        }, AUTO_INTERVAL)
        return () => clearInterval(timer)
    }, [])

    // Calculate which cards should be rendered (visible + buffer)
    const getVisibleCards = React.useCallback(() => {
        const start = currentIndex - BUFFER_SIZE
        const end = currentIndex + FRAMES_VISIBLE_LENGTH + BUFFER_SIZE
        const cards = []

        for (let i = start; i <= end; i++) {
            cards.push({
                index: i,
                imageIndex: ((i % IMAGES.length) + IMAGES.length) % IMAGES.length,
            })
        }

        return cards
    }, [currentIndex])

    const visibleCards = getVisibleCards()

    return (
        <div className="relative w-full h-full flex items-center justify-center overflow-hidden pointer-events-none select-none">
            <div className="relative w-full h-full flex items-center justify-center">
                {visibleCards.map((card) => {
                    const offsetIndex = card.index - currentIndex
                    const blur = currentIndex > card.index ? 2 : 0
                    const opacity = currentIndex > card.index ? 0 : 1
                    const scale = clamp(1 - offsetIndex * 0.08, [0.08, 2])
                    const y = clamp(offsetIndex * FRAME_OFFSET, [FRAME_OFFSET * FRAMES_VISIBLE_LENGTH, Number.POSITIVE_INFINITY])

                    return (
                        <motion.div
                            key={card.index}
                            className="absolute w-full max-w-[1200px] aspect-[16/9] bg-black rounded-lg overflow-hidden shadow-2xl"
                            initial={false}
                            animate={{
                                y,
                                scale,
                                transition: {
                                    type: 'spring',
                                    stiffness: 250,
                                    damping: 20,
                                    mass: 0.5,
                                },
                            }}
                            style={{
                                willChange: 'opacity, filter, transform',
                                filter: `blur(${blur}px)`,
                                opacity,
                                transitionProperty: 'opacity, filter',
                                transitionDuration: '200ms',
                                transitionTimingFunction: 'ease-in-out',
                                zIndex: 1000 - card.index,
                            }}
                        >
                            <img
                                alt=""
                                src={IMAGES[card.imageIndex]}
                                className="object-cover w-full h-full"
                                draggable={false}
                            />
                        </motion.div>
                    )
                })}
            </div>
        </div>
    )
}
