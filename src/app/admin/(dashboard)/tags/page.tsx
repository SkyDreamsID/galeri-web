'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Loader2, Plus, Trash2, Edit, AlertCircle } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
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
  const [deleteTarget, setDeleteTarget] = useState<{id: string, name: string} | null>(null)

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

  const executeDelete = async () => {
    if (!deleteTarget) return    
    const { error } = await supabase.from('tags').delete().eq('id', deleteTarget.id)
    if (error) toast.error('Gagal hapus tag')
    else { toast.success('Tag berhasil dihapus!'); fetchTags() }
    setDeleteTarget(null)
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
                    className="p-1.5 text-text-muted hover:text-blue-500 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-all"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </button>
                  <button 
                    onClick={() => setDeleteTarget({id: t.id, name: t.name})} 
                    className="p-1.5 text-text-muted hover:text-red-500 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-all"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* POPUP TAG */}
        {deleteTarget && (
          <div className="fixed inset-0 z-[9] flex items-center justify-center bg-background/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
            <Card className="w-full max-w-sm bg-surface border-border/50 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
              <CardContent className="p-6 text-center">
                <div className="w-14 h-14 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500 mx-auto mb-4">
                  <AlertCircle className="w-7 h-7" />
                </div>
                <h3 className="text-lg font-heading font-bold text-text-main mb-2 leading-tight">Yakin ingin menghapus tag "{deleteTarget.name}"?</h3>
                <p className="text-sm text-text-muted mb-6">Semua foto yang menggunakan tag ini akan kehilangan tagnya.</p>
                <div className="flex items-center gap-3">
                  <Button type="button" variant="outline" onClick={() => setDeleteTarget(null)} className="flex-1 bg-surface border border-border/50 text-text-main hover:bg-hover-bg">Batal</Button>
                  <Button type="button" onClick={executeDelete} className="flex-1 bg-red-500 hover:bg-red-600 text-white">Hapus</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
