import React from 'react'
import { createClient } from '@/lib/supabase/server'

export async function Footer() {
  const supabase = await createClient()
  const { data: settings } = await supabase.from('site_settings').select('*').limit(1).single()
  
  const authorName = settings?.author_name || 'Rifki Eka Putra'
  const socialLinks: {title: string, url: string, icon_url?: string}[] = settings?.social_links || []
  const footerText = settings?.footer_text || 'Ruang digital untuk menyimpan momen, merangkai cerita, dan mendokumentasikan perjalanan melalui lensa.'
  return (
    <footer className="border-t border-border/10 bg-background mt-auto relative overflow-hidden">
      {/* Subtle Glow Background */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-2xl h-px bg-gradient-to-r from-transparent via-text-muted/20 to-transparent"></div>

      <div className="container mx-auto max-w-3xl px-6 pt-8 pb-10 md:pt-16 md:pb-20 lg:pb-24 flex flex-col items-center text-center">
        
        {/* Branding Minimalis */}
        <span className="font-heading text-base md:text-2xl font-bold tracking-tight text-text-main mb-2 md:mb-3">
          {authorName}
        </span>
        <p className="text-xs md:text-sm text-text-main/80 max-w-md leading-relaxed mb-6 md:mb-8 whitespace-pre-wrap">
          {footerText}
        </p>
        
        {/* Sosmed Links */}
        {socialLinks.length > 0 && (
          <div className="flex flex-wrap justify-center items-center gap-4 md:gap-6 mb-8 md:mb-10">
            {socialLinks.map((link, idx) => (
              <a 
                key={idx} 
                href={link.url} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-[11px] md:text-xs font-bold uppercase tracking-widest text-text-main/80 hover:text-text-main transition-colors flex items-center gap-1.5 group"
              >
                {link.icon_url ? (
                  <img src={link.icon_url} alt={link.title} className="w-5 h-5 object-contain opacity-80 group-hover:opacity-100 transition-opacity" />
                ) : null}
                <span>{link.title}</span>
              </a>
            ))}
          </div>
        )}

        {/* Copyright */}
        <div className="flex flex-col items-center gap-1.5">
          <p className="text-[11px] md:text-xs font-medium text-text-main/70">
            &copy; {new Date().getFullYear()} {authorName}. All rights reserved.
          </p>
          
          {/* EASTER EGG COPYRIGHT: Khusus buat yang fork web ini */}
          {!['rifki eka putra', 'skydreamsid', 'rifki 07', 'rifkiekap07'].includes(authorName.toLowerCase()) && (
            <p className="text-[10px] md:text-[11px] text-text-main/70 font-bold mb-1 animate-pulse">
              Designed by <a href="https://github.com/SkyDreamsID" target="_blank" rel="noopener noreferrer" className="hover:text-primary-neutral transition-colors">SkyDreamsID</a>
            </p>
          )}

          <p className="text-[10px] md:text-[11px] text-text-main/70 leading-relaxed max-w-[250px] md:max-w-none mx-auto">
            Made with <span className="text-primary-neutral animate-pulse mx-0.5 inline-block">♥</span> using Next.js, Tailwind, Supabase, Cloudinary & ZenoFM.
          </p>
        </div>

      </div>
    </footer>
  )
}
