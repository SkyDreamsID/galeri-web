import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getOptimizedImageUrl(url: string, width: number = 1920) {
  if (!url) return ''
  // Cek apakah ini URL Cloudinary
  if (url.includes('res.cloudinary.com')) {
    // Sisipkan parameter transformasi sebelum /upload/
    // Contoh: .../image/upload/v123... -> .../image/upload/q_auto,f_auto,w_1920/v123...
    return url.replace('/upload/', `/upload/q_auto,f_auto,w_${width},c_limit/`)
  }
  return url
}
