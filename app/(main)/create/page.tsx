'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { CreatePostModal } from '@/features/posts/components/CreatePostModal'
import { Button } from '@/components/ui/Button'
import { useAuth } from '@/features/auth/AuthProvider'

export default function CreatePage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [isCreateOpen, setIsCreateOpen] = React.useState(true)

  React.useEffect(() => {
    if (!isLoading && !user) {
      router.push('/auth/signin')
    }
  }, [user, isLoading, router])

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto py-4 px-4 flex items-center justify-center min-h-[50vh]">
        <p className="text-muted-foreground">Đang tải...</p>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="max-w-2xl mx-auto py-4 px-4">
      <h1 className="text-2xl font-bold mb-6">Tạo bài viết</h1>
      
      <CreatePostModal
        isOpen={isCreateOpen}
        onClose={() => router.back()}
        onSuccess={() => router.push('/')}
      />
    </div>
  )
}
