'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Play, Pause, Music, Disc } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export function GalleryRadio() {
  const [isPlaying, setIsPlaying] = useState(false)
  
  // State untuk data radio
  const [trackInfo, setTrackInfo] = useState({
    title: "Menunggu Last.fm API...",
    artist: "SkyDreamsID",
    coverUrl: "", 
    // 🔗 GANTI URL INI kalau lu mau ganti stasiun radio (Pastikan link stream langsung, bukan web player)
    streamUrl: "https://stream.zeno.fm/cnho9wgxkkovv" 
  })

  const audioRef = useRef<HTMLAudioElement | null>(null)

  // Fungsi Toggle Play/Pause
  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause()
      } else {
        // Trik Anti-Cache: Tambahin timestamp biar selalu live narik dari server, bukan memori browser
        audioRef.current.src = `https://stream.zeno.fm/cnho9wgxkkovv?nocache=${new Date().getTime()}`
        audioRef.current.load()
        audioRef.current.play().catch(e => console.error("Play failed:", e))
      }
      setIsPlaying(!isPlaying)
    }
  }

  // Effect untuk narik teks Real-time dari Zeno.fm
  useEffect(() => {
    // 🔗 GANTI URL INI sesuai ID radio Zeno lu kalau ganti stasiun
    const eventSource = new EventSource("https://api.zeno.fm/mounts/metadata/subscribe/cnho9wgxkkovv")

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

          // Fetch Cover Art dari Last.fm API
          // 🔑 API Key Last.fm lu, jangan sampai hilang!
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
  }, [])

  return (
    <>
      <audio 
        ref={audioRef} 
        src={trackInfo.streamUrl} 
        preload="none"
        onEnded={() => setIsPlaying(false)}
      />

      {/* ===================================================================================
          PENGATURAN POSISI WIDGET
          Ubah "bottom-24" (jarak bawah HP) dan "md:bottom-8" (jarak bawah laptop)
      =================================================================================== */}
      <div className="fixed bottom-24 right-4 md:bottom-8 md:right-8 z-50 flex items-center justify-end pointer-events-none">
        
        {/* ===================================================================================
            ANIMASI WIDGET MELAR (MORPHING)
        =================================================================================== */}
        <motion.div
          layout
          initial={false}
          animate={{
            // 📏 UKURAN WIDGET (Bisa lu ubah-ubah kalau kurang gede/kecil)
            width: isPlaying ? 340 : 64, // 340px pas kebuka, 64px pas ketutup (jadi buletan)
            height: isPlaying ? 80 : 64, // Tinggi 80px pas kebuka, 64px pas ketutup
            borderRadius: isPlaying ? 24 : 32, // Radius lekukan: 24 (rounded-2xl) pas kebuka, 32 (lingkaran penuh) pas ketutup
          }}
          // 🏃‍♀️ KECEPATAN ANIMASI (Ubah damping & stiffness) 
          // Makin tinggi stiffness makin cepet, makin tinggi damping makin gak mantul
          transition={{ type: "spring", damping: 22, stiffness: 200 }}
          
          // 🎨 WARNA TEMA WIDGET (Glassmorphism)
          // bg-black/70 = Warna dasar hitam transparan (70% opacity)
          // backdrop-blur-xl = Efek blur kaca di belakangnya
          // border-white/20 = Garis pinggir putih tipis transparan
          className="bg-black/70 backdrop-blur-xl border border-white/20 shadow-2xl flex items-center overflow-hidden pointer-events-auto cursor-pointer"
          
          onClick={!isPlaying ? togglePlay : undefined} // Pas wujud bulet, klik area mana aja bakal muter
          style={{ originX: 1 }} // Expand dari kanan ke kiri
        >
          <AnimatePresence>
            {isPlaying && (
              <motion.div
                key="expanded-content"
                // Animasi pas konten (Teks & Foto) muncul:
                // Masuknya dari blur(4px) jadi jelas blur(0px)
                initial={{ opacity: 0, filter: "blur(4px)" }}
                animate={{ opacity: 1, filter: "blur(0px)" }}
                exit={{ opacity: 0, filter: "blur(4px)" }}
                transition={{ duration: 0.3, delay: 0.1 }}
                className="flex items-center gap-3 pl-3 h-full flex-1 min-w-0"
              >
                {/* 🖼️ KOTAK FOTO / COVER ART */}
                <div className="relative w-14 h-14 shrink-0 rounded-xl overflow-hidden bg-black/40 border border-white/10 flex items-center justify-center shadow-inner">
                  {trackInfo.coverUrl ? (
                    <img 
                      src={trackInfo.coverUrl} 
                      alt="Cover Art" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <>
                      {/* Ikon kaset muter kalau gambar gagal dimuat */}
                      <Disc className="w-7 h-7 text-white/50 animate-spin duration-3000" />
                      {/* Indikator Titik Nyala (Ping) cuma muncul kalau ga ada cover */}
                      <div className="absolute inset-0 bg-black/20 flex items-center justify-center pointer-events-none">
                        <div className="w-2.5 h-2.5 rounded-full bg-primary-neutral animate-ping"></div>
                      </div>
                    </>
                  )}
                </div>

                {/* 📝 TEKS INFORMASI LAGU */}
                <div className="flex-1 min-w-0 flex flex-col justify-center">
                  <div className="overflow-hidden relative whitespace-nowrap mask-fade-edges w-full">
                    {/* =========================================================
                        PENGATURAN TEKS BERJALAN (MARQUEE)
                        Kalau judul kepanjangan (> 20 karakter), teks otomatis jalan
                    ========================================================= */}
                    {trackInfo.title.length > 20 ? (
                      <div className="animate-marquee">
                        {/* 
                          'pr-12' itu jarak spasi di ujung teks sebelum diulang. 
                          pr-12 = padding-right 3rem (~12 karakter kosong). 
                          Kalau rasanya kurang jauh jaraknya, naikin jadi pr-16 atau pr-20 
                        */}
                        <span className="text-base font-bold text-white pr-12">{trackInfo.title}</span>
                        <span className="text-base font-bold text-white pr-12">{trackInfo.title}</span>
                      </div>
                    ) : (
                      <p className="text-base font-bold text-white truncate">
                        {trackInfo.title}
                      </p>
                    )}
                  </div>
                  {/* Nama Artis */}
                  <p className="text-xs text-white/70 truncate mt-0.5 font-medium">
                    {trackInfo.artist}
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ===================================================================================
              AREA TOMBOL (Bagian Kanan yang selalu ada)
          =================================================================================== */}
          <div 
            className="w-16 h-16 shrink-0 flex items-center justify-center"
            onClick={isPlaying ? togglePlay : undefined} // Pas kebuka, klik area ini (Pause) buat nutup
          >
            {isPlaying ? (
              // ⏸️ Wujud Tombol Pause (Pas Widget Membesar)
              <button className="w-11 h-11 shrink-0 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center hover:scale-105 active:scale-95 transition-all backdrop-blur-sm shadow-md">
                <Pause className="w-5 h-5 fill-current" />
              </button>
            ) : (
              // 🎵 Wujud Ikon Musik (Pas Widget Mengecil)
              <motion.div
                initial={{ opacity: 0, rotate: -45 }}
                animate={{ opacity: 1, rotate: 0 }}
                exit={{ opacity: 0, rotate: 45 }}
                transition={{ duration: 0.2 }}
                className="text-white hover:scale-110 active:scale-95 transition-transform"
              >
                <Music className="w-7 h-7" />
              </motion.div>
            )}
          </div>

        </motion.div>
      </div>
    </>
  )
}
