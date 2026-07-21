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
    const { postId } = await request.json()

    if (postId) {
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
      
      const { error } = await supabase.rpc('increment_shares', { row_id: postId })
      
      if (error) {
        console.error('RPC Error:', error)
        throw error
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
