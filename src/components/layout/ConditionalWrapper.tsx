'use client'

import React from 'react'
import { usePathname } from 'next/navigation'

export function ConditionalWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  
  // Sembunyikan elemen ini jika sedang berada di halaman admin
  if (pathname?.startsWith('/admin')) {
    return null
  }
  
  return <>{children}</>
}
