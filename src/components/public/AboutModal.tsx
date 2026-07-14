'use client'

import React, { useState, useEffect } from 'react'
import { X, Instagram, Twitter, Github, Mail, Info, Menu } from 'lucide-react'

export function AboutModal() {
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'auto'
    }
    return () => { document.body.style.overflow = 'auto' }
  }, [isOpen])

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="p-2 -mr-2 text-text-muted hover:text-text-main transition-colors rounded-md"
        aria-label="Menu"
      >
        <Menu size={24} strokeWidth={2.5} />
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-[100] flex justify-end">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-background/80 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Sidebar Panel */}
          <div 
            className="relative w-full max-w-sm bg-surface h-full shadow-2xl border-l border-border/50 p-6 sm:p-8 flex flex-col overflow-y-auto animate-in slide-in-from-right duration-300"
          >
            <button 
              onClick={() => setIsOpen(false)}
              className="absolute top-6 right-6 p-2 rounded-full hover:bg-hover-bg transition-colors"
            >
              <X size={20} className="text-text-muted" />
            </button>

            <div className="flex-1 space-y-8 mt-8">
              {/* Profile Header */}
              <div className="space-y-4">
                <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-primary-neutral to-blue-500/50 p-1">
                  <div className="w-full h-full bg-background rounded-full flex items-center justify-center font-heading text-2xl font-bold">
                    R.
                  </div>
                </div>
                <div>
                  <h2 className="text-2xl font-heading font-bold text-text-main">Rifki Eka Putra</h2>
                  <p className="text-text-muted mt-1 text-sm">Fotografer & Developer</p>
                </div>
              </div>

              {/* Bio */}
              <div className="space-y-3 text-sm text-text-muted/90 leading-relaxed">
                <p>
                  Selamat datang di galeri portofolio pribadi saya. Tempat di mana setiap momen yang ditangkap melalui lensa memiliki ceritanya masing-masing.
                </p>
                <p>
                  Proyek ini dibangun untuk merayakan keindahan dalam hal-hal sederhana.
                </p>
              </div>

              {/* Social Links */}
              <div className="space-y-4 pt-4 border-t border-border/40">
                <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider">Connect</h3>
                <div className="flex flex-col gap-3">
                  <a href="#" className="flex items-center gap-3 text-sm text-text-muted hover:text-primary-neutral transition-colors group">
                    <div className="w-8 h-8 rounded-full bg-background border border-border/50 flex items-center justify-center group-hover:border-primary-neutral/50">
                      <Instagram size={14} />
                    </div>
                    <span>@rifkiekptra</span>
                  </a>
                  <a href="#" className="flex items-center gap-3 text-sm text-text-muted hover:text-primary-neutral transition-colors group">
                    <div className="w-8 h-8 rounded-full bg-background border border-border/50 flex items-center justify-center group-hover:border-primary-neutral/50">
                      <Github size={14} />
                    </div>
                    <span>rifkiekptra</span>
                  </a>
                  <a href="mailto:hello@example.com" className="flex items-center gap-3 text-sm text-text-muted hover:text-primary-neutral transition-colors group">
                    <div className="w-8 h-8 rounded-full bg-background border border-border/50 flex items-center justify-center group-hover:border-primary-neutral/50">
                      <Mail size={14} />
                    </div>
                    <span>Contact Me</span>
                  </a>
                </div>
              </div>
            </div>

            {/* Footer inside modal */}
            <div className="pt-8 mt-auto border-t border-border/40 text-[10px] text-text-muted/60 text-center">
              &copy; {new Date().getFullYear()} Rifki Eka Putra. All rights reserved.
            </div>
          </div>
        </div>
      )}
    </>
  )
}
