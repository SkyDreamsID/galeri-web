import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

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
