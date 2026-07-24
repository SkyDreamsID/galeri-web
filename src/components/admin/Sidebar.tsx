'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { ImagePlus, Images, LogOut, Settings, Menu, X, Camera, Folder, Tag, Globe, Sun, Moon, Music } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useTheme } from 'next-themes'
import { useSiteSettings } from '@/contexts/SiteSettingsContext'

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
  
  const { theme, setTheme } = useTheme()
  const [isMounted, setIsMounted] = useState(false)

  const settings = useSiteSettings()
  const rawZenoId = settings?.zenofm_station_id || process.env.NEXT_PUBLIC_ZENO_STATION_ID
  const hasRadioConfigured = Boolean(rawZenoId?.trim())

  useEffect(() => {
    setIsMounted(true)

    // Handle click outside to close details menus
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      document.querySelectorAll('details[open]').forEach(details => {
        if (!details.contains(target) || (target instanceof Element && target.closest('a, button'))) {
          details.removeAttribute('open');
        }
      });
    };
    
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
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
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/60 border-b border-border/20 flex items-center justify-between px-6 z-50">
        <h1 className="font-heading text-xl font-bold tracking-tight text-text-main">Admin</h1>
        <div className="flex items-center gap-3 relative">
          {/* PORTAL TARGET UNTUK RADIO WIDGET DI MOBILE */}
          <div id="radio-portal-mobile" className="w-11 h-11 shrink-0 relative group empty:hidden">
            {hasRadioConfigured && (
              <div className="dummy-radio absolute inset-0 w-11 h-11 flex items-center justify-center rounded-xl bg-surface/80 text-text-main border border-border/50 shadow-sm opacity-100 group-has-[.real-radio-btn]:hidden">
                <Music size={18} />
              </div>
            )}
          </div>

          {/* Tombol Tema Khusus Mobile */}
          <button
            type="button"
            onClick={() => setTheme(theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches) ? 'light' : 'dark')}
            className="w-11 h-11 flex items-center justify-center rounded-xl bg-surface/80 hover:bg-surface active:scale-90 transition-all text-text-main border border-border/50 shadow-sm touch-manipulation"
            title="Ganti Tema"
          >
            {isMounted ? (
              <>
                <Sun size={20} className="hidden dark:block text-yellow-500" />
                <Moon size={20} className="block dark:hidden" />
              </>
            ) : <div className="w-5 h-5"></div>}
          </button>

          {/* Dropdown Menu Floating Khusus Mobile */}
          <details className="relative group">
            <summary className="w-11 h-11 flex items-center justify-center rounded-xl bg-surface/80 hover:bg-surface active:scale-90 transition-all text-text-main border border-border/50 shadow-sm list-none cursor-pointer [&::-webkit-details-marker]:hidden touch-manipulation">
              <Menu size={22} className="block group-open:hidden" />
              <X size={22} className="hidden group-open:block" />
            </summary>
            <div className="absolute right-0 mt-3 w-[calc(100vw-2rem)] sm:w-60 max-w-[220px] max-h-[75vh] overflow-y-auto overscroll-contain scrollbar-thin rounded-2xl border border-border bg-surface p-1.5 shadow-2xl animate-in fade-in zoom-in-95 duration-200 z-[9999]">
              <div className="space-y-0.5 font-sans">
                {menu.map((item) => {
                  const isActive = pathname === item.path
                  const Icon = item.icon
                  return (
                    <Link
                      key={item.path}
                      href={item.path}
                      className={`flex items-center gap-2.5 px-3 py-2 text-[13px] font-medium rounded-xl transition-colors ${
                        isActive 
                          ? 'bg-primary-neutral/10 text-primary-neutral font-bold' 
                          : 'text-text-muted hover:text-text-main hover:bg-background'
                      }`}
                    >
                      <Icon size={16} className={isActive ? "text-primary-neutral" : "text-text-muted"} />
                      <span>{item.name}</span>
                    </Link>
                  )
                })}

                <span className="block text-center text-text-muted/40 my-2 text-[10px] select-none tracking-widest">──── LAINNYA ────</span>

                <Link 
                  href="/"
                  className="flex w-full items-center gap-2.5 px-3 py-2 text-[13px] font-medium text-text-muted hover:text-text-main hover:bg-background rounded-xl transition-colors"
                >
                  <Globe size={16} />
                  <span>Lihat Website</span>
                </Link>
                <button 
                  type="button"
                  onClick={handleLogout}
                  className="flex w-full items-center gap-2.5 px-3 py-2 text-[13px] font-medium text-red-500 hover:bg-red-500/10 rounded-xl transition-colors"
                >
                  <LogOut size={16} />
                  <span>Keluar</span>
                </button>
              </div>
            </div>
          </details>
        </div>
      </div>

      {/* 💻 SIDEBAR KHUSUS TABLET & DESKTOP */}
      <aside className="hidden md:flex w-[220px] bg-background border-r border-border/40 flex-col sticky top-0 h-screen">
        <SidebarContent />
      </aside>
    </>
  )
}

