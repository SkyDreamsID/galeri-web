import { Metadata } from 'next'

export async function generateMetadata({ params }: { params: Promise<{ name: string }> }): Promise<Metadata> {
  const { name } = await params
  const decodedName = decodeURIComponent(name)
  
  return {
    title: `Foto dengan tag #${decodedName}`,
    description: `Kumpulan foto dengan tag #${decodedName}.`,
    openGraph: {
      title: `#${decodedName} - Foto`,
      description: `Kumpulan foto dengan tag #${decodedName}.`,
    },
    twitter: {
      card: 'summary_large_image',
      title: `#${decodedName} - Galeri Foto`,
      description: `Kumpulan foto dengan tag #${decodedName}.`,
    }
  }
}

export default function TagLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
