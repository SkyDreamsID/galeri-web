'use client'

import React, { createContext, useContext } from 'react'

export type SiteSettings = {
  id?: string
  site_title?: string
  hero_title?: string
  hero_description?: string
  author_name?: string
  site_logo_url?: string
  social_links?: any
  footer_text?: string
  zenofm_station_id?: string
  lastfm_username?: string
  lastfm_api_key?: string
  cloudinary_cloud_name?: string
  contact_email?: string
  theme_config?: {
    dark_bg?: string
    light_bg?: string
    primary_color?: string
    enable_watermark?: boolean
    watermark_position?: 'north_west' | 'north' | 'north_east' | 'center' | 'south_west' | 'south' | 'south_east'
    watermark_font?: string
    watermark_size?: 'small' | 'medium' | 'large'
    watermark_opacity?: number
    show_public_stats?: boolean
  }
}

const SiteSettingsContext = createContext<SiteSettings>({})

export function SiteSettingsProvider({ 
  children, 
  settings 
}: { 
  children: React.ReactNode
  settings: SiteSettings | null
}) {
  return (
    <SiteSettingsContext.Provider value={settings || {}}>
      {children}
    </SiteSettingsContext.Provider>
  )
}

export function useSiteSettings() {
  return useContext(SiteSettingsContext)
}
