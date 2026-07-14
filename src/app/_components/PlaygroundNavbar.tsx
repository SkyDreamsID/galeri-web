'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { Sun, Moon, Menu, X, Camera } from 'lucide-react'
import { GearModal } from './GearModal'

export function PlaygroundNavbar() {
  const [isDark, setIsDark] = useState(false)
  const [isGearModalOpen, setIsGearModalOpen] = useState(false)

  // Sync with current document theme on mount
  useEffect(() => {
    if (document.documentElement.classList.contains('dark')) {
      setIsDark(true)
    }
  }, [])

  const toggleDarkMode = () => {
    setIsDark(!isDark);
    if (!isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  return (
    <>
      {/* ======================================================= */}
      {/* 📱 1. KELOMPOK NAVBAR KHUSUS HP (MOBILE VIEW) 📱 */}
      {/* - Ubah 'h-16' di bawah jadi h-14 atau h-20 untuk ngatur TINGGI navbar */}
      {/* - Semua ubahan di blok ini HANYA ngaruh di HP */}
      {/* ======================================================= */}
      <header className="md:hidden sticky top-0 z-[9999] w-full border-b border-border/40 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 relative">
          
          <div className="flex items-center gap-2 cursor-pointer">
            <span className="font-heading text-[23px] font-bold tracking-tight">
              <Link href="/">Rifki Eka Putra</Link>
            </span>
          </div>

          <div className="flex items-center gap-3 ml-auto">
            <button
              type="button"
              onClick={toggleDarkMode}
              className="w-11 h-11 flex items-center justify-center rounded-xl bg-surface/80 hover:bg-surface active:scale-90 transition-all text-text-main border border-border/50 shadow-sm touch-manipulation"
              aria-label={isDark ? "Mode Terang" : "Mode Gelap"}
              title="Ganti Tema"
            >
              {isDark ? <Sun size={20} className="text-yellow-500" /> : <Moon size={20} />}
            </button>

            <details className="relative group">
              <summary className="w-11 h-11 flex items-center justify-center rounded-xl bg-surface/80 hover:bg-surface active:scale-90 transition-all text-text-main border border-border/50 shadow-sm list-none cursor-pointer [&::-webkit-details-marker]:hidden">
                <Menu size={22} className="block group-open:hidden" />
                <X size={22} className="hidden group-open:block" />
              </summary>
              <div className="absolute right-0 mt-4 w-[240px] rounded-2xl border border-border bg-surface p-3 shadow-2xl animate-in fade-in zoom-in-95 duration-200 z-[9999]">
                <div className="space-y-1">
                  <a href="https://github.com/SkyDreamsID/galeri-web" target="_blank" rel="noopener noreferrer" className="block w-full text-left px-4 py-3.5 text-base font-semibold rounded-xl hover:bg-background hover:text-text-main active:bg-background transition-colors">Source Code</a>
                  <a href="https://github.com/SkyDreamsID" target="_blank" rel="noopener noreferrer" className="block w-full text-left px-4 py-3.5 text-base font-semibold rounded-xl hover:bg-background hover:text-text-main active:bg-background transition-colors">About Me (GitHub)</a>
                  <div className="h-px bg-border my-2"></div>
                  <span className="block px-4 py-2 text-[11px] font-bold text-text-muted uppercase tracking-widest">Lainnya</span>
                  <button type="button" onClick={() => setIsGearModalOpen(true)} className="w-full text-left px-4 py-3 text-sm font-medium rounded-xl hover:bg-background active:bg-background transition-colors">📸 My Gear</button>
                  <a href="mailto:email.lu@gmail.com" className="block w-full text-left px-4 py-3 text-sm font-medium rounded-xl hover:bg-background active:bg-background transition-colors">✉️ Hubungi Saya</a>
                </div>
              </div>
            </details>
          </div>
        </div>
      </header>

      {/* ======================================================= */}
      {/* 💊 2. KELOMPOK NAVBAR KHUSUS TABLET (TABLET VIEW) 💊 */}
      {/* - Ubah 'h-16' di bawah jadi h-14 atau h-20 untuk ngatur TINGGI navbar */}
      {/* ======================================================= */}
      <header className="hidden md:block lg:hidden sticky top-0 z-[9999] w-full border-b border-border/40 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-8 relative">
          
          <div className="flex items-center gap-2 cursor-pointer">
            <span className="font-heading text-lg font-bold tracking-tight">
              <Link href="/">Rifki Eka Putra</Link>
            </span>
          </div>

          <div className="flex items-center gap-3 relative z-50 shrink-0">
            <nav className="flex items-center gap-4">
              <a href="https://github.com/SkyDreamsID/galeri-web" target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-text-muted hover:text-text-main transition-colors cursor-pointer select-none">Source Code</a>
              <a href="https://github.com/SkyDreamsID" target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-text-muted hover:text-text-main transition-colors cursor-pointer select-none">About Me</a>
            </nav>
            <div className="h-4 w-px bg-border mx-1"></div>
            
            <button
              type="button"
              onClick={toggleDarkMode}
              className="relative rounded-lg p-2 hover:bg-surface transition-colors min-w-[36px] min-h-[36px] flex items-center justify-center text-text-main cursor-pointer select-none touch-manipulation"
              aria-label={isDark ? "Mode Terang" : "Mode Gelap"}
              title="Ganti Tema"
            >
              {isDark ? <Sun className="h-5 w-5 text-yellow-500" /> : <Moon className="h-5 w-5 text-text-main" />}
            </button>

            <details className="relative group">
              <summary className="flex items-center justify-center gap-1.5 rounded-lg border border-border px-3 py-2 text-sm font-medium bg-surface/50 hover:bg-surface hover:text-text-main transition-colors min-h-[40px] cursor-pointer select-none list-none [&::-webkit-details-marker]:hidden">
                <Menu size={18} className="block group-open:hidden" />
                <X size={18} className="hidden group-open:block" />
              </summary>
              <div className="absolute right-0 mt-2 w-52 rounded-xl border border-border bg-surface p-2 shadow-xl animate-in fade-in zoom-in-95 duration-200 z-[9999]">
                <div className="space-y-1">
                  <span className="block px-3 py-2 text-[10px] font-bold text-text-muted uppercase tracking-widest">Lainnya</span>
                  <button type="button" onClick={() => setIsGearModalOpen(true)} className="w-full text-left px-3 py-2 text-sm rounded-lg hover:bg-background hover:text-text-main transition-colors cursor-pointer select-none">📸 My Gear</button>
                  <a href="mailto:email.lu@gmail.com" className="block w-full text-left px-3 py-2 text-sm rounded-lg hover:bg-background hover:text-text-main transition-colors cursor-pointer select-none">✉️ Hubungi Saya</a>
                </div>
              </div>
            </details>
          </div>
        </div>
      </header>

      {/* ======================================================= */}
      {/* 💻 3. KELOMPOK NAVBAR KHUSUS LAPTOP/PC (DESKTOP VIEW) 💻 */}
      {/* - Ubah 'h-16' di bawah jadi h-14 atau h-20 untuk ngatur TINGGI navbar */}
      {/* ======================================================= */}
      <header className="hidden lg:block sticky top-0 z-[9999] w-full border-b border-border/40 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto w-[95%] max-w-[3840px] flex h-16 items-center justify-between relative">
          
          <div className="flex items-center gap-2 cursor-pointer">
            <span className="font-heading text-xl font-bold tracking-tight">
              <Link href="/">Rifki Eka Putra</Link>
            </span>
          </div>

          <div className="flex items-center gap-4 relative z-50 shrink-0">
            <nav className="flex items-center gap-6">
              <a href="https://github.com/SkyDreamsID/galeri-web" target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-text-muted hover:text-text-main transition-colors cursor-pointer select-none">Source Code</a>
              <a href="https://github.com/SkyDreamsID" target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-text-muted hover:text-text-main transition-colors cursor-pointer select-none">About Me</a>
            </nav>
            <div className="h-4 w-px bg-border mx-2"></div>
            
            <label className="relative rounded-lg p-2 hover:bg-surface transition-colors min-w-[36px] min-h-[36px] flex items-center justify-center text-text-main cursor-pointer select-none">
              <input type="checkbox" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" checked={isDark} onChange={toggleDarkMode} />
              {isDark ? <Sun className="h-5 w-5 text-yellow-500 pointer-events-none" /> : <Moon className="h-5 w-5 text-text-main pointer-events-none" />}
            </label>

            <div className="h-4 w-px bg-border mx-1"></div>

            <details className="relative group">
              <summary className="flex items-center justify-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-sm font-medium bg-surface/50 hover:bg-surface hover:text-text-main transition-colors min-h-[36px] cursor-pointer select-none list-none [&::-webkit-details-marker]:hidden">
                <Menu size={16} className="block group-open:hidden" />
                <X size={16} className="hidden group-open:block" />
                <span>Menu</span>
              </summary>
              <div className="absolute right-0 mt-2 w-52 rounded-xl border border-border bg-surface p-2 shadow-xl animate-in fade-in zoom-in-95 duration-200 z-[9999]">
                <div className="space-y-1">
                  <span className="block px-3 py-2 text-[10px] font-bold text-text-muted uppercase tracking-widest">Lainnya</span>
                  <button type="button" onClick={() => setIsGearModalOpen(true)} className="w-full text-left px-3 py-2 text-sm rounded-lg hover:bg-background hover:text-text-main transition-colors cursor-pointer select-none">📸 My Gear</button>
                  <a href="mailto:email.lu@gmail.com" className="block w-full text-left px-3 py-2 text-sm rounded-lg hover:bg-background hover:text-text-main transition-colors cursor-pointer select-none">✉️ Hubungi Saya</a>
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
