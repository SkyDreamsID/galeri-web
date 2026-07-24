'use client'

import { useEffect, useState, use, useRef } from 'react'
import { useRouter } from 'next/navigation'
import exifr from 'exifr'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Loader2, UploadCloud, X, ArrowLeft, FileText, Star } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { TagInput } from '@/components/admin/TagInput'
import { CustomSelect } from '@/components/admin/CustomSelect'
import { toast } from 'sonner'
import Link from 'next/link'
import { useSiteSettings } from '@/contexts/SiteSettingsContext'

type FileWithExif = {
  id?: string // Jika sudah ada di DB
  file?: File // Jika baru dipilih
  preview: string
  public_id?: string
  license_type: string
  show_watermark: boolean
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
  const settings = useSiteSettings()
  const cloudName = settings?.cloudinary_cloud_name || process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
  
  const [loading, setLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  // Form states
  const [title, setTitle] = useState('')
  const [story, setStory] = useState('')
  const [location, setLocation] = useState('')
  const [album, setAlbum] = useState('')
  const [status, setStatus] = useState('Published')
  const [tags, setTags] = useState<string[]>([])
  const [allTags, setAllTags] = useState<string[]>([])
  const [availableCollections, setAvailableCollections] = useState<{id: string, name: string}[]>([])
  const [images, setImages] = useState<FileWithExif[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [useCompression, setUseCompression] = useState(true)
  const [coverPhotoId, setCoverPhotoId] = useState<string | null>(null)

  // Bulk Edit States
  const [selectedPhotos, setSelectedPhotos] = useState<number[]>([])
  const [bulkCopyrightName, setBulkCopyrightName] = useState('')
  const [bulkLicense, setBulkLicense] = useState('Copyright')

  // Track deleted existing photos
  const [deletedPhotos, setDeletedPhotos] = useState<{ id: string; public_id: string }[]>([])

  // Auto-resize textarea when story changes
  useEffect(() => {
    const timer = setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto'
        textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
      }
    }, 10)
    return () => clearTimeout(timer)
  }, [story])

  useEffect(() => {
    const loadPostData = async () => {
      try {
        // 1. Fetch Post, Collection, and Photos
        const { data: post, error: postErr } = await supabase
          .from('posts')
          .select(`
            id, title, story, location, license_type, collection_id, status,
            photos (
              id, image_url, public_id, sort_order, bytes, format, original_filename, license_type, copyright_name, show_watermark, is_cover,
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
        setStatus(post.status || 'Published')

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

        // 3. Fetch All Tags for suggestions
        const { data: allTagsData } = await supabase.from('tags').select('name').order('name')
        if (allTagsData) {
          setAllTags(allTagsData.map(t => t.name))
        }

        // 3. Map Photos
        if (post.photos) {
          const sortedPhotos = [...post.photos].sort((a, b) => a.sort_order - b.sort_order)
          let coverId = null
          const mappedPhotos: FileWithExif[] = sortedPhotos.map((p: any) => {
            if (p.is_cover) coverId = p.id
            const exif = p.exif_data?.[0] || {}
            return {
              id: p.id,
              preview: p.image_url,
              public_id: p.public_id,
              license_type: p.license_type || 'Copyright',
              show_watermark: p.show_watermark !== false,
              exif: {
                camera: exif.camera || undefined,
                lens: exif.lens || undefined,
                focal_length: exif.focal_length || undefined,
                aperture: exif.aperture || undefined,
                iso: exif.iso || undefined,
                shutter_speed: exif.shutter_speed || undefined,
                date_taken: exif.date_taken || undefined,
                copyright_name: p.copyright_name || ''
              }
            }
          })
          setImages(mappedPhotos)
          if (coverId) {
            setCoverPhotoId(coverId)
          } else if (mappedPhotos.length > 0) {
            setCoverPhotoId(mappedPhotos[0].id!)
          }
        }
      } catch (err) {
        console.error(err)
        toast.error('Gagal memuat data momen. Kembali ke galeri...')
        router.push('/admin/gallery')
      } finally {
        setLoading(false)
      }
    }

    loadPostData()
  }, [postId])

  // Auto-resize textarea when story changes
  useEffect(() => {
    const timer = setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto'
        textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
      }
    }, 10)
    return () => clearTimeout(timer)
  }, [story, loading])

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

        return { id: `new-${Math.random().toString(36).substring(7)}`, file, preview: URL.createObjectURL(file), license_type: 'Copyright', show_watermark: true, exif: { ...exifData, copyright_name: exifData.copyright_name || '' } }
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
    if (imgToRemove.id && imgToRemove.public_id && !imgToRemove.id.startsWith('new-')) {
      setDeletedPhotos((prev) => [...prev, { id: imgToRemove.id!, public_id: imgToRemove.public_id! }])
    }
    const newImages = images.filter((_, i) => i !== index)
    setImages(newImages)
    setSelectedPhotos((prev) => prev.filter(i => i !== index).map(i => i > index ? i - 1 : i))
    
    if (imgToRemove.id === coverPhotoId && newImages.length > 0) {
      setCoverPhotoId(newImages[0].id!)
    } else if (newImages.length === 0) {
      setCoverPhotoId(null)
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (images.length === 0) return toast.warning('Minimal harus ada 1 foto dalam momen!')
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
            // Proses Kompresi
            let fileToUpload = img.file!
            if (useCompression && fileToUpload.type.startsWith('image/')) {
              fileToUpload = await new Promise<File>((resolve) => {
                const imageObj = new Image()
                imageObj.src = URL.createObjectURL(img.file!)
                imageObj.onload = () => {
                  const canvas = document.createElement('canvas')
                  const MAX_WIDTH = 2500
                  const MAX_HEIGHT = 2500
                  let width = imageObj.width
                  let height = imageObj.height
                  
                  if (width > MAX_WIDTH || height > MAX_HEIGHT) {
                    if (width > height) {
                      height = Math.round(height * (MAX_WIDTH / width))
                      width = MAX_WIDTH
                    } else {
                      width = Math.round(width * (MAX_HEIGHT / height))
                      height = MAX_HEIGHT
                    }
                  }
                  canvas.width = width
                  canvas.height = height
                  const ctx = canvas.getContext('2d')
                  if (!ctx) return resolve(img.file!)
                  ctx.drawImage(imageObj, 0, 0, width, height)
                  canvas.toBlob((blob) => {
                    if (blob) resolve(new File([blob], img.file!.name, { type: 'image/jpeg' }))
                    else resolve(img.file!)
                  }, 'image/jpeg', 0.85)
                }
                imageObj.onerror = () => resolve(img.file!)
              })
            }

            const formData = new FormData()
            formData.append('file', fileToUpload)
            formData.append('api_key', apiKey)
            formData.append('timestamp', timestamp.toString())
            formData.append('signature', signature)

            const cloudRes = await fetch(
              `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
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
          status,
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
      const remainingExistingCount = images.filter(img => img.file === undefined).length
      for (let i = 0; i < uploadedPhotos.length; i++) {
        const photo = uploadedPhotos[i]
        const originalImg = newFiles[i]
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
            show_watermark: photo.show_watermark !== false,
            is_cover: originalImg.id === coverPhotoId,
            sort_order: remainingExistingCount + i,
            copyright_name: photo.exif.copyright_name || ''
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
      const existingPhotos = images.filter(img => img.file === undefined)
      for (const img of existingPhotos) {
        await supabase.from('photos').update({ 
          license_type: img.license_type,
          copyright_name: img.exif.copyright_name || '',
          show_watermark: img.show_watermark !== false,
          is_cover: img.id === coverPhotoId
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

      toast.success('Momen berhasil diperbarui! ✅')
      router.push('/admin/gallery')
    } catch (err: any) {
      console.error(err)
      const message = err?.message?.includes('File size') || err?.message?.includes('10MB')
        ? 'Foto baru terlalu besar! Maksimal 10MB per foto.'
        : err?.message || 'Gagal menyimpan perubahan. Coba lagi.'
      toast.error(message)
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
    <div className="max-w-6xl mx-auto space-y-6 pb-12 w-full overflow-x-hidden md:overflow-visible">
      <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-8 relative w-full">
        {/* Kolom Kiri: Meta Data Post */}
        <div className="lg:col-span-1 space-y-4 md:space-y-6">
          <Card className="bg-surface border-border/40 shadow-sm overflow-visible">
            <CardHeader className="p-3 md:p-6 md:pb-6 flex flex-row items-center gap-2 md:gap-4 space-y-0 min-w-0">
              <Link href="/admin/gallery" className="p-1 md:p-2 hover:bg-hover-bg rounded-full transition-colors shrink-0">
                <ArrowLeft size={18} className="text-text-muted hover:text-text-main md:w-5 md:h-5" />
              </Link>
              <div className="min-w-0 flex-1">
                <CardTitle className="text-text-main font-heading text-lg md:text-2xl truncate">Edit Momen</CardTitle>
                <p className="text-[10px] md:text-sm text-text-muted mt-0.5 md:mt-1 truncate">Ubah cerita, lokasi, tag, atau foto pada momen ini.</p>
              </div>
            </CardHeader>
            <CardContent className="p-4 pt-4 md:p-6 space-y-3 md:space-y-4">
              <div className="space-y-1.5 md:space-y-2">
                <Label className="text-text-muted text-xs md:text-sm">Judul Momen</Label>
                <Input 
                  value={title} onChange={(e) => setTitle(e.target.value)}
                  placeholder="Misal: Senja di Stasiun Tugu" required
                  className="bg-background border-border/50 text-text-main focus:border-primary-neutral h-9 md:h-10 text-[13px] md:text-sm"
                />
              </div>
              <div className="space-y-1.5 md:space-y-2">
                <Label className="text-text-muted text-xs md:text-sm">Lokasi (Opsional)</Label>
                <Input 
                  value={location} onChange={(e) => setLocation(e.target.value)}
                  placeholder="Yogyakarta"
                  className="bg-background border-border/50 text-text-main focus:border-primary-neutral h-9 md:h-10 text-[13px] md:text-sm"
                />
              </div>
              <div className="space-y-1.5 md:space-y-2">
                <Label className="text-text-muted text-xs md:text-sm">Album / Koleksi</Label>
                <CustomSelect
                  value={album}
                  onChange={setAlbum}
                  options={[
                    { value: '', label: '-- Tanpa Koleksi --' },
                    ...availableCollections.map(c => ({ value: c.id, label: c.name }))
                  ]}
                  placeholder="Pilih koleksi..."
                />
              </div>
              <div className="space-y-1.5 md:space-y-2">
                <Label className="text-text-muted text-xs md:text-sm">Status Tayang</Label>
                <CustomSelect
                  value={status}
                  onChange={setStatus}
                  options={[
                    { value: 'Published', label: 'Publik' },
                    { value: 'Draft', label: 'Pribadi / Draft' }
                  ]}
                />
              </div>
              <div className="space-y-1.5 md:space-y-2">
                <Label className="text-text-muted text-xs md:text-sm">Tags</Label>
                <TagInput tags={tags} setTags={setTags} availableTags={allTags} placeholder="Ketik tag & enter" />
              </div>
              <div className="space-y-1.5 md:space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-text-muted text-xs md:text-sm">Cerita / Deskripsi</Label>
                  <label className="cursor-pointer text-xs flex items-center gap-1.5 text-primary-neutral hover:text-primary-neutral/80 transition-colors bg-primary-neutral/10 px-2 py-1 rounded-md border border-primary-neutral/20">
                    <FileText size={14} />
                    <span>Import .txt / .md</span>
                    <input 
                      type="file" 
                      accept=".txt,.md" 
                      className="hidden" 
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (!file) return
                        const reader = new FileReader()
                        reader.onload = (event) => {
                          setStory(event.target?.result as string)
                          if (!title) setTitle(file.name.replace(/\.[^/.]+$/, ""))
                          toast.success('Cerita berhasil diimpor!')
                        }
                        reader.readAsText(file)
                        e.target.value = ''
                      }}
                    />
                  </label>
                </div>
                <textarea 
                  ref={textareaRef}
                  value={story} onChange={(e) => setStory(e.target.value)}
                  placeholder="Tulis cerita di balik karya ini..."
                  className="w-full min-h-[90px] md:min-h-[120px] resize-none overflow-hidden rounded-md border border-border/50 bg-background px-3 py-2 text-[13px] md:text-sm text-text-main placeholder:text-text-muted/50 focus:outline-none focus:ring-1 focus:ring-primary-neutral"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Kolom Kanan: Upload Foto */}
        <div className="lg:col-span-2 space-y-4 md:space-y-6">
          <Card className="bg-surface border-border/40 border-dashed shadow-sm">
            <CardContent className="p-3 md:p-8">
              <label 
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`flex flex-col items-center justify-center w-full h-32 md:h-48 border-2 border-dashed rounded-xl cursor-pointer transition-colors ${
                  isDragging ? 'border-primary-neutral bg-primary-neutral/10' : 'border-border/60 bg-background hover:bg-background/80'
                }`}
              >
                <div className="flex flex-col items-center justify-center pt-5 pb-6 pointer-events-none px-4 text-center">
                  <UploadCloud className="w-8 h-8 md:w-10 md:h-10 mb-2 md:mb-3 text-text-muted" />
                  <p className="mb-1 md:mb-2 text-xs md:text-sm text-text-muted">
                    <span className="font-semibold text-text-main">Klik untuk tambah foto</span> atau drag and drop
                  </p>
                  <p className="text-[10px] md:text-xs text-text-muted/70 mt-1">JPG, PNG (Bisa multi-upload) • Max 10MB/foto</p>
                </div>
                <input type="file" className="hidden" multiple accept="image/*" onChange={handleFileChange} />
              </label>
            </CardContent>
          </Card>

          {/* Preview Area */}
          {images.length > 0 && (
            <div className="space-y-4">
              {/* Bulk Apply Bar */}
              <Card className="bg-surface border-border/40 p-4 shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center gap-4 justify-between overflow-visible">
                <div className="flex items-center justify-between sm:justify-start gap-2">
                  <label className="flex items-center gap-2 cursor-pointer">
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
                  </label>
                </div>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 md:gap-3 w-full sm:w-auto mt-2 sm:mt-0 min-w-0">
                  <Input 
                    value={bulkCopyrightName} 
                    onChange={(e) => setBulkCopyrightName(e.target.value)}
                    placeholder="Masukkan Nama"
                    className="bg-background border-border/50 text-text-main focus:border-primary-neutral h-8 md:h-9 w-full sm:w-40 text-[11px] md:text-sm px-2 min-w-0"
                  />
                  <CustomSelect
                    value={bulkLicense}
                    onChange={setBulkLicense}
                    className="w-full sm:w-56"
                    options={[
                      { value: 'Copyright', label: 'Copyright' },
                      { value: 'Free Copyright', label: 'Free Copyright & Download' }
                    ]}
                  />
                  <Button 
                    type="button"
                    disabled={selectedPhotos.length === 0}
                    onClick={() => {
                      setImages(prev => prev.map((img, i) => 
                        selectedPhotos.includes(i) ? { ...img, license_type: bulkLicense, exif: { ...img.exif, copyright_name: bulkCopyrightName || img.exif.copyright_name } } : img
                      ))
                      setSelectedPhotos([])
                    }}
                    className="bg-primary-neutral hover:bg-primary-neutral/90 text-surface h-8 md:h-9 text-xs md:text-sm px-3 md:px-4 shrink-0"
                  >
                    Terapkan
                  </Button>
                </div>
              </Card>

              <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
                {images.map((img, idx) => (
                  <Card 
                    key={idx} 
                    className={`bg-surface border-2 overflow-visible group relative shadow-sm transition-colors cursor-pointer flex flex-col ${
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

                    {/* Button Jadikan Thumbnail */}
                    {img.id === coverPhotoId ? (
                      <div className="absolute top-2 left-1/2 -translate-x-1/2 bg-yellow-500 text-white text-[10px] md:text-xs font-bold px-2 py-1 rounded-md shadow-md z-10 flex items-center gap-1">
                        <Star className="w-3 h-3 fill-white" />
                        THUMBNAIL
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); setCoverPhotoId(img.id!) }}
                        className="absolute top-2 left-1/2 -translate-x-1/2 bg-black/60 hover:bg-black/80 text-white text-[10px] md:text-xs font-semibold px-2 py-1 rounded-md shadow-sm z-10 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 backdrop-blur-sm"
                      >
                        <Star className="w-3 h-3" />
                        Jadikan Thumbnail
                      </button>
                    )}

                    <div className="h-32 md:h-48 w-full relative shrink-0 bg-zinc-800 overflow-hidden rounded-t-[10px]">
                      {/* Intercept URL Cloudinary biar dapet versi enteng 400px, kalau file lokal baru biarin utuh */}
                      <img 
                        src={img.preview.includes('res.cloudinary.com') ? img.preview.replace('/upload/', '/upload/c_fill,w_400,q_auto,f_auto/') : img.preview} 
                        alt="preview" 
                        className="absolute inset-0 w-full h-full object-cover pointer-events-none" 
                      />
                    </div>

                    <div className="p-3 md:p-4 bg-surface text-xs text-text-muted space-y-2 border-t border-border/40 flex-1 flex flex-col justify-between min-w-0 rounded-b-[10px]">
                      <div className="flex flex-col xl:flex-row xl:justify-between items-start gap-1 md:gap-2 min-w-0">
                        <div className="font-medium text-text-main truncate w-full" title={img.file ? img.file.name : 'Foto Tersimpan'}>
                          {img.file ? img.file.name : 'Foto Tersimpan'}
                        </div>
                        <span className="shrink-0 inline-flex items-center rounded-full bg-primary-neutral/10 px-2.5 py-1 text-[10px] md:text-xs font-medium text-primary-neutral border border-primary-neutral/20 max-w-full truncate">
                          © {img.exif.copyright_name}
                        </span>
                      </div>
                      
                      <CustomSelect
                        value={img.license_type}
                        onChange={(val) => {
                          const newImages = [...images]
                          newImages[idx].license_type = val
                          setImages(newImages)
                        }}
                        size="sm"
                        options={[
                          { value: 'Copyright', label: 'Copyright' },
                          { value: 'Free Copyright', label: 'Free Copyright & Download' }
                        ]}
                      />

                      {/* Checkbox Tampilkan Watermark */}
                      <label
                        className="flex items-center gap-2 cursor-pointer select-none mt-1 group min-w-0"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <input
                          type="checkbox"
                          checked={img.show_watermark !== false}
                          onChange={(e) => {
                            e.stopPropagation()
                            const newImages = [...images]
                            newImages[idx].show_watermark = e.target.checked
                            setImages(newImages)
                          }}
                          onClick={(e) => e.stopPropagation()}
                          className="w-3.5 h-3.5 rounded border-border/50 bg-background accent-primary-neutral cursor-pointer pointer-events-auto shrink-0"
                        />
                        <span className="text-[11px] text-text-muted group-hover:text-text-main transition-colors truncate">Tampilkan watermark</span>
                      </label>

                      <div className="pt-1 space-y-0.5 md:space-y-1 text-[9px] md:text-[10px] leading-tight min-w-0">
                        {img.exif.camera && <p className="truncate">📷 {img.exif.camera} {img.exif.lens}</p>}
                        {img.exif.aperture && (
                          <p className="truncate">⚙️ {img.exif.focal_length} • {img.exif.aperture} • {img.exif.shutter_speed} • {img.exif.iso}</p>
                        )}
                        {!img.exif.camera && <p className="text-yellow-500/80 truncate">⚠️ Tanpa EXIF</p>}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row items-center sm:justify-end gap-4 pt-4 w-full">
            {images.some(img => img.file !== undefined) && (
              <label className="flex items-center gap-2 cursor-pointer order-2 sm:order-1 bg-surface border border-border/50 px-3 py-2 rounded-lg shadow-sm hover:border-primary-neutral/40 transition-colors w-full sm:w-auto">
                <input 
                  type="checkbox" 
                  checked={useCompression} 
                  onChange={(e) => setUseCompression(e.target.checked)} 
                  className="w-4 h-4 rounded border-border/50 accent-primary-neutral shrink-0" 
                />
                <span className="text-sm text-text-muted font-medium whitespace-nowrap">Kompres Foto Baru (Cepat)</span>
              </label>
            )}
            <div className="flex flex-col-reverse sm:flex-row gap-3 order-1 sm:order-2 w-full sm:w-auto">
              <Link href="/admin/gallery" className="w-full sm:w-auto">
                <Button type="button" variant="outline" className="w-full bg-surface border-border/50 text-text-main hover:bg-hover-bg">
                  Batal
                </Button>
              </Link>
              <Button 
                type="submit" 
                disabled={isSaving || images.length === 0} 
                className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white"
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
        </div>
      </form>
    </div>
  )
}
