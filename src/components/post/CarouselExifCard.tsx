import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { ExifData } from '@/types/gallery'

export function CarouselExifCard({ exif, cameraName, isVisible }: { exif?: ExifData, cameraName: string, isVisible: boolean }) {
  if (!isVisible) return null;

  // Jika tidak ada data EXIF sama sekali
  if (!exif || Object.keys(exif).length === 0) {
    return (
      <div className="absolute bottom-16 right-4 p-4 rounded-xl shadow-xl border border-[#3A3A3A] bg-[#F4F4F4] dark:bg-[#1F1F1F] text-sm w-64 animate-in fade-in slide-in-from-bottom-4 duration-250 z-50">
        <p className="text-text-muted text-[12px] text-center py-2">⚠️ Data EXIF tidak tersedia untuk foto ini.</p>
      </div>
    )
  }

  return (
    <div className="absolute bottom-16 right-4 p-4 rounded-xl shadow-xl border border-[#3A3A3A] bg-[#F4F4F4] dark:bg-[#1F1F1F] text-sm w-56 animate-in fade-in slide-in-from-bottom-4 duration-250 z-50">
      <div className="font-mono text-[13px] text-text-main space-y-2">
        <div className="font-bold border-b border-[#3A3A3A]/20 pb-2 mb-2 line-clamp-2 break-words text-[14px]">
          {cameraName}
        </div>
        {exif.lens && (
          <div className="flex items-center gap-2 text-[12px] font-medium text-text-main/90 bg-[#E0E0E0] dark:bg-[#2A2A2A] p-2 rounded-md border border-[#3A3A3A]/30 mb-3 shadow-inner">
            <span className="text-[10px] uppercase tracking-wider text-text-muted shrink-0 bg-background/50 px-1.5 py-0.5 rounded">Lens</span>
            <span className="line-clamp-2 break-words">{exif.lens}</span>
          </div>
        )}
        <div className="grid grid-cols-2 gap-y-3 gap-x-2 mt-2">
          <div><span className="text-[10px] uppercase tracking-wider text-text-muted block mb-0.5">ISO</span>{exif.iso || '-'}</div>
          <div><span className="text-[10px] uppercase tracking-wider text-text-muted block mb-0.5">Aperture</span>{exif.aperture || '-'}</div>
          <div><span className="text-[10px] uppercase tracking-wider text-text-muted block mb-0.5">Shutter</span>{exif.shutter_speed || '-'}</div>
          <div><span className="text-[10px] uppercase tracking-wider text-text-muted block mb-0.5">Focal</span>{exif.focal_length || '-'}</div>
        </div>
      </div>
    </div>
  )
}
