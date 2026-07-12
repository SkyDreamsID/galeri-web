import { createClient } from '@/lib/supabase/server'
import { Navbar } from '@/components/public/Navbar'
import Link from 'next/link'

export const revalidate = 60 // Revalidate cache every 60 seconds

export default async function Home() {
  const supabase = await createClient()

  // Ambil postingan publik
  const { data: posts, error } = await supabase
    .from('posts')
    .select(`
      id, title, slug, location,
      collections (name),
      photos (image_url, is_cover)
    `)
    .eq('status', 'Published')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Failed to fetch public posts:', error)
  }

  return (
    <>
      <Navbar />
      <main className="container mx-auto max-w-7xl px-4 md:px-8 py-12 md:py-20">
        <div className="mb-16">
          <h1 className="text-4xl md:text-5xl font-heading font-bold text-text-main tracking-tight mb-4">
            Jurnal Visual.
          </h1>
          <p className="text-lg text-text-muted max-w-2xl font-sans leading-relaxed">
            Kumpulan cerita dan memori yang ditangkap melalui lensa. Antarmuka minimalis untuk mengutamakan karya.
          </p>
        </div>

        {/* CSS Columns untuk gaya Masonry sederhana */}
        <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
          {posts?.map((post: any) => {
            const coverImage = post.photos?.find((p: any) => p.is_cover)?.image_url || post.photos?.[0]?.image_url
            
            return (
              <Link key={post.id} href={`/post/${post.slug || post.id}`} className="block group break-inside-avoid">
                <div className="bg-card rounded-[16px] overflow-hidden border border-border transition-all duration-250 ease-in-out hover:-translate-y-1" style={{ boxShadow: '0 6px 18px rgba(0,0,0,.04)' }}>
                  {coverImage ? (
                    <div className="relative w-full overflow-hidden bg-surface aspect-auto">
                      {/* Karena masonry butuh aspect ratio asli atau auto, kita pakai img standard */}
                      <img 
                        src={coverImage} 
                        alt={post.title} 
                        className="w-full h-auto object-cover transition-transform duration-500 ease-in-out group-hover:scale-[1.02]"
                        loading="lazy"
                      />
                    </div>
                  ) : (
                    <div className="w-full h-64 bg-surface flex items-center justify-center text-text-muted text-sm">
                      Tidak ada foto
                    </div>
                  )}
                  
                  <div className="p-5 bg-card">
                    {post.collections?.name && (
                      <div className="text-[11px] font-semibold uppercase tracking-widest text-text-muted mb-2">
                        {post.collections.name}
                      </div>
                    )}
                    <h2 className="font-heading text-lg font-bold text-text-main mb-1 group-hover:text-primary-neutral transition-colors">
                      {post.title}
                    </h2>
                    {post.location && (
                      <p className="text-sm text-text-muted">
                        {post.location}
                      </p>
                    )}
                  </div>
                </div>
              </Link>
            )
          })}
        </div>

        {posts?.length === 0 && (
          <div className="text-center py-32 text-text-muted">
            Belum ada momen yang dipublikasikan.
          </div>
        )}
      </main>
    </>
  )
}
