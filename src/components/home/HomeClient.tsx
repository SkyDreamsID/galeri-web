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
  heroTitle: "text-4xl md:text-5xl lg:text-6xl",
  heroDesc: "text-sm md:text-base lg:text-lg",
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

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value
    router.push(`/?sort=${val}`)
  }

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
        className={`mx-auto ${LAYOUT_CONFIG.maxWidth} py-12 md:py-20`}
      >

        {/* Hero Section */}
        <div className="mb-12 md:mb-20 max-w-3xl">
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

          <div className="shrink-0">
            <select
              value={currentSort}
              onChange={handleSortChange}
              className="appearance-none bg-surface border border-border/50 text-text-main text-sm font-medium rounded-full px-4 py-2 pr-8 focus:outline-none focus:border-primary-neutral cursor-pointer hover:bg-surface/80 transition-colors"
              style={{ backgroundImage: 'url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23a1a1aa%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.7rem top 50%', backgroundSize: '0.65rem auto' }}
            >
              <option value="newest">Terbaru</option>
              <option value="oldest">Terlama</option>
              <option value="az">Nama (A-Z)</option>
              <option value="za">Nama (Z-A)</option>
            </select>
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
