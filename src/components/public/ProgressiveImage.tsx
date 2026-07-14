'use client'

import React, { useState, useEffect } from 'react'
import { getOptimizedImageUrl } from '@/lib/utils'

interface ProgressiveImageProps {
  src: string
  alt: string
  className?: string
  width?: number
}

export function ProgressiveImage({ 
  src, 
  alt, 
  className = '',
  width = 800
}: ProgressiveImageProps) {
  const [isLoaded, setIsLoaded] = useState(false)
  const [currentSrc, setCurrentSrc] = useState('')

  useEffect(() => {
    if (!src) return;
    
    // 1. Generate URL gambar nge-blur (low quality) dari Cloudinary
    let lowRes = src
    if (src.includes('upload/')) {
       lowRes = src.replace('upload/', 'upload/e_blur:1000,f_auto,q_1,w_100/')
    }
    setCurrentSrc(lowRes)

    // 2. Preload gambar asli (kualitas bagus) di background
    const highResUrl = getOptimizedImageUrl(src, width)
    const img = new Image()
    img.src = highResUrl
    img.onload = () => {
      // 3. Kalau udah beres ke-download, langsung ganti source-nya
      setCurrentSrc(highResUrl)
      setIsLoaded(true)
    }
  }, [src, width])

  return (
    <img 
      src={currentSrc || src} 
      alt={alt} 
      className={`${className} transition-[filter] duration-1000 ${isLoaded ? 'blur-0' : 'blur-md'}`}
      loading="lazy"
    />
  )
}
