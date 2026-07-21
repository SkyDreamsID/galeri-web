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
  const isPlayingRef = useRef(false) // sensor real-time: cold start vs continuous
  
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
      isPlayingRef.current = false;
    } else {
      // Cache buster: paksa browser muat audio live baru, bukan cache lama
      const cacheBuster = (streamUrl as string).includes('?') ? `&cb=${Date.now()}` : `?cb=${Date.now()}`;
      audioRef.current.src = (streamUrl as string) + cacheBuster;
      audioRef.current.load();

      setIsPlaying(true);
      isPlayingRef.current = true;

      audioRef.current.play().catch(e => {
        if (e.name !== 'AbortError') {
          console.error("Play failed:", e);
          setIsPlaying(false);
          isPlayingRef.current = false;
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
    // Tambahkan cache buster (?cb=...) agar CDN Vercel/Cloudflare tidak menyimpan cache SSE lama
    const eventSource = new EventSource(`https://api.zeno.fm/mounts/metadata/subscribe/${zenoId}?cb=${Date.now()}`)

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

          // Dynamic Delay:
          // - Cold start (pertama kali play): delay 0ms → teks langsung keluar bareng audio
          // - Continuous (lagu ganti saat radio jalan): delay 12000ms → tunggu buffer audio HTML5
          const delay = isPlayingRef.current ? 12000 : 0;

          setTimeout(() => {
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
                  const largeImg = images.find((img: { size: string, '#text': string }) => img.size === 'large') || images[images.length - 1]
                  if (largeImg && largeImg['#text']) {
                    fetchedCover = largeImg['#text']
                  }
                }
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
          }, delay);
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
    setIsMounted(true)
    
    const getTargetId = () => {
      const isTablet = window.matchMedia('(min-width: 768px) and (max-width: 1023px)').matches
      return isTablet ? 'radio-portal-tablet' : 'radio-portal-mobile'
    }

    const checkPortal = () => {
      const isDesktop = window.matchMedia('(min-width: 1024px)').matches
      setIsMobile(!isDesktop)
      
      const targetNode = document.getElementById(getTargetId())
      setPortalTarget(prev => prev !== targetNode ? targetNode : prev)
      return targetNode
    }
    
    checkPortal()

    const observer = new MutationObserver(() => {
      const targetNode = document.getElementById(getTargetId())
      if (targetNode) {
        setPortalTarget(prev => prev !== targetNode ? targetNode : prev)
      } else {
        setPortalTarget(null)
      }
    })

    observer.observe(document.body, { childList: true, subtree: true })
    window.addEventListener('resize', checkPortal)
    
    return () => {
      observer.disconnect()
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
      className={`
        group hidden lg:flex fixed bottom-8 right-8
        text-white shadow-2xl items-center overflow-hidden pointer-events-auto cursor-pointer z-[9999] transition-all duration-300
      `}
      
      onClick={!isPlaying ? togglePlay : undefined}
      style={{ originX: 1 }}
    >
      {/* Background & Border Layer (Translucent on post page) */}
      <div 
        className={`absolute inset-0 bg-black/70 border border-white/20 backdrop-blur-xl transition-all duration-300 group-hover:bg-black/80 group-hover:border-white/40 ${
          isPostPage ? 'opacity-20 group-hover:opacity-100' : 'opacity-100'
        }`}
        style={{ borderRadius: 'inherit' }}
      />
      <AnimatePresence>
        {isPlaying && (
          <motion.div
            key="expanded-content"
            initial={{ opacity: 0, filter: "blur(4px)" }}
            animate={{ opacity: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, filter: "blur(4px)" }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="flex-1 min-w-0 h-full pl-3"
          >
            <div className={`relative flex items-center gap-3 h-full w-full transition-opacity duration-300 ${isPostPage ? 'opacity-20 group-hover:opacity-100' : 'opacity-100'}`}>
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
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div 
        className={`relative w-16 h-16 shrink-0 flex items-center justify-center ml-auto`}
        onClick={isPlaying ? togglePlay : undefined}
      >
        {isPlaying ? (
          <button className={`shrink-0 rounded-full flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-md w-11 h-11 bg-neutral-900 hover:bg-neutral-800 text-white border border-neutral-700`}>
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
