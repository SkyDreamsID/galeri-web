import { NextResponse } from 'next/server'
import { v2 as cloudinary } from 'cloudinary'
import { createClient } from '@/lib/supabase/server'

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export async function POST(request: Request) {
  try {
    const supabase = await createClient()

    // Proteksi Keamanan: Cek apakah user yang request adalah Admin terautentikasi
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { postId } = await request.json()
    if (!postId) {
      return NextResponse.json({ error: 'Post ID is required' }, { status: 400 })
    }

    // 1. Tarik semua data photo milik post ini untuk mendapatkan public_id Cloudinary
    const { data: photos, error: fetchError } = await supabase
      .from('photos')
      .select('public_id')
      .eq('post_id', postId)

    if (fetchError) {
      console.error('Fetch photos error:', fetchError)
      return NextResponse.json({ error: 'Failed to fetch associated photos' }, { status: 500 })
    }

    // 2. Hapus aset media secara fisik di Cloudinary
    if (photos && photos.length > 0) {
      try {
        const deletePromises = photos.map(async (photo) => {
          return new Promise((resolve, reject) => {
            cloudinary.uploader.destroy(photo.public_id, (error: any, result: any) => {
              if (error) {
                console.error(`Failed to delete ${photo.public_id} from Cloudinary:`, error)
                reject(error)
              } else {
                resolve(result)
              }
            })
          })
        })
        
        await Promise.all(deletePromises)
      } catch (cloudErr: any) {
        console.error('Cloudinary deletion failed:', cloudErr)
        return NextResponse.json({ 
          error: `Storage Failure: Gagal menghapus media di Cloudinary (${cloudErr?.message || 'Network/API error'}). Database tidak diubah.` 
        }, { status: 500 })
      }
    }

    // 3. Hapus data di Supabase (CASCADE akan otomatis menghapus di tabel photos & exif_data)
    const { error: deleteError } = await supabase
      .from('posts')
      .delete()
      .eq('id', postId)

    if (deleteError) {
      console.error('Supabase delete post error:', deleteError)
      return NextResponse.json({ error: `Database Failure: Gagal menghapus data momen (${deleteError.message})` }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: 'Momen dan semua aset media berhasil dihapus.' })
  } catch (error) {
    console.error('Delete handler crash:', error)
    return NextResponse.json({ error: 'Terjadi kesalahan sistem internal' }, { status: 500 })
  }
}
