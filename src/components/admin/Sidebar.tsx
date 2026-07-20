'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { ImagePlus, Images, LogOut, Settings, Menu, X, Camera, Folder, Tag, Globe, Sun, Moon } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useTheme } from 'next-themes'

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  
  const { theme, setTheme } = useTheme()
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

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
        <div className="flex items-center gap-2">
          {/* PORTAL TARGET UNTUK RADIO WIDGET DI TABLET */}
          <div id="radio-portal-tablet" className="hidden md:flex lg:hidden w-10 h-10 shrink-0 relative items-center justify-center"></div>
          
          {/* Tombol Tema untuk Desktop/Tablet */}
          <button
            type="button"
            onClick={() => setTheme(theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches) ? 'light' : 'dark')}
            className="hidden md:flex w-9 h-9 items-center justify-center rounded-lg bg-background hover:bg-background/80 active:scale-90 transition-all text-text-main border border-border/50"
            title="Ganti Tema"
          >
            {isMounted ? (
              <>
                <Sun size={16} className="hidden dark:block text-yellow-500" />
                <Moon size={16} className="block dark:hidden text-text-main" />
              </>
            ) : <div className="w-4 h-4"></div>}
          </button>
          
          {/* Tombol X untuk tutup menu di HP */}
          <button onClick={() => setIsMenuOpen(false)} className="md:hidden p-1.5 text-text-muted hover:text-text-main bg-surface rounded-lg">
            <X size={18} />
          </button>
        </div>
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
        <div className="flex items-center gap-3">
          {/* PORTAL TARGET UNTUK RADIO WIDGET DI MOBILE */}
          <div id="radio-portal-mobile" className="w-10 h-10 shrink-0 relative flex items-center justify-center"></div>
          
          {/* Tombol Tema Khusus Mobile */}
          <button
            type="button"
            onClick={() => setTheme(theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches) ? 'light' : 'dark')}
            className="w-10 h-10 flex items-center justify-center rounded-xl bg-surface hover:bg-surface/80 active:scale-90 transition-all text-text-main border border-border/50"
            title="Ganti Tema"
          >
            {isMounted ? (
              <>
                <Sun size={18} className="hidden dark:block text-yellow-500" />
                <Moon size={18} className="block dark:hidden text-text-main" />
              </>
            ) : <div className="w-[18px] h-[18px]"></div>}
          </button>

          <button 
            onClick={() => setIsMenuOpen(true)}
            className="w-10 h-10 flex items-center justify-center text-text-main bg-surface rounded-xl border border-border/50"
          >
            <Menu size={20} />
          </button>
        </div>
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
