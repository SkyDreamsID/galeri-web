'use client'

import { useState, useEffect } from 'react'
import exifr from 'exifr'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Loader2, UploadCloud, X } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { TagInput } from './TagInput'

type FileWithExif = {
  file: File
  preview: string
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

export function UploadForm() {
  const router = useRouter()
  const supabase = createClient()
  const [isUploading, setIsUploading] = useState(false)
  const [title, setTitle] = useState('')
  const [story, setStory] = useState('')
  const [location, setLocation] = useState('')
  const [album, setAlbum] = useState('')
  const [tags, setTags] = useState<string[]>(['Landscape', 'Potret'])
  const [bulkCopyrightName, setBulkCopyrightName] = useState('Rifki Eka Putra')
  const [bulkLicense, setBulkLicense] = useState('Copyright')
  const [availableCollections, setAvailableCollections] = useState<{id: string, name: string}[]>([])
  const [images, setImages] = useState<FileWithExif[]>([])
  const [selectedPhotos, setSelectedPhotos] = useState<number[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const [uploadProgress, setUploadProgress] = useState('')

  // Fetch collections on mount
  useEffect(() => {
    const fetchCollections = async () => {
      const { data } = await supabase.from('collections').select('id, name').order('name', { ascending: true })
      if (data) setAvailableCollections(data)
    }
    fetchCollections()
  }, [])

  const processFiles = async (files: File[]) => {
    // Validasi ukuran file sebelum dikirim ke Cloudinary
    const MAX_SIZE = 10 * 1024 * 1024 // 10MB
    const oversized = files.filter(f => f.size > MAX_SIZE)
    if (oversized.length > 0) {
      toast.error(`${oversized.length} foto ditolak! Ukuran melebihi 10MB: ${oversized.map(f => f.name).join(', ')}`)
      files = files.filter(f => f.size <= MAX_SIZE)
      if (files.length === 0) return
    }

    const newImages = await Promise.all(
      files.map(async (file) => {
        let exifData: FileWithExif['exif'] = {}
        try {
          const parsed = await exifr.parse(file, { tiff: true, exif: true, makerNote: true })
          if (parsed) {
            const make = parsed.Make || ''
            const model = parsed.Model || ''
            let cameraStr = model || make || ''
            if (!model && make) cameraStr = make

            const dateTaken = parsed.DateTimeOriginal || parsed.CreateDate || parsed.ModifyDate || parsed.DateCreated
            
            exifData = {
              camera: cameraStr.trim(),
              lens: String(parsed.LensModel || parsed.Lens || parsed.LensInfo || parsed.LensType || parsed.LensID || parsed.LensMake || parsed.LensSpec || '').trim(),
              focal_length: parsed.FocalLength ? `${parsed.FocalLength}mm` : undefined,
              aperture: parsed.FNumber ? `f/${parsed.FNumber}` : undefined,
              iso: parsed.ISO ? `ISO ${parsed.ISO}` : undefined,
              shutter_speed: parsed.ExposureTime ? `1/${Math.round(1 / parsed.ExposureTime)}s` : undefined,
              date_taken: dateTaken ? new Date(dateTaken).toISOString() : undefined,
            }
          }
        } catch (err) {
          console.warn('Could not parse EXIF for', file.name)
        }

        return { 
          file, 
          preview: URL.createObjectURL(file), 
          license_type: 'Copyright',
          exif: { ...exifData, copyright_name: 'Rifki Eka Putra' } 
        }
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
    setImages((prev) => prev.filter((_, i) => i !== index))
    setSelectedPhotos((prev) => prev.filter(i => i !== index).map(i => i > index ? i - 1 : i))
  }

  const slugify = (text: string) => {
    return text
      .toString()
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')
      .replace(/[^\w\-]+/g, '')
      .replace(/\-\-+/g, '-')
      .replace(/^-+/, '')
      .replace(/-+$/, '')
      + '-' + Math.random().toString(36).substring(2, 6)
  }

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault()
    if (images.length === 0) return toast.warning('Pilih foto dulu sebelum publish!')
    if (!title.trim()) return toast.warning('Judul momen tidak boleh kosong!')
    setIsUploading(true)
    
    // Tracking public_id yang berhasil diupload ke Cloudinary (untuk rollback)
    const uploadedPublicIds: string[] = []

    try {
      // 1. Get Signature & API Key
      const timestamp = Math.round(new Date().getTime() / 1000)
      const sigRes = await fetch('/api/cloudinary/sign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paramsToSign: { timestamp } })
      })
      const { signature, apiKey } = await sigRes.json()

      // 2. Upload tiap foto ke Cloudinary (satu per satu + progress)
      const uploadedPhotos = []
      for (let i = 0; i < images.length; i++) {
        const img = images[i]
        setUploadProgress(`Mengunggah foto ${i + 1} dari ${images.length}...`)
        
        const formData = new FormData()
        formData.append('file', img.file)
        formData.append('api_key', apiKey)
        formData.append('timestamp', timestamp.toString())
        formData.append('signature', signature)

        const cloudRes = await fetch(
          `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
          { method: 'POST', body: formData }
        )
        
        if (!cloudRes.ok) {
          const errText = await cloudRes.text()
          throw new Error(`Gagal upload foto "${img.file.name}": ${errText}`)
        }
        const cloudData = await cloudRes.json()
        uploadedPublicIds.push(cloudData.public_id)
        
        uploadedPhotos.push({
          image_url: cloudData.secure_url,
          public_id: cloudData.public_id,
          bytes: cloudData.bytes,
          format: cloudData.format,
          original_filename: cloudData.original_filename,
          license_type: img.license_type,
          exif: img.exif
        })
      }
      setUploadProgress('Menyimpan data ke database...')

      // 3. Handle Album (Collections) - Langsung pakai ID yang dipilih
      let collectionId = album || null

      // 4. Insert Post (termasuk slug)
      const generatedSlug = slugify(title)
      const { data: postData, error: postError } = await supabase
        .from('posts')
        .insert({
          title,
          slug: generatedSlug,
          story,
          location,
          collection_id: collectionId,
          status: 'Published'
        })
        .select('id')
        .single()

      if (postError || !postData) throw postError

      // 5. Handle Tags
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
          await supabase.from('post_tags').insert({ post_id: postData.id, tag_id: tagId })
        }
      }

      // 6. Insert Photos & Exif (termasuk metadata file)
      for (let i = 0; i < uploadedPhotos.length; i++) {
        const photo = uploadedPhotos[i]
        const { data: photoData, error: photoError } = await supabase
          .from('photos')
          .insert({
            post_id: postData.id,
            image_url: photo.image_url,
            public_id: photo.public_id,
            bytes: photo.bytes,
            format: photo.format,
            original_filename: photo.original_filename,
            license_type: photo.license_type,
            is_cover: i === 0,
            sort_order: i,
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

      toast.success('Upload sukses! Momen berhasil di-publish 🎉')
      setUploadProgress('')
      
      // Arahkan ke halaman kelola galeri
      router.push('/admin/gallery')
    } catch (err: any) {
      console.error('Upload error:', err)
      
      // Rollback: hapus foto yang udah telanjur naik ke Cloudinary
      if (uploadedPublicIds.length > 0) {
        toast.error(`Upload gagal. Membersihkan ${uploadedPublicIds.length} foto dari Cloudinary...`)
        try {
          await fetch('/api/cloudinary/delete', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ public_ids: uploadedPublicIds })
          })
        } catch (cleanupErr) {
          console.error('Rollback Cloudinary gagal:', cleanupErr)
        }
      }
      
      // Tunjukkin error yang spesifik ke user
      const message = err?.message?.includes('10MB') || err?.message?.includes('File size')
        ? 'Foto terlalu besar! Maksimal 10MB per foto.'
        : err?.message || 'Gagal upload. Coba lagi.'
      toast.error(message)
      setUploadProgress('')
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <form onSubmit={handleUpload} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Kolom Kiri: Meta Data Post */}
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
              <Label className="text-text-muted">Override Lensa (Opsional)</Label>
              <Input 
                onChange={(e) => {
                  // Jika diisi, override semua foto di preview
                  const val = e.target.value
                  setImages(prev => prev.map(img => ({
                    ...img,
                    exif: { ...img.exif, lens: val || img.exif.lens }
                  })))
                }}
                placeholder="Misal: NIKKOR AF-S 55-300MM (Isi jika EXIF gagal)"
                className="bg-background border-border/50 text-text-main focus:border-primary-neutral"
              />
              <p className="text-xs text-text-muted/70">Otomatis menimpa data lensa semua foto di bawah.</p>
            </div>
            <div className="space-y-2">
              <Label className="text-text-muted">Album / Koleksi</Label>
              <select 
                value={album} onChange={(e) => setAlbum(e.target.value)}
                className="w-full rounded-xl border border-border/50 bg-background px-4 py-2.5 text-sm text-text-main focus:outline-none focus:ring-2 focus:ring-primary-neutral appearance-none"
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

      {/* Kolom Kanan: Upload Foto */}
      <div className="lg:col-span-2 space-y-6">
        <Card className="bg-surface border-border/40 border-dashed shadow-sm">
          <CardContent className="p-4 md:p-8">
            <label 
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-xl cursor-pointer transition-colors ${
                isDragging ? 'border-primary-neutral bg-primary-neutral/10' : 'border-border/60 bg-background hover:bg-background/80'
              }`}
            >
              <div className="flex flex-col items-center justify-center pt-5 pb-6 pointer-events-none px-4 text-center">
                <UploadCloud className="w-10 h-10 mb-3 text-text-muted" />
                <p className="mb-2 text-sm text-text-muted">
                  <span className="font-semibold text-text-main">Klik untuk upload</span> atau drag and drop
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
                  placeholder="Masukkan Nama"
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
                      <div className="font-medium text-text-main truncate" title={img.file.name}>{img.file.name}</div>
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

        <div className="flex justify-end pt-4 pb-12 md:pb-4">
          <Button 
            type="submit" 
            disabled={isUploading || images.length === 0} 
            className="w-full sm:w-auto bg-primary-neutral hover:bg-primary-neutral/90 text-surface h-12 md:h-10 text-base md:text-sm shadow-md"
          >
            {isUploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {uploadProgress || 'Memproses...'}
              </>
            ) : (
              'Publish Momen'
            )}
          </Button>
        </div>
      </div>
    </form>
  )
}
