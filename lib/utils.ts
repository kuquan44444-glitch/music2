import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { formatDistanceToNow } from 'date-fns'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatTimeAgo(date: string | Date, locale: 'vi' | 'en' = 'vi'): string {
  return formatDistanceToNow(new Date(date), { addSuffix: true })
}

export function parseHashtags(text: string): string[] {
  const hashtagRegex = /#[\w\u00C0-\u024F]+/g
  const matches = text.match(hashtagRegex)
  return matches ? matches.map((tag) => tag.slice(1).toLowerCase()) : []
}

export function generateShareLink(postId: string): string {
  if (typeof window !== 'undefined') {
    return `${window.location.origin}/posts/${postId}`
  }
  return ''
}

export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    return false
  }
}

export function formatCount(count: number): string {
  if (count >= 1000000) {
    return (count / 1000000).toFixed(1) + 'M'
  }
  if (count >= 1000) {
    return (count / 1000).toFixed(1) + 'K'
  }
  return count.toString()
}

export function getInitials(name: string | null | undefined): string {
  if (!name) return '?'
  const parts = name.split(' ')
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
  }
  return name.slice(0, 2).toUpperCase()
}

export function isImageFile(url: string): boolean {
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.avif']
  return imageExtensions.some((ext) => url.toLowerCase().includes(ext))
}

export function isVideoFile(url: string): boolean {
  const videoExtensions = ['.mp4', '.webm', '.ogg', '.mov', '.avi']
  return videoExtensions.some((ext) => url.toLowerCase().includes(ext))
}

export function isAudioFile(url: string): boolean {
  const audioExtensions = ['.mp3', '.wav', '.ogg', '.flac', '.aac', '.m4a']
  return audioExtensions.some((ext) => url.toLowerCase().includes(ext))
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength) + '...'
}
