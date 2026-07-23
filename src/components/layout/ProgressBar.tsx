'use client'

import { AppProgressBar as ProgressBar } from 'next-nprogress-bar'
import { useSiteSettings } from '@/contexts/SiteSettingsContext'

export function GlobalProgressBar() {
  const settings = useSiteSettings()
  
  // Ambil warna tema utama dari pengaturan, fallback ke warna primary-neutral
  const primaryColor = settings?.theme_config?.primary_color || '#00adb5'

  return (
    <ProgressBar
      height="3px"
      color={primaryColor}
      options={{ showSpinner: false }}
      shallowRouting
    />
  )
}
