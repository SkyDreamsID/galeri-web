import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export interface WatermarkOptions {
  position?: 'north_west' | 'north' | 'north_east' | 'center' | 'south_west' | 'south' | 'south_east' | 'west' | 'east' | string
  font?: string
  size?: 'small' | 'medium' | 'large' | string
  opacity?: number
}

export function getOptimizedImageUrl(
  url: string, 
  width: number = 1920, 
  watermarkText?: string | null, 
  enableWatermark: boolean = true, 
  watermarkScale: number = 1,
  options?: WatermarkOptions
) {
  if (!url) return ''
  // Cek apakah ini URL Cloudinary
  if (url.includes('res.cloudinary.com')) {
    let transformation = `q_auto,f_auto,w_${width},c_limit`
    
    if (watermarkText && enableWatermark) {
      // Konfigurasi dinamis
      let font = options?.font ? options.font.replace(/ /g, '_') : 'Arial'
      if (font === 'Monospace') font = 'Courier'
      
      const posMap: Record<string, string> = {
        north_west: 'g_north_west',
        north: 'g_north',
        north_east: 'g_north_east',
        west: 'g_west',
        center: 'g_center',
        east: 'g_east',
        south_west: 'g_south_west',
        south: 'g_south',
        south_east: 'g_south_east',
      }

      const position = options?.position && posMap[options.position] ? posMap[options.position] : (options?.position ? `g_${options.position}` : 'g_south_east')
      const opacity = options?.opacity ?? 50
      
      let baseMultiplier = 0.015 // medium default
      if (options?.size === 'small') baseMultiplier = 0.01
      if (options?.size === 'large') baseMultiplier = 0.025

      const fontSize = Math.max(12, Math.round(width * baseMultiplier * watermarkScale))
      const padding = Math.max(10, Math.round(width * 0.01 * watermarkScale)) 
      
      let padStr = `,x_${padding},y_${padding}`
      if (position === 'g_center') {
        padStr = ''
      } else if (position === 'g_north' || position === 'g_south') {
        padStr = `,y_${padding}`
      } else if (position === 'g_west' || position === 'g_east') {
        padStr = `,x_${padding}`
      }

      const encodedText = encodeURIComponent(watermarkText)
      transformation += `/l_text:${font}_${fontSize}_bold:${encodedText},${position}${padStr},co_white,o_${opacity}`
    }
    
    // Sisipkan parameter transformasi sebelum /upload/
    return url.replace('/upload/', `/upload/${transformation}/`)
  }
  return url
}

export function formatCreators(creators: string[]): string {
  if (!creators || creators.length === 0) return '';
  if (creators.length === 1) return creators[0];
  
  const last = creators[creators.length - 1];
  const rest = creators.slice(0, -1);
  return `${rest.join(', ')} & ${last}`;
}

export function formatDate(dateString: string, longMonth: boolean = false): string {
  if (!dateString) return ''
  const d = new Date(dateString)
  if (isNaN(d.getTime())) return ''
  const shortMonths = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des']
  const longMonths = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember']
  const day = d.getDate()
  const month = longMonth ? longMonths[d.getMonth()] : shortMonths[d.getMonth()]
  const year = d.getFullYear()
  return `${day} ${month} ${year}`
}
