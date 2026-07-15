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
    social_links: [] as { title: string, url: string }[]
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
        social_links: data.social_links || []
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

  const handleSocialLinkChange = (index: number, field: 'title' | 'url', value: string) => {
    setSettings(prev => {
      const newLinks = [...prev.social_links]
      newLinks[index][field] = value
      return { ...prev, social_links: newLinks }
    })
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
        social_links: settings.social_links
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-text-muted">Nama Author / Pemilik Web</label>
              <input 
                name="author_name"
                value={settings.author_name}
                onChange={handleInputChange}
                className="w-full bg-background border border-border/50 rounded-xl px-4 py-3 text-sm focus:border-primary focus:ring-1 focus:ring-primary transition-all outline-none" 
                placeholder="Rifki Eka Putra"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-text-muted">Judul Website (Title Bar)</label>
              <input 
                name="site_title"
                value={settings.site_title}
                onChange={handleInputChange}
                className="w-full bg-background border border-border/50 rounded-xl px-4 py-3 text-sm focus:border-primary focus:ring-1 focus:ring-primary transition-all outline-none" 
                placeholder="Galeri Rifki"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-text-muted">Judul Hero (Halaman Utama)</label>
            <input 
              name="hero_title"
              value={settings.hero_title}
              onChange={handleInputChange}
              className="w-full bg-background border border-border/50 rounded-xl px-4 py-3 text-sm focus:border-primary focus:ring-1 focus:ring-primary transition-all outline-none font-bold text-lg" 
              placeholder="Jurnal Visual"
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-text-muted">Deskripsi Hero</label>
            <textarea 
              name="hero_description"
              value={settings.hero_description}
              onChange={handleInputChange}
              rows={3}
              className="w-full bg-background border border-border/50 rounded-xl px-4 py-3 text-sm focus:border-primary focus:ring-1 focus:ring-primary transition-all outline-none resize-none" 
              placeholder="Ruang untuk menyimpan momen..."
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
              placeholder="Teks penjelasan singkat di area footer..."
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

      {/* Pengaturan API & Integrasi */}
      <div className="bg-surface border border-border/50 rounded-2xl p-6 md:p-8 shadow-sm">
        <h2 className="text-xl font-bold mb-2 flex items-center gap-2">
          <span className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">4</span>
          API & Integrasi Eksternal
        </h2>
        <p className="text-sm text-text-muted mb-6">
          Kosongkan kolom ini jika ingin menggunakan file <code className="bg-background px-1 py-0.5 rounded text-primary-neutral font-mono text-xs">.env.local</code> bawaan. Berguna bagi pengguna yang mem-fork template ini.
        </p>
        
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-text-muted">Zeno.fm Station ID</label>
            <input 
              name="zenofm_station_id"
              value={settings.zenofm_station_id}
              onChange={handleInputChange}
              className="w-full bg-background border border-border/50 rounded-xl px-4 py-3 text-sm focus:border-primary focus:ring-1 focus:ring-primary transition-all outline-none" 
              placeholder="Misal: cnho9wgxkkovv"
            />
            <p className="text-xs text-text-muted">Kumpulan kode acak yang ada di akhir URL stream Zeno.fm.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 opacity-50">
            <div className="space-y-2">
              <label className="text-sm font-medium text-text-muted">Last.fm Username (Segera Hadir)</label>
              <input 
                name="lastfm_username"
                value={settings.lastfm_username}
                onChange={handleInputChange}
                disabled
                className="w-full bg-background border border-border/50 rounded-xl px-4 py-3 text-sm focus:border-primary focus:ring-1 focus:ring-primary transition-all outline-none" 
                placeholder="Username"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-text-muted">Last.fm API Key (Segera Hadir)</label>
              <input 
                name="lastfm_api_key"
                value={settings.lastfm_api_key}
                onChange={handleInputChange}
                disabled
                className="w-full bg-background border border-border/50 rounded-xl px-4 py-3 text-sm focus:border-primary focus:ring-1 focus:ring-primary transition-all outline-none" 
                placeholder="API Key"
              />
            </div>
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
