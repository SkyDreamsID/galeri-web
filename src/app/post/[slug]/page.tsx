import { createClient } from '@/lib/supabase/server'
import { Navbar } from '@/components/public/Navbar'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { EmblaCarousel } from '@/components/public/EmblaCarousel'

export default async function PostDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const supabase = await createClient()

  // Ambil detail postingan berdasarkan slug
  const { data: post, error } = await supabase
    .from('posts')
    .select(`
      id, title, story, location, created_at, license_type, slug,
      collections (name),
      post_tags ( tags (name) ),
      photos (
        id, image_url, sort_order,
        exif_data (camera, lens, focal_length, aperture, iso, shutter_speed, date_taken)
      )
    `)
    .eq('slug', slug)
    .single()

  // Backward compatibility: jika slug tidak ketemu, coba cari berdasarkan ID
  let finalPost = post
  if (error || !post) {
    const { data: postById, error: errById } = await supabase
      .from('posts')
      .select(`
        id, title, story, location, created_at, license_type, slug,
        collections (name),
        post_tags ( tags (name) ),
        photos (
          id, image_url, sort_order,
          exif_data (camera, lens, focal_length, aperture, iso, shutter_speed, date_taken)
        )
      `)
      .eq('id', slug)
      .single()
      
    if (errById || !postById) {
      notFound()
    }
    finalPost = postById
  }

  // Sortir foto berdasarkan sort_order
  const photos = finalPost.photos?.sort((a: any, b: any) => a.sort_order - b.sort_order) || []

  return (
    <>
      <Navbar />
      <main className="container mx-auto max-w-5xl px-4 md:px-8 py-10 md:py-16">
        {/* Header Area */}
        <div className="mb-10">
          <Link href="/" className="inline-flex items-center text-sm font-medium text-text-muted hover:text-text-main transition-colors mb-6">
            &larr; Kembali ke Galeri
          </Link>
          {finalPost.collections?.name && (
            <div className="text-[11px] font-semibold uppercase tracking-widest text-text-muted mb-3">
              {finalPost.collections.name}
            </div>
          )}
          <h1 className="text-3xl md:text-5xl font-heading font-bold text-text-main mb-4 leading-tight">
            {finalPost.title}
          </h1>
          <div className="flex flex-wrap items-center gap-4 text-sm text-text-muted font-sans">
            {finalPost.location && <span>📍 {finalPost.location}</span>}
            <span>🗓️ {new Date(finalPost.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
          </div>
        </div>

        {/* Carousel Area */}
        <div className="mb-12">
          <EmblaCarousel photos={photos} />
        </div>

        {/* Info & Story Area */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {/* Story */}
          <div className="md:col-span-2 space-y-6">
            <h3 className="font-heading text-xl font-bold text-text-main">Cerita di Balik Lensa</h3>
            {finalPost.story ? (
              <p className="text-text-main leading-relaxed font-sans whitespace-pre-line text-[15px]">
                {finalPost.story}
              </p>
            ) : (
              <p className="text-text-muted italic text-[15px]">Tidak ada cerita yang dilampirkan untuk momen ini.</p>
            )}

            {/* Tags */}
            {finalPost.post_tags && finalPost.post_tags.length > 0 && (
              <div className="pt-6">
                <div className="flex flex-wrap gap-2">
                  {finalPost.post_tags.map((pt: any, idx: number) => (
                    <span key={idx} className="px-3 py-1.5 bg-surface border border-border text-xs font-medium text-text-muted rounded-full">
                      #{pt.tags.name}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Meta Sidebar */}
          <div className="space-y-6">
            <div className="bg-surface p-5 rounded-[16px] border border-border shadow-sm">
              <h3 className="font-heading text-xs font-bold text-text-muted uppercase tracking-wider mb-2">Lisensi Penggunaan</h3>
              <p className="text-[14px] font-medium text-text-main">
                {finalPost.license_type || 'Copyright'}
              </p>
            </div>
            
            {/* Download Button (Optional based on license) */}
            {finalPost.license_type !== 'Copyright' && photos.length > 0 && (
              <div>
                <a 
                  href={photos[0]?.image_url} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="block w-full text-center px-4 py-3.5 bg-primary-neutral hover:bg-hover-bg hover:text-text-main text-white font-medium rounded-xl transition-colors shadow-sm"
                >
                  Unduh Resolusi Penuh
                </a>
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  )
}
