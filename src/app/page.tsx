'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { Sun, Moon, Menu, X } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { getOptimizedImageUrl } from '@/lib/utils'
import { motion } from 'framer-motion'
import { PlaygroundNavbar } from './_components/PlaygroundNavbar'

// =========================================================================
// 🛠️ PAPAN KONTROL UKURAN (Tinggal ganti di sini biar gampang utak-atik)
// =========================================================================
const LAYOUT_CONFIG = {
  // Lebar maksimal konten layar (Pakai w-[95%] biar fleksibel, tapi dilimit max-w-[3840px] biar gak pecah di monitor sultan)
  maxWidth: "w-[95%] max-w-[3840px]",
  // Ukuran Judul Utama (HP: text-3xl, Tablet: text-4xl, Laptop: text-5xl)
  heroTitle: "text-3xl md:text-4xl lg:text-5xl",
  // Ukuran Teks Deskripsi (HP: text-sm, Tablet: text-base, Laptop: text-lg)
  heroDesc: "text-sm md:text-base lg:text-lg",
  // Kolom Grid Foto (HP: 2 kolom, Laptop: 3 kolom)
  gridCols: "columns-2 lg:columns-3",
  // Jarak antar foto di grid (HP: gap-3, Laptop: gap-6)
  gridGap: "gap-3 md:gap-6 space-y-3 md:space-y-6"
};

