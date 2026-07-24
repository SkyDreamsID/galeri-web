'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { Sun, Moon, Menu, X, Camera, Music, Images, User, Code2, Mail, Settings, Globe } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { GearModal } from './GearModal'
import { useTheme } from 'next-themes'
import { useSiteSettings } from '@/contexts/SiteSettingsContext'

interface NavbarProps {
  authorName?: string
  siteLogo?: string
  socialLinks?: { title: string; url: string }[]
  contactEmail?: string
}

export function Navbar({ 
  authorName = 'SkyDreamsID', 
  siteLogo = '', 
  socialLinks = [],
  contactEmail = ''
}: NavbarProps) {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const [isGearModalOpen, setIsGearModalOpen] = useState(false)

  const settings = useSiteSettings()
  const rawZenoId = settings?.zenofm_station_id || process.env.NEXT_PUBLIC_ZENO_STATION_ID
  const hasRadioConfigured = Boolean(rawZenoId?.trim())

  // Avoid hydration mismatch by waiting for mount
  useEffect(() => {
    setMounted(true)

    const checkAuth = async () => {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()
      if (session) setIsAdmin(true)
    }
    checkAuth()

    // Handle click outside to close details menus
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      document.querySelectorAll('details[open]').forEach(details => {
        // Close if click is outside the details, OR if click is on an 'a' or 'button' inside it
        if (!details.contains(target) || (target instanceof Element && target.closest('.space-y-1, .space-y-0\\.5'))) {
          details.removeAttribute('open');
        }
      });
    };
    
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [])

  const isDark = mounted && (theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches))

  const toggleDarkMode = () => {
    setTheme(isDark ? 'light' : 'dark');
  };

  const getSocialIcon = (title: string, url: string) => {
    const u = url.toLowerCase()
    if (u.includes('mailto:')) return <Mail size={16} className="text-text-muted shrink-0" />
    return <Globe size={16} className="text-text-muted shrink-0" />
  }

  return (
    <>
      {/* ======================================================= */}
      {/* 📱 1. KELOMPOK NAVBAR KHUSUS HP (MOBILE VIEW) 📱 */}
      {/* ======================================================= */}
      <header className="md:hidden sticky top-0 z-[9999] w-full border-b border-border/20 bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto max-w-7xl flex h-16 items-center justify-between px-6 relative">
          
          <div className="flex items-center gap-2 cursor-pointer">
            <span className="font-heading text-xl font-bold tracking-tight">
              <Link href="/" className="flex items-center gap-2">
                {siteLogo ? (
                  <img src={siteLogo} alt={authorName} className="w-7 h-7 rounded-full object-cover" />
                ) : null}
                {authorName}
              </Link>
            </span>
          </div>

          <div className="flex items-center gap-3 ml-auto relative">
            {/* PORTAL TARGET UNTUK RADIO WIDGET DI HP */}
            <div id="radio-portal-mobile" className="w-11 h-11 shrink-0 relative group empty:hidden">
              {hasRadioConfigured && (
                <div className="dummy-radio absolute inset-0 w-11 h-11 flex items-center justify-center rounded-xl bg-surface/80 text-text-main border border-border/50 shadow-sm opacity-100 group-has-[.real-radio-btn]:hidden">
                  <Music size={18} />
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={() => setTheme(theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches) ? 'light' : 'dark')}
              className="w-11 h-11 flex items-center justify-center rounded-xl bg-surface/80 hover:bg-surface active:scale-90 transition-all text-text-main border border-border/50 shadow-sm touch-manipulation"
              title="Ganti Tema"
            >
              <Sun size={20} className="hidden dark:block text-yellow-500" />
              <Moon size={20} className="block dark:hidden" />
            </button>

            <details className="relative group">
              <summary className="w-11 h-11 flex items-center justify-center rounded-xl bg-surface/80 hover:bg-surface active:scale-90 transition-all text-text-main border border-border/50 shadow-sm list-none cursor-pointer [&::-webkit-details-marker]:hidden touch-manipulation">
                <Menu size={22} className="block group-open:hidden" />
                <X size={22} className="hidden group-open:block" />
              </summary>
              <div className="absolute right-0 mt-3 w-[calc(100vw-2rem)] sm:w-60 max-w-[220px] max-h-[75vh] overflow-y-auto overscroll-contain scrollbar-thin rounded-2xl border border-border bg-surface p-1.5 shadow-2xl animate-in fade-in zoom-in-95 duration-200 z-[9999]">
                <div className="space-y-0.5">
                  <Link href="/albums" className="flex items-center gap-2.5 w-full text-left px-3 py-2 text-[13px] font-medium rounded-xl hover:bg-background hover:text-text-main active:bg-background transition-colors">
                    <Images size={16} className="text-text-muted shrink-0" />
                    <span>Albums</span>
                  </Link>
                  <button type="button" onClick={() => setIsGearModalOpen(true)} className="flex items-center gap-2.5 w-full text-left px-3 py-2 text-[13px] font-medium rounded-xl hover:bg-background hover:text-text-main active:bg-background transition-colors">
                    <Camera size={16} className="text-text-muted shrink-0" />
                    <span>My Gear</span>
                  </button>
                  <a href="https://github.com/SkyDreamsID" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2.5 w-full text-left px-3 py-2 text-[13px] font-medium rounded-xl hover:bg-background hover:text-text-main active:bg-background transition-colors">
                    <User size={16} className="text-text-muted shrink-0" />
                    <span>About Me</span>
                  </a>
                  <a href="https://github.com/SkyDreamsID/galeri-web" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2.5 w-full text-left px-3 py-2 text-[13px] font-medium rounded-xl hover:bg-background hover:text-text-main active:bg-background transition-colors">
                    <Code2 size={16} className="text-text-muted shrink-0" />
                    <span>Source Code (Free)</span>
                  </a>
                  
                  <span className="block text-center text-text-muted/40 my-2 text-[10px] select-none tracking-widest">──── LAINNYA ────</span>
                  
                  {socialLinks.map((link, idx) => (
                    <a key={idx} href={link.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2.5 w-full text-left px-3 py-2 text-[13px] font-medium rounded-xl hover:bg-background hover:text-text-main active:bg-background transition-colors">
                      {getSocialIcon(link.title, link.url)}
                      <span>{link.title}</span>
                    </a>
                  ))}
                  {contactEmail && (
                    <a href={`mailto:${contactEmail}`} className="flex items-center gap-2.5 w-full text-left px-3 py-2 text-[13px] font-medium rounded-xl hover:bg-background hover:text-text-main active:bg-background transition-colors">
                      <Mail size={16} className="text-text-muted shrink-0" />
                      <span>Hubungi Saya (Email)</span>
                    </a>
                  )}
                  
                  {isAdmin && (
                    <>
                      <span className="block text-center text-text-muted/40 my-2 text-[10px] select-none tracking-widest">──── ADMIN ────</span>
                      <Link href="/admin/gallery" className="flex items-center gap-2.5 w-full text-left px-3 py-2 text-[13px] font-bold rounded-xl bg-primary-neutral/10 text-primary-neutral hover:bg-primary-neutral/20 active:bg-primary-neutral/30 transition-colors">
                        <Settings size={16} className="text-primary-neutral shrink-0" />
                        <span>Dashboard Admin</span>
                      </Link>
                    </>
                  )}
                </div>
              </div>
            </details>
          </div>
        </div>
      </header>

      {/* ======================================================= */}
      {/* 💊 2. KELOMPOK NAVBAR KHUSUS TABLET (TABLET VIEW) 💊 */}
      {/* ======================================================= */}
      <header className="hidden md:block lg:hidden sticky top-0 z-[9999] w-full border-b border-border/20 bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto max-w-7xl flex h-16 items-center justify-between px-6 relative">
          
          <div className="flex items-center gap-2 cursor-pointer">
            <span className="font-heading text-lg font-bold tracking-tight">
              <Link href="/" className="flex items-center gap-2">
                {siteLogo ? (
                  <img src={siteLogo} alt={authorName} className="w-7 h-7 rounded-full object-cover" />
                ) : null}
                {authorName}
              </Link>
            </span>
          </div>

          <div className="flex items-center gap-3 relative z-50 shrink-0">
            {/* PORTAL TARGET UNTUK RADIO WIDGET DI TABLET */}
            <div id="radio-portal-tablet" className="w-11 h-11 shrink-0 relative flex items-center justify-center group empty:hidden">
              {hasRadioConfigured && (
                <div className="dummy-radio absolute inset-0 w-11 h-11 flex items-center justify-center rounded-xl bg-surface/80 text-text-main border border-border/50 shadow-sm opacity-100 group-has-[.real-radio-btn]:hidden">
                  <Music size={18} />
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={() => setTheme(theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches) ? 'light' : 'dark')}
              className="w-11 h-11 flex items-center justify-center rounded-xl bg-surface/80 hover:bg-surface active:scale-90 transition-all text-text-main border border-border/50 shadow-sm"
              title="Ganti Tema"
            >
              <Sun size={20} className="hidden dark:block text-yellow-500" />
              <Moon size={20} className="block dark:hidden text-text-main" />
            </button>

            <details className="relative group shrink-0">
              <summary className="w-11 h-11 flex items-center justify-center rounded-xl bg-surface/80 hover:bg-surface active:scale-90 transition-all text-text-main border border-border/50 shadow-sm cursor-pointer select-none list-none [&::-webkit-details-marker]:hidden relative z-[10000]">
                <Menu size={22} className="block group-open:hidden" />
                <X size={22} className="hidden group-open:block" />
              </summary>
              
              <div className="absolute right-0 mt-3 w-[calc(100vw-2rem)] sm:w-60 max-w-[220px] max-h-[75vh] overflow-y-auto overscroll-contain scrollbar-thin rounded-2xl border border-border bg-surface/95 backdrop-blur-xl p-1.5 shadow-2xl animate-in fade-in zoom-in-95 duration-200 z-[9999] hidden group-open:block">
                <div className="space-y-0.5">
                  <Link href="/albums" className="flex items-center gap-2.5 w-full text-left px-3 py-2 text-[13px] font-medium rounded-xl hover:bg-background hover:text-text-main transition-colors cursor-pointer select-none">
                    <Images size={16} className="text-text-muted shrink-0" />
                    <span>Albums</span>
                  </Link>
                  <button type="button" onClick={() => setIsGearModalOpen(true)} className="flex items-center gap-2.5 w-full text-left px-3 py-2 text-[13px] font-medium rounded-xl hover:bg-background hover:text-text-main transition-colors cursor-pointer select-none">
                    <Camera size={16} className="text-text-muted shrink-0" />
                    <span>My Gear</span>
                  </button>
                  <a href="https://github.com/SkyDreamsID" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2.5 w-full text-left px-3 py-2 text-[13px] font-medium rounded-xl hover:bg-background hover:text-text-main transition-colors cursor-pointer select-none">
                    <User size={16} className="text-text-muted shrink-0" />
                    <span>About Me</span>
                  </a>
                  <a href="https://github.com/SkyDreamsID/galeri-web" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2.5 w-full text-left px-3 py-2 text-[13px] font-medium rounded-xl hover:bg-background hover:text-text-main transition-colors cursor-pointer select-none">
                    <Code2 size={16} className="text-text-muted shrink-0" />
                    <span>Source Code (Free)</span>
                  </a>
                  
                  <span className="block text-center text-text-muted/40 my-2 text-[10px] select-none tracking-widest">──── LAINNYA ────</span>
                  {socialLinks.map((link, idx) => (
                    <a key={idx} href={link.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2.5 w-full text-left px-3 py-2 text-[13px] font-medium rounded-xl hover:bg-background hover:text-text-main transition-colors cursor-pointer select-none">
                      {getSocialIcon(link.title, link.url)}
                      <span>{link.title}</span>
                    </a>
                  ))}
                  {contactEmail && (
                    <a href={`mailto:${contactEmail}`} className="flex items-center gap-2.5 w-full text-left px-3 py-2 text-[13px] font-medium rounded-xl hover:bg-background hover:text-text-main transition-colors cursor-pointer select-none">
                      <Mail size={16} className="text-text-muted shrink-0" />
                      <span>Hubungi Saya (Email)</span>
                    </a>
                  )}
                  
                  {isAdmin && (
                    <>
                      <span className="block text-center text-text-muted/40 my-2 text-[10px] select-none tracking-widest">──── ADMIN ────</span>
                      <Link href="/admin/gallery" className="flex items-center gap-2.5 w-full text-left px-3 py-2 text-[13px] font-bold rounded-xl bg-primary-neutral/10 text-primary-neutral hover:bg-primary-neutral/20 transition-colors cursor-pointer select-none">
                        <Settings size={16} className="text-primary-neutral shrink-0" />
                        <span>Dashboard Admin</span>
                      </Link>
                    </>
                  )}
                </div>
              </div>
            </details>
          </div>
        </div>
      </header>

      {/* ======================================================= */}
      {/* 💻 3. KELOMPOK NAVBAR KHUSUS LAPTOP/PC (DESKTOP VIEW) 💻 */}
      {/* ======================================================= */}
      <header className="hidden lg:block sticky top-0 z-[9999] w-full border-b border-border/20 bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto max-w-7xl flex h-16 items-center justify-between px-6 relative">
          
          <div className="flex items-center gap-2 cursor-pointer">
            <span className="font-heading text-xl font-bold tracking-tight">
              <Link href="/" className="flex items-center gap-2">
                {siteLogo ? (
                  <img src={siteLogo} alt={authorName} className="w-8 h-8 rounded-full object-cover" />
                ) : null}
                {authorName}
              </Link>
            </span>
          </div>

          <div className="flex items-center gap-4 relative z-50 shrink-0">
            <nav className="flex items-center gap-6">
              <Link href="/albums" className="text-sm font-medium text-text-main/80 hover:text-primary-neutral transition-colors cursor-pointer select-none">Albums</Link>
              <a href="https://github.com/SkyDreamsID/galeri-web" target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-text-main/80 hover:text-primary-neutral transition-colors cursor-pointer select-none">Source Code (Free)</a>
              <a href="https://github.com/SkyDreamsID" target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-text-main/80 hover:text-primary-neutral transition-colors cursor-pointer select-none">About Me</a>
            </nav>
            <div className="h-4 w-px bg-border/50 mx-2"></div>
            
            <label className="relative rounded-lg p-2 hover:bg-surface transition-colors min-w-[36px] min-h-[36px] flex items-center justify-center text-text-main cursor-pointer select-none">
              <input type="checkbox" aria-label="Toggle Dark Mode" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" checked={isDark} onChange={toggleDarkMode} />
              {isDark ? <Sun className="h-5 w-5 text-yellow-500 pointer-events-none" /> : <Moon className="h-5 w-5 text-text-main pointer-events-none" />}
            </label>

            <div className="h-4 w-px bg-border/50 mx-1"></div>

            <details className="relative group">
              <summary className="flex items-center justify-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-sm font-medium bg-surface/50 hover:bg-surface hover:text-text-main transition-colors min-h-[36px] cursor-pointer select-none list-none [&::-webkit-details-marker]:hidden">
                <Menu size={16} className="block group-open:hidden" />
                <X size={16} className="hidden group-open:block" />
                <span>Menu</span>
              </summary>
              <div className="absolute right-0 mt-2 w-52 max-h-[70vh] overflow-y-auto overscroll-contain scrollbar-thin rounded-xl border border-border bg-surface p-2 shadow-xl animate-in fade-in zoom-in-95 duration-200 z-[9999]">
                <div className="space-y-1">
                  <span className="block px-3 py-1.5 text-[10px] font-bold text-text-muted uppercase tracking-widest">Lainnya</span>
                  <button type="button" onClick={() => setIsGearModalOpen(true)} className="flex items-center gap-2.5 w-full text-left px-3 py-2 text-sm rounded-lg hover:bg-background hover:text-text-main transition-colors cursor-pointer select-none">
                    <Camera size={16} className="text-text-muted shrink-0" />
                    <span>My Gear</span>
                  </button>
                  {contactEmail && (
                    <a href={`mailto:${contactEmail}`} className="flex items-center gap-2.5 w-full text-left px-3 py-2 text-sm rounded-lg hover:bg-background hover:text-text-main transition-colors cursor-pointer select-none">
                      <Mail size={16} className="text-text-muted shrink-0" />
                      <span>Hubungi Saya (Email)</span>
                    </a>
                  )}
                  {isAdmin && (
                    <Link href="/admin/gallery" className="flex items-center gap-2.5 w-full text-left px-3 py-2 text-sm font-medium rounded-lg bg-primary-neutral/10 text-primary-neutral hover:bg-primary-neutral/20 transition-colors cursor-pointer select-none mt-1">
                      <Settings size={16} className="text-primary-neutral shrink-0" />
                      <span>Dashboard Admin</span>
                    </Link>
                  )}
                </div>
              </div>
            </details>
          </div>
        </div>
      </header>

      {/* Gear Modal */}
      <GearModal isOpen={isGearModalOpen} onClose={() => setIsGearModalOpen(false)} />
    </>
  )
}

