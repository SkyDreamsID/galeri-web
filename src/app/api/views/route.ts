import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { headers } from 'next/headers'

const rateLimitMap = new Map<string, { count: number, resetAt: number }>()

function isRateLimited(ip: string): boolean {
  const now = Date.now()
  const limit = 5
  const windowMs = 60 * 1000

  if (!rateLimitMap.has(ip)) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + windowMs })
    return false
  }

  const record = rateLimitMap.get(ip)!
  if (now > record.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + windowMs })
    return false
  }

  if (record.count >= limit) {
    return true
  }

  record.count += 1
  return false
}

export async function POST(request: Request) {
  try {
    const bodyText = await request.text()
    if (!bodyText) {
      return NextResponse.json({ error: 'Post ID is required' }, { status: 400 })
    }
    const { postId } = JSON.parse(bodyText)
    
    if (!postId) {
      return NextResponse.json({ error: 'Post ID is required' }, { status: 400 })
    }

    const supabase = await createClient()

    // Rate Limiting (Kecuali Admin)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      const headersList = await headers()
      const ip = headersList.get('x-forwarded-for') || headersList.get('x-real-ip') || 'unknown'
      
      if (ip !== 'unknown' && isRateLimited(ip)) {
        return NextResponse.json({ error: 'Too Many Requests' }, { status: 429 })
      }
    }

    // Pakai RPC untuk bypass RLS (karena user publik tidak punya akses UPDATE)
    const { error } = await supabase.rpc('increment_views', { row_id: postId })

    if (error) {
      console.error('RPC Error:', error)
      throw error
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to update views:', error)
    return NextResponse.json({ error: 'Failed to update views' }, { status: 500 })
  }
}
