import { createClient } from '@/lib/supabase/server'
import { PlaygroundNavbar } from '../../_components/PlaygroundNavbar'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { EmblaCarousel } from '../_components/EmblaCarousel'
import { Metadata } from 'next'
import { getOptimizedImageUrl } from '@/lib/utils'
import { ViewTracker } from '@/components/public/ViewTracker'

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

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const supabase = await createClient()

  let post = null
  const { data } = await supabase
    .from('posts')
    .select('title, story, photos (image_url, is_cover)')
    .eq('slug', slug)
    .single()
  
  if (data) post = data
  if (!post) {
    const { data: byId } = await supabase.from('posts').select('title, story, photos (image_url, is_cover)').eq('id', slug).single()
    if (byId) post = byId
  }

  if (!post) return {}

  const coverPhoto = post.photos?.find((p: any) => p.is_cover) || post.photos?.[0]
  const imageUrl = coverPhoto ? getOptimizedImageUrl(coverPhoto.image_url, 1200) : ''
  const desc = post.story ? post.story.substring(0, 160) + '...' : 'Sebuah momen tertangkap kamera.'

  return {
    title: `${post.title} | Galeri`,
    description: desc,
    openGraph: {
      title: post.title,
      description: desc,
      images: imageUrl ? [{ url: imageUrl, width: 1200, height: 630 }] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: desc,
      images: imageUrl ? [imageUrl] : [],
    }
  }
}

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
        id, image_url, sort_order, bytes, format, original_filename, license_type, copyright_name,
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
          id, image_url, sort_order, bytes, format, original_filename, license_type, copyright_name,
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

  // Buat Ambient Glow dari gambar cover
  const ambientCover = photos.find((p: any) => p.is_cover) || photos[0]
  const ambientGlowUrl = ambientCover ? getOptimizedImageUrl(ambientCover.image_url, 400) : null

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
      <ViewTracker postId={finalPost.id} />
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

        {/* Carousel Area dengan Ambient Glow */}
        <div className="mb-12 relative">
          {ambientGlowUrl && (
            <div className="absolute inset-0 -z-10 blur-[60px] opacity-40 transform scale-95 translate-y-8 rounded-full pointer-events-none transition-all duration-1000">
              <img src={ambientGlowUrl} alt="" className="w-full h-full object-cover rounded-full" />
            </div>
          )}
          <EmblaCarousel photos={photos} />
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
                    <Link key={idx} href={`/tag/${pt.tags.name}`} className="px-3 py-1.5 bg-surface border border-border text-[11px] md:text-xs font-medium text-text-muted hover:text-text-main hover:border-primary-neutral/50 transition-colors rounded-full cursor-pointer">
                      #{pt.tags.name}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer Khusus Single Post */}
      <footer className="border-t border-border/40 bg-surface/30 mt-0.25">
        
        {/* Bagian Atas Footer (Logo/Tagline & Link Sosmed) */}
        <div className="container mx-auto max-w-7xl px-2 md:px-4 py-2 md:py-4 flex flex-col md:flex-row items-center justify-between gap-3">
          
          {/* Logo & Tagline */}
          <div className="flex flex-col items-center md:items-start gap-2">
            <span className="font-heading text-xl font-bold tracking-tight">Galeri<span className="text-primary-neutral"></span></span>
            <p className="text-sm text-text-muted text-center md:text-left">
              Menangkap momen, merangkai cerita.
            </p>
          </div>
          
          {/* Link Sosial Media (Ganti URL href-nya dengan link asli lu) */}
          <div className="flex items-center gap-6 text-sm text-text-muted">
            <a href="https://instagram.com/rifkiekap07" target="_blank" rel="noopener noreferrer" className="hover:text-primary-neutral transition-colors">Instagram</a>
            <a href="https://github.com/SkyDreamsID" target="_blank" rel="noopener noreferrer" className="hover:text-primary-neutral transition-colors">GitHub</a>
            <a href="mailto:arunikaframes2025@gmail.com" className="hover:text-primary-neutral transition-colors">Email</a>
          </div>
        </div>

        {/* Bagian Bawah Footer (Copyright & Tech Stack) */}
        <div className="border-t border-border/40 py-3 text-center space-y-0.5">
          {/* Teks Copyright */}
          <p className="text-xs text-text-muted/60">
            &copy; {new Date().getFullYear()} Rifki Eka Putra | All Rights Reserved
          </p>
          {/* Teks "Made with Love" */}
          <p className="text-xs text-text-muted/60">
            Made with <span className="text-primary-neutral">♥</span> using Supabase + Cloudinary + Next.js
          </p>
        </div>
      </footer>
    </>
  )
}
