'use client'

import React, { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { Play, Pause, Music, Disc } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useSiteSettings } from '@/contexts/SiteSettingsContext'

export function GalleryRadio() {
  const settings = useSiteSettings()
  let rawZenoId = settings?.zenofm_station_id || process.env.NEXT_PUBLIC_ZENO_STATION_ID
  let streamUrl = rawZenoId?.trim()
  let zenoId: string | null = null
  
  if (streamUrl) {
    if (!streamUrl.startsWith('http')) {
      zenoId = streamUrl
      streamUrl = `https://stream.zeno.fm/${streamUrl}`
    } else if (streamUrl.includes('stream.zeno.fm/')) {
      const parts = streamUrl.split('/').filter(Boolean)
      zenoId = parts[parts.length - 1]
    }
  }

  if (!streamUrl) return null
  const [isPlaying, setIsPlaying] = useState(false)
  
  // State untuk data radio
  const [trackInfo, setTrackInfo] = useState({
    title: "Menunggu last.fm API...",
    artist: "SkyDreamsID",
    coverUrl: "", 
    streamUrl: streamUrl
  })

  const audioRef = useRef<HTMLAudioElement | null>(null)
  const playPromiseRef = useRef<Promise<void> | void | null>(null)

  // Fungsi Toggle Play/Pause
  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        // Jika sedang loading play(), tunggu sampai resolve baru pause
        if (playPromiseRef.current) {
          playPromiseRef.current.then(() => {
            audioRef.current?.pause()
          }).catch(() => {})
        } else {
          audioRef.current.pause()
        }
        setIsPlaying(false)
      } else {
        audioRef.current.src = streamUrl
        audioRef.current.load()
        const playPromise = audioRef.current.play()
        playPromiseRef.current = playPromise
        if (playPromise !== undefined) {
          playPromise.catch(e => {
            if (e.name !== 'AbortError') console.error("Play failed:", e)
          })
        }
        setIsPlaying(true)
      }
    }
  }

  // Effect untuk Zeno.fm dan deteksi Portal Target
  useEffect(() => {
    if (!zenoId) {
      setTrackInfo(prev => ({ ...prev, title: "Streaming Audio", artist: "Live" }))
      return
    }

    // 1. Zeno.fm Fetch
    const eventSource = new EventSource(`https://api.zeno.fm/mounts/metadata/subscribe/${zenoId}`)

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        if (data.streamTitle) {
          const parts = data.streamTitle.split(" - ")
          let newArtist = "Radio Station"
          let newTitle = data.streamTitle

          if (parts.length >= 2) {
            newArtist = parts[0].trim()
            newTitle = parts.slice(1).join(" - ").trim()
          }

          setTrackInfo(prev => ({
            ...prev,
            title: newTitle,
            artist: newArtist
          }))

          const apiKey = "257a264bbac662d1b74762320ba4bcc1"
          fetch(`https://ws.audioscrobbler.com/2.0/?method=track.getInfo&api_key=${apiKey}&artist=${encodeURIComponent(newArtist)}&track=${encodeURIComponent(newTitle)}&format=json`)
            .then(res => res.json())
            .then(lastFmData => {
              let fetchedCover = ""
              if (lastFmData.track?.album?.image) {
                const images = lastFmData.track.album.image
                const largeImg = images.find((img: any) => img.size === 'large') || images[images.length - 1]
                if (largeImg && largeImg['#text']) {
                  fetchedCover = largeImg['#text']
                }
              }
              setTrackInfo(prev => ({ ...prev, coverUrl: fetchedCover }))
            })
            .catch(err => console.error("Gagal ambil cover Last.fm", err))
        }
      } catch (err) {
        console.error("Gagal parsing Zeno metadata", err)
      }
    }

    return () => {
      eventSource.close()
    }
  }, [zenoId])

  // Responsive logic & Portal Target Detection
  const [isMobile, setIsMobile] = useState(false)
  const [portalTarget, setPortalTarget] = useState<Element | null>(null)

  useEffect(() => {
    const checkPortal = () => {
      const width = window.innerWidth
      setIsMobile(width < 1024) // Sekarang mencakup layar Tablet dan Mobile Landscape (lg = 1024px)
      
      let targetId = 'radio-portal-mobile'
      if (width >= 768 && width < 1024) {
        targetId = 'radio-portal-tablet'
      }
      
      const targetNode = document.getElementById(targetId)
      setPortalTarget(prev => prev !== targetNode ? targetNode : prev)
    }
    
    // Initial check (use timeout to ensure Navbar is rendered on first mount)
    setTimeout(checkPortal, 100)
    
    window.addEventListener('resize', checkPortal)
    
    return () => {
      window.removeEventListener('resize', checkPortal)
    }
  }, [])

  // Widget untuk Desktop (Kanan Bawah)
  const desktopWidget = (
    <motion.div
      layout
      initial={false}
      animate={{
        width: isPlaying ? 340 : 64,
        height: isPlaying ? 80 : 64,
        borderRadius: isPlaying ? 24 : 32,
      }}
      transition={{ type: "spring", damping: 22, stiffness: 200 }}
      
      className={`
        fixed bottom-8 right-8
        bg-black/70 border border-white/20 text-white shadow-2xl backdrop-blur-xl hover:bg-black/80 hover:border-white/40
        flex items-center overflow-hidden pointer-events-auto cursor-pointer z-[9999] transition-all duration-300
      `}
      
      onClick={!isPlaying ? togglePlay : undefined}
      style={{ originX: 1 }}
    >
      <AnimatePresence>
        {isPlaying && (
          <motion.div
            key="expanded-content"
            initial={{ opacity: 0, filter: "blur(4px)" }}
            animate={{ opacity: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, filter: "blur(4px)" }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="flex items-center gap-3 pl-3 h-full flex-1 min-w-0"
          >
            {/* 🖼️ KOTAK FOTO / COVER ART */}
            <div className={`relative shrink-0 rounded-[10px] md:rounded-xl overflow-hidden flex items-center justify-center shadow-inner w-14 h-14 bg-black/40 border border-white/10`}>
              {trackInfo.coverUrl ? (
                <img 
                  src={trackInfo.coverUrl} 
                  alt="Cover Art" 
                  className="w-full h-full object-cover"
                />
              ) : (
                <>
                  <Disc className={`w-7 h-7 animate-spin duration-3000 text-white/50`} />
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-2.5 h-2.5 rounded-full bg-primary-neutral animate-ping"></div>
                  </div>
                </>
              )}
            </div>

            {/* 📝 TEKS INFORMASI LAGU */}
            <div className="flex-1 min-w-0 flex flex-col justify-center">
              <div className="overflow-hidden relative whitespace-nowrap mask-fade-edges w-full">
                {trackInfo.title.length > 20 ? (
                  <div className="animate-marquee">
                    <span className={`text-base font-bold pr-12 text-white`}>{trackInfo.title}</span>
                    <span className={`text-base font-bold pr-12 text-white`}>{trackInfo.title}</span>
                  </div>
                ) : (
                  <p className={`text-base font-bold truncate text-white`}>
                    {trackInfo.title}
                  </p>
                )}
              </div>
              <p className={`text-xs truncate mt-0.5 font-medium text-white/70`}>
                {trackInfo.artist}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* AREA TOMBOL */}
      <div 
        className={`w-16 h-16 shrink-0 flex items-center justify-center ml-auto`}
        onClick={isPlaying ? togglePlay : undefined}
      >
        {isPlaying ? (
          <button className={`shrink-0 rounded-full flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-md w-11 h-11 bg-white/20 hover:bg-white/30 text-white backdrop-blur-sm`}>
            <Pause className={`fill-current w-5 h-5`} />
          </button>
        ) : (
          <motion.div
            initial={{ opacity: 0, rotate: -45 }}
            animate={{ opacity: 1, rotate: 0 }}
            exit={{ opacity: 0, rotate: 45 }}
            transition={{ duration: 0.2 }}
            className={`hover:scale-110 active:scale-95 transition-transform text-white`}
          >
            <Music className={'w-7 h-7'} />
          </motion.div>
        )}
      </div>
    </motion.div>
  )

  // Tombol Toggle untuk Mobile Navbar
  const mobileToggleButton = (
    <button
      type="button"
      onClick={togglePlay}
      className={`w-11 h-11 relative flex items-center justify-center rounded-xl transition-all border shadow-sm touch-manipulation ${
        isPlaying 
          ? 'bg-surface text-primary-neutral border-primary-neutral/30' 
          : 'bg-surface/80 hover:bg-surface active:scale-90 text-text-main border-border/50'
      }`}
      title="Radio"
    >
      <Music size={18} className={isPlaying ? 'opacity-90' : ''} />
      {/* Indikator "Nyala" (Filler) di pojok atas tombol */}
      {isPlaying && (
        <>
          <span className="absolute top-3 right-3 w-1.5 h-1.5 rounded-full bg-primary-neutral animate-ping" />
          <span className="absolute top-3 right-3 w-1.5 h-1.5 rounded-full bg-primary-neutral shadow-[0_0_6px_rgba(0,173,181,1)]" />
        </>
      )}
    </button>
  )

  // Banner Musik untuk Mobile (IG Notes Style)
  const mobileBanner = (
    <AnimatePresence>
      {isPlaying && (
        <motion.div
          initial={{ opacity: 0, scale: 0.01, y: -30, filter: "blur(10px)", transformOrigin: "60% -30px" }}
          animate={{ opacity: 1, scale: 1, y: 0, filter: "blur(0px)" }}
          exit={{ opacity: 0, scale: 0.01, y: -30, filter: "blur(10px)", transition: { duration: 0.25, ease: "easeInOut" } }}
          transition={{ type: "spring", damping: 14, stiffness: 280, mass: 0.8 }}
          /* 🛠️ UBAH JARAK WIDGET DARI ATAS DI SINI */
          /* 'top-[68px]' = jarak dari layar atas. Kecilin angka (contoh: top-[64px]) kalau mau makin naik nempel ke navbar. */
          className="fixed top-[68px] right-6 z-[9990] max-w-[220px] bg-surface/95 border border-border/50 shadow-lg rounded-full px-2.5 py-1.5 flex items-center gap-2 lg:hidden pointer-events-auto select-text backdrop-blur-md"
        >
          {/* Cover Art Super Mini */}
          <div className="w-4 h-4 shrink-0 rounded-full overflow-hidden bg-background flex items-center justify-center relative shadow-sm border border-border/50">
            {trackInfo.coverUrl ? (
              <img src={trackInfo.coverUrl} alt="Cover" className="w-full h-full object-cover" />
            ) : (
              <Music className="w-2.5 h-2.5 text-text-muted" />
            )}
          </div>
          
          {/* Info Teks (1 Baris) */}
          <div className="flex-1 min-w-0 overflow-hidden relative mask-fade-edges">
            <div className="whitespace-nowrap">
              {trackInfo.title.length + trackInfo.artist.length > 25 ? (
                <div className="animate-marquee inline-block">
                  <span className="text-[10px] font-medium text-text-main pr-6">
                    <span className="text-text-muted">{trackInfo.artist}</span> • {trackInfo.title}
                  </span>
                  <span className="text-[10px] font-medium text-text-main pr-6">
                    <span className="text-text-muted">{trackInfo.artist}</span> • {trackInfo.title}
                  </span>
                </div>
              ) : (
                <p className="text-[10px] font-medium text-text-main truncate">
                  <span className="text-text-muted">{trackInfo.artist}</span> • {trackInfo.title}
                </p>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )

  if (!streamUrl) return null;

  return (
    <>
      <audio 
        ref={audioRef} 
        src={trackInfo.streamUrl} 
        preload="none"
        onEnded={() => setIsPlaying(false)}
      />
      {isMobile ? (
        <>
          {portalTarget ? createPortal(mobileToggleButton, portalTarget) : null}
          {mobileBanner}
        </>
      ) : (
        desktopWidget
      )}
    </>
  )
}
