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

    const { data: post, error: getError } = await supabase
      .from('posts')
      .select('views')
      .eq('id', postId)
      .single()

    if (getError) throw getError

    const newViews = (post.views || 0) + 1

    const { error: updateError } = await supabase
      .from('posts')
      .update({ views: newViews })
      .eq('id', postId)

    if (updateError) throw updateError

    return NextResponse.json({ success: true, views: newViews })
  } catch (error) {
    console.error('Failed to update views:', error)
    return NextResponse.json({ error: 'Failed to update views' }, { status: 500 })
  }
}
