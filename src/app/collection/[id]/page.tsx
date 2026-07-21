'use client'

import React, { useEffect, useState, use, useRef, useCallback } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { getOptimizedImageUrl } from '@/lib/utils'
import { motion } from 'framer-motion'
import { Navbar } from '@/components/layout/Navbar'
import { ProgressiveImage } from '@/components/ui/ProgressiveImage'
import { ArrowLeft } from 'lucide-react'
import { useSiteSettings } from '@/contexts/SiteSettingsContext'

const LAYOUT_CONFIG = {
  maxWidth: "w-[95%] max-w-[3840px]",
  heroTitle: "text-3xl md:text-4xl lg:text-5xl",
  heroDesc: "text-sm md:text-base lg:text-lg",
  gridCols: "columns-2 lg:columns-3",
  gridGap: "gap-3 md:gap-6 space-y-3 md:space-y-6"
};

export default function CollectionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: collectionId } = use(params)
  const supabase = createClient()
  const [posts, setPosts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [collectionName, setCollectionName] = useState('')
  const [collectionDesc, setCollectionDesc] = useState('')
  
  const [page, setPage] = useState(0)
  const [hasMore, setHasMore] = useState(true)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const POSTS_PER_PAGE = 9
  const observerTarget = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const fetchCollectionInfo = async () => {
      const { data } = await supabase.from('collections').select('name, description').eq('id', collectionId).single()
      if (data) {
        setCollectionName(data.name)
        setCollectionDesc(data.description || `Kumpulan foto dalam album ${data.name}.`)
      }
    }
    fetchCollectionInfo()
  }, [collectionId])

  const fetchPosts = async (pageIndex = 0, isInitial = false) => {
    try {
      if (!isInitial) setIsLoadingMore(true)
      const from = pageIndex * POSTS_PER_PAGE
      const to = from + POSTS_PER_PAGE - 1

      const { data, error, count } = await supabase
        .from('posts')
        .select(`
          id, title, slug, location, created_at,
          collections (name),
          photos (image_url, is_cover, copyright_name, show_watermark)
        `, { count: 'exact' })
        .eq('status', 'Published')
        .eq('collection_id', collectionId)
        .order('created_at', { ascending: false })
        .range(from, to)

      if (error) throw error
      if (data) {
        if (isInitial) setPosts(data)
        else setPosts(prev => [...prev, ...data])
        
        if (count && from + data.length >= count) setHasMore(false)
        else if (data.length < POSTS_PER_PAGE) setHasMore(false)
      }
    } catch (err) {
      console.error('Failed to fetch posts:', err)
    } finally {
      setLoading(false)
      setIsLoadingMore(false)
    }
  }

  useEffect(() => {
    if (collectionId) fetchPosts(0, true)
  }, [collectionId])

  const loadMore = useCallback(() => {
    if (isLoadingMore) return
    const nextPage = page + 1
    setPage(nextPage)
    fetchPosts(nextPage, false)
  }, [page, isLoadingMore])

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && hasMore && !isLoadingMore) {
          loadMore()
        }
      },
      { threshold: 0.1 }
    )

    if (observerTarget.current) {
      observer.observe(observerTarget.current)
    }

    return () => {
      if (observerTarget.current) observer.unobserve(observerTarget.current)
    }
  }, [hasMore, isLoadingMore, loadMore])

  return (
    <>
      <main className="container mx-auto px-6 py-12 md:py-20 mt-16 max-w-7xl min-h-screen">
        <div className="mb-10 md:mb-16">
          <Link href="/albums" className="inline-flex items-center gap-2 text-text-muted hover:text-primary-neutral transition-colors mb-6 text-sm font-medium">
            <ArrowLeft className="w-4 h-4" />
            Kembali ke Daftar Album
          </Link>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: "easeOut" }}
            className={`${LAYOUT_CONFIG.heroTitle} font-heading font-bold text-text-main tracking-tight mb-2 md:mb-4`}
          >
            📁 {collectionName || 'Memuat Koleksi...'}
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: "easeOut", delay: 0.1 }}
            className={`${LAYOUT_CONFIG.heroDesc} text-text-muted max-w-2xl font-sans leading-relaxed`}
          >
            {collectionDesc}
          </motion.p>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <span className="text-sm text-text-muted animate-pulse">Loading database assets...</span>
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-20 text-text-muted">
            Belum ada foto di koleksi ini.
          </div>
        ) : (
          <>
            <div className={`${LAYOUT_CONFIG.gridCols} ${LAYOUT_CONFIG.gridGap}`}>
              {posts.map((post: any) => {
                const coverPhoto = post.photos?.find((p: any) => p.is_cover) || post.photos?.[0]
                const rawCoverImage = coverPhoto?.image_url
                const copyrightName = coverPhoto?.copyright_name
                const showWatermark = coverPhoto?.show_watermark !== false
                const coverImage = rawCoverImage ? getOptimizedImageUrl(rawCoverImage, 800, copyrightName, showWatermark) : null
                
                return (
                  <motion.div 
                    key={post.id} 
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-50px" }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    className="block break-inside-avoid" 
                  >
                    <Link href={`/post/${post.slug || post.id}`} className="block group cursor-pointer relative overflow-hidden rounded-xl md:rounded-2xl bg-surface">
                      {coverImage ? (
                        <ProgressiveImage src={rawCoverImage} alt={post.title} watermarkText={copyrightName} enableWatermark={showWatermark} className="w-full h-auto object-cover group-hover:scale-110 transition-transform duration-700 ease-[cubic-bezier(0.25,0.46,0.45,0.94)]" />
                      ) : (
                        <div className="w-full aspect-[4/3] flex items-center justify-center bg-surface text-text-muted">No Photo</div>
                      )}
                      
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity duration-500"></div>
                      
                      <div className="absolute bottom-0 left-0 right-0 p-2.5 md:p-6 translate-y-0 opacity-100 lg:translate-y-8 lg:opacity-0 lg:group-hover:translate-y-0 lg:group-hover:opacity-100 transition-all duration-500 ease-out drop-shadow-md">
                        {/* 👇 UKURAN TEKS: JUDUL FOTO */}
                        <h3 className="font-heading text-[12px] leading-snug md:text-xl font-bold text-white mb-0.5 md:mb-1 translate-y-0 lg:translate-y-4 lg:group-hover:translate-y-0 transition-transform duration-500 delay-100 line-clamp-2">
                          {post.title}
                        </h3>
                        <div className="flex items-center justify-between translate-y-0 lg:translate-y-4 lg:group-hover:translate-y-0 transition-transform duration-500 delay-150 gap-1">
                          {/* 👇 UKURAN TEKS: LOKASI */}
                          <p className="text-[9px] md:text-xs text-white/70 line-clamp-1">
                            {post.location || 'Unknown Location'}
                          </p>
                          {/* 👇 UKURAN TEKS: TANGGAL */}
                          <p className="text-[8px] md:text-[10px] text-white/60 font-medium whitespace-nowrap">
                            {new Date(post.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </p>
                        </div>
                        {post.photos && post.photos.length > 1 && (
                          <div className="flex items-center gap-1 md:gap-1.5 mt-1 md:mt-4 translate-y-0 lg:translate-y-4 lg:group-hover:translate-y-0 transition-transform duration-500 delay-200">
                            {post.photos.slice(0, 5).map((_: any, idx: number) => (
                              <div key={idx} className={`w-1 h-1 md:w-1.5 md:h-1.5 rounded-full ${idx === 0 ? 'bg-primary-neutral drop-shadow' : 'bg-primary-neutral/40'}`}></div>
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

            {hasMore && (
              <div ref={observerTarget} className="flex justify-center mt-6 md:mt-12 h-10">
                <div className="flex items-center justify-center gap-3 text-text-muted text-sm font-medium">
                  {isLoadingMore ? (
                    <>
                      <div className="w-5 h-5 border-2 border-primary-neutral border-t-transparent rounded-full animate-spin"></div>
                      Memuat Foto...
                    </>
                  ) : (
                    'Scroll ke bawah untuk memuat lebih banyak'
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </>
  )
}
