import React, { useState } from 'react'
import { Info, Download, Copyright } from 'lucide-react'

export function CarouselActions({ 
  photo, 
  license, 
  copyrightName,
  onToggleExif, 
  hasExif 
}: { 
  photo: any, 
  license?: string, 
  copyrightName?: string,
  onToggleExif: () => void,
  hasExif: boolean
}) {
  const [showCopyright, setShowCopyright] = useState(false);

  return (
    <div className="absolute bottom-4 right-4 flex items-center gap-2">
      {/* Download Button */}
      {license === 'Free Copyright' && (
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

      {/* Copyright Button */}
      <div className="relative">
        <button 
          onClick={() => setShowCopyright(!showCopyright)}
          className="bg-background/80 backdrop-blur border border-border p-2 rounded-full text-text-main hover:bg-surface transition-colors"
          title="Info Hak Cipta"
        >
          <Copyright size={18} />
        </button>

        {/* Copyright Popup */}
        {showCopyright && (
          <div className="absolute bottom-12 right-0 p-3 rounded-xl shadow-xl border border-[#3A3A3A] bg-[#F4F4F4] dark:bg-[#1F1F1F] text-sm w-48 animate-in fade-in slide-in-from-bottom-2 duration-200 z-50">
            <div className="text-[11px] text-text-main font-medium">
              <span className="block text-text-muted mb-1 text-[10px] uppercase tracking-wider">{license || 'Copyright'}</span>
              © {copyrightName || 'Rifki Eka Putra'}.<br/>All rights reserved.
            </div>
          </div>
        )}
      </div>

      {/* Info Button */}
      {hasExif && (
        <button 
          onClick={onToggleExif}
          className="bg-background/80 backdrop-blur border border-border p-2 rounded-full text-text-main hover:bg-surface transition-colors"
          title="Info EXIF"
        >
          <Info size={18} />
        </button>
      )}
    </div>
  )
}
