import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { getOptimizedImageUrl } from '@/lib/utils'
import { ArrowLeft, Image as ImageIcon } from 'lucide-react'

export async function generateMetadata() {
  const supabase = await createClient()
  const { data: settings } = await supabase.from('site_settings').select('site_title').limit(1).single()
  const siteTitle = settings?.site_title || 'Jurnal Visual'
  
  return {
    title: 'Albums',
    description: 'Koleksi foto dan album',
    openGraph: {
      title: 'Albums',
      description: 'Koleksi foto dan album',
    }
  }
}

export default async function AlbumsPage() {
  const supabase = await createClient()

  const { data: settings } = await supabase.from('site_settings').select('theme_config').limit(1).single()
  const enableWatermark = settings?.theme_config?.enable_watermark !== false

  // Ambil daftar koleksi
  const { data: collectionsData } = await supabase
    .from('collections')
    .select('id, name, description')
    .order('name', { ascending: true })

  // Ambil semua postingan yang punya koleksi untuk mendapatkan cover dan jumlah
  const { data: postsData } = await supabase
    .from('posts')
    .select(`
      collection_id,
      photos (image_url, is_cover, copyright_name)
    `)
    .eq('status', 'Published')
    .not('collection_id', 'is', null)

  const collections = collectionsData || []
  const posts = postsData || []

  // Gabungkan data
  const albums = collections.map(col => {
    const colPosts = posts.filter(p => p.collection_id === col.id)
    
    // Cari cover: cari post dengan photo is_cover = true, kalau gak ada ambil foto pertama dari post pertama
    let coverUrl = null
    let copyrightName = null
    for (const post of colPosts) {
      const coverPhoto = post.photos?.find((p: any) => p.is_cover)
      if (coverPhoto) {
        coverUrl = coverPhoto.image_url
        copyrightName = coverPhoto.copyright_name
        break
      }
    }
    if (!coverUrl && colPosts.length > 0 && colPosts[0].photos?.[0]) {
      coverUrl = colPosts[0].photos[0].image_url
      copyrightName = colPosts[0].photos[0].copyright_name
    }

    return {
      ...col,
      postCount: colPosts.length,
      coverUrl,
      copyrightName
    }
  })

  // Hanya tampilkan album yang memiliki postingan aktif (Published)
  const activeAlbums = albums.filter(a => a.postCount > 0)
  
  // Album kosong tidak akan ditampilkan di frontend publik
  const sortedAlbums = [...activeAlbums]

  return (
    <div className="bg-background text-text-main min-h-screen">
      <main className="container mx-auto px-6 py-12 md:py-20 mt-16 max-w-7xl">
        
        <div className="mb-10 md:mb-16 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <Link href="/" className="inline-flex items-center gap-2 text-text-muted hover:text-primary-neutral transition-colors mb-6 text-sm font-medium">
            <ArrowLeft className="w-4 h-4" />
            Kembali ke Semua Foto
          </Link>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading font-bold text-text-main tracking-tight mb-4">
            Albums
          </h1>
          <p className="text-lg md:text-xl text-text-muted max-w-2xl font-sans leading-relaxed">
            Eksplorasi cerita melalui koleksi dan momen yang diabadikan
          </p>
        </div>

        {sortedAlbums.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-text-muted animate-in fade-in duration-500">
            <ImageIcon className="w-16 h-16 mb-4 opacity-20" />
            <p>Belum ada album yang dibuat</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 lg:gap-8">
            {sortedAlbums.map((album, idx) => {
              const displayUrl = album.coverUrl ? getOptimizedImageUrl(album.coverUrl, 600, album.copyrightName, enableWatermark) : ''
              
              return (
                <Link 
                  href={`/collection/${album.id}`}
                  key={album.id}
                  className="group block animate-in fade-in slide-in-from-bottom-8 duration-700 fill-mode-both"
                  style={{ animationDelay: `${idx * 100}ms` }}
                >
                  <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-surface mb-4 border border-border/50 shadow-sm transition-all duration-300 group-hover:shadow-xl group-hover:-translate-y-1">
                    {displayUrl ? (
                      <img 
                        src={displayUrl} 
                        alt={album.name} 
                        className="w-full h-full object-contain transition-transform duration-700 ease-out group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-text-muted/50 bg-background/50">
                        <ImageIcon className="w-10 h-10 mb-2" />
                        <span className="text-xs font-medium uppercase tracking-widest">Kosong</span>
                      </div>
                    )}
                    
                    {/* Overlay Gradient (Mobile Style Folder) */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60 transition-opacity duration-300 group-hover:opacity-80"></div>
                    
                    {/* Badge Jumlah Post/judul */}
                    <div className="absolute top-3 right-3 bg-background/80 backdrop-blur-md px-2.5 py-1 rounded-full border border-border/50">
                      <span className="text-[10px] font-bold text-text-main">{album.postCount} Post</span>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-heading text-lg font-bold text-text-main group-hover:text-primary-neutral transition-colors line-clamp-1">
                      {album.name}
                    </h3>
                    {album.description && (
                      <p className="text-sm text-text-muted mt-1 line-clamp-1">
                        {album.description}
                      </p>
                    )}
                  </div>
                </Link>
              )
            })}
          </div>
        )}

      </main>
    </div>
  )
}
