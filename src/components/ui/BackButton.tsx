'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export function BackButton() {
  const router = useRouter()

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [])

  return (
    <button 
      onClick={() => {
        // Jika histori ada lebih dari 1, kembali secara instan pakai memori browser
        if (typeof window !== 'undefined' && window.history.length > 2) {
          router.back()
        } else {
          router.push('/')
        }
      }}
      className="inline-flex items-center gap-2 px-4 py-2 bg-surface/50 hover:bg-surface border border-border/50 rounded-full text-[10px] md:text-xs font-bold text-text-muted hover:text-text-main transition-all uppercase tracking-widest group cursor-pointer select-none shadow-sm"
    >
      <span className="transition-transform group-hover:-translate-x-1">←</span> Kembali ke Galeri
    </button>
  )
}
