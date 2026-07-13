'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Loader2, MapPin, Calendar, Trash2, Pencil } from 'lucide-react'
import Link from 'next/link'

type Post = {
  id: string
  title: string
  location: string | null
  created_at: string
  collections: { name: string } | null
  photos: { image_url: string }[]
}

export default function GalleryManagement() {
  const supabase = createClient()
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const fetchPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('posts')
        .select(`
          id,
          title,
          location,
          created_at,
          collections (name),
          photos (image_url)
        `)
        .order('created_at', { ascending: false })

      if (error) throw error
      setPosts(data as any)
    } catch (err) {
      console.error('Fetch posts failed:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPosts()
  }, [])

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

      alert('Momen berhasil dihapus!')
      setPosts((prev) => prev.filter((post) => post.id !== postId))
    } catch (err: any) {
      console.error(err)
      alert(`Gagal menghapus: ${err.message}`)
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

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-20 md:pb-12">
      <div>
        <h2 className="text-3xl font-heading font-bold tracking-tight text-text-main">Kelola Galeri</h2>
        <p className="text-text-muted mt-1 font-sans">Daftar momen yang telah dipublikasikan di galeri Anda.</p>
      </div>

      {posts.length === 0 ? (
        <Card className="bg-surface border-border/40 p-8 text-center text-text-muted shadow-sm">
          Belum ada momen yang diunggah. Silakan upload momen baru terlebih dahulu.
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post) => {
            const coverImage = post.photos?.[0]?.image_url
            return (
              <Card key={post.id} className="bg-surface border-border/40 overflow-hidden flex flex-col shadow-sm">
                <div className="h-48 w-full relative bg-background">
                  {coverImage ? (
                    <img 
                      src={coverImage} 
                      alt={post.title} 
                      className="absolute inset-0 w-full h-full object-cover" 
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-text-muted/50 text-xs">
                      Tidak ada foto
                    </div>
                  )}
                  {post.collections?.name && (
                    <span className="absolute top-2 left-2 bg-primary-neutral/90 text-surface text-xs px-2.5 py-1 rounded-md font-semibold shadow-sm">
                      📁 {post.collections.name}
                    </span>
                  )}
                </div>

                <CardHeader className="p-4 flex-1">
                  <CardTitle className="text-text-main text-lg font-bold font-heading truncate">{post.title}</CardTitle>
                  <div className="flex flex-col gap-1.5 text-text-muted text-xs mt-2 font-sans">
                    {post.location && (
                      <div className="flex items-center gap-1">
                        <MapPin size={14} className="text-text-muted/80" />
                        <span>{post.location}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1">
                      <Calendar size={14} className="text-text-muted/80" />
                      <span>
                        {new Date(post.created_at).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric'
                        })}
                      </span>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="p-4 pt-0 border-t border-border/20 bg-background/30 flex justify-between items-center mt-auto">
                  <span className="text-xs text-text-muted font-medium">
                    {post.photos?.length || 0} Foto
                  </span>
                  <div className="flex gap-2">
                    <Link href={`/admin/edit/${post.id}`}>
                      <Button 
                        variant="outline"
                        size="sm"
                        className="bg-background hover:bg-surface text-text-main border-border/50 transition-colors"
                      >
                        <Pencil size={15} className="mr-1.5" />
                        Edit
                      </Button>
                    </Link>
                    <Button 
                      variant="destructive"
                      size="sm"
                      disabled={deletingId === post.id}
                      onClick={() => handleDelete(post.id)}
                      className="bg-red-500/90 hover:bg-red-500 text-white transition-colors"
                    >
                      {deletingId === post.id ? (
                        <Loader2 size={16} className="animate-spin" />
                      ) : (
                        <>
                          <Trash2 size={16} className="mr-1.5" />
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
      )}
    </div>
  )
}
