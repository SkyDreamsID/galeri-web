'use client'

import React, { useState, useEffect, useCallback } from 'react'
import useEmblaCarousel from 'embla-carousel-react'

import { getOptimizedImageUrl } from '@/lib/utils'
import { CarouselControls } from './CarouselControls'
import { CarouselPagination } from './CarouselPagination'
import { CarouselActions } from './CarouselActions'
import { CarouselExifCard } from './CarouselExifCard'

export function EmblaCarousel({ photos, license }: { photos: any[], license?: string }) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true })
  const [showExif, setShowExif] = useState<Record<string, boolean>>({})
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([])

  const scrollPrev = useCallback(() => emblaApi && emblaApi.scrollPrev(), [emblaApi])
  const scrollNext = useCallback(() => emblaApi && emblaApi.scrollNext(), [emblaApi])
  const scrollTo = useCallback((index: number) => emblaApi && emblaApi.scrollTo(index), [emblaApi])

  const onInit = useCallback((emblaApi: any) => {
    setScrollSnaps(emblaApi.scrollSnapList())
  }, [])

  const onSelect = useCallback((emblaApi: any) => {
    setSelectedIndex(emblaApi.selectedScrollSnap())
  }, [])

  useEffect(() => {
    if (!emblaApi) return
    onInit(emblaApi)
    onSelect(emblaApi)
    emblaApi.on('reInit', onInit)
    emblaApi.on('reInit', onSelect)
    emblaApi.on('select', onSelect)
  }, [emblaApi, onInit, onSelect])

  const toggleExif = (photoId: string) => {
    setShowExif(prev => ({ ...prev, [photoId]: !prev[photoId] }))
  }

  if (!photos || photos.length === 0) return null

  return (
    <div className="relative group">
      <div className="overflow-hidden rounded-[16px] bg-surface/50 border border-border backdrop-blur-sm" ref={emblaRef}>
        <div className="flex">
          {photos.map((photo) => {
            const exif = photo.exif_data?.[0]
            const isExifVisible = showExif[photo.id]
            let cameraName = exif?.camera || 'Unknown Camera'
            if (cameraName.includes('NIKON CORPORATION NIKON')) {
              cameraName = cameraName.replace('NIKON CORPORATION NIKON', 'NIKON')
            } else if (cameraName.startsWith('NIKON CORPORATION ')) {
              cameraName = cameraName.replace('NIKON CORPORATION ', '')
            }
            
            // Selalu gunakan versi terkompresi (max 1920px) untuk tampilan frontend web
            const displayUrl = getOptimizedImageUrl(photo.image_url, 1920)
            
            return (
              <div key={photo.id} className="relative flex-[0_0_100%] min-w-0">
                
                {/* ======================================================= */}
                {/* 📱 1. TAMPILAN KHUSUS HP (MOBILE VIEW) 📱 */}
                {/* Hanya muncul di layar kecil. Otomatis hilang di Tablet. */}
                {/* Silakan edit ukuran h-[55vh] di bawah sesuai selera lu! */}
                {/* ======================================================= */}
                <div className="flex md:hidden w-full h-[30vh] items-center justify-center">
                  <img src={displayUrl} alt="Mobile View" className="max-w-full max-h-full w-auto h-auto object-contain" />
                  
                  <CarouselActions 
                    photo={photo} license={license} copyrightName={photo.copyright_name} hasExif={!!exif && Object.keys(exif).length > 0} onToggleExif={() => toggleExif(photo.id)}
                  />
                  <CarouselExifCard exif={exif} cameraName={cameraName} isVisible={isExifVisible} />
                </div>

                {/* ======================================================= */}
                {/* 💊 2. TAMPILAN KHUSUS TABLET (TABLET VIEW) 💊 */}
                {/* Hanya muncul di iPad/Tablet. Hilang di HP & PC. */}
                {/* Silakan edit ukuran h-[65vh] di bawah sesuai selera lu! */}
                {/* ======================================================= */}
                <div className="hidden md:flex lg:hidden w-full h-[45vh] items-center justify-center">
                  <img src={displayUrl} alt="Tablet View" className="max-w-full max-h-full w-auto h-auto object-contain" />
                  
                  <CarouselActions 
                    photo={photo} license={license} copyrightName={photo.copyright_name} hasExif={!!exif && Object.keys(exif).length > 0} onToggleExif={() => toggleExif(photo.id)}
                  />
                  <CarouselExifCard exif={exif} cameraName={cameraName} isVisible={isExifVisible} />
                </div>

                {/* ======================================================= */}
                {/* 💻 3. TAMPILAN KHUSUS LAPTOP/PC (DESKTOP VIEW) 💻 */}
                {/* Hanya muncul di Laptop ke atas. Hilang di HP & Tablet. */}
                {/* Silakan edit ukuran h-[75vh] di bawah sesuai selera lu! */}
                {/* ======================================================= */}
                <div className="hidden lg:flex w-full h-[75vh] items-center justify-center">
                  <img src={displayUrl} alt="Desktop View" className="max-w-full max-h-full w-auto h-auto object-contain" />
                  
                  <CarouselActions 
                    photo={photo} license={license} copyrightName={photo.copyright_name} hasExif={!!exif && Object.keys(exif).length > 0} onToggleExif={() => toggleExif(photo.id)}
                  />
                  <CarouselExifCard exif={exif} cameraName={cameraName} isVisible={isExifVisible} />
                </div>

              </div>
            )
          })}
        </div>
      </div>
      
      <CarouselControls 
        show={photos.length > 1} 
        onPrev={scrollPrev} 
        onNext={scrollNext} 
      />

      <CarouselPagination 
        show={photos.length > 1}
        scrollSnaps={scrollSnaps}
        selectedIndex={selectedIndex}
        onDotClick={scrollTo}
      />
    </div>
  )
}
