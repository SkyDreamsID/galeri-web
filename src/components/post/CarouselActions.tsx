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

  // 🔥 BUILD URL DOWNLOAD CLOUDINARY YANG BENAR 🔥
  // Ambil nama file: prioritas original_filename, fallback ke judul post
  const safeTitle = (postTitle || 'JurnalVisual_Image').replace(/[^a-zA-Z0-9_-]/g, '_')
  const rawName = photo.original_filename 
    ? photo.original_filename.replace(/[^a-zA-Z0-9_\-. ]/g, '_') // Sanitasi, tapi jangan encode
    : safeTitle
  const finalName = rawName.replace(/\s+/g, '_') // Spasi → underscore (aman di Cloudinary URL)

  // Sisipkan fl_attachment TEPAT setelah "/upload/" dan SEBELUM transformasi/versi/public_id
  // Contoh benar: https://res.cloudinary.com/demo/image/upload/fl_attachment:nama/v1/sample.jpg
  const buildDownloadUrl = (imageUrl: string): string => {
    const uploadMarker = '/upload/'
    const idx = imageUrl.indexOf(uploadMarker)
    if (idx === -1) return imageUrl // fallback: URL tidak ada /upload/
    const base = imageUrl.substring(0, idx + uploadMarker.length)
    const rest = imageUrl.substring(idx + uploadMarker.length)
    return `${base}fl_attachment:${finalName}/${rest}`
  }

  const downloadUrl = buildDownloadUrl(photo.image_url)

  return (
    <div className="absolute bottom-4 right-4 flex items-center gap-2">
      {/* Download Button */}
      {license === 'Free Copyright' && (
        <a 
          href={downloadUrl}
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