import { createClient } from '@/lib/supabase/server'
import { Navbar } from '@/components/layout/Navbar'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { EmblaCarousel } from '@/components/post/EmblaCarousel'
import { Metadata } from 'next'
import { getOptimizedImageUrl, formatCreators } from '@/lib/utils'
import { ViewTracker } from '@/components/post/ViewTracker'
import { CarouselActions } from '@/components/post/CarouselActions'
import { ShareButton } from '@/components/post/ShareButton'
import { ProgressiveImage } from '@/components/ui/ProgressiveImage'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Eye, Download } from 'lucide-react'
import type { Photo, PostTag } from '@/types/gallery'

// =========================================================================
// 🛠️ PAPAN KONTROL UKURAN (Tinggal ganti di sini biar gampang utak-atik)
// =========================================================================
const LAYOUT_CONFIG = {
  // Ukuran Judul Postingan
  postTitle: "text-xl md:text-3xl lg:text-4xl max-lg:landscape:text-xl",
  // Ukuran Teks Sub-Judul Cerita
  storySubtitle: "text-lg md:text-xl lg:text-2xl max-lg:landscape:text-lg",
  // Ukuran Teks Cerita
  storyText: "text-sm md:text-base lg:text-base max-lg:landscape:text-sm",
};

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const supabase = await createClient()

  let post = null
  let enableWatermark = true
  const { data } = await supabase
    .from('posts')
    .select('title, story, status, photos (image_url, is_cover, copyright_name)')
    .eq('slug', slug)
    .single()
  
  if (data) {
    post = data
  }
  if (!post) {
    const { data: byId } = await supabase.from('posts').select('title, story, status, photos (image_url, is_cover, copyright_name)').eq('id', slug).single()
    if (byId) post = byId
  }

  const { data: settings } = await supabase.from('site_settings').select('theme_config, site_title').limit(1).single()
  enableWatermark = settings?.theme_config?.enable_watermark !== false
  const siteTitle = settings?.site_title || 'Jurnal Visual'

  if (!post || post.status !== 'Published') {
    return {
      title: 'Postingan Tidak Tersedia | Galeri',
      description: 'Postingan ini telah dihapus atau bersifat pribadi.',
    }
  }

  const coverPhoto = post.photos?.find((p: Photo) => p.is_cover) || post.photos?.[0]
  const imageToUse = coverPhoto ? getOptimizedImageUrl(coverPhoto.image_url, 1200, undefined, false) : '/placeholder.jpg'

  // Kumpulin semua nama kreator/copyright
  const uniqueCopyrights = Array.from(new Set(
      post.photos?.map((p: Photo) => p.copyright_name).filter(Boolean) || []
  )) as string[]
  const creators = uniqueCopyrights.length > 0 ? formatCreators(uniqueCopyrights) : siteTitle

  const title = `${post.title} • ${siteTitle}`
  const desc = `Jelajahi karya "${post.title}" oleh ${creators} di ${siteTitle}.`

  return {
    title: title,
    description: desc,
    openGraph: {
      title: title,
      description: desc,
      images: imageToUse ? [{ url: imageToUse, width: 1200, height: 630 }] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title: title,
      description: desc,
      images: imageToUse ? [imageToUse] : [],
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
      id, title, story, location, created_at, license_type, slug, status, views, downloads,
      collections (id, name),
      post_tags ( tags (name) ),
      photos (
        id, image_url, sort_order, bytes, format, original_filename, license_type, copyright_name, show_watermark,
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
        id, title, story, location, created_at, license_type, slug, status, views, downloads,
        collections (id, name),
        post_tags ( tags (name) ),
        photos (
          id, image_url, sort_order, bytes, format, original_filename, license_type, copyright_name, show_watermark,
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

  const { data: settings } = await supabase.from('site_settings').select('theme_config, site_title').limit(1).single()
  const enableWatermark = settings?.theme_config?.enable_watermark !== false
  const showPublicStats = settings?.theme_config?.show_public_stats !== false && String(settings?.theme_config?.show_public_stats) !== "false"

  if (!finalPost || finalPost.status !== 'Published') {
    return (
      <main className="container mx-auto max-w-7xl px-4 md:px-8 py-20 flex flex-col items-center justify-center min-h-[60vh] text-center animate-in fade-in zoom-in-95 duration-500">
        <div className="bg-surface border border-border/40 p-8 md:p-12 rounded-2xl shadow-sm max-w-md w-full mx-auto mt-10">
          <div className="w-16 h-16 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-3xl">🔒</span>
          </div>
          <h2 className="text-2xl font-heading font-bold text-text-main mb-3">Akses Ditolak</h2>
          <p className="text-text-muted mb-8">Postingan Tidak Tersedia (dihapus/pribadi)</p>
          <Link 
            href="/" 
            className="inline-flex items-center justify-center px-6 py-2.5 bg-primary-neutral hover:bg-primary-neutral/90 text-surface font-medium rounded-lg transition-all shadow-sm"
          >
            Kembali ke Beranda
          </Link>
        </div>
      </main>
    )
  }

  const postData = finalPost

  // Sortir foto berdasarkan sort_order
  const photos: Photo[] = postData.photos?.sort((a: Photo, b: Photo) => (a.sort_order || 0) - (b.sort_order || 0)) || []
  
  // Find cover photo explicitly
  const ambientCover = photos.find((p: Photo) => p.is_cover) || photos[0]
  const ambientGlowUrl = ambientCover ? getOptimizedImageUrl(ambientCover.image_url, 400, null, false) : null

  // Cari tanggal diambil dari EXIF foto pertama, fallback ke created_at
  const firstExifDate = photos[0]?.exif_data?.[0]?.date_taken
  const displayDate = firstExifDate ? new Date(firstExifDate) : new Date(postData.created_at)

  // Ambil semua copyright_name unik dari foto
  const uniqueCopyrights = Array.from(
    new Set(
      photos.map((p: Photo) => p.copyright_name).filter(Boolean)
    )
  ) as string[]
  
  const creatorsFormatted = uniqueCopyrights.length > 0 
    ? formatCreators(uniqueCopyrights) 
    : (settings?.site_title || 'Jurnal Visual')

  // Safely extract collection name & id
  const collectionData = postData.collections
    ? (Array.isArray(postData.collections) ? postData.collections[0] : postData.collections)
    : null
  const collectionName = collectionData && !Array.isArray(collectionData) ? collectionData.name : null
  const collectionId = collectionData && !Array.isArray(collectionData) ? collectionData.id : null

  return (
    <>
      <ViewTracker postId={postData.id} />
      <main className="container mx-auto max-w-7xl px-4 md:px-8 py-10 md:py-16 animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out">
        {/* Kontainer Utama: Kolom 1 tumpuk di Mobile Portrait, 2 Kolom di Landscape & Desktop */}
        <div className="flex flex-col max-lg:landscape:grid max-lg:landscape:grid-cols-11 lg:grid lg:grid-cols-11 max-lg:landscape:gap-6 lg:gap-16 items-start">
          
          {/* === BAGIAN KIRI: Foto (Sticky saat grid/layar besar) === */}
          <div className="max-lg:landscape:col-span-5 lg:col-span-6 order-1 w-full max-lg:landscape:sticky max-lg:landscape:top-24 lg:sticky lg:top-24 self-start">
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
          <div className="max-lg:landscape:col-span-6 lg:col-span-5 order-2 w-full max-lg:landscape:sticky max-lg:landscape:top-20 lg:sticky lg:top-20 max-lg:landscape:h-[calc(100vh-80px)] lg:h-[calc(100vh-80px)] flex flex-col">
            
            {/* ZONA ATAS: Tombol Kembali (Sticky di dalam panel saat desktop, normal di mobile) */}
            <div className="shrink-0 pb-4 border-b border-border/20 mb-6 sticky top-0 z-10 bg-background pt-2 md:pt-0">
              <Link href="/" className="inline-flex items-center gap-2 text-[10px] md:text-xs font-bold text-text-muted hover:text-text-main transition-colors uppercase tracking-widest group cursor-pointer select-none">
                <span className="transition-transform group-hover:-translate-x-1">←</span> Kembali ke Galeri
              </Link>
            </div>

            {/* ZONA BAWAH: Konten Utama (Scrollable area saat Desktop, normal saat Mobile) */}
            <div className="max-lg:landscape:flex-1 max-lg:landscape:overflow-y-auto lg:flex-1 lg:overflow-y-auto pr-1 max-lg:landscape:scrollbar-thin lg:scrollbar-thin space-y-6 md:space-y-8 pb-10">
              
              {/* Header Area */}
              <div className="flex flex-col gap-2 md:gap-3">
                {collectionName && (
                  <div>
                    {collectionId ? (
                      <Link 
                        href={`/collection/${collectionId}`}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary-neutral/10 border border-primary-neutral/20 text-[10px] font-bold uppercase tracking-widest text-primary-neutral hover:bg-primary-neutral/20 transition-colors"
                        title={`Lihat album ${collectionName}`}
                      >
                        {collectionName}
                      </Link>
                    ) : (
                      <div className="inline-flex items-center px-2.5 py-1 rounded-full bg-surface border border-border/40 text-[10px] font-bold uppercase tracking-widest text-text-muted">
                        {collectionName}
                      </div>
                    )}
                  </div>
                )}
                
                {/* Judul */}
                <div>
                  <h1 className={`${LAYOUT_CONFIG.postTitle} font-heading font-extrabold text-text-main tracking-tighter leading-tight break-words`}>
                    {postData.title}
                  </h1>
                </div>
              </div>

              {/* Story Area */}
              <div className="space-y-6">
                {/* Metadata & Action Block */}
                <div className="flex flex-col gap-4 pb-6 border-b border-border/10">
                  {/* Info List — grid biar ":" sejajar */}
                  <div className="grid gap-y-2 text-[13px] md:text-sm text-text-muted font-sans" style={{ gridTemplateColumns: 'auto 1fr' }}>
                    <span className="pr-3 whitespace-nowrap">🗓️ Diposting</span>
                    <span className="text-text-main"><span className="text-text-muted mr-2">:</span>{new Date(postData.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                    {firstExifDate && (
                      <>
                        <span className="pr-3 whitespace-nowrap">📷 Diambil</span>
                        <span className="text-text-main"><span className="text-text-muted mr-2">:</span>{new Date(firstExifDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                      </>
                    )}
                    <span className="pr-3 whitespace-nowrap">🖼️ File</span>
                    <span className="text-text-main"><span className="text-text-muted mr-2">:</span>{photos.length} Foto</span>
                    {postData.location && (
                      <>
                        <span className="pr-3 whitespace-nowrap">📍 Lokasi</span>
                        <span className="text-text-main"><span className="text-text-muted mr-2">:</span>{postData.location}</span>
                      </>
                    )}
                  </div>

                  {/* Share & Stats Action */}
                  <div className="pt-2 flex">
                    <div className="flex items-stretch bg-surface/50 border border-border/40 rounded-full shadow-sm backdrop-blur-sm overflow-hidden transition-all">
                      <ShareButton title={postData.title} siteTitle={settings?.site_title} creators={creatorsFormatted} />
                      
                      {showPublicStats && (
                        <>
                          <div className="w-px bg-border/40 my-2"></div>
                          <div className="shrink-0 flex items-center justify-center gap-2 px-3 md:px-4 py-2 text-text-muted hover:text-text-main hover:bg-surface/80 transition-all font-sans text-xs md:text-sm font-medium cursor-default" title="Total Dilihat">
                            <Eye size={16} />
                            <span>{postData.views || 0}</span>
                          </div>
                          <div className="w-px bg-border/40 my-2"></div>
                          <div className="shrink-0 flex items-center justify-center gap-2 px-3 md:px-4 py-2 text-text-muted hover:text-text-main hover:bg-surface/80 transition-all font-sans text-xs md:text-sm font-medium cursor-default" title="Total Diunduh">
                            <Download size={16} />
                            <span>{postData.downloads || 0}</span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Teks Cerita */}
                <div>
                  <h3 className={`${LAYOUT_CONFIG.storySubtitle} font-heading font-bold text-text-main mb-3`}>Cerita di Balik Karya</h3>
                  {postData.story ? (
                    <div className={`prose dark:prose-invert max-w-none prose-p:text-text-main prose-headings:text-text-main prose-a:text-primary-neutral hover:prose-a:text-primary-neutral/80 prose-strong:text-text-main prose-li:text-text-main font-sans leading-relaxed break-words overflow-hidden ${LAYOUT_CONFIG.storyText}`}>
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {postData.story}
                      </ReactMarkdown>
                    </div>
                  ) : (
                    <p className={`${LAYOUT_CONFIG.storyText} text-text-muted italic`}>Tidak ada cerita yang dilampirkan untuk momen ini.</p>
                  )}
                </div>

                {/* Tags */}
                {postData.post_tags && postData.post_tags.length > 0 && (
                  <div className="pt-2 md:pt-4 pb-6">
                    <div className="flex flex-wrap gap-2">
                      {postData.post_tags.map((pt: PostTag, idx: number) => (
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