export default function PlaygroundPage() {
  const supabase = createClient()
  const [posts, setPosts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  
  // Pagination & Infinite Scroll States
  const [page, setPage] = useState(0)
  const [hasMore, setHasMore] = useState(true)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const POSTS_PER_PAGE = 9

  // Mode gelap dummy untuk ngetes toggle di playground
  const [isDark, setIsDark] = useState(false)
  // State untuk burger menu dropdown
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  // ==========================================
  // 🔄 FUNGSI TARIK DATA (PAGINATION / INFINITE SCROLL)
  // ==========================================
  // Fungsi ini narik data dari Supabase tapi dicicil (misal 9 foto per halaman).
  // Kalau isInitial = true, berarti baru pertama kali load.
  // Kalau isInitial = false, berarti dipanggil dari tombol "Muat Lebih Banyak".
  const fetchPosts = async (pageIndex = 0, isInitial = false) => {
    try {
      if (!isInitial) setIsLoadingMore(true)
      const from = pageIndex * POSTS_PER_PAGE
      const to = from + POSTS_PER_PAGE - 1

      const { data, error, count } = await supabase
        .from('posts')
        .select(`
          id, title, slug, location,
          collections (name),
          photos (image_url, is_cover)
        `, { count: 'exact' })
        .eq('status', 'Published')
        .order('created_at', { ascending: false })
        .range(from, to)

      if (error) throw error
      if (data) {
        if (isInitial) {
          setPosts(data)
        } else {
          setPosts(prev => [...prev, ...data])
        }
        
        if (count && from + data.length >= count) {
          setHasMore(false)
        } else if (data.length < POSTS_PER_PAGE) {
          setHasMore(false)
        }
      }
    } catch (err) {
      console.error('Playground failed to fetch posts:', err)
    } finally {
      setLoading(false)
      setIsLoadingMore(false)
    }
  }

  useEffect(() => {
    fetchPosts(0, true)
  }, [])

  const toggleDarkMode = () => {
    const newMode = !isDark;
    setIsDark(newMode);
    if (newMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  return (
    <div className="bg-background text-text-main min-h-screen">
      
      {/* --- KODE NAVBAR MENTAH --- */}
      <PlaygroundNavbar />

      <main className={`mx-auto ${LAYOUT_CONFIG.maxWidth} py-12 md:py-20`}>
        

        {/* --- STRUKTUR DEPAN (HERO SECTION) --- */}
        <div className="mb-10 md:mb-16">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: "easeOut" }}
            className={`${LAYOUT_CONFIG.heroTitle} font-heading font-bold text-text-main tracking-tight mb-2 md:mb-4`}
          >
            Jurnal Visual
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: "easeOut", delay: 0.1 }}
            className={`${LAYOUT_CONFIG.heroDesc} text-text-muted max-w-2xl font-sans leading-relaxed`}
          >
            Ruang untuk menyimpan momen, membagikan cerita dan mendokumentasikan perjalanan melalui fotografi.
          </motion.p>
        </div>

        {/* CSS Columns untuk gaya Masonry sederhana */}
        {loading ? (
          <div className="flex justify-center py-20">
            <span className="text-sm text-text-muted animate-pulse">Loading database assets...</span>
          </div>
        ) : (
          <>
            <div className={`${LAYOUT_CONFIG.gridCols} ${LAYOUT_CONFIG.gridGap}`}>
              {posts.map((post: any) => {
                const rawCoverImage = post.photos?.find((p: any) => p.is_cover)?.image_url || post.photos?.[0]?.image_url
                const coverImage = rawCoverImage ? getOptimizedImageUrl(rawCoverImage, 800) : null
                
                // motion.div dengan whileInView bikin foto nge-fade-in otomatis pas di-scroll
                return (
                  <motion.div 
                    key={post.id} 
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-50px" }} // margin -50px biar dia ke-trigger pas udah bener-bener masuk layar
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    className="block break-inside-avoid" 
                  >
                    <Link 
                      href={`/post/${post.slug || post.id}`} 
                      className="block group cursor-pointer relative overflow-hidden rounded-none md:rounded-2xl bg-surface"
                    >
                      {coverImage ? (
                        <img 
                          src={coverImage} 
                          alt={post.title} 
                          // group-hover:scale-110 = foto membesar pas container utamanya di-hover
                          className="w-full h-auto object-cover group-hover:scale-110 transition-transform duration-700 ease-[cubic-bezier(0.25,0.46,0.45,0.94)]"
                        />
                      ) : (
                        <div className="w-full aspect-[4/3] flex items-center justify-center bg-surface text-text-muted">
                          No Photo
                        </div>
                      )}
                      
                      {/* Overlay gradien kaca / Glassmorphism Backdrop Blur */}
                      {/* Di HP (default) selalu muncul opacity-100, di Laptop (lg) dia sembunyi opacity-0 dan baru muncul pas di-hover */}
                      <div className="absolute inset-0 bg-gradient-to-t from-background/95 via-background/40 to-transparent opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity duration-500 lg:backdrop-blur-[2px]"></div>
                      
                      {/* Info di dalam foto (Kategori, Judul, Lokasi) */}
                      {/* Sama kayak overlay, di HP selalu muncul (translate-y-0), di laptop sembunyi turun ke bawah (translate-y-8) */}
                      <div className="absolute bottom-0 left-0 right-0 p-3 md:p-6 translate-y-0 opacity-100 lg:translate-y-8 lg:opacity-0 lg:group-hover:translate-y-0 lg:group-hover:opacity-100 transition-all duration-500 ease-out">
                        
                        {/* Kategori (Delay 75ms) */}
                        <div className="text-[8px] md:text-[10px] font-bold uppercase tracking-widest text-primary-neutral mb-1 md:mb-2 translate-y-0 lg:translate-y-4 lg:group-hover:translate-y-0 transition-transform duration-500 delay-75">
                          {post.collections?.name || 'Uncategorized'}
                        </div>
                        
                        {/* Judul (Delay 100ms) */}
                        <h3 className="font-heading text-sm md:text-xl font-bold text-text-main mb-1 translate-y-0 lg:translate-y-4 lg:group-hover:translate-y-0 transition-transform duration-500 delay-100 line-clamp-2">
                          {post.title}
                        </h3>
                        
                        {/* Lokasi (Delay 150ms) */}
                        <p className="text-[9px] md:text-xs text-text-muted translate-y-0 lg:translate-y-4 lg:group-hover:translate-y-0 transition-transform duration-500 delay-150 line-clamp-1">
                          {post.location || 'Unknown Location'}
                        </p>

                        {/* Indikator Multiple Photos (Poin Bulat) - Khusus post yang fotonya > 1 */}
                        {post.photos && post.photos.length > 1 && (
                          <div className="flex items-center gap-1 md:gap-1.5 mt-2 md:mt-4 translate-y-0 lg:translate-y-4 lg:group-hover:translate-y-0 transition-transform duration-500 delay-200">
                            {post.photos.slice(0, 5).map((_: any, idx: number) => (
                              <div key={idx} className={`w-1 h-1 md:w-1.5 md:h-1.5 rounded-full ${idx === 0 ? 'bg-primary-neutral' : 'bg-primary-neutral/30'}`}></div>
                            ))}
                            {post.photos.length > 5 && (
                              <span className="text-[8px] md:text-[9px] text-text-muted font-bold ml-0.5">+{post.photos.length - 5}</span>
                            )}
                          </div>
                        )}
                      </div>
                    </Link>
                  </motion.div>
                )
              })}
            </div>

            {/* Tombol Load More */}
            {hasMore && (
              <div className="flex justify-center mt-12 mb-8">
                <button 
                  onClick={() => {
                    const nextPage = page + 1;
                    setPage(nextPage);
                    fetchPosts(nextPage, false);
                  }}
                  disabled={isLoadingMore}
                  className="px-6 py-3 rounded-full bg-surface border border-border text-text-main text-sm font-bold tracking-wide hover:bg-surface/80 hover:border-primary-neutral/50 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                >
                  {isLoadingMore ? 'Memuat Foto...' : 'Muat Lebih Banyak'}
                </button>
              </div>
            )}
          </>
        )}

      </main>
    </div>
  )
}
