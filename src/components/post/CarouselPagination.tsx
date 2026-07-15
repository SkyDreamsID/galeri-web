import React from 'react'

export function CarouselPagination({
  show,
  scrollSnaps,
  selectedIndex,
  onDotClick
}: {
  show: boolean
  scrollSnaps: number[]
  selectedIndex: number
  onDotClick: (index: number) => void
}) {
  if (!show) return null

  return (
    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 z-10">
      {scrollSnaps.map((_, index) => (
        <button
          key={index}
          onClick={() => onDotClick(index)}
          className={`w-2 h-2 rounded-full transition-all duration-300 ${
            index === selectedIndex ? 'bg-white w-4' : 'bg-background/80 hover:bg-white backdrop-blur border border-white/20'
          }`}
          aria-label={`Go to slide ${index + 1}`}
        />
      ))}
    </div>
  )
}
