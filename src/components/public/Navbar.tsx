import Link from 'next/link'

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto max-w-7xl flex h-16 items-center justify-between px-4 md:px-8">
        <Link href="/" className="flex items-center gap-2">
          <span className="font-heading text-xl font-bold tracking-tight">Galeri<span className="text-primary-neutral">.</span></span>
        </Link>
        <nav className="flex items-center gap-6">
          <Link href="/" className="text-sm font-medium text-text-muted hover:text-text-main transition-colors">
            Karya
          </Link>
          <Link href="/about" className="text-sm font-medium text-text-muted hover:text-text-main transition-colors">
            Tentang
          </Link>
        </nav>
      </div>
    </header>
  )
}
