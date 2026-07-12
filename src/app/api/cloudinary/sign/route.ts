import { NextResponse } from 'next/server'
import { v2 as cloudinary } from 'cloudinary'
import { createClient } from '@/lib/supabase/server'

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

    // 2. Generate Signature
    const body = await request.json()
    const { paramsToSign } = body

    const signature = cloudinary.utils.api_sign_request(
      paramsToSign,
      process.env.CLOUDINARY_API_SECRET!
    )

    return NextResponse.json({ 
      signature,
      apiKey: process.env.CLOUDINARY_API_KEY
    })
  } catch (error) {
    console.error('Signature error:', error)
    return NextResponse.json({ error: 'Failed to generate signature' }, { status: 500 })
  }
}
