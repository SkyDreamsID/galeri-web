import { createClient } from '@/lib/supabase/server'
import { PlaygroundNavbar } from '../../_components/PlaygroundNavbar'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { EmblaCarousel } from '../_components/EmblaCarousel'

// =========================================================================
// 🛠️ PAPAN KONTROL UKURAN (Tinggal ganti di sini biar gampang utak-atik)
// =========================================================================
const LAYOUT_CONFIG = {
  // Ukuran Judul Postingan (HP: text-2xl, Tablet: text-4xl, Laptop: text-5xl)
  postTitle: "text-2xl md:text-4xl lg:text-5xl",
  // Ukuran Teks Sub-Judul Cerita
  storySubtitle: "text-lg md:text-xl lg:text-2xl",
  // Ukuran Teks Cerita (HP: text-sm, Tablet: text-[15px], Laptop: text-base)
  storyText: "text-sm md:text-[15px] lg:text-base",
};

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
        id, image_url, sort_order, copyright_name,
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
          id, image_url, sort_order, copyright_name,
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

  // Cari tanggal diambil dari EXIF foto pertama, fallback ke created_at
  const firstExifDate = photos[0]?.exif_data?.[0]?.date_taken
  const displayDate = firstExifDate ? new Date(firstExifDate) : new Date(finalPost.created_at)

  // Ambil semua copyright_name unik dari foto
  const uniqueCopyrights = Array.from(
    new Set(
      photos.map((p: any) => p.copyright_name).filter(Boolean)
    )
  )
  const displayCopyright = uniqueCopyrights.length > 0 
    ? uniqueCopyrights.join(', ') 
    : 'Rifki Eka Putra'

  return (
    <>
      <PlaygroundNavbar />
      <main className="container mx-auto max-w-5xl px-4 md:px-8 py-10 md:py-16">
        {/* Header Area */}
        <div className="mb-10">
          <Link href="/" className="inline-flex items-center gap-2 text-[10px] md:text-xs font-bold text-text-muted hover:text-text-main transition-colors uppercase tracking-widest mb-6 md:mb-8 group cursor-pointer select-none">
            <span className="transition-transform group-hover:-translate-x-1">←</span> Kembali ke Galeri
          </Link>
          {finalPost.collections?.name && (
            <div className="text-[11px] font-semibold uppercase tracking-widest text-text-muted mb-3">
              {finalPost.collections.name}
            </div>
          )}
          <h1 className={`${LAYOUT_CONFIG.postTitle} font-heading font-bold text-text-main mb-4 leading-tight`}>
            {finalPost.title}
          </h1>
          <div className="flex flex-wrap items-center gap-4 text-sm text-text-muted font-sans">
            {finalPost.location && <span>📍 {finalPost.location}</span>}
          </div>
        </div>

        {/* Carousel Area */}
        <div className="mb-12">
          <EmblaCarousel photos={photos} license={finalPost.license_type} />
        </div>

        {/* Info & Story Area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
          {/* Story */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex flex-wrap items-center gap-x-2.5 gap-y-2 text-[13px] md:text-sm text-text-muted font-sans mb-2">
              <span>🗓️ Diposting: {new Date(finalPost.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
              
              <span className="text-border">•</span>
              <span>🖼️ {photos.length} Foto</span>

              {firstExifDate && (
                <>
                  <span className="text-border">•</span>
                  <span>📷 Diambil: {new Date(firstExifDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                </>
              )}
            </div>
            <h3 className={`${LAYOUT_CONFIG.storySubtitle} font-heading font-bold text-text-main mb-3`}>Cerita di Balik Lensa</h3>
            {finalPost.story ? (
              <p className={`${LAYOUT_CONFIG.storyText} text-text-main leading-relaxed font-sans whitespace-pre-line`}>
                {finalPost.story}
              </p>
            ) : (
              <p className={`${LAYOUT_CONFIG.storyText} text-text-muted italic`}>Tidak ada cerita yang dilampirkan untuk momen ini.</p>
            )}

            {/* Tags */}
            {finalPost.post_tags && finalPost.post_tags.length > 0 && (
              <div className="pt-4 md:pt-6">
                <div className="flex flex-wrap gap-2">
                  {finalPost.post_tags.map((pt: any, idx: number) => (
                    <span key={idx} className="px-3 py-1.5 bg-surface border border-border text-[11px] md:text-xs font-medium text-text-muted rounded-full">
                      #{pt.tags.name}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  )
}
