'use client'

import * as React from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Camera, UserPlus, UserCheck, MessageCircle, Settings } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Avatar } from '@/components/ui/Avatar'
import { Button } from '@/components/ui/Button'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/Tabs'
import { Badge } from '@/components/ui/Badge'
import { useAuth } from '@/features/auth/AuthProvider'
import { useProfile } from '../hooks/useProfile'
import { PostCard } from '@/features/posts/components/PostCard'
import { ImageGrid } from '@/components/ui/ImageGrid'
import { VideoPlayer } from '@/components/ui/VideoPlayer'
import { AudioPlayer } from '@/components/ui/AudioPlayer'
import { Skeleton } from '@/components/ui/Skeleton'
import { formatTimeAgo } from '@/lib/utils'
import Link from 'next/link'

interface ProfileHeaderProps {
  userId: string
}

export function ProfileHeader({ userId }: ProfileHeaderProps) {
  const { user } = useAuth()
  const { profile, isLoading, uploadAvatar, uploadCover } = useProfile(userId)
  const fileInputRef = React.useRef<HTMLInputElement>(null)
  const coverInputRef = React.useRef<HTMLInputElement>(null)
  const router = useRouter()

  const isOwner = user?.id === userId

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    
    if (file.size > 5 * 1024 * 1024) {
      alert('Kích thước file quá lớn (tối đa 5MB)')
      return
    }

    await uploadAvatar(file)
    e.target.value = ''
  }

  const handleCoverChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    
    if (file.size > 10 * 1024 * 1024) {
      alert('Kích thước file quá lớn (tối đa 10MB)')
      return
    }

    await uploadCover(file)
    e.target.value = ''
  }

  if (isLoading) {
    return <ProfileSkeleton />
  }

  if (!profile) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-muted-foreground">Không tìm thấy người dùng</p>
      </div>
    )
  }

  return (
    <div className="pb-4">
      <div className="relative h-48 md:h-64 bg-muted overflow-hidden">
        {profile.cover_url ? (
          <Image
            src={profile.cover_url}
            alt="Cover"
            fill
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/5" />
        )}
        
        {isOwner && (
          <>
            <input
              ref={coverInputRef}
              type="file"
              accept="image/*"
              onChange={handleCoverChange}
              className="hidden"
            />
            <button
              onClick={() => coverInputRef.current?.click()}
              className="absolute bottom-4 right-4 p-2 bg-black/50 rounded-full hover:bg-black/70 transition-colors"
            >
              <Camera className="h-5 w-5 text-white" />
            </button>
          </>
        )}
      </div>

      <div className="px-4">
        <div className="relative -mt-16 mb-4 flex justify-between items-end">
          <div className="relative">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              className="hidden"
            />
            <div 
              className={cn(
                "relative rounded-full border-4 border-background overflow-hidden",
                isOwner && "cursor-pointer hover:opacity-80 transition-opacity"
              )}
              onClick={() => isOwner && fileInputRef.current?.click()}
            >
              <Avatar
                src={profile.avatar_url}
                alt={profile.full_name || profile.username}
                size="xl"
              />
              {isOwner && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                  <Camera className="h-6 w-6 text-white" />
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isOwner ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push('/profile/edit')}
              >
                <Settings className="h-4 w-4 mr-2" />
                Chỉnh sửa
              </Button>
            ) : (
              <>
                <Button variant="outline" size="sm">
                  <UserPlus className="h-4 w-4 mr-2" />
                  Kết bạn
                </Button>
                <Button variant="outline" size="icon">
                  <MessageCircle className="h-4 w-4" />
                </Button>
              </>
            )}
          </div>
        </div>

        <div>
          <h1 className="text-2xl font-bold">
            {profile.full_name || profile.username}
          </h1>
          <p className="text-muted-foreground">@{profile.username}</p>
        </div>

        {profile.bio && (
          <p className="mt-3 text-sm">{profile.bio}</p>
        )}

        <div className="flex items-center gap-4 mt-4 text-sm text-muted-foreground">
          <span>Tham gia {formatTimeAgo(profile.created_at)}</span>
        </div>
      </div>
    </div>
  )
}

function ProfileSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-48 w-full rounded-none" />
      <div className="px-4">
        <div className="flex items-end gap-4 -mt-16">
          <Skeleton className="h-32 w-32 rounded-full border-4 border-background" />
          <div className="flex-1 pb-2">
            <Skeleton className="h-6 w-32 mb-2" />
            <Skeleton className="h-4 w-48" />
          </div>
        </div>
      </div>
    </div>
  )
}
