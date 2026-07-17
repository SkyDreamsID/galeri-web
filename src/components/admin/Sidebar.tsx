'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { ImagePlus, Images, LogOut, Settings, Menu, X, Camera, Folder, Tag, Globe } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/admin/login')
  }

  const menu = [
    { name: 'Upload Baru', path: '/admin', icon: ImagePlus },
    { name: 'Kelola Galeri', path: '/admin/gallery', icon: Images },
    { name: 'Koleksi (Album)', path: '/admin/collections', icon: Folder },
    { name: 'Kelola Tags', path: '/admin/tags', icon: Tag },
    { name: 'Kelola Gear', path: '/admin/gear', icon: Camera },
    { name: 'Pengaturan', path: '/admin/settings', icon: Settings },
  ]

  const SidebarContent = () => (
    <>
      <div className="p-3 md:p-5 border-b border-border/40 flex items-center justify-between">
        <div>
          <h1 className="text-lg md:text-xl font-heading font-bold tracking-tight text-text-main leading-tight">Admin Dashboard</h1>
          <p className="text-[10px] md:text-xs text-text-muted mt-0.5 font-sans">Galeri Control Panel</p>
        </div>
        {/* Tombol X untuk tutup menu di HP */}
        <button onClick={() => setIsMenuOpen(false)} className="md:hidden p-1.5 text-text-muted hover:text-text-main bg-surface rounded-lg">
          <X size={18} />
        </button>
      </div>

      <nav className="flex-1 p-3 space-y-1 overflow-y-auto font-sans">
        {menu.map((item) => {
          const isActive = pathname === item.path
          const Icon = item.icon
          return (
            <Link
              key={item.path}
              href={item.path}
              onClick={() => setIsMenuOpen(false)}
              className={`flex items-center gap-2.5 px-3 py-2 md:py-2.5 rounded-lg transition-all text-sm ${
                isActive 
                  ? 'bg-primary-neutral text-surface font-semibold shadow-sm' 
                  : 'text-text-muted hover:text-text-main hover:bg-surface border border-transparent'
              }`}
            >
              <Icon size={18} className={isActive ? "text-surface" : "text-text-muted"} />
              <span>{item.name}</span>
            </Link>
          )
        })}
      </nav>

      <div className="p-3 border-t border-border/40 font-sans flex flex-col gap-1">
        <Link 
          href="/"
          className="flex w-full items-center gap-2.5 px-3 py-2 text-sm text-text-muted hover:text-text-main hover:bg-surface rounded-lg transition-colors font-medium border border-transparent"
        >
          <Globe size={18} />
          <span>Lihat Website</span>
        </Link>
        <button 
          onClick={handleLogout}
          className="flex w-full items-center gap-2.5 px-3 py-2 text-sm text-red-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors font-medium border border-transparent"
        >
          <LogOut size={18} />
          <span>Keluar</span>
        </button>
        <div className="text-[9px] text-center text-text-muted/40 font-mono mt-1 select-none">
          v1.0.0
        </div>
      </div>
    </>
  )

  return (
    <>
      {/* 📱 TOP NAVBAR KHUSUS HP (MOBILE VIEW) */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-14 bg-background/90 backdrop-blur-md border-b border-border/40 flex items-center justify-between px-4 z-50">
        <h1 className="text-base font-heading font-bold tracking-tight text-text-main">Admin<span className="text-primary-neutral">.</span></h1>
        <button 
          onClick={() => setIsMenuOpen(true)}
          className="p-2 text-text-main bg-surface rounded-xl border border-border/50"
        >
          <Menu size={20} />
        </button>
      </div>

      {/* 📱 MOBILE MENU DROPDOWN (OVERLAY) */}
      {isMenuOpen && (
        <div className="md:hidden fixed inset-0 bg-background/95 backdrop-blur-sm z-[60] flex flex-col w-full h-full animate-in fade-in duration-200">
          <SidebarContent />
        </div>
      )}

      {/* 💻 SIDEBAR KHUSUS TABLET & DESKTOP */}
      <aside className="hidden md:flex w-[220px] bg-background border-r border-border/40 flex-col sticky top-0 h-screen">
        <SidebarContent />
      </aside>
    </>
  )
}
