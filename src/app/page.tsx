import { createClient } from '@/lib/supabase/server'
import { Navbar } from '@/components/layout/Navbar'
import { HomeClient } from '@/components/home/HomeClient'

const POSTS_PER_PAGE = 9

export default async function HomePage({ searchParams }: { searchParams: Promise<{ sort?: string, tag?: string }> }) {
  const { sort, tag } = await searchParams
  const supabase = await createClient()

  // Tentukan order berdasarkan parameter sort
  let orderColumn = 'created_at'
  let isAscending = false
  
  if (sort === 'oldest') {
    orderColumn = 'created_at'
    isAscending = true
  } else if (sort === 'az') {
    orderColumn = 'title'
    isAscending = true
  } else if (sort === 'za') {
    orderColumn = 'title'
    isAscending = false
  }

  // Fetch initial page of posts di server (SEO-friendly)
  let query = supabase
    .from('posts')
    .select(`
      id, title, slug, location, created_at,
      collections (name),
      photos (image_url, is_cover, copyright_name, show_watermark)
      ${tag ? ', post_tags!inner(tags!inner(name))' : ''}
    `, { count: 'exact' })
    .eq('status', 'Published')
    
  if (tag) {
    query = query.eq('post_tags.tags.name', tag)
  }

  const { data: postsData, count } = await query
    .order(orderColumn, { ascending: isAscending })
    .range(0, POSTS_PER_PAGE - 1)

  // Fetch tags and collections that are used in Published posts
  const [{ data: rawTags }, { data: rawCollections }, { data: settings }] = await Promise.all([
    supabase.from('tags').select('id, name, post_tags!inner(posts!inner(status))').eq('post_tags.posts.status', 'Published').order('name'),
    supabase.from('collections').select('id, name, posts!inner(status)').eq('posts.status', 'Published').order('name'),
    supabase.from('site_settings').select('hero_title, hero_description').limit(1).single()
  ])

  // Mapping to clean format (remove the relational inner objects)
  const tagsData = (rawTags || []).map(t => ({ id: t.id, name: t.name }))
  const collectionsData = (rawCollections || []).map(c => ({ id: c.id, name: c.name }))

  const initialPosts = (postsData as any[]) || []
  const initialHasMore = !!(count && count > POSTS_PER_PAGE)

  return (
    <>
      <HomeClient
        initialPosts={initialPosts}
        initialHasMore={initialHasMore}
        tags={tagsData || []}
        collections={collectionsData || []}
        heroTitle={settings?.hero_title || 'Jurnal Visual'}
        heroDesc={settings?.hero_description || 'Ruang untuk menyimpan momen, membagikan cerita dan mendokumentasikan perjalanan melalui lensa.'}
      />
    </>
  )
}
