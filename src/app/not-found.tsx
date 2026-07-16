import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center text-center px-4">
      <h1 className="text-6xl font-extrabold text-text-main mb-4 font-heading tracking-tighter">404</h1>
      <p className="text-xl text-text-muted mb-8 font-medium">Waduh, halaman yang lu cari nggak ada nih.</p>
      <Link 
        href="/" 
        className="px-6 py-3 bg-surface hover:bg-border text-text-main rounded-xl font-bold transition-all border border-border hover:scale-105 active:scale-95"
      >
        Balik ke Beranda
      </Link>
    </div>
  )
}
