'use client'

import { useState, useEffect, useRef } from 'react'
import { Input } from '@/components/ui/input'
import { createClient } from '@/lib/supabase/client'
import { Camera } from 'lucide-react'

interface LensInputProps {
  value: string
  onChange: (val: string) => void
  placeholder?: string
  className?: string
}

export function saveLensToHistory(lensName: string) {
  if (!lensName || !lensName.trim()) return
  try {
    const trimmed = lensName.trim()
    const stored = localStorage.getItem('lens_history')
    let history: string[] = stored ? JSON.parse(stored) : []
    if (!history.some(l => l.toLowerCase() === trimmed.toLowerCase())) {
      history.unshift(trimmed)
      localStorage.setItem('lens_history', JSON.stringify(history.slice(0, 50)))
    }
  } catch (err) {
    console.error('Failed to save lens history to localStorage:', err)
  }
}

export function LensInput({ value, onChange, placeholder, className }: LensInputProps) {
  const supabase = createClient()
  const [isFocused, setIsFocused] = useState(false)
  const [lensHistory, setLensHistory] = useState<string[]>([])
  const wrapperRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    async function loadLensHistory() {
      let uniqueLenses: string[] = []

      // 1. Ambil data nama lensa unik dari database exif_data
      try {
        const { data } = await supabase
          .from('exif_data')
          .select('lens')
          .not('lens', 'is', null)
          .limit(100)

        if (data) {
          data.forEach(item => {
            if (item.lens && item.lens.trim()) {
              const l = item.lens.trim()
              if (!uniqueLenses.some(existing => existing.toLowerCase() === l.toLowerCase())) {
                uniqueLenses.push(l)
              }
            }
          })
        }
      } catch (err) {
        console.error('Error fetching lens history from Supabase:', err)
      }

      // 2. Gabungkan dengan riwayat simpanan di localStorage
      try {
        const stored = localStorage.getItem('lens_history')
        if (stored) {
          const localLenses: string[] = JSON.parse(stored)
          localLenses.forEach(l => {
            if (l && l.trim() && !uniqueLenses.some(existing => existing.toLowerCase() === l.trim().toLowerCase())) {
              uniqueLenses.push(l.trim())
            }
          })
        }
      } catch (err) {
        console.error('Error reading lens_history from localStorage:', err)
      }

      setLensHistory(uniqueLenses)
    }

    loadLensHistory()
  }, [])

  // Tutup dropdown jika klik di luar elemen
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsFocused(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Konsep Search Engine: Rekomendasi HANYA muncul jika input TIDAK kosong (length > 0)
  const query = value.trim().toLowerCase()
  const filteredSuggestions = query.length > 0
    ? lensHistory.filter(item => item.toLowerCase().includes(query))
    : []

  return (
    <div className="relative w-full" ref={wrapperRef}>
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setIsFocused(true)}
        placeholder={placeholder || 'Misal: NIKKOR AF-S 55-300MM (Isi jika EXIF gagal)'}
        className={className}
      />

      {isFocused && filteredSuggestions.length > 0 && (
        <div className="absolute top-full left-0 mt-1.5 w-full max-h-48 overflow-y-auto overscroll-contain rounded-xl border border-border bg-surface/95 backdrop-blur-md shadow-xl p-1 z-50 animate-in fade-in zoom-in-95 duration-150 touch-pan-y scrollbar-thin">
          <div className="px-2 py-1 text-[10px] font-bold tracking-wider text-text-muted/60 uppercase">
            Riwayat Lensa
          </div>
          {filteredSuggestions.map((item, idx) => (
            <button
              key={`${item}-${idx}`}
              type="button"
              className="w-full text-left px-3 py-2 text-xs md:text-sm text-text-main hover:bg-primary-neutral/10 hover:text-primary-neutral rounded-lg transition-colors flex items-center gap-2 cursor-pointer select-none"
              onClick={() => {
                onChange(item)
                setIsFocused(false)
              }}
            >
              <Camera size={14} className="text-text-muted shrink-0" />
              <span className="truncate font-medium">{item}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
