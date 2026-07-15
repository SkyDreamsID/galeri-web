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
                {/* 📸 KONTENER FOTO RESPONSIVE 📸 */}
                {/* ======================================================= */}
                <div className="flex w-full items-center justify-center h-[55vh] md:h-[65vh] lg:h-[80vh] landscape:h-[85vh] lg:landscape:h-[80vh]">
                  <img src={displayUrl} alt="Photo View" className="max-w-full max-h-full w-auto h-auto object-contain" />
                  
                  <CarouselActions 
                    photo={photo} license={photo.license_type} copyrightName={photo.copyright_name} hasExif={!!exif && Object.keys(exif).length > 0} onToggleExif={() => toggleExif(photo.id)}
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
