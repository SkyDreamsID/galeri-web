import { NextResponse } from 'next/server'
import { v2 as cloudinary } from 'cloudinary'
import { createClient } from '@/lib/supabase/server'

// Tambahkan maxDuration agar tidak timeout saat upload file besar dari HP
export const maxDuration = 60 // detik

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
})

export async function POST(request: Request) {
  try {
    // 1. Verifikasi Session Admin
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 2. Parse FormData dari Client
    const formData = await request.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({ error: 'Tidak ada file yang dikirim' }, { status: 400 })
    }

    // 3. Konfigurasi ulang Cloudinary dari Settings Database (jika .env kosong)
    const { data: settings } = await supabase.from('site_settings').select('*').limit(1).single()
    if (settings?.cloudinary_cloud_name && settings?.cloudinary_api_key && settings?.cloudinary_api_secret) {
      cloudinary.config({
        cloud_name: settings.cloudinary_cloud_name,
        api_key: settings.cloudinary_api_key,
        api_secret: settings.cloudinary_api_secret,
        secure: true
      })
    }

    // 4. Simpan nama file asli sebelum upload
    const nameWithoutExt = file.name.substring(0, file.name.lastIndexOf('.')) || file.name

    // 5. Convert ke Buffer → upload via stream ke Cloudinary
    // Lebih ringan dari base64 (+33% ukuran) dan tidak perlu simpan ke disk
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    const result = await new Promise<any>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { resource_type: 'auto' },
        (error, result) => {
          if (error) return reject(error)
          resolve(result)
        }
      )
      uploadStream.end(buffer)
    })

    // 6. Pastikan original_filename terisi dari nama file asli
    if (!result.original_filename) {
      result.original_filename = nameWithoutExt
    }

    return NextResponse.json(result)
  } catch (error: any) {
    console.error('Relay Upload Error:', error)
    return NextResponse.json({ error: error.message || 'Gagal memproses upload media' }, { status: 500 })
  }
}
