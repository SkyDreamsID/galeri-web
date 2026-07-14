'use client'

import React, { useEffect, useState, use } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { getOptimizedImageUrl } from '@/lib/utils'
import { motion } from 'framer-motion'
import { PlaygroundNavbar } from '@/app/_components/PlaygroundNavbar'
import { ProgressiveImage } from '@/components/public/ProgressiveImage'
import { ArrowLeft } from 'lucide-react'

const LAYOUT_CONFIG = {
  maxWidth: "w-[95%] max-w-[3840px]",
  heroTitle: "text-3xl md:text-4xl lg:text-5xl",
  heroDesc: "text-sm md:text-base lg:text-lg",
  gridCols: "columns-2 lg:columns-3",
  gridGap: "gap-3 md:gap-6 space-y-3 md:space-y-6"
};

export default function TagPage({ params }: { params: Promise<{ name: string }> }) {
  const { name: rawTagName } = use(params)
  const tagName = decodeURIComponent(rawTagName)
  
  const supabase = createClient()
  const [posts, setPosts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  
  const [page, setPage] = useState(0)
  const [hasMore, setHasMore] = useState(true)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const POSTS_PER_PAGE = 9

  const fetchPosts = async (pageIndex = 0, isInitial = false) => {
    try {
      if (!isInitial) setIsLoadingMore(true)
      const from = pageIndex * POSTS_PER_PAGE
      const to = from + POSTS_PER_PAGE - 1

      // Relational filter: fetch posts that have this tag
      const { data, error, count } = await supabase
        .from('posts')
        .select(`
          id, title, slug, location,
          collections (name),
          photos (image_url, is_cover),
          post_tags!inner(
            tags!inner(name)
          )
        `, { count: 'exact' })
        .eq('status', 'Published')
        .eq('post_tags.tags.name', tagName)
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
      console.error('Failed to fetch posts by tag:', err)
    } finally {
      setLoading(false)
      setIsLoadingMore(false)
    }
  }

  useEffect(() => {
    if (tagName) fetchPosts(0, true)
  }, [tagName])

  return (
    <div className="bg-background text-text-main min-h-screen">
      <PlaygroundNavbar />

      <main className={`mx-auto ${LAYOUT_CONFIG.maxWidth} py-12 md:py-20`}>
        <div className="mb-10 md:mb-16">
          <Link href="/" className="inline-flex items-center gap-2 text-text-muted hover:text-primary-neutral transition-colors mb-6 text-sm font-medium">
            <ArrowLeft className="w-4 h-4" />
            Kembali ke Semua Foto
          </Link>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: "easeOut" }}
            className={`${LAYOUT_CONFIG.heroTitle} font-heading font-bold text-text-main tracking-tight mb-2 md:mb-4`}
          >
            #{tagName}
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: "easeOut", delay: 0.1 }}
            className={`${LAYOUT_CONFIG.heroDesc} text-text-muted max-w-2xl font-sans leading-relaxed`}
          >
            Kumpulan momen dengan tag {tagName}.
          </motion.p>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <span className="text-sm text-text-muted animate-pulse">Loading database assets...</span>
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-20 text-text-muted">
            Belum ada foto dengan tag ini.
          </div>
        ) : (
          <>
            <div className={`${LAYOUT_CONFIG.gridCols} ${LAYOUT_CONFIG.gridGap}`}>
              {posts.map((post: any) => {
                const rawCoverImage = post.photos?.find((p: any) => p.is_cover)?.image_url || post.photos?.[0]?.image_url
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
                    <Link href={`/post/${post.slug || post.id}`} className="block group cursor-pointer relative overflow-hidden rounded-none md:rounded-2xl bg-surface">
                      {coverImage ? (
                        <ProgressiveImage src={rawCoverImage} alt={post.title} className="w-full h-auto object-cover group-hover:scale-110 transition-transform duration-700 ease-[cubic-bezier(0.25,0.46,0.45,0.94)]" />
                      ) : (
                        <div className="w-full aspect-[4/3] flex items-center justify-center bg-surface text-text-muted">No Photo</div>
                      )}
                      
                      <div className="absolute inset-0 bg-gradient-to-t from-background/95 via-background/40 to-transparent opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity duration-500 lg:backdrop-blur-[2px]"></div>
                      
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
                      </div>
                    </Link>
                  </motion.div>
                )
              })}
            </div>

            {hasMore && (
              <div className="flex justify-center mt-12 mb-8">
                <button 
                  onClick={() => { const nextPage = page + 1; setPage(nextPage); fetchPosts(nextPage, false); }}
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
