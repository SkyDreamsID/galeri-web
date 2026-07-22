'use client'

import React, { useState } from 'react'
import { Share2, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

interface ShareButtonProps {
  title: string
  siteTitle?: string
  creators?: string
  postId?: string
  shares?: number
  showPublicStats?: boolean
}

export function ShareButton({ title, siteTitle = 'Jurnal Visual', creators, postId, shares = 0, showPublicStats = false }: ShareButtonProps) {
  const [isSharing, setIsSharing] = useState(false)
  const [localShares, setLocalShares] = useState(shares)
  const [hasShared, setHasShared] = useState(false)

  const handleShare = async () => {
    try {
      setIsSharing(true)
      
      const displayCreator = creators ? creators : siteTitle;
      
      if (navigator.share) {
        await navigator.share({
          title: `${title} • ${siteTitle}`,
          url: window.location.href,
        })
      } else {
        // Fallback for browsers that don't support Web Share API
        await navigator.clipboard.writeText(window.location.href)
        toast.success('Link disalin ke clipboard!')
      }

      // Increment shares only once per session via API
      if (postId && !hasShared) {
        setLocalShares(prev => prev + 1)
        setHasShared(true)
        fetch('/api/share', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ postId })
        }).catch(err => console.error('Failed to increment shares:', err))
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
      className="shrink-0 flex items-center justify-center gap-2 px-3 md:px-4 py-2 text-text-muted hover:text-text-main hover:bg-surface/80 transition-all active:scale-95 disabled:opacity-50 font-sans text-xs md:text-sm font-medium"
      title="Bagikan Tautan"
    >
      {isSharing ? <Loader2 size={16} className="animate-spin" /> : <Share2 size={16} />}
      <span>
        {showPublicStats ? `Bagikan${localShares > 0 ? ` (${localShares})` : ''}` : 'Bagikan'}
      </span>
    </button>
  )
}
