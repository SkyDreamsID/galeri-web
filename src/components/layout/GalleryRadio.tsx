'use client'

import React, { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { Play, Pause, Music, Disc } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useSiteSettings } from '@/contexts/SiteSettingsContext'
import { usePathname } from 'next/navigation' // Ditambahkan untuk deteksi URL

export function GalleryRadio() {
  const settings = useSiteSettings()
  
  // Deteksi apakah sedang berada di halaman detail post
  const pathname = usePathname()
  const isPostPage = pathname?.startsWith('/post/')

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

  // Fungsi Toggle Play/Pause
  const togglePlay = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      // PERBAIKAN 1: Hapus Cache Buster dan gunakan .load()
      audioRef.current.src = streamUrl as string; 
      audioRef.current.load(); 

      setIsPlaying(true);

      audioRef.current.play().catch(e => {
        if (e.name !== 'AbortError') {
          console.error("Play failed:", e);
          setIsPlaying(false);
        }
      });
    }
  };

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

          // Perbaikan fungsi split agar tidak memicu error array
          const cleanArtist = newArtist.split(/ feat\.? | ft\.? /i)[0].split(',')[0].trim()
          const cleanTitle = newTitle

          // PERBAIKAN 2: Tampilkan judul dan artis secara real-time detik itu juga
          setTrackInfo(prev => ({
            ...prev,
            title: newTitle,
            artist: newArtist,
            coverUrl: ""
          }))

          const apiKey = "257a264bbac662d1b74762320ba4bcc1"
          fetch(`https://ws.audioscrobbler.com/2.0/?method=track.getInfo&api_key=${apiKey}&artist=${encodeURIComponent(cleanArtist)}&track=${encodeURIComponent(cleanTitle)}&format=json`)
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
              // Update gambar menyusul jika ditemukan
              if (fetchedCover) {
                setTrackInfo(prev => ({
                  ...prev,
                  coverUrl: fetchedCover
                }))
              }
            })
            .catch(err => {
              console.error("Gagal ambil cover Last.fm", err)
            })
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
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    const checkPortal = () => {
      const isTablet = window.matchMedia('(min-width: 768px) and (max-width: 1023px)').matches
      const isDesktop = window.matchMedia('(min-width: 1024px)').matches
      
      setIsMobile(!isDesktop)
      
      let targetId = isTablet ? 'radio-portal-tablet' : 'radio-portal-mobile'
      const targetNode = document.getElementById(targetId)
      
      setPortalTarget(prev => prev !== targetNode ? targetNode : prev)
      return targetNode
    }
    
    setIsMounted(true)
    checkPortal()

    let retryCount = 0
    const pollInterval = setInterval(() => {
      const found = checkPortal()
      retryCount++
      if (found || retryCount > 20) {
        clearInterval(pollInterval)
      }
    }, 150)
    
    window.addEventListener('resize', checkPortal)
    
    return () => {
      clearInterval(pollInterval)
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
        hidden lg:flex fixed bottom-8 right-8
        bg-black/70 border border-white/20 text-white shadow-2xl backdrop-blur-xl hover:bg-black/80 hover:border-white/40
        items-center overflow-hidden pointer-events-auto cursor-pointer z-[9999] transition-all duration-300
        ${isPostPage ? 'opacity-20 hover:opacity-100' : 'opacity-100'} 
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
      className={`real-radio-btn w-11 h-11 relative flex items-center justify-center rounded-xl transition-all border shadow-sm touch-manipulation z-10 overflow-hidden ${
        isPlaying 
          ? 'bg-surface text-primary-neutral border-primary-neutral/30' 
          : 'bg-surface/80 hover:bg-surface active:scale-90 text-text-main border-border/50'
      }`}
      title="Radio"
    >
      <Music size={18} className={isPlaying ? 'opacity-90' : ''} />
      {isPlaying && (
        <>
          <span className="absolute top-3 right-3 w-1.5 h-1.5 rounded-full bg-primary-neutral animate-ping" />
          <span className="absolute top-3 right-3 w-1.5 h-1.5 rounded-full bg-primary-neutral shadow-[0_0_6px_rgba(0,173,181,1)]" />
        </>
      )}
    </button>
  )

  // Banner Musik untuk Mobile
  const mobileBanner = (
    <AnimatePresence>
      {isPlaying && (
        <motion.div
          initial={{ 
            opacity: 0, 
            width: 44,
            height: 29,
            y: -20, 
            filter: "blur(5px)",
            borderRadius: 10
          }}
          animate={{ 
            opacity: 1, 
            width: 180,
            height: 29,
            y: 0, 
            filter: "blur(0px)",
            borderRadius: 10
          }}
          exit={{ 
            opacity: 0, 
            width: 44,
            height: 29,
            y: -20, 
            filter: "blur(5px)", 
            transition: { duration: 0.2, ease: "easeIn" } 
          }}
          transition={{ 
            type: "spring", 
            damping: 17, 
            stiffness: 250, 
            mass: 0.8 
          }}
          className="absolute top-[56px] -left-3 z-[9990] max-w-[220px] bg-surface/95 border border-border/50 shadow-lg rounded-[10px] flex items-center lg:hidden pointer-events-auto select-text backdrop-blur-md"
        >
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1, transition: { delay: 0.1 } }} 
            exit={{ opacity: 0, transition: { duration: 0.1 } }}
            className="absolute -top-[6px] left-[27px] w-3 h-3 bg-surface/95 border-t border-l border-border/50 transform rotate-45 z-[-1]"
          />
          <div className="flex items-center gap-3 w-full h-full px-2.5 py-1 overflow-hidden rounded-[10px] relative">
            <div className="w-5 h-5 shrink-0 rounded-[6px] overflow-hidden bg-background flex items-center justify-center shadow-sm border border-border/50 z-10">
              {trackInfo.coverUrl ? (
                <img src={trackInfo.coverUrl} alt="Cover" className="w-full h-full object-cover" />
              ) : (
                <Music className="w-3 h-3 text-text-muted" />
              )}
            </div>
            
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1, transition: { delay: 0.15 } }}
              exit={{ opacity: 0, transition: { duration: 0.1 } }}
              className="flex-1 min-w-0 overflow-hidden relative mask-fade-edges h-full flex flex-col justify-center"
            >
              <div className="whitespace-nowrap w-[125px] shrink-0">
                {trackInfo.title.length + trackInfo.artist.length > 20 ? (
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
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )

  if (!streamUrl || !isMounted) return null;

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
          {portalTarget ? createPortal(
            <>
              {mobileToggleButton}
              {mobileBanner}
            </>, 
            portalTarget
          ) : null}
        </>
      ) : (
        desktopWidget
      )}
    </>
  )
}
