'use client'

import React from 'react'
import Image from 'next/image'
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
  if (!src) return null;

  // 1. Generate URL gambar nge-blur (low quality) dari Cloudinary untuk placeholder
  let blurUrl = src
  if (src.includes('upload/')) {
     blurUrl = src.replace('upload/', 'upload/e_blur:1000,f_auto,q_1,w_100/')
  }

  // 2. Gunakan getOptimizedImageUrl bawaan untuk kualitas utama
  const highResUrl = getOptimizedImageUrl(src, width)

  return (
    <Image 
      src={highResUrl} 
      alt={alt} 
      width={width}
      height={width} // dummy height, css auto overrides it
      style={{ width: '100%', height: 'auto' }}
      placeholder="blur"
      blurDataURL={blurUrl}
      className={className}
      unoptimized // Cloudinary sudah melakukan kompresi f_auto,q_auto
    />
  )
}
