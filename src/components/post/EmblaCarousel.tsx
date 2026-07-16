'use client'

import React, { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import useEmblaCarousel from 'embla-carousel-react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { createPortal } from 'react-dom'
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch'

import { getOptimizedImageUrl } from '@/lib/utils'
import { CarouselControls } from './CarouselControls'
import { CarouselPagination } from './CarouselPagination'
import { CarouselActions } from './CarouselActions'
import { CarouselExifCard } from './CarouselExifCard'

export function EmblaCarousel({ photos, postId, license }: { photos: any[], postId: string, license?: string }) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true })
  const [showExif, setShowExif] = useState<Record<string, boolean>>({})
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([])
  const [zoomedImage, setZoomedImage] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    
    // Tangkap event tombol back android/browser
    const handlePopState = () => {
      setZoomedImage(prev => prev ? null : prev)
    }
    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  const openZoom = (url: string) => {
    window.history.pushState({ lightbox: true }, '')
    setZoomedImage(url)
  }

  const closeZoom = () => {
    setZoomedImage(null)
    if (window.history.state?.lightbox) {
      window.history.back()
    }
  }

  useEffect(() => {
    if (zoomedImage) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [zoomedImage])

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
    <>
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
                <div className="flex w-full items-center justify-center aspect-square md:aspect-auto md:h-[65vh] lg:h-[80vh] max-lg:landscape:h-[85vh] lg:landscape:h-[80vh]">
                  <Image 
                    src={displayUrl} 
                    alt="Photo View" 
                    width={1920}
                    height={1080}
                    style={{ width: 'auto', height: '100%', maxHeight: '100%', maxWidth: '100%' }}
                    className="object-contain cursor-zoom-in transition-transform hover:scale-[1.01]" 
                    unoptimized
                    onClick={() => openZoom(displayUrl)}
                  />
                  
                  <CarouselActions 
                    photo={photo} postId={postId} license={photo.license_type} copyrightName={photo.copyright_name} hasExif={!!exif && Object.keys(exif).length > 0} onToggleExif={() => toggleExif(photo.id)}
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

      {/* LIGHTBOX MODAL */}
      {mounted && createPortal(
        <AnimatePresence>
          {zoomedImage && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/95 backdrop-blur-xl"
              onClick={closeZoom}
            >
              {/* Close Button */}
              <motion.button
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: 0.2 }}
                className="absolute top-6 right-6 lg:top-10 lg:right-10 p-3 rounded-full bg-white/10 text-white hover:bg-white/20 hover:scale-110 transition-all cursor-pointer z-50"
                onClick={(e) => {
                  e.stopPropagation()
                  closeZoom()
                }}
              >
                <X size={24} />
              </motion.button>

              {/* Zoomed Image */}
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                className="relative w-full h-full max-w-[100vw] max-h-[100vh] flex items-center justify-center p-0"
                onClick={(e) => e.stopPropagation()} // Prevent closing when clicking the image itself
              >
                <TransformWrapper
                  initialScale={1}
                  minScale={1}
                  maxScale={5}
                  centerOnInit
                  wheel={{ step: 0.1 }}
                  pinch={{ step: 5 }}
                >
                  <TransformComponent wrapperStyle={{ width: '100%', height: '100%' }} contentStyle={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <img 
                      src={zoomedImage} 
                      alt="Zoomed" 
                      className="w-auto h-auto max-w-[95vw] max-h-[95vh] object-contain rounded-md shadow-2xl cursor-grab active:cursor-grabbing"
                    />
                  </TransformComponent>
                </TransformWrapper>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </>
  )
}
