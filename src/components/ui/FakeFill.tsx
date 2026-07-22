'use client'

import React, { useMemo } from 'react'

// 4 fixed aspect ratio shapes
const SHAPES = [
  { ratio: 'aspect-[4/3]', label: 'landscape' },
  { ratio: 'aspect-[3/4]', label: 'portrait' },
  { ratio: 'aspect-[1/1]', label: 'square' },
  { ratio: 'aspect-[2/3]', label: 'tall' },
]

// Curated gradient palettes
const GRADIENTS = [
  'from-violet-900/60 via-indigo-800/50 to-blue-900/60',
  'from-rose-900/60 via-pink-800/50 to-orange-800/60',
  'from-emerald-900/60 via-teal-800/50 to-cyan-900/60',
  'from-amber-900/60 via-yellow-800/40 to-orange-900/60',
  'from-slate-800/80 via-slate-700/60 to-zinc-800/80',
  'from-purple-900/60 via-fuchsia-800/50 to-rose-900/60',
  'from-sky-900/60 via-blue-800/50 to-indigo-900/60',
  'from-green-900/60 via-emerald-800/50 to-teal-900/60',
]

interface FakeFillProps {
  seed?: number
  className?: string
}

export function FakeFill({ seed = 0, className = '' }: FakeFillProps) {
  const { shape, gradient } = useMemo(() => {
    const s = SHAPES[seed % SHAPES.length]
    const g = GRADIENTS[seed % GRADIENTS.length]
    return { shape: s, gradient: g }
  }, [seed])

  return (
    <div
      className={`block w-full rounded-xl md:rounded-2xl overflow-hidden break-inside-avoid pointer-events-none select-none ${className}`}
      aria-hidden="true"
    >
      <div className={`w-full ${shape.ratio} relative bg-gradient-to-br ${gradient}`}>
        {/* Subtle noise/texture overlay */}
        <div className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
            backgroundSize: 'cover',
          }}
        />
        {/* Subtle inner glow / vignette */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-black/10" />
      </div>
    </div>
  )
}
