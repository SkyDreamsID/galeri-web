'use client'

import { useEffect } from 'react'
import Link from 'next/link'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('App Error:', error)
  }, [error])

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center text-center px-4">
      <h1 className="text-4xl font-extrabold text-text-main mb-3 font-heading tracking-tighter">Terjadi Kesalahan</h1>
      <p className="text-sm text-text-muted mb-6 max-w-md">
        {error?.message || 'Gagal memuat data. Silakan coba muat ulang halaman.'}
      </p>
      <div className="flex items-center gap-3">
        <button
          onClick={() => reset()}
          className="px-5 py-2.5 bg-primary-neutral text-white rounded-xl font-bold transition-all shadow-sm hover:opacity-90 active:scale-95 text-sm cursor-pointer"
        >
          Coba Lagi
        </button>
        <Link 
          href="/" 
          className="px-5 py-2.5 bg-surface hover:bg-border text-text-main rounded-xl font-bold transition-all border border-border text-sm"
        >
          Balik ke Beranda
        </Link>
      </div>
    </div>
  )
}
