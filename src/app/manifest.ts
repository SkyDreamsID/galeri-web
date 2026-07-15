import { MetadataRoute } from 'next'
import { createClient } from '@/lib/supabase/server'

export default async function manifest(): Promise<MetadataRoute.Manifest> {
  const supabase = await createClient()
  const { data: settings } = await supabase.from('site_settings').select('*').limit(1).single()

  const name = settings?.site_title || 'Galeri - Portfolio Fotografi'
  const short_name = settings?.author_name || 'Galeri'
  const description = settings?.hero_description || 'Kumpulan momen dan cerita di balik lensa.'
  
  // Jika user menyetel logo di pengaturan, pakai logo itu (kita minta versi 512x512 dari Cloudinary)
  // Kalau kosong, kita pakai icon bawaan di public/icon.jpg
  let iconUrl = '/icon.jpg'
  
  if (settings?.site_logo_url) {
    // Memastikan Cloudinary me-resize logo jadi 512x512 pas
    // C/upload/ -> c/upload/c_fill,w_512,h_512/
    const url = settings.site_logo_url;
    if (url.includes('upload/')) {
      iconUrl = url.replace('upload/', 'upload/c_fill,w_512,h_512/')
    } else {
      iconUrl = url
    }
  }

  return {
    name,
    short_name,
    description,
    start_url: '/',
    display: 'standalone',
    background_color: '#1a1a1a', // Warna dark mode default
    theme_color: '#00adb5', // Warna primary-neutral
    icons: [
      {
        src: iconUrl,
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any maskable'
      },
      {
        src: iconUrl,
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any maskable'
      }
    ]
  }
}
