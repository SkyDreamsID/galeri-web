'use client'

import { useState, KeyboardEvent, useRef, useEffect } from 'react'
import { X } from 'lucide-react'

interface TagInputProps {
  tags: string[]
  setTags: (tags: string[]) => void
  availableTags?: string[]
  placeholder?: string
}

export function TagInput({ tags, setTags, availableTags = [], placeholder }: TagInputProps) {
  const [inputValue, setInputValue] = useState('')
  const [isFocused, setIsFocused] = useState(false)
  const wrapperRef = useRef<HTMLDivElement>(null)

  const addTag = (tagToAdd?: string) => {
    const newTag = (tagToAdd || inputValue).trim().toLowerCase().replace(/^,+|,+$/g, '')
    if (newTag && !tags.includes(newTag)) {
      setTags([...tags, newTag])
    }
    setInputValue('')
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      addTag()
      setIsFocused(false)
    }
  }

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove))
  }

  // Handle outside click to close dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsFocused(false)
        if (inputValue) addTag()
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [inputValue, tags])

  const filteredTags = availableTags.filter(
    t => t.toLowerCase().includes(inputValue.toLowerCase()) && !tags.includes(t)
  )

  return (
    <div className="relative" ref={wrapperRef}>
      <div className="flex flex-wrap items-center gap-2 rounded-md border border-border/50 bg-background px-3 py-2 focus-within:ring-1 focus-within:ring-primary-neutral/50 transition-shadow">
        {tags.map((tag) => (
          <span 
            key={tag} 
            className="flex items-center gap-1 bg-surface text-text-main text-xs px-2 py-1 rounded-md border border-border/50"
          >
            {tag}
            <button 
              type="button" 
              onClick={() => removeTag(tag)}
              className="hover:text-red-500 text-text-muted focus:outline-none transition-colors"
            >
              <X size={14} />
            </button>
          </span>
        ))}
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsFocused(true)}
          placeholder={tags.length === 0 ? placeholder : 'Ketik tag baru...'}
          className="flex-1 min-w-[120px] bg-transparent text-text-main text-sm outline-none placeholder:text-text-muted/60"
        />
      </div>

      {isFocused && filteredTags.length > 0 && (
        <div className="absolute z-50 w-full mt-1 max-h-40 overflow-y-auto overscroll-contain rounded-md border border-border/50 bg-background shadow-lg p-1 touch-pan-y">
          {filteredTags.map(tag => (
            <button
              key={tag}
              type="button"
              className="w-full text-left px-3 py-2 text-sm text-text-main hover:bg-surface rounded-sm transition-colors"
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                addTag(tag)
                setIsFocused(false)
              }}
            >
              #{tag}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
