import { NextRequest, NextResponse } from 'next/server'
import { v2 as cloudinary } from 'cloudinary'

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
})

// Endpoint untuk menghapus satu atau banyak foto dari Cloudinary (dipakai untuk rollback)
export async function POST(req: NextRequest) {
  try {
    const { public_ids } = await req.json()

    if (!public_ids || !Array.isArray(public_ids) || public_ids.length === 0) {
      return NextResponse.json({ error: 'public_ids harus berupa array' }, { status: 400 })
    }

    // Hapus semua foto sekaligus pakai delete_resources
    const result = await cloudinary.api.delete_resources(public_ids, {
      resource_type: 'image',
    })

    return NextResponse.json({ success: true, result })
  } catch (err: any) {
    console.error('Cloudinary bulk delete error:', err)
    return NextResponse.json({ error: err.message || 'Gagal menghapus dari Cloudinary' }, { status: 500 })
  }
}
