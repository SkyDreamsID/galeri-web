import { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { getOptimizedImageUrl } from '@/lib/utils'

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params
  const supabase = await createClient()

  const { data: collection } = await supabase
    .from('collections')
    .select('name, description, posts (photos (image_url, is_cover))')
    .eq('id', id)
    .single()

  if (!collection) return { title: 'Koleksi Tidak Ditemukan' }

  const firstPost = collection.posts?.[0]
  const coverPhoto = firstPost?.photos?.find((p: any) => p.is_cover) || firstPost?.photos?.[0]
  const imageUrl = coverPhoto ? getOptimizedImageUrl(coverPhoto.image_url, 1200) : ''

  return {
    title: `${collection.name} | Galeri`,
    description: collection.description || `Kumpulan foto dalam koleksi ${collection.name}.`,
    openGraph: {
      title: collection.name,
      description: collection.description || `Kumpulan foto dalam koleksi ${collection.name}.`,
      images: imageUrl ? [{ url: imageUrl, width: 1200, height: 630 }] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title: collection.name,
      description: collection.description || `Kumpulan foto dalam koleksi ${collection.name}.`,
      images: imageUrl ? [imageUrl] : [],
    }
  }
}

export default function CollectionLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
