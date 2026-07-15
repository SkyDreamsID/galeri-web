'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Loader2, Plus, Trash2, Edit, ImageIcon } from 'lucide-react'
import { toast } from 'sonner'
import { ManageCollectionPhotosModal } from '@/components/admin/ManageCollectionPhotosModal'

type Collection = {
  id: string
  name: string
  description: string | null
}

export default function CollectionsPage() {
  const [collections, setCollections] = useState<Collection[]>([])
  const [loading, setLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({ name: '', description: '' })
  const [editingId, setEditingId] = useState<string | null>(null)
  const [managingCollection, setManagingCollection] = useState<Collection | null>(null)

  const supabase = createClient()

  const fetchCollections = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('collections')
      .select('*')
      .order('name', { ascending: true })
    
    if (error) {
      console.error('Error fetching collections:', error)
    } else {
      setCollections(data || [])
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchCollections()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name.trim()) return

    setIsSubmitting(true)
    if (editingId) {
      // Update
      const { error } = await supabase
        .from('collections')
        .update({ name: formData.name, description: formData.description })
        .eq('id', editingId)
      
      if (error) toast.error('Gagal update koleksi')
      else toast.success('Koleksi berhasil diperbarui!')
    } else {
      // Insert
      const { error } = await supabase
        .from('collections')
        .insert([{ name: formData.name, description: formData.description }])
      
      if (error) toast.error('Gagal tambah koleksi')
      else toast.success('Koleksi berhasil ditambahkan!')
    }
    
    setFormData({ name: '', description: '' })
    setEditingId(null)
    setIsSubmitting(false)
    fetchCollections()
  }

  const handleEdit = (c: Collection) => {
    setFormData({ name: c.name, description: c.description || '' })
    setEditingId(c.id)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Yakin ingin menghapus koleksi ini? (Postingan dengan koleksi ini tidak akan terhapus, hanya kehilangan label koleksinya)')) return
    
    const { error } = await supabase.from('collections').delete().eq('id', id)
    if (error) toast.error('Gagal hapus koleksi')
    else { toast.success('Koleksi berhasil dihapus!'); fetchCollections() }
  }

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary-neutral" />
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h2 className="text-3xl font-heading font-bold tracking-tight text-text-main">Kelola Koleksi</h2>
        <p className="text-text-muted mt-2">Kelompokkan fotomu ke dalam album/koleksi tertentu (misal: Pernikahan, Pemandangan).</p>
      </div>

      <div className="bg-surface border border-border/50 p-6 rounded-2xl shadow-sm">
        <h3 className="text-lg font-semibold mb-4 text-text-main">{editingId ? 'Edit Koleksi' : 'Tambah Koleksi Baru'}</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-muted mb-1">Nama Koleksi <span className="text-red-500">*</span></label>
            <input 
              type="text" 
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-text-main focus:ring-2 focus:ring-primary-neutral focus:border-transparent transition-all outline-none"
              placeholder="Contoh: Prewedding Bali 2024"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-muted mb-1">Deskripsi Singkat</label>
            <textarea 
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-text-main focus:ring-2 focus:ring-primary-neutral focus:border-transparent transition-all outline-none resize-none h-24"
              placeholder="Opsional"
            />
          </div>
          <div className="flex justify-end gap-3">
            {editingId && (
              <button 
                type="button" 
                onClick={() => { setEditingId(null); setFormData({ name: '', description: '' }) }}
                className="px-6 py-2.5 rounded-xl font-medium border border-border text-text-main hover:bg-background transition-colors"
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
              {editingId ? 'Simpan Perubahan' : 'Tambah Koleksi'}
            </button>
          </div>
        </form>
      </div>

      <div className="bg-surface border border-border/50 rounded-2xl shadow-sm overflow-hidden">
        {collections.length === 0 ? (
          <div className="p-8 text-center text-text-muted">Belum ada koleksi yang dibuat.</div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-background/50 border-b border-border/50 text-text-muted text-sm uppercase tracking-wider">
                <th className="p-4 font-medium">Nama Koleksi</th>
                <th className="p-4 font-medium hidden md:table-cell">Deskripsi</th>
                <th className="p-4 font-medium w-32 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30">
              {collections.map(c => (
                <tr key={c.id} className="hover:bg-background/30 transition-colors">
                  <td className="p-4 font-medium text-text-main">{c.name}</td>
                  <td className="p-4 text-text-muted hidden md:table-cell truncate max-w-[200px]">{c.description || '-'}</td>
                  <td className="p-4 text-right space-x-2">
                    <button onClick={() => setManagingCollection(c)} className="p-2 bg-primary-neutral/10 text-primary-neutral hover:bg-primary-neutral/20 rounded-lg transition-colors" title="Kelola Foto">
                      <ImageIcon className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleEdit(c)} className="p-2 bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 rounded-lg transition-colors" title="Edit Koleksi">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(c.id)} className="p-2 bg-red-500/10 text-red-500 hover:bg-red-500/20 rounded-lg transition-colors" title="Hapus Koleksi">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {managingCollection && (
        <ManageCollectionPhotosModal
          collectionId={managingCollection.id}
          collectionName={managingCollection.name}
          onClose={() => setManagingCollection(null)}
        />
      )}
    </div>
  )
}
