'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Loader2, Plus, Trash2, Edit } from 'lucide-react'
import { toast } from 'sonner'

type Tag = {
  id: string
  name: string
}

export default function TagsPage() {
  const [tags, setTags] = useState<Tag[]>([])
  const [loading, setLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({ name: '' })
  const [editingId, setEditingId] = useState<string | null>(null)

  const supabase = createClient()

  const fetchTags = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('tags')
      .select('*')
      .order('name', { ascending: true })
    
    if (error) {
      console.error('Error fetching tags:', error)
    } else {
      setTags(data || [])
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchTags()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name.trim()) return

    // Normalisasi: Huruf kecil semua, hilangkan spasi ganda, dll
    const normalizedName = formData.name.trim().toLowerCase()

    setIsSubmitting(true)
    if (editingId) {
      // Update
      const { error } = await supabase
        .from('tags')
        .update({ name: normalizedName })
        .eq('id', editingId)
      
      if (error) toast.error('Gagal update tag — mungkin nama tag sudah ada')
      else toast.success('Tag berhasil diperbarui!')
    } else {
      // Insert
      const { error } = await supabase
        .from('tags')
        .insert([{ name: normalizedName }])
      
      if (error) toast.error('Gagal tambah tag — mungkin nama tag sudah ada')
      else toast.success('Tag berhasil ditambahkan!')
    }
    
    setFormData({ name: '' })
    setEditingId(null)
    setIsSubmitting(false)
    fetchTags()
  }

  const handleEdit = (t: Tag) => {
    setFormData({ name: t.name })
    setEditingId(t.id)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Yakin ingin menghapus tag ini? Semua foto yang menggunakan tag ini akan kehilangan tagnya.')) return
    
    const { error } = await supabase.from('tags').delete().eq('id', id)
    if (error) toast.error('Gagal hapus tag')
    else { toast.success('Tag berhasil dihapus!'); fetchTags() }
  }

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary-neutral" />
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h2 className="text-3xl font-heading font-bold tracking-tight text-text-main">Kelola Tags</h2>
        <p className="text-text-muted mt-2">Buat tag/label untuk mempermudah pencarian foto (misal: #sunset, #portrait).</p>
      </div>

      <div className="bg-surface border border-border/50 p-6 rounded-2xl shadow-sm">
        <h3 className="text-lg font-semibold mb-4 text-text-main">{editingId ? 'Edit Tag' : 'Tambah Tag Baru'}</h3>
        <form onSubmit={handleSubmit} className="flex gap-4 items-start">
          <div className="flex-1">
            <input 
              type="text" 
              value={formData.name}
              onChange={e => setFormData({ name: e.target.value })}
              className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-text-main focus:ring-2 focus:ring-primary-neutral focus:border-transparent transition-all outline-none"
              placeholder="Contoh: cinematic"
              required
            />
            <p className="text-[10px] text-text-muted mt-1.5">Tag akan otomatis diubah menjadi huruf kecil (lowercase).</p>
          </div>
          <div className="flex gap-2">
            {editingId && (
              <button 
                type="button" 
                onClick={() => { setEditingId(null); setFormData({ name: '' }) }}
                className="px-4 py-2.5 rounded-xl font-medium border border-border text-text-main hover:bg-background transition-colors"
              >
                Batal
              </button>
            )}
            <button 
              type="submit" 
              disabled={isSubmitting || !formData.name.trim()}
              className="px-6 py-2.5 rounded-xl font-medium bg-primary-neutral text-surface hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-2"
            >
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : (editingId ? <Edit className="w-4 h-4" /> : <Plus className="w-4 h-4" />)}
              {editingId ? 'Simpan' : 'Tambah'}
            </button>
          </div>
        </form>
      </div>

      <div className="bg-surface border border-border/50 rounded-2xl shadow-sm overflow-hidden p-6">
        {tags.length === 0 ? (
          <div className="text-center text-text-muted py-4">Belum ada tag yang dibuat.</div>
        ) : (
          <div className="flex flex-wrap gap-3">
            {tags.map(t => (
              <div key={t.id} className="group flex items-center gap-2 bg-background border border-border rounded-full pl-4 pr-1.5 py-1.5">
                <span className="text-sm font-medium text-text-main">#{t.name}</span>
                <div className="flex items-center">
                  <button 
                    onClick={() => handleEdit(t)} 
                    className="p-1.5 text-text-muted hover:text-blue-500 opacity-0 group-hover:opacity-100 transition-all"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </button>
                  <button 
                    onClick={() => handleDelete(t.id)} 
                    className="p-1.5 text-text-muted hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
