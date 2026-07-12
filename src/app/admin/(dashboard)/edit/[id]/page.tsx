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
  exif: {
    camera?: string
    lens?: string
    focal_length?: string
    aperture?: string
    iso?: string
    shutter_speed?: string
    date_taken?: string
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
  const [license, setLicense] = useState('Copyright')
  const [images, setImages] = useState<FileWithExif[]>([])
  const [isDragging, setIsDragging] = useState(false)

  // Track deleted existing photos
  const [deletedPhotos, setDeletedPhotos] = useState<{ id: string; public_id: string }[]>([])

  useEffect(() => {
    const loadPostData = async () => {
      try {
        // 1. Fetch Post, Collection, and Photos
        const { data: post, error: postErr } = await supabase
          .from('posts')
          .select(`
            id, title, story, location, license_type,
            collections (name),
            photos (
              id, image_url, public_id, sort_order, bytes, format, original_filename,
              exif_data (camera, lens, focal_length, aperture, iso, shutter_speed, date_taken)
            )
          `)
          .eq('id', postId)
          .single()

        if (postErr || !post) throw postErr || new Error('Momen tidak ditemukan')

        setTitle(post.title)
        setStory(post.story || '')
        setLocation(post.location || '')
        setAlbum(post.collections?.name || '')
        setLicense(post.license_type || 'Copyright')

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
              exif: {
                camera: exif.camera || undefined,
                lens: exif.lens || undefined,
                focal_length: exif.focal_length || undefined,
                aperture: exif.aperture || undefined,
                iso: exif.iso || undefined,
                shutter_speed: exif.shutter_speed || undefined,
                date_taken: exif.date_taken || undefined,
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

        return { file, preview: URL.createObjectURL(file), exif: exifData }
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
            
            if (!cloudRes.ok) throw new Error('Cloudinary upload failed')
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
      let collectionId = null
      if (album.trim()) {
        const { data: existingCol } = await supabase
          .from('collections')
          .select('id')
          .eq('name', album.trim())
          .maybeSingle()

        if (existingCol) {
          collectionId = existingCol.id
        } else {
          const { data: newCol } = await supabase
            .from('collections')
            .insert({ name: album.trim() })
            .select('id')
            .single()
          if (newCol) collectionId = newCol.id
        }
      }

      // 4. Update Post
      const { error: postUpdateErr } = await supabase
        .from('posts')
        .update({
          title,
          story,
          location,
          collection_id: collectionId,
          license_type: license,
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
            is_cover: remainingExistingCount === 0 && i === 0, // Cover jika tidak ada foto lama tersisa
            sort_order: remainingExistingCount + i
          })
          .select('id')
          .single()

        if (photoError || !photoData) throw photoError

        const hasExif = Object.values(photo.exif).some(val => val !== undefined)
        if (hasExif) {
          await supabase.from('exif_data').insert({
            photo_id: photoData.id,
            ...photo.exif
          })
        }
      }

      alert('Momen berhasil diperbarui!')
      router.push('/admin/gallery')
    } catch (err) {
      console.error(err)
      alert('Gagal menyimpan perubahan. Cek console.')
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
          <Button variant="outline" size="icon" className="bg-zinc-900 border-zinc-800 hover:bg-zinc-800 text-white">
            <ArrowLeft size={18} />
          </Button>
        </Link>
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-white">Edit Momen</h2>
          <p className="text-zinc-400 mt-1">Ubah cerita, lokasi, tag, atau foto pada momen ini.</p>
        </div>
      </div>

      <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left column: metadata */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader>
              <CardTitle className="text-white">Detail Momen</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="text-zinc-300">Judul Momen</Label>
                <Input 
                  value={title} onChange={(e) => setTitle(e.target.value)}
                  placeholder="Misal: Senja di Stasiun Tugu" required
                  className="bg-zinc-950 border-zinc-800 text-white"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-zinc-300">Lokasi (Opsional)</Label>
                <Input 
                  value={location} onChange={(e) => setLocation(e.target.value)}
                  placeholder="Yogyakarta"
                  className="bg-zinc-950 border-zinc-800 text-white"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-zinc-300">Album / Koleksi</Label>
                <Input 
                  value={album} onChange={(e) => setAlbum(e.target.value)}
                  placeholder="Misal: Trip Jepang 2026"
                  className="bg-zinc-950 border-zinc-800 text-white"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-zinc-300">Tags</Label>
                <TagInput tags={tags} setTags={setTags} placeholder="Ketik tag & enter" />
              </div>
              <div className="space-y-2">
                <Label className="text-zinc-300">Cerita / Deskripsi</Label>
                <textarea 
                  value={story} onChange={(e) => setStory(e.target.value)}
                  placeholder="Tulis cerita di balik foto ini..."
                  className="w-full min-h-[120px] rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-zinc-700"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-zinc-300">Lisensi Gambar</Label>
                <select 
                  value={license} onChange={(e) => setLicense(e.target.value)}
                  className="w-full rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-zinc-700"
                >
                  <option value="Copyright">Copyright (Tidak boleh diunduh)</option>
                  <option value="Free Copyright">Free Copyright (Bebas diunduh)</option>
                  <option value="CC BY">CC BY (Atribusi)</option>
                  <option value="CC BY-SA">CC BY-SA (Atribusi-BerbagiSerupa)</option>
                  <option value="CC BY-NC">CC BY-NC (Atribusi-NonKomersial)</option>
                </select>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right column: photos */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="bg-zinc-900 border-zinc-800 border-dashed">
            <CardContent className="p-8">
              <label 
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
                  isDragging ? 'border-blue-500 bg-blue-500/10' : 'border-zinc-800 bg-zinc-950 hover:bg-zinc-900'
                }`}
              >
                <div className="flex flex-col items-center justify-center pt-5 pb-6 pointer-events-none">
                  <UploadCloud className="w-10 h-10 mb-3 text-zinc-500" />
                  <p className="mb-2 text-sm text-zinc-400">
                    <span className="font-semibold text-white">Klik untuk tambah foto</span> atau drag and drop
                  </p>
                  <p className="text-xs text-zinc-500">JPG, PNG (Bisa multi-upload)</p>
                </div>
                <input type="file" className="hidden" multiple accept="image/*" onChange={handleFileChange} />
              </label>
            </CardContent>
          </Card>

          {/* Preview Area */}
          {images.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {images.map((img, idx) => (
                <Card key={idx} className="bg-zinc-900 border-zinc-800 overflow-hidden group relative">
                  <button 
                    type="button" 
                    onClick={() => removeImage(idx)}
                    className="absolute top-2 right-2 bg-red-500/80 p-1.5 rounded-md hover:bg-red-500 z-10 transition-colors"
                  >
                    <X size={16} className="text-white" />
                  </button>
                  <div className="h-48 w-full relative">
                    <img src={img.preview} alt="preview" className="absolute inset-0 w-full h-full object-cover" />
                  </div>
                  <div className="p-4 bg-zinc-900 text-xs text-zinc-400 space-y-1">
                    <div className="font-medium text-white mb-2 truncate">
                      {img.file ? img.file.name : 'Foto Tersimpan'}
                    </div>
                    {img.exif.camera && <p>📷 {img.exif.camera} {img.exif.lens}</p>}
                    {img.exif.aperture && (
                      <p>⚙️ {img.exif.focal_length} • {img.exif.aperture} • {img.exif.shutter_speed} • {img.exif.iso}</p>
                    )}
                    {!img.exif.camera && <p className="text-yellow-500/80">⚠️ Data EXIF tidak terdeteksi</p>}
                  </div>
                </Card>
              ))}
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4">
            <Link href="/admin/gallery">
              <Button type="button" variant="outline" className="bg-zinc-900 border-zinc-800 text-white hover:bg-zinc-800">
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
