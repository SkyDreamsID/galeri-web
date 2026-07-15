'use client'

import React, { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Loader2, X, Check, Search, Image as ImageIcon } from 'lucide-react'
import { toast } from 'sonner'
import { getOptimizedImageUrl } from '@/lib/utils'

interface ManageCollectionPhotosModalProps {
  collectionId: string
  collectionName: string
  onClose: () => void
}

type PostItem = {
  id: string
  title: string
  collection_id: string | null
  photos: { image_url: string; is_cover: boolean }[]
}

export function ManageCollectionPhotosModal({ collectionId, collectionName, onClose }: ManageCollectionPhotosModalProps) {
  const [posts, setPosts] = useState<PostItem[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  
  // State for tracking selected post IDs
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [initialSelectedIds, setInitialSelectedIds] = useState<Set<string>>(new Set())

  const supabase = createClient()

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true)
      const { data, error } = await supabase
        .from('posts')
        .select(`
          id, title, collection_id,
          photos (image_url, is_cover)
        `)
        .eq('status', 'Published')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching posts:', error)
        toast.error('Gagal memuat daftar foto')
      } else if (data) {
        setPosts(data as unknown as PostItem[])
        
        // Find which posts already belong to this collection
        const initialSelected = new Set<string>()
        data.forEach((post: any) => {
          if (post.collection_id === collectionId) {
            initialSelected.add(post.id)
          }
        })
        setInitialSelectedIds(initialSelected)
        setSelectedIds(new Set(initialSelected))
      }
      setLoading(false)
    }

    fetchPosts()
  }, [collectionId, supabase])

  const toggleSelection = (id: string) => {
    const newSelection = new Set(selectedIds)
    if (newSelection.has(id)) {
      newSelection.delete(id)
    } else {
      newSelection.add(id)
    }
    setSelectedIds(newSelection)
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      // Find what to add and what to remove
      const toAdd = Array.from(selectedIds).filter(id => !initialSelectedIds.has(id))
      const toRemove = Array.from(initialSelectedIds).filter(id => !selectedIds.has(id))

      const promises = []

      // Add to collection
      if (toAdd.length > 0) {
        promises.push(
          supabase.from('posts').update({ collection_id: collectionId }).in('id', toAdd)
        )
      }

      // Remove from collection
      if (toRemove.length > 0) {
        promises.push(
          supabase.from('posts').update({ collection_id: null }).in('id', toRemove)
        )
      }

      await Promise.all(promises)
      toast.success('Koleksi berhasil diperbarui!')
      onClose()
    } catch (err) {
      console.error('Error saving collection photos:', err)
      toast.error('Terjadi kesalahan saat menyimpan')
    } finally {
      setSaving(false)
    }
  }

  const filteredPosts = posts.filter(post => 
    post.title.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-background/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-surface w-full max-w-4xl h-[85vh] rounded-2xl shadow-2xl flex flex-col border border-border overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border/50 bg-background/50">
          <div>
            <h2 className="text-xl font-bold text-text-main">Kelola Foto: {collectionName}</h2>
            <p className="text-sm text-text-muted mt-1">Pilih foto yang ingin dimasukkan ke dalam koleksi ini.</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-background rounded-full transition-colors">
            <X className="w-5 h-5 text-text-muted" />
          </button>
        </div>

        {/* Toolbar */}
        <div className="p-4 border-b border-border/50 bg-surface flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <input 
              type="text"
              placeholder="Cari nama foto..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-background border border-border rounded-xl text-sm focus:outline-none focus:border-primary-neutral"
            />
          </div>
          <div className="text-sm font-medium text-text-muted">
            {selectedIds.size} dipilih
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-background/30">
          {loading ? (
            <div className="flex h-full items-center justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-primary-neutral" />
            </div>
          ) : filteredPosts.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-text-muted">
              <ImageIcon className="w-12 h-12 mb-2 opacity-20" />
              <p>Tidak ada foto yang ditemukan.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {filteredPosts.map(post => {
                const isSelected = selectedIds.has(post.id)
                const coverPhoto = post.photos?.find(p => p.is_cover)?.image_url || post.photos?.[0]?.image_url
                const displayUrl = coverPhoto ? getOptimizedImageUrl(coverPhoto, 300) : ''

                return (
                  <div 
                    key={post.id}
                    onClick={() => toggleSelection(post.id)}
                    className={`group relative aspect-square rounded-xl overflow-hidden cursor-pointer border-2 transition-all duration-200 ${
                      isSelected ? 'border-primary-neutral shadow-[0_0_15px_rgba(0,173,181,0.3)] scale-[0.98]' : 'border-transparent hover:border-border'
                    }`}
                  >
                    {displayUrl ? (
                      <img src={displayUrl} alt={post.title} className="w-full h-full object-cover bg-surface" />
                    ) : (
                      <div className="w-full h-full bg-surface flex items-center justify-center text-text-muted">No Image</div>
                    )}
                    
                    {/* Overlay Title */}
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-3 pt-8">
                      <p className="text-white text-xs font-medium truncate drop-shadow-md">{post.title}</p>
                    </div>

                    {/* Checkbox indicator */}
                    <div className={`absolute top-2 right-2 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                      isSelected ? 'bg-primary-neutral border-primary-neutral' : 'bg-black/20 border-white/70 group-hover:border-white'
                    }`}>
                      {isSelected && <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border/50 bg-surface flex justify-end gap-3">
          <button 
            onClick={onClose}
            className="px-5 py-2.5 text-sm font-medium border border-border rounded-xl hover:bg-background transition-colors"
          >
            Batal
          </button>
          <button 
            onClick={handleSave}
            disabled={saving}
            className="px-5 py-2.5 text-sm font-medium bg-primary-neutral text-surface rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-2"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
            Simpan Perubahan
          </button>
        </div>

      </div>
    </div>
  )
}
