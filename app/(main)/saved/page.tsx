'use client'

import * as React from 'react'
import { useInfiniteQuery } from '@tanstack/react-query'
import { getSavedPosts } from '@/features/profile/actions/getUserContent'
import { PostCard } from '@/features/posts/components/PostCard'
import { PostSkeleton } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/ui/EmptyState'
import { useAuth } from '@/features/auth/AuthProvider'

export default function SavedPage() {
  const { user } = useAuth()

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  } = useInfiniteQuery({
    queryKey: ['saved-posts', user?.id],
    queryFn: async ({ pageParam }) => {
      return getSavedPosts(user!.id, pageParam)
    },
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    enabled: !!user,
  })

  const posts = data?.pages.flatMap((page) => page.data || []) || []

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto py-4 px-4 space-y-4">
        <h1 className="text-2xl font-bold">Đã lưu</h1>
        <PostSkeleton />
        <PostSkeleton />
        <PostSkeleton />
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto py-4 px-4">
      <h1 className="text-2xl font-bold mb-6">Đã lưu</h1>

      {posts.length === 0 ? (
        <EmptyState
          icon="inbox"
          title="Chưa có bài viết nào được lưu"
          description="Lưu các bài viết bạn yêu thích để xem lại sau"
        />
      ) : (
        <div className="space-y-4">
          {posts.map((post: any) => (
            <PostCard key={post.id} post={post} />
          ))}
          
          {hasNextPage && (
            <button
              onClick={() => fetchNextPage()}
              disabled={isFetchingNextPage}
              className="w-full py-3 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              {isFetchingNextPage ? 'Đang tải...' : 'Xem thêm'}
            </button>
          )}
        </div>
      )}
    </div>
  )
}
