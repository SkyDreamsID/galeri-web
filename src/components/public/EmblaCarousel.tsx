'use client'

import React, { useState } from 'react'
import useEmblaCarousel from 'embla-carousel-react'
import { ChevronLeft, ChevronRight, Info, Download } from 'lucide-react'

import { getOptimizedImageUrl } from '@/lib/utils'

export function EmblaCarousel({ photos }: { photos: any[] }) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true })
  const [showExif, setShowExif] = useState<Record<string, boolean>>({})

  const scrollPrev = () => emblaApi && emblaApi.scrollPrev()
  const scrollNext = () => emblaApi && emblaApi.scrollNext()
  
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
            // Resolusi asli HANYA boleh diakses lewat tombol download
            const displayUrl = getOptimizedImageUrl(photo.image_url, 1920)
            
            return (
              <div key={photo.id} className="relative flex-[0_0_100%] min-w-0">
                <img 
                  src={displayUrl} 
                  alt="Gallery image" 
                  className="w-full h-auto max-h-[80vh] object-contain"
                />
                
                {/* Action Buttons */}
                <div className="absolute bottom-4 right-4 flex items-center gap-2">
                  {/* Download Button */}
                  {photo.license_type === 'Free Copyright' && (
                    <a 
                      href={photo.image_url.replace('/upload/', '/upload/fl_attachment/')} 
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-background/80 backdrop-blur border border-border p-2 rounded-full text-text-main hover:bg-surface transition-colors"
                      title="Unduh Resolusi Penuh"
                    >
                      <Download size={18} />
                    </a>
                  )}

                  {/* Info Button */}
                  {exif && Object.keys(exif).length > 0 && (
                    <button 
                      onClick={() => toggleExif(photo.id)}
                      className="bg-background/80 backdrop-blur border border-border p-2 rounded-full text-text-main hover:bg-surface transition-colors"
                      title="Info EXIF"
                    >
                      <Info size={18} />
                    </button>
                  )}
                </div>

                {/* EXIF Card Overlay (JetBrains Mono) */}
                {isExifVisible && exif && (
                  <div className="absolute bottom-16 right-4 p-4 rounded-xl shadow-xl border border-[#3A3A3A] bg-[#F4F4F4] dark:bg-[#1F1F1F] text-sm w-72 animate-in fade-in slide-in-from-bottom-4 duration-250">
                    <div className="font-mono text-[13px] text-text-main space-y-2">
                      <div className="font-bold border-b border-[#3A3A3A]/20 pb-2 mb-2 line-clamp-2 break-words">
                        {cameraName}
                      </div>
                      {exif.lens && <div className="line-clamp-2 break-words text-text-muted">{exif.lens}</div>}
                      <div className="grid grid-cols-2 gap-y-3 gap-x-2 mt-3">
                        <div><span className="text-[10px] uppercase tracking-wider text-text-muted block mb-0.5">ISO</span>{exif.iso || '-'}</div>
                        <div><span className="text-[10px] uppercase tracking-wider text-text-muted block mb-0.5">Aperture</span>{exif.aperture || '-'}</div>
                        <div><span className="text-[10px] uppercase tracking-wider text-text-muted block mb-0.5">Shutter</span>{exif.shutter_speed || '-'}</div>
                        <div><span className="text-[10px] uppercase tracking-wider text-text-muted block mb-0.5">Focal</span>{exif.focal_length || '-'}</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
      
      {/* Carousel Controls */}
      {photos.length > 1 && (
        <>
          <button 
            className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center rounded-full bg-background/80 backdrop-blur border border-border text-text-main opacity-0 group-hover:opacity-100 transition-opacity hover:bg-surface shadow-sm"
            onClick={scrollPrev}
          >
            <ChevronLeft size={20} />
          </button>
          <button 
            className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center rounded-full bg-background/80 backdrop-blur border border-border text-text-main opacity-0 group-hover:opacity-100 transition-opacity hover:bg-surface shadow-sm"
            onClick={scrollNext}
          >
            <ChevronRight size={20} />
          </button>
        </>
      )}
    </div>
  )
}
