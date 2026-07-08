'use client'

import * as React from 'react'
import Image from 'next/image'
import { cn } from '@/lib/utils'

interface ImageGridProps {
  images: string[]
  className?: string
}

export function ImageGrid({ images, className }: ImageGridProps) {
  const count = images.length

  if (count === 0) return null

  if (count === 1) {
    return (
      <div className={cn('relative overflow-hidden rounded-xl', className)}>
        <Image
          src={images[0]}
          alt="Post image"
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 600px"
        />
      </div>
    )
  }

  if (count === 2) {
    return (
      <div className={cn('grid grid-cols-2 gap-1 rounded-xl overflow-hidden', className)}>
        {images.map((img, i) => (
          <div key={i} className="relative aspect-square">
            <Image
              src={img}
              alt={`Post image ${i + 1}`}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 50vw, 300px"
            />
          </div>
        ))}
      </div>
    )
  }

  if (count === 3) {
    return (
      <div className={cn('grid grid-cols-2 gap-1 rounded-xl overflow-hidden', className)}>
        <div className="relative aspect-square">
          <Image
            src={images[0]}
            alt="Post image 1"
            fill
            className="object-cover"
            sizes="(max-width: 768px) 50vw, 300px"
          />
        </div>
        <div className="grid grid-rows-2 gap-1">
          {[1, 2].map((i) => (
            <div key={i} className="relative aspect-square">
              <Image
                src={images[i]}
                alt={`Post image ${i + 1}`}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 25vw, 150px"
              />
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (count === 4) {
    return (
      <div className={cn('grid grid-cols-2 gap-1 rounded-xl overflow-hidden', className)}>
        {images.map((img, i) => (
          <div key={i} className="relative aspect-square">
            <Image
              src={img}
              alt={`Post image ${i + 1}`}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 50vw, 300px"
            />
          </div>
        ))}
      </div>
    )
  }

  // 5+ images
  return (
    <div className={cn('grid grid-cols-2 gap-1 rounded-xl overflow-hidden', className)}>
      <div className="relative aspect-square">
        <Image
          src={images[0]}
          alt="Post image 1"
          fill
          className="object-cover"
          sizes="(max-width: 768px) 50vw, 300px"
        />
      </div>
      <div className="grid grid-rows-2 gap-1">
        {[1, 2].map((i) => (
          <div key={i} className="relative aspect-square">
            <Image
              src={images[i]}
              alt={`Post image ${i + 1}`}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 25vw, 150px"
            />
          </div>
        ))}
        <div className="relative aspect-square">
          <Image
            src={images[3]}
            alt="Post image 4"
            fill
            className="object-cover"
            sizes="(max-width: 768px) 25vw, 150px"
          />
          {count > 4 && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <span className="text-white text-2xl font-bold">+{count - 4}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
