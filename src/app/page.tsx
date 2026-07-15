import { createClient } from '@/lib/supabase/server'
import { Navbar } from '@/components/layout/Navbar'
import { HomeClient } from '@/components/home/HomeClient'

const POSTS_PER_PAGE = 9

export default async function HomePage() {
  const supabase = await createClient()

  // Fetch initial page of posts di server (SEO-friendly)
  const { data: postsData, count } = await supabase
    .from('posts')
    .select(`
      id, title, slug, location,
      collections (name),
      photos (image_url, is_cover)
    `, { count: 'exact' })
    .eq('status', 'Published')
    .order('created_at', { ascending: false })
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
      <Navbar />
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
