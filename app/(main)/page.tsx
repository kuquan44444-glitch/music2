'use client'

import * as React from 'react'
import { useInfiniteQuery } from '@tanstack/react-query'
import { Plus } from 'lucide-react'
import { useFeed } from '@/features/posts/hooks/useFeed'
import { PostCard } from '@/features/posts/components/PostCard'
import { CreatePostModal } from '@/features/posts/components/CreatePostModal'
import { PostSkeleton } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/ui/EmptyState'
import { Button } from '@/components/ui/Button'
import { useAuth } from '@/features/auth/AuthProvider'

export default function HomePage() {
  const { user } = useAuth()
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading, refetch } = useFeed()
  const [isCreateOpen, setIsCreateOpen] = React.useState(false)

  const posts = data?.pages.flatMap((page) => page.data) || []

  return (
    <div className="max-w-2xl mx-auto py-4 px-4">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Trang chủ</h1>
        <Button onClick={() => setIsCreateOpen(true)}>
          <Plus className="h-5 w-5 mr-1" />
          Tạo bài viết
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          <PostSkeleton />
          <PostSkeleton />
          <PostSkeleton />
        </div>
      ) : posts.length === 0 ? (
        <EmptyState
          icon="inbox"
          title="Chưa có bài viết nào"
          description="Hãy là người đầu tiên đăng bài viết trên MixFlow!"
          action={{
            label: 'Tạo bài viết',
            onClick: () => setIsCreateOpen(true),
          }}
        />
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} onPostDeleted={() => refetch()} />
          ))}
          
          {hasNextPage && (
            <button
              onClick={() => fetchNextPage()}
              disabled={isFetchingNextPage}
              className="w-full py-3 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              {isFetchingNextPage ? 'Đang tải...' : 'Xem thêm bài viết'}
            </button>
          )}
        </div>
      )}

      <CreatePostModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSuccess={() => refetch()}
      />
    </div>
  )
}
