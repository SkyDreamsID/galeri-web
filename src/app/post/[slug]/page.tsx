import { createClient } from '@/lib/supabase/server'
import { Navbar } from '@/components/layout/Navbar'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { EmblaCarousel } from '@/components/post/EmblaCarousel'
import { Metadata } from 'next'
import { getOptimizedImageUrl } from '@/lib/utils'
import { ViewTracker } from '@/components/post/ViewTracker'
import { CarouselActions } from '@/components/post/CarouselActions'
import { ProgressiveImage } from '@/components/ui/ProgressiveImage'

// =========================================================================
// 🛠️ PAPAN KONTROL UKURAN (Tinggal ganti di sini biar gampang utak-atik)
// =========================================================================
const LAYOUT_CONFIG = {
  // Ukuran Judul Postingan
  postTitle: "text-3xl md:text-5xl lg:text-5xl",
  // Ukuran Teks Sub-Judul Cerita
  storySubtitle: "text-lg md:text-xl lg:text-2xl",
  // Ukuran Teks Cerita
  storyText: "text-sm md:text-base lg:text-base",
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

  if (!finalPost) {
    notFound()
  }

  const postData = finalPost

  // Sortir foto berdasarkan sort_order
  const photos = postData.photos?.sort((a: any, b: any) => a.sort_order - b.sort_order) || []

  // Buat Ambient Glow dari gambar cover
  const ambientCover = photos.find((p: any) => p.is_cover) || photos[0]
  const ambientGlowUrl = ambientCover ? getOptimizedImageUrl(ambientCover.image_url, 400) : null

  // Cari tanggal diambil dari EXIF foto pertama, fallback ke created_at
  const firstExifDate = photos[0]?.exif_data?.[0]?.date_taken
  const displayDate = firstExifDate ? new Date(firstExifDate) : new Date(postData.created_at)

  // Ambil semua copyright_name unik dari foto
  const uniqueCopyrights = Array.from(
    new Set(
      photos.map((p: any) => p.copyright_name).filter(Boolean)
    )
  )
  const displayCopyright = uniqueCopyrights.length > 0 
    ? uniqueCopyrights.join(', ') 
    : 'Rifki Eka Putra'

  // Safely extract collection name
  const collectionName = postData.collections
    ? (Array.isArray(postData.collections)
      ? (postData.collections[0] as any)?.name
      : (postData.collections as any)?.name)
    : null

  return (
    <>
      <ViewTracker postId={postData.id} />
      <main className="container mx-auto max-w-7xl px-4 md:px-8 py-10 md:py-16 animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out">
        {/* Kontainer Utama: Kolom 1 tumpuk di Mobile Portrait, 2 Kolom di Landscape & Desktop */}
        <div className="flex flex-col landscape:grid landscape:grid-cols-5 lg:grid lg:grid-cols-5 gap-10 lg:gap-16 items-start">
          
          {/* === BAGIAN KIRI: Foto (Sticky saat grid/layar besar) === */}
          <div className="landscape:col-span-3 lg:col-span-3 order-1 w-full landscape:sticky landscape:top-24 lg:sticky lg:top-24">
            <div className="relative">
              {ambientGlowUrl && (
                <div className="absolute inset-0 -z-10 blur-[60px] opacity-40 transform scale-95 translate-y-8 rounded-full pointer-events-none transition-all duration-1000">
                  <img src={ambientGlowUrl} alt="" className="w-full h-full object-cover rounded-full" />
                </div>
              )}
              <EmblaCarousel photos={photos} postId={postData.id} />
            </div>
          </div>

          {/* === BAGIAN KANAN: Detail & Cerita === */}
          {/* Di layar besar, jadi panel setinggi layar dikurangi navbar biar bisa discroll sendiri */}
          <div className="landscape:col-span-2 lg:col-span-2 order-2 w-full landscape:sticky landscape:top-20 lg:sticky lg:top-20 landscape:h-[calc(100vh-80px)] lg:h-[calc(100vh-80px)] flex flex-col">
            
            {/* ZONA ATAS: Tombol Kembali (Sticky di dalam panel saat desktop, normal di mobile) */}
            <div className="shrink-0 pb-4 border-b border-border/20 mb-6">
              <Link href="/" className="inline-flex items-center gap-2 text-[10px] md:text-xs font-bold text-text-muted hover:text-text-main transition-colors uppercase tracking-widest group cursor-pointer select-none">
                <span className="transition-transform group-hover:-translate-x-1">←</span> Kembali ke Galeri
              </Link>
            </div>

            {/* ZONA BAWAH: Konten Utama (Scrollable area saat Desktop, normal saat Mobile) */}
            <div className="landscape:flex-1 landscape:overflow-y-auto lg:flex-1 lg:overflow-y-auto pr-1 landscape:scrollbar-thin lg:scrollbar-thin space-y-6 md:space-y-8 pb-10">
              
              {/* Header Area */}
              <div>
                {collectionName && (
                  <div className="text-[11px] font-semibold uppercase tracking-widest text-text-muted mb-2 md:mb-3">
                    {collectionName}
                  </div>
                )}
                <h1 className={`${LAYOUT_CONFIG.postTitle} font-heading font-extrabold text-text-main mb-3 md:mb-4 tracking-tighter leading-tight`}>
                  {postData.title}
                </h1>
                <div className="flex flex-wrap items-center gap-4 text-sm text-text-muted font-sans">
                  {postData.location && <span>📍 {postData.location}</span>}
                </div>
              </div>

              {/* Story Area */}
              <div className="space-y-6">
                {/* Metadata Tanggal dll */}
                <div className="flex flex-col gap-2 text-[13px] md:text-sm text-text-muted font-sans pb-4 border-b border-border/10">
                  <div className="flex items-center gap-2">
                    <span>🗓️ Diposting:</span>
                    <span className="text-text-main">{new Date(postData.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                  </div>
                  {firstExifDate && (
                    <div className="flex items-center gap-2">
                      <span>📷 Diambil:</span>
                      <span className="text-text-main">{new Date(firstExifDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <span>🖼️ File:</span>
                    <span className="text-text-main">{photos.length} Foto</span>
                  </div>
                </div>
                
                {/* Teks Cerita */}
                <div>
                  <h3 className={`${LAYOUT_CONFIG.storySubtitle} font-heading font-bold text-text-main mb-3`}>Cerita di Balik Karya</h3>
                  {postData.story ? (
                    <p className={`${LAYOUT_CONFIG.storyText} text-text-main leading-relaxed font-sans whitespace-pre-line`}>
                      {postData.story}
                    </p>
                  ) : (
                    <p className={`${LAYOUT_CONFIG.storyText} text-text-muted italic`}>Tidak ada cerita yang dilampirkan untuk momen ini.</p>
                  )}
                </div>

                {/* Tags */}
                {postData.post_tags && postData.post_tags.length > 0 && (
                  <div className="pt-2 md:pt-4 pb-6">
                    <div className="flex flex-wrap gap-2">
                      {postData.post_tags.map((pt: any, idx: number) => (
                        <Link key={idx} href={`/tag/${pt.tags.name}`} className="px-4 py-1.5 bg-surface/50 border border-border/20 text-xs font-medium text-text-muted hover:text-text-main hover:bg-surface/80 hover:border-border/40 transition-all duration-300 rounded-full cursor-pointer backdrop-blur-sm">
                          #{pt.tags.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>

            </div>
          </div>
          
        </div>
      </main>
    </>
  )
}
