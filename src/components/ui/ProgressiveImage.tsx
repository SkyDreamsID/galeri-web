'use client'

import React from 'react'
import Image from 'next/image'
import { getOptimizedImageUrl } from '@/lib/utils'

interface ProgressiveImageProps {
  src: string
  alt: string
  className?: string
  width?: number
  watermarkText?: string | null
  enableWatermark?: boolean
  priority?: boolean
  style?: React.CSSProperties
  onClick?: () => void
  sizes?: string
}

export function ProgressiveImage({ 
  src, 
  alt, 
  className = '',
  width = 800,
  watermarkText,
  enableWatermark = true,
  priority = false,
  style = { width: '100%', height: 'auto' },
  onClick,
  sizes = "(max-width: 768px) 50vw, 33vw"
}: ProgressiveImageProps) {
  if (!src) return null;

  // 1. Generate URL gambar nge-blur (low quality) dari Cloudinary untuk placeholder
  let blurUrl = src
  if (src.includes('upload/')) {
     blurUrl = src.replace('upload/', 'upload/e_blur:1000,f_auto,q_1,w_100/')
  }

  // 2. Custom Loader untuk Next.js Image
  const cloudinaryLoader = ({ src: loaderSrc, width: loaderWidth }: { src: string, width: number }) => {
    return getOptimizedImageUrl(loaderSrc, loaderWidth, watermarkText, enableWatermark)
  }

  return (
    <Image 
      loader={cloudinaryLoader}
      src={src} 
      alt={alt} 
      width={width}
      height={width} // dummy height, css auto overrides it
      style={style}
      placeholder="blur"
      blurDataURL={blurUrl}
      className={className}
      sizes={sizes}
      priority={priority}
      onClick={onClick}
    />
  )
}
