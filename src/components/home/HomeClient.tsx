'use client'

import React, { useState, useCallback, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import { getOptimizedImageUrl } from '@/lib/utils'
import { ProgressiveImage } from '@/components/ui/ProgressiveImage'

// =========================================================================
// 🛠️ PAPAN KONTROL UKURAN (Tinggal ganti di sini biar gampang utak-atik)
// =========================================================================
const LAYOUT_CONFIG = {
  maxWidth: "container max-w-7xl px-6",
  heroTitle: "text-3xl md:text-5xl lg:text-6xl max-lg:landscape:text-3xl",
  heroDesc: "text-sm md:text-base lg:text-lg max-lg:landscape:text-sm",
  gridCols: "columns-1 sm:columns-2 lg:columns-3",
  gridGap: "gap-4 md:gap-6 space-y-4 md:space-y-6"
}

const POSTS_PER_PAGE = 9

type Post = {
  id: string
  title: string
  slug: string
  location: string | null
  created_at: string
  collections: { name: string } | null
  photos: { image_url: string; is_cover: boolean }[]
}

type Filter = { id: string; name: string }

export function HomeClient({
  initialPosts,
  initialHasMore,
  tags,
  collections,
  heroTitle,
  heroDesc,
}: {
  initialPosts: Post[]
  initialHasMore: boolean
  tags: Filter[]
  collections: Filter[]
  heroTitle: string
  heroDesc: string
}) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const currentSort = searchParams.get('sort') || 'newest'

  const supabase = createClient()
  const [posts, setPosts] = useState<Post[]>(initialPosts)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(initialHasMore)
  const [isLoadingMore, setIsLoadingMore] = useState(false)

  // Sinkronisasi dengan initialPosts dari server ketika URL / sort berubah
  useEffect(() => {
    setPosts(initialPosts)
    setPage(1)
    setHasMore(initialHasMore)
  }, [initialPosts, initialHasMore])

  const handleSortChange = (val: string, e: React.MouseEvent) => {
    router.push(`/?sort=${val}`)
    const details = (e.target as Element).closest('details')
    if (details) details.removeAttribute('open')
  }

  const sortOptions = [
    { value: 'newest', label: 'Terbaru' },
    { value: 'oldest', label: 'Terlama' },
    { value: 'az', label: 'Nama (A-Z)' },
    { value: 'za', label: 'Nama (Z-A)' },
  ]
  const currentSortLabel = sortOptions.find(o => o.value === (currentSort || 'newest'))?.label || 'Terbaru'

  const loadMore = useCallback(async () => {
    setIsLoadingMore(true)
    try {
      const from = page * POSTS_PER_PAGE
      const to = from + POSTS_PER_PAGE - 1

      let orderColumn = 'created_at'
      let isAscending = false
      if (currentSort === 'oldest') {
        orderColumn = 'created_at'
        isAscending = true
      } else if (currentSort === 'az') {
        orderColumn = 'title'
        isAscending = true
      } else if (currentSort === 'za') {
        orderColumn = 'title'
        isAscending = false
      }

      const { data, error, count } = await supabase
        .from('posts')
        .select(`
          id, title, slug, location, created_at,
          collections (name),
          photos (image_url, is_cover)
        `, { count: 'exact' })
        .eq('status', 'Published')
        .order(orderColumn, { ascending: isAscending })
        .range(from, to)

      if (error) throw error
      if (data) {
        setPosts(prev => [...prev, ...data as unknown as Post[]])
        const totalFetched = (page + 1) * POSTS_PER_PAGE
        if (!count || totalFetched >= count || data.length < POSTS_PER_PAGE) {
          setHasMore(false)
        }
      }
      setPage(p => p + 1)
    } catch (err) {
      console.error('Failed to load more posts:', err)
    } finally {
      setIsLoadingMore(false)
    }
  }, [page, supabase])

  return (
    <div className="bg-background text-text-main min-h-screen">
      <motion.main 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        transition={{ duration: 0.8, ease: "easeOut" }}
        className={`mx-auto ${LAYOUT_CONFIG.maxWidth} py-8 md:py-20 max-lg:landscape:py-6`}
      >

        {/* Hero Section */}
        <div className="mb-8 md:mb-20 max-lg:landscape:mb-6 max-w-3xl">
          <motion.h1
            initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className={`${LAYOUT_CONFIG.heroTitle} font-heading font-extrabold text-text-main tracking-tighter mb-4 leading-tight`}
          >
            {heroTitle}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className={`${LAYOUT_CONFIG.heroDesc} text-text-muted font-sans leading-relaxed`}
          >
            {heroDesc}
          </motion.p>
        </div>

        {/* Filter Pills & Sort */}
        <div className="mb-8 md:mb-12 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3 overflow-x-auto pb-4 md:pb-0 scrollbar-hide snap-x flex-1">
            <Link
              href="/"
              className="shrink-0 snap-start px-4 py-1.5 rounded-full bg-text-main text-background hover:opacity-90 transition-opacity text-sm font-semibold whitespace-nowrap shadow-sm"
            >
              Semua Foto
            </Link>

            {tags.map(t => (
              <Link
                key={`tag-${t.id}`}
                href={`/tag/${t.name}`}
                className="shrink-0 snap-start px-4 py-1.5 rounded-full bg-surface/50 border border-border/20 text-text-main hover:bg-surface/80 hover:border-border/40 transition-all duration-300 text-sm font-medium whitespace-nowrap backdrop-blur-sm"
              >
                #{t.name}
              </Link>
            ))}
          </div>

          <div className="shrink-0 self-start md:self-auto">
            <details className="relative group">
              <summary className="flex items-center gap-2 bg-surface border border-border/50 text-text-main text-sm font-medium rounded-full px-4 py-2 cursor-pointer hover:bg-surface/80 hover:border-border transition-colors list-none [&::-webkit-details-marker]:hidden select-none">
                {currentSortLabel}
                <svg className="w-4 h-4 text-text-muted group-open:rotate-180 transition-transform duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
              </summary>
              <div className="absolute left-0 md:left-auto md:right-0 mt-2 w-48 rounded-2xl border border-border bg-surface/90 backdrop-blur-xl p-2 shadow-2xl animate-in fade-in zoom-in-95 duration-200 z-50">
                <div className="space-y-1">
                  {sortOptions.map(opt => (
                    <button
                      key={opt.value}
                      onClick={(e) => handleSortChange(opt.value, e)}
                      className={`w-full text-left px-3 py-2 text-sm rounded-xl transition-all cursor-pointer select-none ${
                        currentSort === opt.value 
                          ? 'bg-text-main text-background font-bold shadow-sm' 
                          : 'text-text-main hover:bg-surface-hover hover:text-text-main'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            </details>
          </div>
        </div>

        {/* Masonry Grid */}
        <div className={`${LAYOUT_CONFIG.gridCols} ${LAYOUT_CONFIG.gridGap}`}>
          {posts.map((post) => {
            const rawCoverImage = post.photos?.find((p) => p.is_cover)?.image_url || post.photos?.[0]?.image_url
            const coverImage = rawCoverImage ? getOptimizedImageUrl(rawCoverImage, 800) : null

            return (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="block break-inside-avoid"
              >
                <Link
                  href={`/post/${post.slug || post.id}`}
                  className="block group cursor-pointer relative overflow-hidden rounded-none md:rounded-2xl bg-surface"
                >
                  {coverImage ? (
                    <ProgressiveImage
                      src={rawCoverImage!}
                      alt={post.title}
                      className="w-full h-auto object-cover group-hover:scale-110 transition-transform duration-700 ease-[cubic-bezier(0.25,0.46,0.45,0.94)]"
                    />
                  ) : (
                    <div className="w-full aspect-[4/3] flex items-center justify-center bg-surface text-text-muted">
                      No Photo
                    </div>
                  )}

                  {/* Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-background/95 via-background/40 to-transparent opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity duration-500 lg:backdrop-blur-[2px]"></div>

                  {/* Info */}
                  <div className="absolute bottom-0 left-0 right-0 p-3 md:p-6 translate-y-0 opacity-100 lg:translate-y-8 lg:opacity-0 lg:group-hover:translate-y-0 lg:group-hover:opacity-100 transition-all duration-500 ease-out">
                    <div className="text-[8px] md:text-[10px] font-bold uppercase tracking-widest text-primary-neutral mb-1 md:mb-2 translate-y-0 lg:translate-y-4 lg:group-hover:translate-y-0 transition-transform duration-500 delay-75">
                      {post.collections?.name || 'Uncategorized'}
                    </div>
                    <h3 className="font-heading text-sm md:text-xl font-bold text-text-main mb-1 translate-y-0 lg:translate-y-4 lg:group-hover:translate-y-0 transition-transform duration-500 delay-100 line-clamp-2">
                      {post.title}
                    </h3>
                    <div className="flex items-center justify-between translate-y-0 lg:translate-y-4 lg:group-hover:translate-y-0 transition-transform duration-500 delay-150">
                      <p className="text-[9px] md:text-xs text-text-muted line-clamp-1">
                        {post.location || 'Unknown Location'}
                      </p>
                      <p className="text-[8px] md:text-[10px] text-text-muted/70 font-medium">
                        {new Date(post.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                    </div>

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

        {/* Load More */}
        {hasMore && (
          <div className="flex justify-center mt-12 mb-8">
            <button
              onClick={loadMore}
              disabled={isLoadingMore}
              className="px-6 py-3 rounded-full bg-surface border border-border text-text-main text-sm font-bold tracking-wide hover:bg-surface/80 hover:border-primary-neutral/50 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            >
              {isLoadingMore ? 'Memuat Foto...' : 'Muat Lebih Banyak'}
            </button>
          </div>
        )}

      </motion.main>
    </div>
  )
}
