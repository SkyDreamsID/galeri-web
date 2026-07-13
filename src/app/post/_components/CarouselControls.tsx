import React from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

export function CarouselControls({ 
  show, 
  onPrev, 
  onNext 
}: { 
  show: boolean, 
  onPrev: () => void, 
  onNext: () => void 
}) {
  if (!show) return null

  return (
    <>
      <button 
        className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center rounded-full bg-background/80 backdrop-blur border border-border text-text-main opacity-0 group-hover:opacity-100 transition-opacity hover:bg-surface shadow-sm"
        onClick={onPrev}
      >
        <ChevronLeft size={20} />
      </button>
      <button 
        className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center rounded-full bg-background/80 backdrop-blur border border-border text-text-main opacity-0 group-hover:opacity-100 transition-opacity hover:bg-surface shadow-sm"
        onClick={onNext}
      >
        <ChevronRight size={20} />
      </button>
    </>
  )
}
