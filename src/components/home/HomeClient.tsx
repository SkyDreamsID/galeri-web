'use client'

import React, { useState, useCallback } from 'react'
import Link from 'next/link'
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
  const supabase = createClient()
  const [posts, setPosts] = useState<Post[]>(initialPosts)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(initialHasMore)
  const [isLoadingMore, setIsLoadingMore] = useState(false)

  const loadMore = useCallback(async () => {
    setIsLoadingMore(true)
    try {
      const from = page * POSTS_PER_PAGE
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

        {/* Filter Pills */}
        <div className="mb-8 md:mb-12">
          <div className="flex items-center gap-3 overflow-x-auto pb-4 scrollbar-hide snap-x">
            <Link
              href="/"
              className="shrink-0 snap-start px-4 py-1.5 rounded-full bg-text-main text-background hover:opacity-90 transition-opacity text-sm font-semibold whitespace-nowrap shadow-sm"
            >
              Semua Foto
            </Link>

            {collections.map(c => (
              <Link
                key={`col-${c.id}`}
                href={`/collection/${c.id}`}
                className="shrink-0 snap-start px-4 py-1.5 rounded-full bg-surface/50 border border-border/20 text-text-main hover:bg-surface/80 hover:border-border/40 transition-all duration-300 text-sm font-medium whitespace-nowrap flex items-center gap-1.5 backdrop-blur-sm"
              >
                📁 {c.name}
              </Link>
            ))}

            {collections.length > 0 && tags.length > 0 && (
              <div className="shrink-0 w-px h-6 bg-border mx-2"></div>
            )}

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
                    <p className="text-[9px] md:text-xs text-text-muted translate-y-0 lg:translate-y-4 lg:group-hover:translate-y-0 transition-transform duration-500 delay-150 line-clamp-1">
                      {post.location || 'Unknown Location'}
                    </p>

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
