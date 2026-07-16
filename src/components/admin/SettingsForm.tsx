'use client'

import React, { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { Upload, Plus, Trash2, Save, Link as LinkIcon } from 'lucide-react'

export function SettingsForm() {
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isUploading, setIsUploading] = useState(false)

  const [settings, setSettings] = useState({
    id: '',
    site_title: '',
    hero_title: '',
    hero_description: '',
    author_name: '',
    site_logo_url: '',
    footer_text: '',
    zenofm_station_id: '',
    lastfm_username: '',
    lastfm_api_key: '',
    cloudinary_cloud_name: '',
    contact_email: '',
    social_links: [] as { title: string, url: string, icon_url?: string }[],
    theme_config: { dark_bg: '', light_bg: '', primary_color: '' }
  })

  const supabase = createClient()

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    setIsLoading(true)
    const { data, error } = await supabase.from('site_settings').select('*').limit(1).single()
    if (data) {
      setSettings({
        id: data.id,
        site_title: data.site_title || '',
        hero_title: data.hero_title || '',
        hero_description: data.hero_description || '',
        author_name: data.author_name || '',
        site_logo_url: data.site_logo_url || '',
        footer_text: data.footer_text || '',
        zenofm_station_id: data.zenofm_station_id || '',
        lastfm_username: data.lastfm_username || '',
        lastfm_api_key: data.lastfm_api_key || '',
        cloudinary_cloud_name: data.cloudinary_cloud_name || '',
        contact_email: data.contact_email || '',
        social_links: data.social_links || [],
        theme_config: data.theme_config || { dark_bg: '', light_bg: '', primary_color: '' }
      })
    }
    if (error && error.code !== 'PGRST116') {
      toast.error('Gagal memuat pengaturan')
      console.error(error)
    }
    setIsLoading(false)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setSettings(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleAddSocialLink = () => {
    setSettings(prev => ({
      ...prev,
      social_links: [...prev.social_links, { title: '', url: '' }]
    }))
  }

  const handleSocialLinkChange = (index: number, field: 'title' | 'url' | 'icon_url', value: string) => {
    setSettings(prev => {
      const newLinks = [...prev.social_links]
      newLinks[index][field] = value
      return { ...prev, social_links: newLinks }
    })
  }

  const handleSocialIconUpload = async (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return
    const file = e.target.files[0]
    setIsUploading(true)

    try {
      const signRes = await fetch('/api/cloudinary/sign?folder=galeri_settings')
      const signData = await signRes.json()
      if (!signData.signature) throw new Error('Gagal mendapatkan signature Cloudinary')

      const formData = new FormData()
      formData.append('file', file)
      formData.append('api_key', signData.apiKey)
      formData.append('timestamp', signData.timestamp)
      formData.append('signature', signData.signature)
      formData.append('folder', 'galeri_settings')

      const uploadRes = await fetch(`https://api.cloudinary.com/v1_1/${signData.cloudName}/image/upload`, {
        method: 'POST',
        body: formData
      })
      const uploadData = await uploadRes.json()
      
      if (uploadData.secure_url) {
        handleSocialLinkChange(index, 'icon_url', uploadData.secure_url)
        toast.success('Icon berhasil diunggah')
      } else {
        throw new Error('Gagal upload icon')
      }
    } catch (error) {
      console.error(error)
      toast.error('Terjadi kesalahan saat upload icon')
    } finally {
      setIsUploading(false)
    }
  }

  const handleThemeChange = (field: 'dark_bg' | 'light_bg' | 'primary_color', value: string) => {
    setSettings(prev => ({
      ...prev,
      theme_config: { ...prev.theme_config, [field]: value }
    }))
  }

  const resetTheme = () => {
    if (confirm('Yakin ingin mereset tema ke warna bawaan asli (Legendary UI)?')) {
      setSettings(prev => ({
        ...prev,
        theme_config: { dark_bg: '', light_bg: '', primary_color: '' }
      }))
      toast.success('Warna tema dikembalikan ke default')
    }
  }

  const isLightColor = (hex: string) => {
    const color = hex.charAt(0) === '#' ? hex.substring(1, 7) : hex
    if (color.length !== 6) return true
    const r = parseInt(color.substring(0, 2), 16)
    const g = parseInt(color.substring(2, 4), 16)
    const b = parseInt(color.substring(4, 6), 16)
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
    return luminance > 0.5
  }

  const handleThemeBlur = (field: 'dark_bg' | 'light_bg', value: string) => {
    if (!value || value.length < 7) return
    const isLight = isLightColor(value)
    if (field === 'dark_bg' && isLight) {
      toast.error('Dark Background harus menggunakan warna gelap!')
    } else if (field === 'light_bg' && !isLight) {
      toast.error('Light Background harus menggunakan warna terang!')
    }
  }

  const handleRemoveSocialLink = (index: number) => {
    setSettings(prev => {
      const newLinks = [...prev.social_links]
      newLinks.splice(index, 1)
      return { ...prev, social_links: newLinks }
    })
  }

  const handleUploadLogo = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return
    const file = e.target.files[0]
    setIsUploading(true)

    try {
      const signRes = await fetch('/api/cloudinary/sign?folder=galeri_settings')
      const signData = await signRes.json()
      if (!signData.signature) throw new Error('Gagal mendapatkan signature Cloudinary')

      const formData = new FormData()
      formData.append('file', file)
      formData.append('api_key', signData.apiKey)
      formData.append('timestamp', signData.timestamp)
      formData.append('signature', signData.signature)
      formData.append('folder', 'galeri_settings')

      const uploadRes = await fetch(`https://api.cloudinary.com/v1_1/${signData.cloudName}/image/upload`, {
        method: 'POST',
        body: formData
      })
      const uploadData = await uploadRes.json()
      
      if (uploadData.secure_url) {
        setSettings(prev => ({ ...prev, site_logo_url: uploadData.secure_url }))
        toast.success('Logo berhasil diunggah')
      } else {
        throw new Error('Gagal upload gambar')
      }
    } catch (error) {
      console.error(error)
      toast.error('Terjadi kesalahan saat upload logo')
    } finally {
      setIsUploading(false)
    }
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const payload = {
        site_title: settings.site_title,
        hero_title: settings.hero_title,
        hero_description: settings.hero_description,
        author_name: settings.author_name,
        site_logo_url: settings.site_logo_url,
        footer_text: settings.footer_text,
        zenofm_station_id: settings.zenofm_station_id,
        lastfm_username: settings.lastfm_username,
        lastfm_api_key: settings.lastfm_api_key,
        cloudinary_cloud_name: settings.cloudinary_cloud_name,
        contact_email: settings.contact_email,
        social_links: settings.social_links,
        theme_config: settings.theme_config
      }

      // Jika belum ada ID, berarti tabel kosong, pakai insert. Kalau udah ada ID, update.
      if (settings.id) {
        const { error } = await supabase
          .from('site_settings')
          .update(payload)
          .eq('id', settings.id)
        if (error) throw error
      } else {
        const { error, data } = await supabase
          .from('site_settings')
          .insert([payload])
          .select()
        
        if (error) throw error
        if (data) setSettings(prev => ({ ...prev, id: data[0].id }))
      }
      toast.success('Pengaturan berhasil disimpan')
    } catch (err: any) {
      console.error(err)
      toast.error(err.message || 'Gagal menyimpan pengaturan')
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) return <div className="p-8 text-center text-text-muted animate-pulse">Memuat pengaturan...</div>

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      
      {/* Pengaturan Dasar */}
      <div className="bg-surface border border-border/50 rounded-2xl p-6 md:p-8 shadow-sm">
        <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
          <span className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">1</span>
          Informasi Dasar
        </h2>
        
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-text-muted">Nama Author / Pemilik Web</label>
              <input 
                name="author_name"
                value={settings.author_name}
                onChange={handleInputChange}
                className="w-full bg-background border border-border/50 rounded-xl px-4 py-3 text-sm focus:border-primary focus:ring-1 focus:ring-primary transition-all outline-none" 
                placeholder="Masukkan Nama"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-text-muted">Judul Website (Title Bar)</label>
              <input 
                name="site_title"
                value={settings.site_title}
                onChange={handleInputChange}
                className="w-full bg-background border border-border/50 rounded-xl px-4 py-3 text-sm focus:border-primary focus:ring-1 focus:ring-primary transition-all outline-none" 
                placeholder="Ex: Galeriku"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-text-muted">Email Kontak</label>
              <input 
                name="contact_email"
                type="email"
                value={settings.contact_email}
                onChange={handleInputChange}
                className="w-full bg-background border border-border/50 rounded-xl px-4 py-3 text-sm focus:border-primary focus:ring-1 focus:ring-primary transition-all outline-none" 
                placeholder="hello@domain.com"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-text-muted">Header Halaman Utama</label>
            <input 
              name="hero_title"
              value={settings.hero_title}
              onChange={handleInputChange}
              className="w-full bg-background border border-border/50 rounded-xl px-4 py-3 text-sm focus:border-primary focus:ring-1 focus:ring-primary transition-all outline-none font-bold text-lg" 
              placeholder="Ex: Jurnal Visual"
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-text-muted">Slogan / Deskripsi</label>
            <textarea 
              name="hero_description"
              value={settings.hero_description}
              onChange={handleInputChange}
              rows={3}
              className="w-full bg-background border border-border/50 rounded-xl px-4 py-3 text-sm focus:border-primary focus:ring-1 focus:ring-primary transition-all outline-none resize-none" 
              placeholder="Ex: Ruang untuk menyimpan momen..."
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-text-muted">Teks Footer</label>
            <textarea 
              name="footer_text"
              value={settings.footer_text}
              onChange={handleInputChange}
              rows={2}
              className="w-full bg-background border border-border/50 rounded-xl px-4 py-3 text-sm focus:border-primary focus:ring-1 focus:ring-primary transition-all outline-none resize-none" 
              placeholder="Teks singkat di area footer..."
            />
          </div>
        </div>
      </div>

      {/* Pengaturan Logo */}
      <div className="bg-surface border border-border/50 rounded-2xl p-6 md:p-8 shadow-sm">
        <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
          <span className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">2</span>
          Logo Website (Opsional)
        </h2>
        
        <div className="flex flex-col md:flex-row items-center gap-8">
          <div className="w-32 h-32 shrink-0 bg-background border-2 border-dashed border-border rounded-2xl flex items-center justify-center overflow-hidden relative group">
            {settings.site_logo_url ? (
              <>
                <img src={settings.site_logo_url} alt="Site Logo" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <span className="text-white text-xs font-medium">Ubah Logo</span>
                </div>
              </>
            ) : (
              <div className="text-center p-4">
                <Upload className="w-8 h-8 text-text-muted mx-auto mb-2 opacity-50" />
                <span className="text-xs text-text-muted block">Belum ada logo</span>
              </div>
            )}
            <input 
              type="file" 
              accept="image/*"
              onChange={handleUploadLogo}
              disabled={isUploading}
              className="absolute inset-0 opacity-0 cursor-pointer disabled:cursor-not-allowed" 
            />
          </div>
          <div className="flex-1 space-y-2 text-center md:text-left">
            <p className="text-sm text-text-main font-medium">Gunakan logo bentuk kotak persegi (Aspek Rasio 1:1)</p>
            <p className="text-xs text-text-muted leading-relaxed">
              Disarankan ukuran maksimal <b>500x500 px</b> dengan format PNG transparan agar tidak pecah dan rapih saat dipasang di Navbar.
            </p>
            {isUploading && (
              <p className="text-xs text-primary font-medium animate-pulse mt-2">Sedang mengunggah logo...</p>
            )}
            {settings.site_logo_url && (
              <button 
                onClick={() => setSettings(prev => ({ ...prev, site_logo_url: '' }))}
                className="text-xs text-red-500 hover:text-red-400 font-medium mt-2 transition-colors"
              >
                Hapus Logo
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Pengaturan Sosial Media */}
      <div className="bg-surface border border-border/50 rounded-2xl p-6 md:p-8 shadow-sm">
        <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
          <span className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">3</span>
          Sosial Media & Tautan
        </h2>
        
        <p className="text-sm text-text-muted mb-6">Tautan ini akan muncul di bagian Footer website. Anda bisa menambahkan tak terbatas.</p>

        <div className="space-y-4">
          {settings.social_links.map((link, idx) => (
            <div key={idx} className="flex flex-col sm:flex-row items-center gap-3 bg-background border border-border/50 p-3 rounded-xl relative group">
              {/* Icon Upload / Display */}
              <div className="shrink-0 relative group/icon cursor-pointer">
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={(e) => handleSocialIconUpload(idx, e)} 
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
                <div className="w-10 h-10 rounded-lg bg-surface border border-border/50 flex items-center justify-center overflow-hidden">
                  {link.icon_url ? (
                    <img src={link.icon_url} alt="icon" className="w-6 h-6 object-contain" />
                  ) : (
                    <Upload className="w-4 h-4 text-text-muted" />
                  )}
                </div>
              </div>

              <div className="w-full sm:w-1/3">
                <input 
                  value={link.title}
                  onChange={(e) => handleSocialLinkChange(idx, 'title', e.target.value)}
                  className="w-full bg-transparent border-none outline-none text-sm px-2 font-medium" 
                  placeholder="Nama (Cth: Instagram)"
                />
              </div>
              <div className="hidden sm:block w-px h-6 bg-border/50"></div>
              <div className="w-full sm:flex-1 flex items-center gap-2">
                <LinkIcon className="w-4 h-4 text-text-muted shrink-0 ml-2 sm:ml-0" />
                <input 
                  value={link.url}
                  onChange={(e) => handleSocialLinkChange(idx, 'url', e.target.value)}
                  className="w-full bg-transparent border-none outline-none text-sm text-text-muted focus:text-text-main transition-colors" 
                  placeholder="URL (Cth: https://instagram.com/...)"
                />
              </div>
              <button 
                onClick={() => handleRemoveSocialLink(idx)}
                className="absolute right-3 sm:static p-2 text-text-muted hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors opacity-100 sm:opacity-0 sm:group-hover:opacity-100"
                title="Hapus Tautan"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
          
          <button 
            onClick={handleAddSocialLink}
            className="w-full flex items-center justify-center gap-2 py-4 border-2 border-dashed border-border/50 rounded-xl text-sm font-medium text-text-muted hover:text-primary hover:border-primary/50 transition-all hover:bg-primary/5"
          >
            <Plus className="w-4 h-4" />
            Tambah Tautan Sosial Media
          </button>
        </div>
      </div>

      {/* Kustomisasi Tema */}
      <div className="bg-surface border border-border/50 rounded-2xl p-6 md:p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">4</span>
            Kustomisasi Tema
          </h2>
          <button 
            onClick={resetTheme}
            type="button"
            className="text-sm font-medium text-red-500 hover:text-red-600 bg-red-500/10 hover:bg-red-500/20 px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
          >
            <Trash2 className="w-4 h-4" /> Reset ke Default
          </button>
        </div>
        
        <p className="text-sm text-text-muted mb-6">
          Ubah Theme Color utama web. Kosongkan nilai untuk kembali menggunakan warna asli (Legendary UI).
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-text-muted">Primary Color (Aksen)</label>
            <div className="flex gap-2">
              <input 
                type="color"
                name="primary_color"
                value={settings.theme_config.primary_color || '#00ADB5'}
                onChange={(e) => handleThemeChange('primary_color', e.target.value)}
                className="w-12 h-12 rounded-xl cursor-pointer bg-background border border-border/50 p-1 shrink-0" 
              />
              <input 
                type="text"
                value={settings.theme_config.primary_color || ''}
                onChange={(e) => handleThemeChange('primary_color', e.target.value)}
                className="w-full bg-background border border-border/50 rounded-xl px-4 py-3 text-sm focus:border-primary focus:ring-1 focus:ring-primary transition-all outline-none" 
                placeholder="#00ADB5"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-text-muted">Dark Mode Background</label>
            <div className="flex gap-2">
              <input 
                type="color"
                name="dark_bg"
                value={settings.theme_config.dark_bg || '#222831'}
                onChange={(e) => handleThemeChange('dark_bg', e.target.value)}
                onBlur={(e) => handleThemeBlur('dark_bg', e.target.value)}
                className="w-12 h-12 rounded-xl cursor-pointer bg-background border border-border/50 p-1 shrink-0" 
              />
              <input 
                type="text"
                value={settings.theme_config.dark_bg || ''}
                onChange={(e) => handleThemeChange('dark_bg', e.target.value)}
                onBlur={(e) => handleThemeBlur('dark_bg', e.target.value)}
                className="w-full bg-background border border-border/50 rounded-xl px-4 py-3 text-sm focus:border-primary focus:ring-1 focus:ring-primary transition-all outline-none" 
                placeholder="#222831"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-text-muted">Light Mode Background</label>
            <div className="flex gap-2">
              <input 
                type="color"
                name="light_bg"
                value={settings.theme_config.light_bg || '#EEEEEE'}
                onChange={(e) => handleThemeChange('light_bg', e.target.value)}
                onBlur={(e) => handleThemeBlur('light_bg', e.target.value)}
                className="w-12 h-12 rounded-xl cursor-pointer bg-background border border-border/50 p-1 shrink-0" 
              />
              <input 
                type="text"
                value={settings.theme_config.light_bg || ''}
                onChange={(e) => handleThemeChange('light_bg', e.target.value)}
                onBlur={(e) => handleThemeBlur('light_bg', e.target.value)}
                className="w-full bg-background border border-border/50 rounded-xl px-4 py-3 text-sm focus:border-primary focus:ring-1 focus:ring-primary transition-all outline-none" 
                placeholder="#EEEEEE"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Pengaturan API & Integrasi */}
      <div className="bg-surface border border-border/50 rounded-2xl p-6 md:p-8 shadow-sm">
        <h2 className="text-xl font-bold mb-2 flex items-center gap-2">
          <span className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">5</span>
          Pengaturan Streaming Radio
        </h2>
        <p className="text-sm text-text-muted mb-6">
          Kosongkan kolom ini jika tidak ingin menampilkan widget radio, atau isi dengan link streaming radio (bebas).
        </p>
        
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-text-muted">Link Radio Streaming (Zeno.fm / Icecast / Shoutcast)</label>
            <input 
              name="zenofm_station_id"
              value={settings.zenofm_station_id}
              onChange={handleInputChange}
              className="w-full bg-background border border-border/50 rounded-xl px-4 py-3 text-sm focus:border-primary focus:ring-1 focus:ring-primary transition-all outline-none" 
              placeholder="https://stream.zeno.fm/cnho9wgxkkovv"
            />
            <p className="text-xs text-text-muted">Masukkan URL streaming radio, atau ID Zeno.fm nya saja.</p>
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-4">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="bg-primary text-primary-foreground px-8 py-3 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-primary/90 transition-all shadow-md active:scale-95 disabled:opacity-50"
        >
          {isSaving ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              Menyimpan...
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              Simpan Semua Pengaturan
            </>
          )}
        </button>
      </div>
    </div>
  )
}
