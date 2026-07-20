import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getOptimizedImageUrl(url: string, width: number = 1920, watermarkText?: string | null, enableWatermark: boolean = true) {
  if (!url) return ''
  // Cek apakah ini URL Cloudinary
  if (url.includes('res.cloudinary.com')) {
    let transformation = `q_auto,f_auto,w_${width},c_limit`
    
    if (watermarkText && enableWatermark) {
      // Watermark: font size 18, opacity 50 - subtle tapi terbaca
      const encodedText = encodeURIComponent(watermarkText).replace(/%20/g, '%20')
      transformation += `/l_text:Arial_18_bold_opacity_50:${encodedText},g_south_east,x_16,y_16,co_white`
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
