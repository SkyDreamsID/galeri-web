'use client'

import { useState, KeyboardEvent } from 'react'
import { X } from 'lucide-react'

interface TagInputProps {
  tags: string[]
  setTags: (tags: string[]) => void
  placeholder?: string
}

export function TagInput({ tags, setTags, placeholder }: TagInputProps) {
  const [inputValue, setInputValue] = useState('')

  const addTag = () => {
    const newTag = inputValue.trim().replace(/^,+|,+$/g, '')
    if (newTag && !tags.includes(newTag)) {
      setTags([...tags, newTag])
    }
    setInputValue('')
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      addTag()
    }
  }

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove))
  }

  return (
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
        onBlur={addTag}
        placeholder={tags.length === 0 ? placeholder : 'Ketik tag baru...'}
        className="flex-1 min-w-[120px] bg-transparent text-text-main text-sm outline-none placeholder:text-text-muted/60"
      />
    </div>
  )
}
