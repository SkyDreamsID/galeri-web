'use client'

import React, { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { X, Camera, Loader2 } from 'lucide-react'

type Gear = {
  id: string
  name: string
  type: string
  description?: string
  image_url?: string
}

export function GearModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const supabase = createClient()
  const [gears, setGears] = useState<Gear[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [expandedGears, setExpandedGears] = useState<Record<string, boolean>>({})

  const toggleExpand = (id: string) => {
    setExpandedGears(prev => ({ ...prev, [id]: !prev[id] }))
  }

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden' // Prevent scroll when modal is open
      fetchGears()
    } else {
      document.body.style.overflow = 'auto'
    }
    return () => { document.body.style.overflow = 'auto' }
  }, [isOpen])

  const fetchGears = async () => {
    setIsLoading(true)
    const { data, error } = await supabase
      .from('gears')
      .select('id, name, type, description, image_url')
      .order('created_at', { ascending: false })
    
    if (!error && data) {
      setGears(data)
    }
    setIsLoading(false)
  }

  if (!isOpen) return null

  // Grouping gears by type
  const groupedGears = gears.reduce((acc, gear) => {
    if (!acc[gear.type]) acc[gear.type] = []
    acc[gear.type].push(gear)
    return acc
  }, {} as Record<string, Gear[]>)

  // Sort categories based on priority
  const categoryOrder: Record<string, number> = { 
    'Kamera': 1, 
    'Lensa': 2, 
    'Drone': 3, 
    'Lainnya': 4 
  }
  
  const sortedCategories = Object.keys(groupedGears).sort((a, b) => {
    const orderA = categoryOrder[a] || 99
    const orderB = categoryOrder[b] || 99
    return orderA - orderB
  })

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 sm:p-6 md:p-12">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-surface border border-border shadow-2xl rounded-2xl md:rounded-[24px] flex flex-col animate-in fade-in zoom-in-95 duration-200 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border/40 shrink-0">
          <div>
            <h2 className="text-2xl font-heading font-bold tracking-tight text-text-main flex items-center gap-2">
              <Camera className="text-primary-neutral" size={24} />
              My Gear
            </h2>
            <p className="text-sm text-text-muted mt-1">Peralatan tempur yang saya pakai.</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-xl bg-background hover:bg-border/50 text-text-muted hover:text-text-main transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Body / Content */}
        <div className="p-6 overflow-y-auto flex-1">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-48 space-y-4">
              <Loader2 className="w-8 h-8 animate-spin text-primary-neutral" />
              <p className="text-sm text-text-muted">Membongkar tas kamera...</p>
            </div>
          ) : gears.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-center">
              <Camera className="w-12 h-12 mb-4 text-text-muted/50" />
              <p className="text-text-main font-medium">Belum ada gear.</p>
              <p className="text-sm text-text-muted">Sang fotografer belum memamerkan senjatanya.</p>
            </div>
          ) : (
            <div className="space-y-10">
              {sortedCategories.map((type) => (
                <div key={type} className="space-y-4">
                  <h3 className="text-lg font-heading font-bold text-text-main flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-primary-neutral"></span>
                    {type}
                  </h3>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {groupedGears[type].map(gear => (
                      <div key={gear.id} className="bg-background/50 border border-border/40 rounded-xl overflow-hidden hover:border-primary-neutral/50 transition-colors group">
                        <div className="h-40 w-full relative bg-surface flex items-center justify-center border-b border-border/40">
                          {gear.image_url ? (
                            <img src={gear.image_url} alt={gear.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                          ) : (
                            <Camera className="w-12 h-12 text-text-muted/20" />
                          )}
                        </div>
                        <div className="p-4">
                          <h4 className="font-bold text-text-main mb-1 line-clamp-2 leading-snug">{gear.name}</h4>
                          {gear.description && (
                            <div 
                              onClick={() => toggleExpand(gear.id)}
                              className={`cursor-pointer group/desc transition-all ${gear.description.length > 80 ? 'active:opacity-70' : ''}`}
                            >
                              <p className={`text-xs text-text-muted leading-relaxed mt-1.5 transition-all ${expandedGears[gear.id] ? '' : 'line-clamp-2'}`}>
                                {gear.description}
                              </p>
                              {gear.description.length > 80 && (
                                <p className="text-[10px] text-primary-neutral mt-1.5 font-medium opacity-80 hover:opacity-100 hover:underline">
                                  {expandedGears[gear.id] ? 'Tutup' : 'Selengkapnya...'}
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
