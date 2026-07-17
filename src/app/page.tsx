import { createClient } from '@/lib/supabase/server'
import { Navbar } from '@/components/layout/Navbar'
import { HomeClient } from '@/components/home/HomeClient'

const POSTS_PER_PAGE = 9

export default async function HomePage({ searchParams }: { searchParams: Promise<{ sort?: string }> }) {
  const { sort } = await searchParams
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
  const { data: postsData, count } = await supabase
    .from('posts')
    .select(`
      id, title, slug, location, created_at,
      collections (name),
      photos (image_url, is_cover, copyright_name, show_watermark)
    `, { count: 'exact' })
    .eq('status', 'Published')
    .order(orderColumn, { ascending: isAscending })
    .range(0, POSTS_PER_PAGE - 1)

  // Fetch tags, collections, and settings
  const [{ data: tagsData }, { data: collectionsData }, { data: settings }] = await Promise.all([
    supabase.from('tags').select('id, name').order('name'),
    supabase.from('collections').select('id, name').order('name'),
    supabase.from('site_settings').select('hero_title, hero_description').limit(1).single()
  ])

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
