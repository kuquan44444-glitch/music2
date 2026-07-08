'use client'

import * as React from 'react'
import EmojiPicker from 'emoji-picker-react'

interface EmojiPickerProps {
  onEmojiSelect: (emoji: string) => void
  className?: string
}

export function EmojiPickerButton({ onEmojiSelect, className }: EmojiPickerProps) {
  const [isOpen, setIsOpen] = React.useState(false)

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={className}
      >
        😀
      </button>
      
      {isOpen && (
        <div className="absolute bottom-full left-0 mb-2 z-50">
          <div
            className="fixed inset-0 z-[-1]"
            onClick={() => setIsOpen(false)}
          />
          <EmojiPicker
            onEmojiClick={(emojiData) => {
              onEmojiSelect(emojiData.emoji)
              setIsOpen(false)
            }}
            height={350}
            width={300}
          />
        </div>
      )}
    </div>
  )
}
