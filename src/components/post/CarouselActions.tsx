import React, { useState } from 'react'
import { Info, Download, Copyright } from 'lucide-react'
import { toast } from 'sonner'
import { useSiteSettings } from '@/contexts/SiteSettingsContext'

export function CarouselActions({ 
  photo, 
  postId,
  postTitle, 
  license, 
  copyrightName,
  onToggleExif, 
  isCopyrightVisible,
  onToggleCopyright
}: { 
  photo: any, 
  postId: string,
  postTitle?: string,
  license?: string, 
  copyrightName?: string,
  onToggleExif: () => void,
  isCopyrightVisible: boolean,
  onToggleCopyright: () => void
}) {

  const settings = useSiteSettings()

  const handleDownload = () => {
    fetch('/api/download', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ postId })
    }).catch(console.error)
  }

  // 🔥 FILTER ANTI ERROR 400 CLOUDINARY 🔥
  // Ubah spasi & karakter aneh di judul post jadi underscore "_" [1]
  const safeTitle = (postTitle || 'JurnalVisual_Image').replace(/[^a-zA-Z0-9_-]/g, '_')
  const finalName = photo.original_filename 
    ? encodeURIComponent(photo.original_filename) 
    : safeTitle

  return (
    <div className="absolute bottom-4 right-4 flex items-center gap-2">
      {/* Download Button */}
      {license === 'Free Copyright' && (
        <a 
          href={photo.image_url.replace('/upload/', `/upload/fl_attachment:${finalName}/`)}
          onClick={handleDownload}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-background/80 backdrop-blur border border-border p-2 rounded-full text-text-main hover:bg-surface transition-colors"
          title="Unduh file asli"
        >
          <Download size={18} />
        </a>
      )}

      {/* Copyright Button */}
      <div className="relative">
        <button 
          onClick={onToggleCopyright}
          className="bg-background/80 backdrop-blur border border-border p-2 rounded-full text-text-main hover:bg-surface transition-colors"
          title="Info Hak Cipta"
        >
          <Copyright size={18} />
        </button>

        {/* Copyright Popup */}
        {isCopyrightVisible && (
          <div className="absolute bottom-12 right-0 p-2.5 sm:p-3 rounded-xl shadow-xl border border-[#3A3A3A] bg-[#F4F4F4] dark:bg-[#1F1F1F] text-sm w-40 sm:w-48 animate-in fade-in slide-in-from-bottom-2 duration-200 z-50">
            <div className="text-[10px] sm:text-[11px] text-text-main font-medium">
              <span className="block text-text-muted mb-1 text-[9px] sm:text-[10px] uppercase tracking-wider">{license || 'Copyright'}</span>
              © {copyrightName || settings?.author_name || 'Jurnal Visual'}<br/>All rights reserved.
            </div>
          </div>
        )}
      </div>

      {/* Info Button - selalu tampil */}
      <button 
        onClick={onToggleExif}
        className="bg-background/80 backdrop-blur border border-border p-2 rounded-full text-text-main hover:bg-surface transition-colors"
        title="Info EXIF"
      >
        <Info size={18} />
      </button>
    </div>
  )
}