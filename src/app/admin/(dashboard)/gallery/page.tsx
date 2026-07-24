'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Loader2, MapPin, Calendar, Trash2, Pencil, Eye, DownloadCloud, Search, Share2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import Link from 'next/link'
import { toast } from 'sonner'

type Post = {
  id: string
  title: string
  location: string | null
  created_at: string
  views: number
  downloads: number
  shares: number
  status: string
  collections: { name: string } | null
  photos: { image_url: string }[]
  post_tags?: { tags: { name: string } }[]
}

const POSTS_PER_PAGE = 12

export default function GalleryManagement() {
  const supabase = createClient()
  const [posts, setPosts] = useState<Post[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(0)
  const [hasMore, setHasMore] = useState(true)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const observerTarget = useRef<HTMLDivElement>(null)

  const fetchPostsBatch = useCallback(async (pageIndex: number, isInitial = false) => {
    if (!isInitial && (isLoadingMore || !hasMore)) return
    if (isInitial) setLoading(true)
    else setIsLoadingMore(true)

    try {
      const from = pageIndex * POSTS_PER_PAGE
      const to = from + POSTS_PER_PAGE - 1

      const { data, error, count } = await supabase
        .from('posts')
        .select(`
          id,
          title,
          location,
          created_at,
          views,
          downloads,
          shares,
          status,
          collections (name),
          photos (image_url),
          post_tags ( tags (name) )
        `, { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(from, to)

      if (error) throw error
      if (data) {
        if (isInitial) {
          setPosts(data as any)
        } else {
          setPosts(prev => {
            const existingIds = new Set(prev.map(p => p.id))
            const newItems = (data as any[]).filter(p => !existingIds.has(p.id))
            return [...prev, ...newItems]
          })
        }
        const totalFetched = (pageIndex + 1) * POSTS_PER_PAGE
        if (!count || totalFetched >= count || data.length < POSTS_PER_PAGE) {
          setHasMore(false)
        }
      }
      setPage(pageIndex + 1)
    } catch (err) {
      console.error('Fetch posts failed:', err)
    } finally {
      setLoading(false)
      setIsLoadingMore(false)
    }
  }, [supabase, isLoadingMore, hasMore])

  useEffect(() => {
    fetchPostsBatch(0, true)
  }, [])

  useEffect(() => {
    const el = observerTarget.current
    if (!el || !hasMore || isLoadingMore || loading) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoadingMore) {
          fetchPostsBatch(page)
        }
      },
      { threshold: 0.1 }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [observerTarget, hasMore, isLoadingMore, loading, page, fetchPostsBatch])

  const handleDelete = async (postId: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus momen ini beserta seluruh fotonya secara permanen dari Cloudinary & Database?')) return

    setDeletingId(postId)
    try {
      const res = await fetch('/api/post/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId })
      })
      const data = await res.json()

      if (!res.ok) throw new Error(data.error || 'Failed to delete')

      toast.success('Momen berhasil dihapus!')
      setPosts((prev) => prev.filter((post) => post.id !== postId))
    } catch (err: any) {
      console.error(err)
      toast.error(`Gagal menghapus: ${err.message}`)
    } finally {
      setDeletingId(null)
    }
  }

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    )
  }

  const filteredPosts = posts.filter(post => {
    if (!searchTerm) return true
    const term = searchTerm.toLowerCase()
    if (post.title.toLowerCase().includes(term)) return true
    const dateStr = new Date(post.created_at).toLocaleDateString('id-ID', {
      day: 'numeric', month: 'long', year: 'numeric'
    }).toLowerCase()
    if (dateStr.includes(term)) return true
    if (post.post_tags?.some((pt: any) => pt.tags?.name?.toLowerCase().includes(term))) return true
    if (post.collections?.name?.toLowerCase().includes(term)) return true
    return false
  })

  return (
    <div className="flex flex-col pb-20 md:pb-12">
      {/* STICKY HEADER & SEARCH BAR - FULL WIDTH, ALIGNED WITH SIDEBAR HEADER */}
      <div className="sticky top-0 z-20 bg-background/80 backdrop-blur-xl border-b border-border/40 shadow-sm -mx-4 md:-mx-8 -mt-4 md:-mt-8 mb-6 md:mb-8 px-4 md:px-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4 min-h-[66px] md:min-h-[108px] py-3 md:py-5">
          <div>
            <h2 className="text-lg md:text-xl font-heading font-bold tracking-tight text-text-main leading-tight">Kelola Galeri</h2>
            <p className="text-[10px] md:text-xs text-text-muted mt-0.5 font-sans">Daftar momen yang telah dipublikasikan di galeri Anda</p>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted/50 w-4 h-4" />
            <Input 
              type="text" 
              placeholder="Cari judul, tag, atau tanggal..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 bg-surface/60 backdrop-blur-md border-border/50 text-text-main focus:border-primary-neutral h-9 md:h-10 w-full text-xs md:text-sm"
            />
          </div>
        </div>
      </div>
      <div className="max-w-6xl mx-auto w-full space-y-6">

      {posts.length === 0 ? (
        <Card className="bg-surface border-border/40 p-8 text-center text-text-muted shadow-sm">
          Belum ada momen yang diunggah. Silakan upload momen baru terlebih dahulu
        </Card>
      ) : filteredPosts.length === 0 ? (
        <Card className="bg-surface border-border/40 p-8 text-center text-text-muted shadow-sm">
          Pencarian untuk "{searchTerm}" tidak ditemukan
        </Card>
      ) : (
        <>
          {/* ===== MOBILE GRID START ===== */}
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-1.5 md:gap-5">
          {filteredPosts.map((post) => {
            const rawImage = post.photos?.[0]?.image_url;
            // Optimasi Penggunaan kuota internet
            const coverImage = rawImage ? rawImage.replace('/upload/', '/upload/c_fill,w_400,q_auto,f_auto/') : null;
            return (
              <Card key={post.id} className="bg-surface border-border/40 overflow-hidden flex flex-col shadow-sm">
                <div className="h-28 md:h-48 w-full relative bg-background">
                  {coverImage ? (
                    <img 
                      src={coverImage} 
                      alt={post.title} 
                      loading="lazy"
                      decoding="async"
                      className="absolute inset-0 w-full h-full object-cover" 
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-text-muted/50 text-[10px] md:text-xs">
                      Tidak ada foto
                    </div>
                  )}
                  {post.collections?.name && (
                    <span className="absolute top-1.5 md:top-2 left-1.5 md:left-2 bg-primary-neutral/90 text-surface text-[9px] md:text-xs px-1.5 md:px-2.5 py-0.5 md:py-1 rounded md:rounded-md font-semibold shadow-sm truncate max-w-[80%]">
                      📁 {post.collections.name}
                    </span>
                  )}
                  <span className={`absolute top-1.5 md:top-2 right-1.5 md:right-2 text-[8px] md:text-[10px] uppercase font-bold tracking-wider px-1.5 md:px-2 py-0.5 md:py-1 rounded md:rounded-md shadow-sm backdrop-blur-md border ${
                    post.status === 'Published' 
                      ? 'bg-black/60 text-white border-white/20'
                      : 'bg-red-500/80 text-white border-red-500/20'
                  }`}>
                    {post.status === 'Published' ? '🌍 Publik' : '🔒 Pribadi'}
                  </span>
                </div>

                <CardHeader className="p-2.5 md:p-4 flex-1">
                  <CardTitle className="text-text-main text-sm md:text-lg font-bold font-heading truncate">{post.title}</CardTitle>
                  <div className="flex flex-col gap-1 md:gap-1.5 text-text-muted text-[10px] md:text-xs mt-1 md:mt-2 font-sans">
                    {post.location && (
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 md:w-3.5 md:h-3.5 text-text-muted/80 shrink-0" />
                        <span className="truncate">{post.location}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 md:w-3.5 md:h-3.5 text-text-muted/80 shrink-0" />
                      <span className="truncate">
                        {new Date(post.created_at).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </span>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="p-2.5 md:p-4 pt-0 border-t border-border/20 bg-background/30 flex flex-col xl:flex-row justify-between items-start xl:items-center mt-auto gap-2 xl:gap-0">
                  <div className="flex items-center gap-2 md:gap-3">
                    <span className="text-[10px] md:text-xs text-text-muted font-medium">
                      {post.photos?.length || 0} Foto
                    </span>
                    <span className="text-[10px] md:text-xs text-text-muted font-medium flex items-center gap-0.5 md:gap-1">
                      <Eye className="w-3 h-3 md:w-3.5 md:h-3.5" /> {post.views || 0}
                    </span>
                    <span className="text-[10px] md:text-xs text-text-muted font-medium flex items-center gap-0.5 md:gap-1">
                      <DownloadCloud className="w-3 h-3 md:w-3.5 md:h-3.5" /> {post.downloads || 0}
                    </span>
                    <span className="text-[10px] md:text-xs text-text-muted font-medium flex items-center gap-0.5 md:gap-1" title="Total Share">
                      <Share2 className="w-3 h-3 md:w-3.5 md:h-3.5" /> {post.shares || 0}
                    </span>
                  </div>
                  <div className="flex gap-1.5 md:gap-2 w-full xl:w-auto">
                    <Link href={`/admin/edit/${post.id}`} className="flex-1 xl:flex-none">
                      <Button 
                        variant="outline"
                        size="sm"
                        className="w-full h-7 md:h-8 px-2 md:px-3 text-[10px] md:text-xs bg-background hover:bg-surface text-text-main border-border/50 transition-colors"
                      >
                        <Pencil className="w-3 h-3 mr-1 md:w-3.5 md:h-3.5 md:mr-1.5" />
                        Edit
                      </Button>
                    </Link>
                    <Button 
                      variant="destructive"
                      size="sm"
                      disabled={deletingId === post.id}
                      onClick={() => handleDelete(post.id)}
                      className="flex-1 xl:flex-none h-7 md:h-8 px-2 md:px-3 text-[10px] md:text-xs bg-red-500/90 hover:bg-red-500 text-white transition-colors"
                    >
                      {deletingId === post.id ? (
                        <Loader2 className="w-3 h-3 md:w-4 md:h-4 animate-spin" />
                      ) : (
                        <>
                          <Trash2 className="w-3 h-3 mr-1 md:w-4 md:h-4 md:mr-1.5" />
                          Hapus
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
          </div>
          {/* Target untuk Infinite Scroll */}
          <div ref={observerTarget} className="h-4 w-full" />

          {/* Loading Indicator saat menarik batch berikutnya */}
          {isLoadingMore && (
            <div className="flex items-center justify-center py-6 gap-2 text-text-muted text-xs font-medium">
              <Loader2 className="w-4 h-4 animate-spin text-primary-neutral" />
              <span>Memuat momen berikutnya...</span>
            </div>
          )}
          {/* ===== MOBILE GRID END ===== */}
        </>
      )}
      </div>
    </div>
  )
}
