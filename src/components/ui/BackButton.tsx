'use client'

import { useRouter } from 'next/navigation'

export function BackButton() {
  const router = useRouter()

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
      className="inline-flex items-center gap-2 text-[10px] md:text-xs font-bold text-text-muted hover:text-text-main transition-colors uppercase tracking-widest group cursor-pointer select-none"
    >
      <span className="transition-transform group-hover:-translate-x-1">←</span> Kembali ke Galeri
    </button>
  )
}
