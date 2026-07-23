'use client'

import { useState, useRef, useEffect } from 'react'
import { ChevronDown } from 'lucide-react'

interface Option {
  value: string
  label: string
}

interface CustomSelectProps {
  value: string
  onChange: (value: string) => void
  options: Option[]
  placeholder?: string
  className?: string
  size?: 'default' | 'sm'
}

export function CustomSelect({ value, onChange, options, placeholder = 'Pilih salah satu...', className = '', size = 'default' }: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false)
  const wrapperRef = useRef<HTMLDivElement>(null)

  const selectedOption = options.find(opt => opt.value === value)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const sizeClasses = size === 'sm' 
    ? 'px-2 py-1 h-7 text-[10px] md:text-xs rounded'
    : 'px-3 md:px-4 py-2 md:py-2.5 h-9 md:h-10 text-[13px] md:text-sm rounded-md'

  return (
    <div 
      className={`relative ${className}`} 
      ref={wrapperRef}
      onClick={(e) => e.stopPropagation()}
    >
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center justify-between w-full border border-border/50 bg-background focus:outline-none focus:ring-1 focus:ring-primary-neutral transition-colors gap-2 ${sizeClasses}`}
      >
        <span className={`truncate ${!selectedOption ? 'text-text-muted' : ''}`}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown size={16} className={`shrink-0 text-text-muted transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute z-50 min-w-full mt-1 max-h-60 overflow-y-auto overscroll-contain rounded-md border border-border/50 bg-background shadow-lg p-1 animate-in fade-in slide-in-from-top-2 duration-200">
          {options.map((opt) => (
            <button
              key={opt.value}
              type="button"
              className={`w-full text-left truncate rounded-sm transition-colors ${
                size === 'sm' ? 'px-2 py-1.5 text-[10px] md:text-xs' : 'px-3 py-2 text-[13px] md:text-sm'
              } ${
                opt.value === value 
                  ? 'bg-primary-neutral/10 text-primary-neutral font-medium' 
                  : 'text-text-main hover:bg-surface'
              }`}
              onClick={() => {
                onChange(opt.value)
                setIsOpen(false)
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
