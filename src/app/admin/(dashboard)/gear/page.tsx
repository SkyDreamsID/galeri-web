'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useSiteSettings } from '@/contexts/SiteSettingsContext'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Loader2, UploadCloud, X, Camera, Trash2, CheckCircle2, AlertCircle, Edit } from 'lucide-react'

type Gear = {
  id: string
  name: string
  type: string
  description?: string
  image_url?: string
  public_id?: string
  created_at: string
}

export default function GearManagement() {
  const supabase = createClient()
  const settings = useSiteSettings()
  const cloudName = settings?.cloudinary_cloud_name || process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
  
  const [gears, setGears] = useState<Gear[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isUploading, setIsUploading] = useState(false)
  const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' } | null>(null)
  
  // Form State
  const [name, setName] = useState('')
  const [type, setType] = useState('Kamera')
  const [description, setDescription] = useState('')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  
  const [editingGearId, setEditingGearId] = useState<string | null>(null)
  const [editingPublicId, setEditingPublicId] = useState<string | null>(null)

  useEffect(() => {
    fetchGears()
  }, [])

  // Auto hide toast
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000)
      return () => clearTimeout(timer)
    }
  }, [toast])

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type })
  }

  const fetchGears = async () => {
    setIsLoading(true)
    const { data, error } = await supabase
      .from('gears')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('Error fetching gears:', error)
    } else {
      setGears(data || [])
    }
    setIsLoading(false)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setImageFile(file)
      setImagePreview(URL.createObjectURL(file))
    }
  }

  const removeImage = () => {
    setImageFile(null)
    setImagePreview(null)
  }

  const startEditing = (gear: Gear) => {
    setEditingGearId(gear.id)
    setName(gear.name)
    setType(gear.type)
    setDescription(gear.description || '')
    setImagePreview(gear.image_url || null)
    setEditingPublicId(gear.public_id || null)
    setImageFile(null)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const cancelEditing = () => {
    setEditingGearId(null)
    setName('')
    setType('Kamera')
    setDescription('')
    removeImage()
    setEditingPublicId(null)
  }

  const handleAddGear = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return showToast('Nama gear harus diisi!', 'error')
    
    setIsUploading(true)
    try {
      let imageUrl = editingGearId ? imagePreview : null
      let publicId = editingGearId ? editingPublicId : null

      if (imageFile) {
        const timestamp = Math.round(new Date().getTime() / 1000)
        const sigRes = await fetch('/api/cloudinary/sign', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ paramsToSign: { timestamp, folder: 'galeri_gears' } })
        })
        const { signature, apiKey } = await sigRes.json()

        const formData = new FormData()
        formData.append('file', imageFile)
        formData.append('api_key', apiKey)
        formData.append('timestamp', timestamp.toString())
        formData.append('signature', signature)
        formData.append('folder', 'galeri_gears')

        const uploadRes = await fetch(
          `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
          { method: 'POST', body: formData }
        )
        
        if (!uploadRes.ok) throw new Error('Upload gambar gagal')
        const cloudData = await uploadRes.json()
        
        imageUrl = cloudData.secure_url
        publicId = cloudData.public_id
      }

      if (editingGearId) {
        const { error } = await supabase
          .from('gears')
          .update({
            name: name.trim(),
            type,
            description: description.trim() || null,
            image_url: imageUrl,
            public_id: publicId
          })
          .eq('id', editingGearId)
        if (error) throw error
        showToast('Berhasil mengedit gear!', 'success')
      } else {
        const { error } = await supabase
          .from('gears')
          .insert({
            name: name.trim(),
            type,
            description: description.trim() || null,
            image_url: imageUrl,
            public_id: publicId
          })
        if (error) throw error
        showToast('Berhasil menambahkan gear!', 'success')
      }

      cancelEditing()
      fetchGears()
    } catch (err) {
      console.error(err)
      showToast('Gagal menyimpan gear.', 'error')
    } finally {
      setIsUploading(false)
    }
  }

  const handleDelete = async (id: string, publicId?: string) => {
    if (!confirm('Yakin ingin menghapus gear ini?')) return

    try {
      if (publicId) {
        await fetch('/api/cloudinary/delete', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ public_ids: [publicId] })
        }).catch(err => console.warn('Gagal hapus gambar di Cloudinary:', err))
      }

      const { error } = await supabase.from('gears').delete().eq('id', id)
      if (error) throw error

      showToast('Gear berhasil dihapus!', 'success')
      fetchGears()
    } catch (err) {
      console.error(err)
      showToast('Gagal menghapus gear.', 'error')
    }
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-20 md:pb-12 relative">
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border animate-in slide-in-from-bottom-5 fade-in duration-300 ${
          toast.type === 'success' 
            ? 'bg-[#E8F5E9] border-[#A5D6A7] text-[#2E7D32] dark:bg-[#1B5E20]/20 dark:border-[#2E7D32] dark:text-[#A5D6A7]' 
            : 'bg-[#FFEBEE] border-[#FFCDD2] text-[#C62828] dark:bg-[#B71C1C]/20 dark:border-[#C62828] dark:text-[#FFCDD2]'
        }`}>
          {toast.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
          <p className="text-sm font-semibold">{toast.message}</p>
        </div>
      )}

      <div>
        <h2 className="text-3xl font-heading font-bold tracking-tight text-text-main">Kelola Gear & Peralatan</h2>
        <p className="text-text-muted mt-1 font-sans">
          Tambahkan kamera, lensa, atau perlengkapan tempur lu ke dalam etalase.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Kolom Kiri: Form Tambah */}
        <div className="lg:col-span-1">
          <Card className="bg-surface border-border/40 shadow-sm sticky top-24">
            <CardHeader>
              <CardTitle className="text-text-main font-heading flex items-center gap-2">
                <Camera size={20} className="text-primary-neutral" />
                {editingGearId ? 'Edit Gear' : 'Tambah Gear Baru'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddGear} className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-text-muted">Nama Gear</Label>
                  <Input 
                    value={name} onChange={(e) => setName(e.target.value)}
                    placeholder="Misal: Sony A7III" required
                    className="bg-background border-border/50 text-text-main focus:border-primary-neutral"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label className="text-text-muted">Kategori</Label>
                  <select 
                    value={type} onChange={(e) => setType(e.target.value)}
                    className="w-full rounded-md border border-border/50 bg-background px-3 py-2 text-sm text-text-main focus:outline-none focus:ring-1 focus:ring-primary-neutral"
                  >
                    <option value="Kamera">Kamera</option>
                    <option value="Lensa">Lensa</option>
                    <option value="Drone">Drone</option>
                    <option value="Aksesoris">Aksesoris</option>
                    <option value="Lainnya">Lainnya</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label className="text-text-muted">Deskripsi Singkat (Opsional)</Label>
                  <textarea 
                    value={description} onChange={(e) => setDescription(e.target.value)}
                    placeholder="Misal: Lensa andalan buat foto bokeh..."
                    className="w-full min-h-[80px] rounded-md border border-border/50 bg-background px-3 py-2 text-sm text-text-main placeholder:text-text-muted/50 focus:outline-none focus:ring-1 focus:ring-primary-neutral"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-text-muted">Foto Gear (Opsional)</Label>
                  {!imagePreview ? (
                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-xl cursor-pointer transition-colors border-border/60 bg-background hover:bg-background/80">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center">
                        <UploadCloud className="w-8 h-8 mb-2 text-text-muted" />
                        <p className="text-xs text-text-muted"><span className="font-semibold text-text-main">Klik upload</span> foto</p>
                      </div>
                      <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                    </label>
                  ) : (
                    <div className="relative h-32 w-full rounded-xl overflow-hidden border border-border/40">
                      <button 
                        type="button" onClick={removeImage}
                        className="absolute top-1 right-1 bg-red-500/90 p-1.5 rounded-lg hover:bg-red-500 z-10 transition-colors shadow-sm"
                      >
                        <X size={14} className="text-white" />
                      </button>
                      <img src={imagePreview} alt="Preview" className="w-full h-full object-contain p-2 drop-shadow-md bg-background/50" />
                    </div>
                  )}
                </div>

                <div className="flex gap-2 mt-2">
                  <Button 
                    type="submit" 
                    disabled={isUploading || !name.trim()} 
                    className="flex-1 bg-primary-neutral hover:bg-primary-neutral/90 text-surface h-10 text-sm shadow-md"
                  >
                    {isUploading ? (
                      <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Menyimpan...</>
                    ) : editingGearId ? (
                      'Update Gear'
                    ) : (
                      'Simpan Gear'
                    )}
                  </Button>
                  {editingGearId && (
                    <Button 
                      type="button" 
                      onClick={cancelEditing}
                      variant="outline"
                      className="h-10 text-sm border-border/50 text-text-main hover:bg-background bg-surface shadow-sm"
                    >
                      Batal
                    </Button>
                  )}
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Kolom Kanan: Daftar Gear */}
        <div className="lg:col-span-2">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="w-8 h-8 animate-spin text-primary-neutral" />
            </div>
          ) : gears.length === 0 ? (
            <div className="bg-surface border border-border/40 rounded-[16px] p-12 text-center flex flex-col items-center justify-center text-text-muted h-64">
              <Camera className="w-12 h-12 mb-4 opacity-50" />
              <p>Belum ada gear yang diupload.</p>
              <p className="text-sm opacity-70">Tambahkan di form sebelah kiri.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {gears.map((gear) => (
                <div key={gear.id} className="bg-surface border border-border/40 rounded-xl overflow-hidden shadow-sm flex flex-col group">
                  <div className="h-40 w-full relative bg-background/50 flex items-center justify-center border-b border-border/40">
                    {gear.image_url ? (
                      <img src={gear.image_url} alt={gear.name} className="w-full h-full object-contain p-2 drop-shadow-md" />
                    ) : (
                      <Camera className="w-10 h-10 text-text-muted/30" />
                    )}
                    <div className="absolute top-2 right-2 flex gap-1.5 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => startEditing(gear)}
                        className="bg-background/90 backdrop-blur-sm text-text-main p-2 rounded-lg hover:bg-background shadow-sm border border-border/50"
                        title="Edit Gear"
                      >
                        <Edit size={16} />
                      </button>
                      <button 
                        onClick={() => handleDelete(gear.id, gear.public_id)}
                        className="bg-red-500/90 backdrop-blur-sm text-white p-2 rounded-lg hover:bg-red-500 shadow-sm"
                        title="Hapus Gear"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                    <div className="absolute bottom-2 left-2 px-2 py-1 bg-background/80 backdrop-blur rounded-md text-[10px] font-bold tracking-wider uppercase text-text-main border border-border/50">
                      {gear.type}
                    </div>
                  </div>
                  <div className="p-4 flex-1 flex flex-col">
                    <h3 className="font-heading font-bold text-text-main line-clamp-2 leading-snug">{gear.name}</h3>
                    {gear.description && (
                      <p className="text-xs text-text-muted mt-1.5 line-clamp-2">{gear.description}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
