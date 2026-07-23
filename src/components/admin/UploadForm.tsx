'use client'

import { useState, useEffect, useRef } from 'react'
import exifr from 'exifr'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Loader2, UploadCloud, X, FileText, CheckCircle2, AlertCircle, Star, Plus } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { TagInput } from './TagInput'
import { CustomSelect } from './CustomSelect'
import { useSiteSettings } from '@/contexts/SiteSettingsContext'

type FileWithExif = {
  id: string
  file: File
  preview: string
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

export function UploadForm() {
  const router = useRouter()
  const supabase = createClient()
  const settings = useSiteSettings()
  const cloudName = settings?.cloudinary_cloud_name || process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
  
  const [uploadState, setUploadState] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle')
  const [uploadErrorMsg, setUploadErrorMsg] = useState('')
  const abortControllerRef = useRef<AbortController | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  
  const [title, setTitle] = useState('')
  const [story, setStory] = useState('')
  const [location, setLocation] = useState('')
  const [album, setAlbum] = useState('')
  const [status, setStatus] = useState('Published')
  const [tags, setTags] = useState<string[]>([])
  const [bulkCopyrightName, setBulkCopyrightName] = useState('')
  const [bulkLicense, setBulkLicense] = useState('Copyright')
  const [availableCollections, setAvailableCollections] = useState<{id: string, name: string}[]>([])
  const [availableTags, setAvailableTags] = useState<string[]>([])
  const [images, setImages] = useState<FileWithExif[]>([])
  const [selectedPhotos, setSelectedPhotos] = useState<string[]>([])
  const [coverPhotoId, setCoverPhotoId] = useState<string | null>(null)
  const [isCreatingCollection, setIsCreatingCollection] = useState(false)
  const [newCollectionName, setNewCollectionName] = useState('')
  const [draggedIdx, setDraggedIdx] = useState<number | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [uploadProgress, setUploadProgress] = useState('')
  const [useCompression, setUseCompression] = useState(true)

  // Fetch collections and tags on mount
  useEffect(() => {
    const fetchData = async () => {
      const [colsRes, tagsRes] = await Promise.all([
        supabase.from('collections').select('id, name').order('name', { ascending: true }),
        supabase.from('tags').select('name').order('name', { ascending: true })
      ])
      if (colsRes.data) setAvailableCollections(colsRes.data)
      if (tagsRes.data) setAvailableTags(tagsRes.data.map(t => t.name))
    }
    fetchData()
  }, [])

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
          const parsed = await exifr.parse(file, { tiff: true, exif: true, makerNote: true, xmp: true, iptc: true })
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

        return { id: Math.random().toString(36).substring(2, 9) + Date.now().toString(36), file, preview: URL.createObjectURL(file), license_type: 'Copyright', show_watermark: true, exif: { ...exifData, copyright_name: exifData.copyright_name || '' } }
      })
    )
    setImages((prev) => {
      const updated = [...prev, ...newImages]
      if (!coverPhotoId && updated.length > 0) {
        setCoverPhotoId(updated[0].id)
      }
      return updated
    })
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
    setImages((prev) => {
      const newArr = prev.filter((_, i) => i !== index)
      if (prev[index].id === coverPhotoId && newArr.length > 0) {
        setCoverPhotoId(newArr[0].id)
      } else if (newArr.length === 0) {
        setCoverPhotoId(null)
      }
      return newArr
    })
    setSelectedPhotos(prev => prev.filter(id => id !== images[index].id))
  }

  const handleCardDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIdx(index)
    e.currentTarget.classList.add('opacity-50')
  }

  const handleCardDragEnd = (e: React.DragEvent) => {
    setDraggedIdx(null)
    e.currentTarget.classList.remove('opacity-50')
  }

  const handleCardDragEnter = (e: React.DragEvent, targetIdx: number) => {
    e.preventDefault()
    if (draggedIdx === null || draggedIdx === targetIdx) return
    
    setImages(prev => {
      const newImages = [...prev]
      const draggedItem = newImages[draggedIdx]
      newImages.splice(draggedIdx, 1)
      newImages.splice(targetIdx, 0, draggedItem)
      return newImages
    })
    setDraggedIdx(targetIdx)
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
    
    setUploadState('uploading')
    setUploadErrorMsg('')
    abortControllerRef.current = new AbortController()
    const signal = abortControllerRef.current.signal

    // Tracking public_id yang berhasil diupload ke Cloudinary (untuk rollback)
    const uploadedPublicIds: string[] = []

    try {
      // 1. Upload tiap foto ke Cloudinary (Sistem Antrian / Concurrent 3-3 & Auto-retry)
      const uploadedPhotos: any[] = new Array(images.length)
      let completedCount = 0

      const uploadWorker = async (img: FileWithExif, index: number) => {
        let attempts = 0
        const maxAttempts = 3
        while (attempts < maxAttempts) {
          try {
            if (signal.aborted) throw new Error('Dibatalkan oleh pengguna')
            
            // Generate signature BARU untuk setiap foto biar ga keburu expired
            const timestamp = Math.round(new Date().getTime() / 1000)
            const sigRes = await fetch('/api/cloudinary/sign', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ paramsToSign: { timestamp } }),
              signal
            }).catch(e => {
              throw new Error(`Koneksi server gagal: ${e.message}`)
            })
            if (!sigRes.ok) throw new Error('Gagal memproses otorisasi upload')
            const { signature, apiKey } = await sigRes.json()

            // Proses Kompresi (Jika diaktifkan) via Main Thread (Lebih stabil di HP)
            let fileToUpload = img.file
            if (useCompression && fileToUpload.type.startsWith('image/')) {
              fileToUpload = await new Promise<File>((resolve) => {
                const imgElement = document.createElement('img')
                imgElement.onload = () => {
                  let width = imgElement.width
                  let height = imgElement.height
                  const MAX_WIDTH = 2500
                  const MAX_HEIGHT = 2500

                  if (width > MAX_WIDTH || height > MAX_HEIGHT) {
                    if (width > height) {
                      height = Math.round(height * (MAX_WIDTH / width))
                      width = MAX_WIDTH
                    } else {
                      width = Math.round(width * (MAX_HEIGHT / height))
                      height = MAX_HEIGHT
                    }
                  }

                  const canvas = document.createElement('canvas')
                  canvas.width = width
                  canvas.height = height
                  const ctx = canvas.getContext('2d')
                  if (!ctx) return resolve(img.file) // Fallback

                  ctx.drawImage(imgElement, 0, 0, width, height)
                  canvas.toBlob((blob) => {
                    if (blob) {
                      resolve(new File([blob], img.file.name, { type: 'image/jpeg' }))
                    } else {
                      resolve(img.file)
                    }
                  }, 'image/jpeg', 0.85)
                }
                imgElement.onerror = () => resolve(img.file)
                imgElement.src = URL.createObjectURL(img.file)
              })
            }

            const formData = new FormData()
            formData.append('file', fileToUpload)
            formData.append('api_key', apiKey)
            formData.append('timestamp', timestamp.toString())
            formData.append('signature', signature)

            const cloudRes = await fetch(
              `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
              { method: 'POST', body: formData, signal }
            ).catch(e => {
              throw new Error(`Upload Cloudinary timeout/gagal: ${e.message}`)
            })
            
            if (!cloudRes.ok) {
              const errText = await cloudRes.text()
              throw new Error(`Gagal upload foto "${img.file.name}": ${errText}`)
            }
            const cloudData = await cloudRes.json()
            uploadedPublicIds.push(cloudData.public_id)
            
            uploadedPhotos[index] = {
              image_url: cloudData.secure_url,
              public_id: cloudData.public_id,
              bytes: cloudData.bytes,
              format: cloudData.format,
              original_filename: cloudData.original_filename,
              license_type: img.license_type,
              exif: img.exif,
              show_watermark: img.show_watermark !== false,
              is_cover: img.id === coverPhotoId
            }
            
            completedCount++
            setUploadProgress(`Mengunggah foto... (${completedCount}/${images.length} selesai)`)
            break // sukses, keluar dari loop retry
          } catch (err: any) {
            attempts++
            if (err.name === 'AbortError' || err.message === 'Dibatalkan oleh pengguna' || attempts >= maxAttempts) throw err
            console.warn(`Retry upload ${img.file.name} (${attempts}/${maxAttempts})...`)
            await new Promise(r => setTimeout(r, 2000)) // delay 2 detik sebelum retry
          }
        }
      }

      // Execute worker dengan limit max 2 barengan (biar aman di HP)
      let workerIndex = 0
      const executeNextWorker = async (): Promise<void> => {
        if (workerIndex >= images.length) return
        const currentIndex = workerIndex++
        await uploadWorker(images[currentIndex], currentIndex)
        return executeNextWorker()
      }
      const workers = Array.from({ length: Math.min(2, images.length) }, () => executeNextWorker())
      await Promise.all(workers)
      setUploadProgress('Menyimpan data ke database...')
      if (signal.aborted) throw new Error('Dibatalkan oleh pengguna')

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
          status
        })
        .select('id')
        .single()

      if (postError || !postData) throw postError
      if (signal.aborted) throw new Error('Dibatalkan oleh pengguna')

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
            show_watermark: photo.show_watermark !== false,
            is_cover: photo.is_cover,
            sort_order: i,
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

      setUploadState('success')
    } catch (err: any) {
      console.error('Upload error:', err)
      
      if (err.name === 'AbortError' || err.message === 'Dibatalkan oleh pengguna') {
        toast.info('Upload dibatalkan.')
        setUploadState('idle')
      } else {
        const message = err?.message?.includes('10MB') || err?.message?.includes('File size')
          ? 'Foto terlalu besar! Maksimal 10MB per foto.'
          : err?.message || 'Gagal upload. Coba lagi.'
        setUploadErrorMsg(message)
        setUploadState('error')
      }
      
      // Rollback: hapus foto yang udah telanjur naik ke Cloudinary
      if (uploadedPublicIds.length > 0) {
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
    }
  }

  return (
    <>
      <form onSubmit={handleUpload} className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-8 relative">
        {/* Kolom Kiri: Meta Data Post */}
      <div className="lg:col-span-1 space-y-4 md:space-y-6">
        <Card className="bg-surface border-border/40 shadow-sm overflow-visible">
          <CardHeader className="p-4 pb-0 md:p-6 md:pb-6">
            <CardTitle className="text-text-main font-heading text-xl md:text-2xl">Detail Momen</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-4 md:p-6 space-y-3 md:space-y-4">
            <div className="space-y-1.5 md:space-y-2">
              <Label className="text-text-muted">Judul Momen</Label>
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
              <Label className="text-text-muted text-xs md:text-sm">Override Lensa (Opsional)</Label>
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
                className="bg-background border-border/50 text-text-main focus:border-primary-neutral h-9 md:h-10 text-[13px] md:text-sm"
              />
              <p className="text-[10px] md:text-xs text-text-muted/70">Otomatis menimpa data lensa semua foto di bawah.</p>
            </div>
            <div className="space-y-1.5 md:space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-text-muted text-xs md:text-sm">Album / Koleksi</Label>
                {!isCreatingCollection && (
                  <button 
                    type="button" 
                    onClick={() => setIsCreatingCollection(true)}
                    className="text-xs flex items-center gap-1 text-primary-neutral hover:text-primary-neutral/80"
                  >
                    <Plus size={14} /> Buat Baru
                  </button>
                )}
              </div>
              
              {isCreatingCollection ? (
                <div className="flex items-center gap-2">
                  <Input 
                    value={newCollectionName} 
                    onChange={(e) => setNewCollectionName(e.target.value)}
                    placeholder="Nama koleksi baru..."
                    className="bg-background border-border/50 text-text-main h-9 md:h-10 text-[13px] md:text-sm"
                    autoFocus
                  />
                  <Button 
                    type="button"
                    disabled={!newCollectionName.trim()}
                    onClick={async () => {
                      if (!newCollectionName.trim()) return
                      try {
                        const { data, error } = await supabase
                          .from('collections')
                          .insert({ name: newCollectionName.trim() })
                          .select('id, name')
                          .single()
                        if (error) throw error
                        setAvailableCollections(prev => [...prev, data].sort((a,b) => a.name.localeCompare(b.name)))
                        setAlbum(data.id)
                        setIsCreatingCollection(false)
                        setNewCollectionName('')
                        toast.success('Koleksi baru ditambahkan!')
                      } catch (err: any) {
                        toast.error('Gagal membuat koleksi')
                      }
                    }}
                    className="bg-primary-neutral text-surface hover:bg-primary-neutral/90 h-10 px-4"
                  >
                    Simpan
                  </Button>
                  <Button type="button" variant="ghost" onClick={() => setIsCreatingCollection(false)} className="h-10 px-3 border border-border/50 text-text-main hover:bg-border/30">
                    Batal
                  </Button>
                </div>
              ) : (
                <CustomSelect
                  value={album}
                  onChange={setAlbum}
                  options={[
                    { value: '', label: '-- Tanpa Koleksi --' },
                    ...availableCollections.map(c => ({ value: c.id, label: c.name }))
                  ]}
                  placeholder="Pilih koleksi..."
                />
              )}
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
              <TagInput 
                tags={tags} 
                setTags={setTags} 
                availableTags={availableTags} 
              />
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
                  <span className="font-semibold text-text-main">Klik untuk upload</span> atau drag and drop
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
                      if (e.target.checked) setSelectedPhotos(images.map(img => img.id))
                      else setSelectedPhotos([])
                    }}
                    className="w-4 h-4 rounded border-border/50 bg-background accent-primary-neutral cursor-pointer"
                  />
                  <span className="text-sm text-text-muted font-medium">
                    Pilih Semua ({selectedPhotos.length}/{images.length})
                  </span>
                </label>
              </div>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 md:gap-3 w-full sm:w-auto">
                <Input 
                  value={bulkCopyrightName} 
                  onChange={(e) => setBulkCopyrightName(e.target.value)}
                  placeholder="Masukkan Nama"
                  className="bg-background border-border/50 text-text-main focus:border-primary-neutral h-9 w-full sm:w-40 text-[13px] md:text-sm"
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
                    setImages(prev => prev.map(img => 
                      selectedPhotos.includes(img.id) ? { ...img, license_type: bulkLicense, exif: { ...img.exif, copyright_name: bulkCopyrightName || img.exif.copyright_name } } : img
                    ))
                    setSelectedPhotos([])
                  }}
                  className="bg-primary-neutral hover:bg-primary-neutral/90 text-surface h-9 text-sm px-4 shrink-0"
                >
                  Terapkan
                </Button>
              </div>
            </Card>

            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
              {images.map((img, idx) => (
                <Card 
                  key={img.id} 
                  draggable
                  onDragStart={(e) => handleCardDragStart(e, idx)}
                  onDragEnter={(e) => handleCardDragEnter(e, idx)}
                  onDragEnd={handleCardDragEnd}
                  onDragOver={(e) => e.preventDefault()}
                  className={`bg-surface border-2 overflow-visible group relative shadow-sm transition-colors cursor-move flex flex-col ${
                    selectedPhotos.includes(img.id) ? 'border-primary-neutral/60' : 'border-border/40 hover:border-primary-neutral/30'
                  }`}
                  onClick={() => {
                    setSelectedPhotos(prev => 
                      prev.includes(img.id) ? prev.filter(id => id !== img.id) : [...prev, img.id]
                    )
                  }}
                >
                  {/* Checkbox Overlay */}
                  <div className="absolute top-2 left-2 z-10 bg-background/80 p-1 rounded-lg backdrop-blur-sm border border-border/50">
                    <input 
                      type="checkbox" 
                      checked={selectedPhotos.includes(img.id)}
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

                  <div className="h-32 md:h-48 w-full relative shrink-0 overflow-hidden rounded-t-[10px]">
                    <img src={img.preview} alt="preview" className="absolute inset-0 w-full h-full object-cover pointer-events-none" />
                  </div>
                  <div className="p-3 md:p-4 bg-surface text-xs text-text-muted space-y-2 border-t border-border/40 flex-1 flex flex-col justify-between rounded-b-[10px]">
                    <div className="flex flex-col xl:flex-row xl:justify-between items-start gap-1 md:gap-2">
                      <div className="font-medium text-text-main truncate w-full" title={img.file.name}>{img.file.name}</div>
                      <span className="shrink-0 inline-flex items-center rounded-full bg-primary-neutral/10 px-2 py-0.5 text-[9px] md:text-[10px] font-medium text-primary-neutral border border-primary-neutral/20">
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
                      className="flex items-center gap-2 cursor-pointer select-none mt-1 group"
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
                        className="w-3.5 h-3.5 rounded border-border/50 bg-background accent-primary-neutral cursor-pointer pointer-events-auto"
                      />
                      <span className="text-[11px] text-text-muted group-hover:text-text-main transition-colors">Tampilkan watermark</span>
                    </label>

                    <div className="pt-1 space-y-0.5 md:space-y-1 text-[9px] md:text-[10px] leading-tight">
                      {img.exif.camera && <p className="truncate">📷 {img.exif.camera} {img.exif.lens}</p>}
                      {img.exif.aperture && (
                        <p className="truncate">⚙️ {img.exif.focal_length} • {img.exif.aperture} • {img.exif.shutter_speed} • {img.exif.iso}</p>
                      )}
                      {!img.exif.camera && <p className="text-yellow-500/80">⚠️ Tanpa EXIF</p>}
                    </div>
                  </div>
                  </Card>
            ))}
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-center sm:justify-end gap-4 pt-4 pb-12 md:pb-4 w-full">
          <label className="flex items-center gap-2 cursor-pointer order-2 sm:order-1 bg-surface border border-border/50 px-3 py-2 rounded-lg shadow-sm hover:border-primary-neutral/40 transition-colors w-full sm:w-auto">
            <input 
              type="checkbox" 
              checked={useCompression} 
              onChange={(e) => setUseCompression(e.target.checked)} 
              className="w-4 h-4 rounded border-border/50 accent-primary-neutral shrink-0" 
            />
            <span className="text-sm text-text-muted font-medium whitespace-nowrap">Kompres Resolusi (upload lebih Cepat)</span>
          </label>
          <Button 
            type="submit" 
            disabled={uploadState !== 'idle' || images.length === 0} 
            className="w-full sm:w-auto bg-primary-neutral hover:bg-primary-neutral/90 text-surface h-12 md:h-10 text-base md:text-sm shadow-md order-1 sm:order-2 shrink-0 px-8"
          >
            Publish Momen
          </Button>
        </div>
      </div>
    </form>

    {/* OVERLAY LOADING BESAR */}
    {uploadState !== 'idle' && (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
        <Card className="w-full max-w-md bg-surface border-border/40 shadow-xl overflow-hidden animate-in zoom-in-95 duration-200">
          <CardContent className="p-8 flex flex-col items-center text-center space-y-6">
            {uploadState === 'uploading' && (
              <>
                <Loader2 className="w-16 h-16 animate-spin text-primary-neutral" />
                <div>
                  <h3 className="text-xl font-heading font-bold text-text-main mb-2">Memproses Upload</h3>
                  <p className="text-sm text-text-muted">{uploadProgress || 'Mohon tunggu sebentar...'}</p>
                </div>
                <Button 
                  type="button"
                  variant="outline" 
                  onClick={() => abortControllerRef.current?.abort()}
                  className="mt-4 border-danger/50 text-danger hover:bg-danger/10 hover:text-danger w-full max-w-[200px]"
                >
                  Batal
                </Button>
              </>
            )}
            {uploadState === 'success' && (
              <>
                <CheckCircle2 className="w-16 h-16 text-success" />
                <div>
                  <h3 className="text-xl font-heading font-bold text-text-main mb-2">Upload Sukses!</h3>
                  <p className="text-sm text-text-muted">Momen berhasil disimpan dan dipublikasikan.</p>
                </div>
                <Button 
                  type="button"
                  onClick={() => router.push('/admin/gallery')}
                  className="mt-4 bg-primary-neutral hover:bg-primary-neutral/90 text-surface px-8 w-full max-w-[200px]"
                >
                  Oke
                </Button>
              </>
            )}
            {uploadState === 'error' && (
              <>
                <AlertCircle className="w-16 h-16 text-danger" />
                <div>
                  <h3 className="text-xl font-heading font-bold text-text-main mb-2">Upload Gagal</h3>
                  <p className="text-sm text-text-muted">{uploadErrorMsg}</p>
                </div>
                <Button 
                  type="button"
                  onClick={() => setUploadState('idle')}
                  className="mt-4 bg-surface border border-border/50 text-text-main hover:bg-hover-bg px-8 w-full max-w-[200px]"
                >
                  Tutup
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    )}
    </>
  )
}
