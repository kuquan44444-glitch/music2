'use client'

import * as React from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ProfileHeader, ProfileTabs } from '@/features/profile'
import { useProfile } from '@/features/profile/hooks/useProfile'
import { useAuth } from '@/features/auth/AuthProvider'
import { Skeleton } from '@/components/ui/Skeleton'

export default function ProfilePage() {
  const params = useParams()
  const userId = params.username as string
  const router = useRouter()
  const { user, isLoading: authLoading } = useAuth()
  
  React.useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/signin')
    }
  }, [user, authLoading, router])

  const { profile, isLoading: profileLoading } = useProfile(userId)

  if (authLoading || profileLoading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="space-y-4">
          <Skeleton className="h-48 w-full rounded-none" />
          <div className="px-4">
            <div className="flex items-end gap-4 -mt-16">
              <Skeleton className="h-32 w-32 rounded-full border-4 border-background" />
              <div className="flex-1 space-y-2 pb-2">
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-4 w-48" />
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      <ProfileHeader userId={userId} />
      <div className="px-4 mt-6">
        <ProfileTabs userId={userId} />
      </div>
    </div>
  )
}
