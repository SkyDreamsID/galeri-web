export interface ExifData {
  camera?: string
  lens?: string
  iso?: string
  shutter_speed?: string
  aperture?: string
  focal_length?: string
  date_taken?: string
}

export interface Photo {
  id: string
  image_url: string
  public_id?: string
  copyright_name?: string
  show_watermark?: boolean
  license_type?: string
  sort_order?: number
  is_cover?: boolean
  exif_data?: ExifData[]
}

export interface PostTag {
  tags: {
    name: string
  }
}

export interface CollectionData {
  id: string
  name: string
}

export interface Post {
  id: string
  title: string
  story?: string
  location?: string
  created_at: string
  license_type?: string
  slug: string
  status: string
  views?: number
  downloads?: number
  shares?: number
  collections?: CollectionData | CollectionData[] | null
  post_tags?: PostTag[]
  photos?: Photo[]
}
