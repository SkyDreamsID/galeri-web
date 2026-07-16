import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  try {
    const { postId } = await request.json()

    if (postId) {
      const supabase = await createClient()
      
      const { error } = await supabase.rpc('increment_downloads', { row_id: postId })
      
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
