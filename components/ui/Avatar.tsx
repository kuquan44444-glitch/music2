'use client'

import * as React from 'react'
import Image from 'next/image'
import { cn, getInitials } from '@/lib/utils'

interface AvatarProps {
  src?: string | null
  alt?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
  fallback?: string
}

const sizeMap = {
  sm: 32,
  md: 40,
  lg: 48,
  xl: 128,
}

const sizeClassMap = {
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-12 w-12 text-base',
  xl: 'h-32 w-32 text-2xl',
}

export function Avatar({ src, alt, size = 'md', className, fallback }: AvatarProps) {
  const [imageError, setImageError] = React.useState(false)
  const initials = getInitials(alt || fallback)

  if (!src || imageError) {
    return (
      <div
        className={cn(
          'flex items-center justify-center rounded-full bg-muted font-semibold text-muted-foreground',
          sizeClassMap[size],
          className
        )}
      >
        {initials}
      </div>
    )
  }

  return (
    <Image
      src={src}
      alt={alt || 'Avatar'}
      width={sizeMap[size]}
      height={sizeMap[size]}
      className={cn('rounded-full object-cover', sizeClassMap[size], className)}
      onError={() => setImageError(true)}
    />
  )
}
