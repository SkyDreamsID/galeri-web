'use client'

import { useEffect, useState, use } from 'react'
import { useRouter } from 'next/navigation'
import exifr from 'exifr'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Loader2, UploadCloud, X, ArrowLeft } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { TagInput } from '@/components/admin/TagInput'
import Link from 'next/link'

type FileWithExif = {
  id?: string // Jika sudah ada di DB
  file?: File // Jika baru dipilih
  preview: string
  public_id?: string
  license_type: string
  exif: {
    camera?: string
    lens?: string
    focal_length?: string
    aperture?: string
    iso?: string
    shutter_speed?: string
    date_taken?: string
    copyright_name?: string
  }
}

export default function EditPostPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const { id: postId } = use(params)
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  // Form states
  const [title, setTitle] = useState('')
  const [story, setStory] = useState('')
  const [location, setLocation] = useState('')
  const [album, setAlbum] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [availableCollections, setAvailableCollections] = useState<{id: string, name: string}[]>([])
  const [images, setImages] = useState<FileWithExif[]>([])
  const [isDragging, setIsDragging] = useState(false)

  // Bulk Edit States
  const [selectedPhotos, setSelectedPhotos] = useState<number[]>([])
  const [bulkCopyrightName, setBulkCopyrightName] = useState('Rifki Eka Putra')
  const [bulkLicense, setBulkLicense] = useState('Copyright')

  // Track deleted existing photos
  const [deletedPhotos, setDeletedPhotos] = useState<{ id: string; public_id: string }[]>([])

  useEffect(() => {
    const loadPostData = async () => {
      try {
        // 1. Fetch Post, Collection, and Photos
        const { data: post, error: postErr } = await supabase
          .from('posts')
          .select(`
            id, title, story, location, license_type, collection_id,
            photos (
              id, image_url, public_id, sort_order, bytes, format, original_filename, license_type, copyright_name,
              exif_data (camera, lens, focal_length, aperture, iso, shutter_speed, date_taken)
            )
          `)
          .eq('id', postId)
          .single()

        if (postErr || !post) throw postErr || new Error('Momen tidak ditemukan')

        setTitle(post.title)
        setStory(post.story || '')
        setLocation(post.location || '')
        setAlbum(post.collection_id || '')
        setAlbum(post.collection_id || '')

        // Fetch collections
        const { data: cols } = await supabase.from('collections').select('id, name').order('name', { ascending: true })
        if (cols) setAvailableCollections(cols)

        // 2. Fetch Tags
        const { data: postTags } = await supabase
          .from('post_tags')
          .select('tags (name)')
          .eq('post_id', postId)

        if (postTags) {
          const loadedTags = postTags.map((pt: any) => pt.tags?.name).filter(Boolean)
          setTags(loadedTags)
        }

        // 3. Map Photos
        if (post.photos) {
          const sortedPhotos = [...post.photos].sort((a, b) => a.sort_order - b.sort_order)
          const mappedPhotos: FileWithExif[] = sortedPhotos.map((p: any) => {
            const exif = p.exif_data?.[0] || {}
            return {
              id: p.id,
              preview: p.image_url,
              public_id: p.public_id,
              license_type: p.license_type || 'Copyright',
              exif: {
                camera: exif.camera || undefined,
                lens: exif.lens || undefined,
                focal_length: exif.focal_length || undefined,
                aperture: exif.aperture || undefined,
                iso: exif.iso || undefined,
                shutter_speed: exif.shutter_speed || undefined,
                date_taken: exif.date_taken || undefined,
                copyright_name: p.copyright_name || 'Rifki Eka Putra'
              }
            }
          })
          setImages(mappedPhotos)
        }
      } catch (err) {
        console.error(err)
        alert('Gagal memuat data momen')
        router.push('/admin/gallery')
      } finally {
        setLoading(false)
      }
    }

    loadPostData()
  }, [postId])

  const processFiles = async (files: File[]) => {
    const newImages = await Promise.all(
      files.map(async (file) => {
        let exifData: FileWithExif['exif'] = {}
        try {
          const parsed = await exifr.parse(file, { tiff: true, exif: true })
          if (parsed) {
            exifData = {
              camera: parsed.Make && parsed.Model ? `${parsed.Make} ${parsed.Model}` : parsed.Model,
              lens: parsed.LensModel,
              focal_length: parsed.FocalLength ? `${parsed.FocalLength}mm` : undefined,
              aperture: parsed.FNumber ? `f/${parsed.FNumber}` : undefined,
              iso: parsed.ISO ? `ISO ${parsed.ISO}` : undefined,
              shutter_speed: parsed.ExposureTime ? `1/${Math.round(1 / parsed.ExposureTime)}s` : undefined,
              date_taken: parsed.DateTimeOriginal?.toISOString(),
            }
          }
        } catch (err) {
          console.warn('Could not parse EXIF for', file.name)
        }

        return { file, preview: URL.createObjectURL(file), license_type: 'Copyright', exif: { ...exifData, copyright_name: 'Rifki Eka Putra' } }
      })
    )
    setImages((prev) => [...prev, ...newImages])
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) processFiles(Array.from(e.target.files))
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault(); setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault(); setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); setIsDragging(false)
    if (e.dataTransfer.files?.length > 0) processFiles(Array.from(e.dataTransfer.files))
  }

  const removeImage = (index: number) => {
    const imgToRemove = images[index]
    if (imgToRemove.id && imgToRemove.public_id) {
      setDeletedPhotos((prev) => [...prev, { id: imgToRemove.id!, public_id: imgToRemove.public_id! }])
    }
    setImages((prev) => prev.filter((_, i) => i !== index))
    setSelectedPhotos((prev) => prev.filter(i => i !== index).map(i => i > index ? i - 1 : i))
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (images.length === 0) return alert('Minimal harus ada 1 foto!')
    setIsSaving(true)

    try {
      // 1. Hapus foto lama yang ditandai untuk didelete (Cloudinary & DB)
      if (deletedPhotos.length > 0) {
        for (const p of deletedPhotos) {
          // Trigger API Delete khusus untuk single photo
          // (Menggunakan API routing delete kita tetapi didesain khusus)
          // Agar sederhana, kita hapus di database, Supabase CASCADE akan menghapus exif.
          // Untuk Cloudinary, kita panggil API Delete kita.
          // Biar seragam, kita panggil fetch delete.
          await supabase.from('photos').delete().eq('id', p.id)
          
          // Hapus dari Cloudinary via API
          await fetch('/api/post/delete', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ publicId: p.public_id }) // API routing posts/delete bisa kita upgrade untuk terima publicId saja
          })
        }
      }

      // 2. Upload foto baru jika ada ke Cloudinary
      const newFiles = images.filter((img) => img.file !== undefined)
      let uploadedPhotos: any[] = []

      if (newFiles.length > 0) {
        const timestamp = Math.round(new Date().getTime() / 1000)
        const sigRes = await fetch('/api/cloudinary/sign', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ paramsToSign: { timestamp } })
        })
        const { signature, apiKey } = await sigRes.json()

        uploadedPhotos = await Promise.all(
          newFiles.map(async (img) => {
            const formData = new FormData()
            formData.append('file', img.file!)
            formData.append('api_key', apiKey)
            formData.append('timestamp', timestamp.toString())
            formData.append('signature', signature)

            const cloudRes = await fetch(
              `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
              { method: 'POST', body: formData }
            )
            
            if (!cloudRes.ok) {
              const errText = await cloudRes.text()
              throw new Error(`Cloudinary upload failed: ${errText}`)
            }
            const cloudData = await cloudRes.json()
            
            return {
              image_url: cloudData.secure_url,
              public_id: cloudData.public_id,
              bytes: cloudData.bytes,
              format: cloudData.format,
              original_filename: cloudData.original_filename,
              exif: img.exif
            }
          })
        )
      }

      // 3. Handle Album (Collections)
      let collectionId = album || null

      // 4. Update Post
      const { error: postUpdateErr } = await supabase
        .from('posts')
        .update({
          title,
          story,
          location,
          collection_id: collectionId,
        })
        .eq('id', postId)

      if (postUpdateErr) throw postUpdateErr

      // 5. Update Tags (Hapus post_tags lama, lalu masukkan yang baru)
      await supabase.from('post_tags').delete().eq('post_id', postId)
      for (const tagName of tags) {
        let tagId = null
        const { data: existingTag } = await supabase
          .from('tags')
          .select('id')
          .eq('name', tagName)
          .maybeSingle()

        if (existingTag) {
          tagId = existingTag.id
        } else {
          const { data: newTag } = await supabase
            .from('tags')
            .insert({ name: tagName })
            .select('id')
            .single()
          if (newTag) tagId = newTag.id
        }

        if (tagId) {
          await supabase.from('post_tags').insert({ post_id: postId, tag_id: tagId })
        }
      }

      // 6. Insert Foto Baru & EXIF
      const remainingExistingCount = images.filter(img => img.id !== undefined).length
      for (let i = 0; i < uploadedPhotos.length; i++) {
        const photo = uploadedPhotos[i]
        const { data: photoData, error: photoError } = await supabase
          .from('photos')
          .insert({
            post_id: postId,
            image_url: photo.image_url,
            public_id: photo.public_id,
            bytes: photo.bytes,
            format: photo.format,
            original_filename: photo.original_filename,
            license_type: photo.license_type || 'Copyright',
            is_cover: remainingExistingCount === 0 && i === 0, // Cover jika tidak ada foto lama tersisa
            sort_order: remainingExistingCount + i,
            copyright_name: photo.exif.copyright_name || 'Rifki Eka Putra'
          })
          .select('id')
          .single()

        if (photoError || !photoData) throw photoError

        const { copyright_name, ...exifToInsert } = photo.exif
        const hasExif = Object.values(exifToInsert).some(val => val !== undefined)
        if (hasExif) {
          await supabase.from('exif_data').insert({
            photo_id: photoData.id,
            ...exifToInsert
          })
        }
      }

      // 7. Update metadata foto lama (lisensi & copyright_name) yang tidak dihapus
      const existingPhotos = images.filter(img => img.id !== undefined)
      for (const img of existingPhotos) {
        await supabase.from('photos').update({ 
          license_type: img.license_type,
          copyright_name: img.exif.copyright_name || 'Rifki Eka Putra'
        }).eq('id', img.id)
        
        const { copyright_name, ...exifToInsert } = img.exif
        const hasExif = Object.values(exifToInsert).some(val => val !== undefined)
        
        if (hasExif) {
          const { data: existingExif } = await supabase.from('exif_data').select('id').eq('photo_id', img.id).maybeSingle()
          if (existingExif) {
            await supabase.from('exif_data').update({ ...exifToInsert }).eq('photo_id', img.id)
          } else {
            await supabase.from('exif_data').insert({ photo_id: img.id, ...exifToInsert })
          }
        }
      }

      alert('Momen berhasil diperbarui!')
      router.push('/admin/gallery')
    } catch (err) {
      console.error(err)
      alert('Gagal menyimpan! Pastikan ukuran per foto baru tidak lebih dari 10MB.')
    } finally {
      setIsSaving(false)
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
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      <div className="flex items-center gap-3">
        <Link href="/admin/gallery">
          <Button variant="outline" size="icon" className="bg-surface border-border/50 hover:bg-hover-bg text-text-main">
            <ArrowLeft size={18} />
          </Button>
        </Link>
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-text-main">Edit Momen</h2>
          <p className="text-text-muted mt-1">Ubah cerita, lokasi, tag, atau foto pada momen ini.</p>
        </div>
      </div>

      <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left column: metadata */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="bg-surface border-border/40 shadow-sm">
            <CardHeader>
              <CardTitle className="text-text-main font-heading">Detail Momen</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="text-text-muted">Judul Momen</Label>
                <Input 
                  value={title} onChange={(e) => setTitle(e.target.value)}
                  placeholder="Misal: Senja di Stasiun Tugu" required
                  className="bg-background border-border/50 text-text-main focus:border-primary-neutral"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-text-muted">Lokasi (Opsional)</Label>
                <Input 
                  value={location} onChange={(e) => setLocation(e.target.value)}
                  placeholder="Yogyakarta"
                  className="bg-background border-border/50 text-text-main focus:border-primary-neutral"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-text-muted">Album / Koleksi</Label>
                <select 
                  value={album} onChange={(e) => setAlbum(e.target.value)}
                  className="w-full rounded-md border border-border/50 bg-background px-3 py-2 text-sm text-text-main focus:outline-none focus:ring-1 focus:ring-primary-neutral appearance-none"
                >
                  <option value="">-- Tanpa Koleksi --</option>
                  {availableCollections.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label className="text-text-muted">Tags</Label>
                <TagInput tags={tags} setTags={setTags} placeholder="Ketik tag & enter" />
              </div>
              <div className="space-y-2">
                <Label className="text-text-muted">Cerita / Deskripsi</Label>
                <textarea 
                  value={story} onChange={(e) => setStory(e.target.value)}
                  placeholder="Tulis cerita di balik foto ini..."
                  className="w-full min-h-[120px] rounded-md border border-border/50 bg-background px-3 py-2 text-sm text-text-main placeholder:text-text-muted/50 focus:outline-none focus:ring-1 focus:ring-primary-neutral"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right column: photos */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="bg-surface border-border/40 border-dashed shadow-sm">
            <CardContent className="p-8">
              <label 
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
                  isDragging ? 'border-primary-neutral bg-primary-neutral/10' : 'border-border/60 bg-background hover:bg-background/80'
                }`}
              >
                <div className="flex flex-col items-center justify-center pt-5 pb-6 pointer-events-none">
                  <UploadCloud className="w-10 h-10 mb-3 text-text-muted" />
                  <p className="mb-2 text-sm text-text-muted">
                    <span className="font-semibold text-text-main">Klik untuk tambah foto</span> atau drag and drop
                  </p>
                  <p className="text-xs text-text-muted/70 mt-1">JPG, PNG (Bisa multi-upload) • Max 10MB/foto</p>
                </div>
                <input type="file" className="hidden" multiple accept="image/*" onChange={handleFileChange} />
              </label>
            </CardContent>
          </Card>

          {/* Preview Area */}
          {images.length > 0 && (
            <div className="space-y-4">
              {/* Bulk Apply Bar */}
              <Card className="bg-surface border-border/40 p-4 shadow-sm flex flex-col sm:flex-row items-center gap-4 justify-between">
                <div className="flex items-center gap-2">
                  <input 
                    type="checkbox" 
                    checked={selectedPhotos.length === images.length && images.length > 0}
                    onChange={(e) => {
                      if (e.target.checked) setSelectedPhotos(images.map((_, i) => i))
                      else setSelectedPhotos([])
                    }}
                    className="w-4 h-4 rounded border-border/50 bg-background accent-primary-neutral cursor-pointer"
                  />
                  <span className="text-sm text-text-muted font-medium">
                    Pilih Semua ({selectedPhotos.length}/{images.length})
                  </span>
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <Input 
                    value={bulkCopyrightName} 
                    onChange={(e) => setBulkCopyrightName(e.target.value)}
                    placeholder="Misal: Tina"
                    className="bg-background border-border/50 text-text-main focus:border-primary-neutral h-9 w-full sm:w-32 text-sm"
                  />
                  <select 
                    value={bulkLicense}
                    onChange={(e) => setBulkLicense(e.target.value)}
                    className="bg-background border border-border/50 text-text-main rounded-md focus:outline-none focus:border-primary-neutral h-9 px-2 w-full sm:w-36 text-sm"
                  >
                    <option value="Copyright">Copyright</option>
                    <option value="Free Copyright">Free Copyright</option>
                  </select>
                  <Button 
                    type="button"
                    disabled={selectedPhotos.length === 0}
                    onClick={() => {
                      setImages(prev => prev.map((img, i) => 
                        selectedPhotos.includes(i) ? { ...img, license_type: bulkLicense, exif: { ...img.exif, copyright_name: bulkCopyrightName || img.exif.copyright_name } } : img
                      ))
                      setSelectedPhotos([])
                    }}
                    className="bg-primary-neutral hover:bg-primary-neutral/90 text-surface h-9 text-sm px-4 shrink-0"
                  >
                    Terapkan
                  </Button>
                </div>
              </Card>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {images.map((img, idx) => (
                  <Card 
                    key={idx} 
                    className={`bg-surface border-2 overflow-hidden group relative shadow-sm transition-colors cursor-pointer ${
                      selectedPhotos.includes(idx) ? 'border-primary-neutral/60' : 'border-border/40 hover:border-primary-neutral/30'
                    }`}
                    onClick={() => {
                      setSelectedPhotos(prev => 
                        prev.includes(idx) ? prev.filter(i => i !== idx) : [...prev, idx]
                      )
                    }}
                  >
                    {/* Checkbox Overlay */}
                    <div className="absolute top-2 left-2 z-10 bg-background/80 p-1.5 rounded-lg backdrop-blur-sm border border-border/50">
                      <input 
                        type="checkbox" 
                        checked={selectedPhotos.includes(idx)}
                        onChange={() => {}} // handled by parent onClick
                        className="w-4 h-4 rounded border-border/50 bg-background accent-primary-neutral pointer-events-none"
                      />
                    </div>

                    <button 
                      type="button" 
                      onClick={(e) => { e.stopPropagation(); removeImage(idx); }}
                      className="absolute top-2 right-2 bg-red-500/90 p-2 md:p-1.5 rounded-lg hover:bg-red-500 z-10 transition-colors shadow-sm"
                    >
                      <X size={16} className="text-white" />
                    </button>
                    <div className="h-48 w-full relative">
                      <img src={img.preview} alt="preview" className="absolute inset-0 w-full h-full object-cover" />
                    </div>
                    <div className="p-4 bg-surface text-xs text-text-muted space-y-2 border-t border-border/40">
                      <div className="flex justify-between items-start gap-2">
                        <div className="font-medium text-text-main truncate" title={img.file ? img.file.name : 'Foto Tersimpan'}>
                          {img.file ? img.file.name : 'Foto Tersimpan'}
                        </div>
                        <span className="shrink-0 inline-flex items-center rounded-full bg-primary-neutral/10 px-2 py-0.5 text-[10px] font-medium text-primary-neutral border border-primary-neutral/20">
                          © {img.exif.copyright_name}
                        </span>
                      </div>
                      
                      <select
                        value={img.license_type}
                        onChange={(e) => {
                          e.stopPropagation()
                          const newImages = [...images]
                          newImages[idx].license_type = e.target.value
                          setImages(newImages)
                        }}
                        onClick={(e) => e.stopPropagation()}
                        className="w-full bg-background border border-border/50 text-text-main rounded py-1 px-2 text-xs focus:outline-none focus:border-primary-neutral"
                      >
                        <option value="Copyright">Hak Cipta (Dilarang Unduh)</option>
                        <option value="Free Copyright">Bebas (Izinkan Unduh)</option>
                      </select>

                      <div className="pt-1 space-y-1">
                        {img.exif.camera && <p>📷 {img.exif.camera} {img.exif.lens}</p>}
                        {img.exif.aperture && (
                          <p>⚙️ {img.exif.focal_length} • {img.exif.aperture} • {img.exif.shutter_speed} • {img.exif.iso}</p>
                        )}
                        {!img.exif.camera && <p className="text-yellow-500/80">⚠️ Data EXIF tidak terdeteksi</p>}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4">
            <Link href="/admin/gallery">
              <Button type="button" variant="outline" className="bg-surface border-border/50 text-text-main hover:bg-hover-bg">
                Batal
              </Button>
            </Link>
            <Button 
              type="submit" 
              disabled={isSaving || images.length === 0} 
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Menyimpan...
                </>
              ) : (
                'Simpan Perubahan'
              )}
            </Button>
          </div>
        </div>
      </form>
    </div>
  )
}
