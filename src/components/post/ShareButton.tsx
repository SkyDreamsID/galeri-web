'use client'

import React, { useState } from 'react'
import { Share2, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

interface ShareButtonProps {
  title: string
  siteTitle?: string
  creators?: string
}

export function ShareButton({ title, siteTitle = 'Jurnal Visual', creators }: ShareButtonProps) {
  const [isSharing, setIsSharing] = useState(false)

  const handleShare = async () => {
    try {
      setIsSharing(true)
      
      const displayCreator = creators ? creators : siteTitle;
      
      if (navigator.share) {
        await navigator.share({
          title: `${title} • ${siteTitle}`,
          text: `Jelajahi karya "${title}" oleh ${displayCreator} di ${siteTitle}.`,
          url: window.location.href,
        })
      } else {
        // Fallback for browsers that don't support Web Share API
        await navigator.clipboard.writeText(window.location.href)
        toast.success('Link disalin ke clipboard!')
      }
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        console.error('Error sharing:', err)
        toast.error('Gagal membagikan tautan.')
      }
    } finally {
      setIsSharing(false)
    }
  }

  return (
    <button 
      onClick={handleShare}
      disabled={isSharing}
      className="shrink-0 flex items-center justify-center px-3 md:px-4 py-1.5 md:py-2 rounded-full bg-surface/50 border border-border/40 text-text-muted hover:text-text-main hover:bg-surface transition-all active:scale-95 shadow-sm disabled:opacity-50 gap-2 font-sans text-xs md:text-sm font-medium"
      title="Bagikan Tautan"
    >
      {isSharing ? <Loader2 size={16} className="animate-spin" /> : <Share2 size={16} />}
      <span>Bagikan</span>
    </button>
  )
}
