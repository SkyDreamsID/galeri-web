import React from 'react'

interface SkeletonCardProps {
  height?: number | string;
  className?: string;
}

export function SkeletonCard({ height, className = '' }: SkeletonCardProps) {
  // Gunakan aspect-video sebagai default jika tidak ada height
  const defaultClass = height ? '' : 'aspect-video';

  return (
    <div
      className={`block w-full rounded-xl md:rounded-2xl bg-surface animate-pulse break-inside-avoid relative overflow-hidden ${defaultClass} ${className}`}
      style={height ? { height } : undefined}
    >
      <div className="absolute bottom-0 left-0 right-0 p-3 md:p-5 flex flex-col gap-2">
        <div className="h-3 md:h-4 w-2/3 bg-white/10 rounded"></div>
        <div className="h-2 md:h-3 w-1/2 bg-white/10 rounded"></div>
      </div>
    </div>
  )
}
