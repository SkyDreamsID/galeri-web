'use client'

import { useEffect } from 'react'

export function ViewTracker({ postId }: { postId: string }) {
  useEffect(() => {
    // Pakai sessionStorage biar nggak ke-hitung 2x kalau cuma refresh atau balik dari halaman lain
    const hasTracked = sessionStorage.getItem(`tracked_${postId}`)
    if (!hasTracked) {
      fetch('/api/views', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId }),
      })
      .then(res => {
         if (res.ok) sessionStorage.setItem(`tracked_${postId}`, 'true')
      })
      .catch(err => console.error("Gagal nyatet view:", err))
    }
  }, [postId])

  return null // Komponen ini invisible, cuma buat jalanin script di background
}
