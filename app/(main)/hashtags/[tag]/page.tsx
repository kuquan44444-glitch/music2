'use client'

import * as React from 'react'
import { useParams } from 'next/navigation'
import { useInfiniteQuery } from '@tanstack/react-query'
import { PostCard } from '@/features/posts/components/PostCard'
import { PostSkeleton } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/ui/EmptyState'
import { Skeleton } from '@/components/ui/Skeleton'
import { createClient } from '@/lib/supabase/client'

export default function HashtagPage() {
  const params = useParams()
  const tag = params.tag as string
  const supabase = createClient()

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  } = useInfiniteQuery({
    queryKey: ['hashtag-posts', tag],
    queryFn: async ({ pageParam }) => {
      const { data: hashtag } = await supabase
        .from('hashtags')
        .select('id')
        .eq('name', tag.toLowerCase())
        .single()

      if (!hashtag) return { data: [], nextCursor: undefined }

      const { data: postHashtags } = await supabase
        .from('post_hashtags')
        .select('post_id, created_at')
        .eq('hashtag_id', hashtag.id)
        .order('created_at', { ascending: false })
        .limit(11)

      if (!postHashtags || postHashtags.length === 0) {
        return { data: [], nextCursor: undefined }
      }

      let query = supabase
        .from('posts')
        .select(`
          *,
          profiles!inner(id, username, full_name, avatar_url),
          post_images(id, image_url),
          post_videos(id, video_url, view_count),
          post_music(id, title, artist, file_url, cover_url),
          post_likes(id, user_id),
          comments(id),
          _count
        `)
        .eq('visibility', 'public')
        .in('id', postHashtags.slice(0, 10).map((ph: any) => ph.post_id))
        .order('created_at', { ascending: false })

      if (pageParam) {
        query = query.lt('created_at', pageParam)
      }

      const { data: posts } = await query

      const nextCursor = postHashtags.length > 10 
        ? postHashtags[postHashtags.length - 1].created_at 
        : undefined

      return { data: posts || [], nextCursor }
    },
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  })

  const posts = data?.pages.flatMap((page) => page.data) || []

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto py-4 px-4 space-y-4">
        <Skeleton className="h-8 w-32" />
        <PostSkeleton />
        <PostSkeleton />
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto py-4 px-4">
      <h1 className="text-2xl font-bold mb-2">#{tag}</h1>
      <p className="text-muted-foreground mb-6">
        {posts.length > 0 ? `${posts.length} bài viết` : 'Không có bài viết nào'}
      </p>

      {posts.length === 0 ? (
        <EmptyState
          icon="inbox"
          title="Chưa có bài viết nào"
          description={`#${tag} chưa có bài viết nào`}
        />
      ) : (
        <div className="space-y-4">
          {posts.map((post: any) => (
            <PostCard key={post.id} post={{ ...post, isLiked: false, isSaved: false }} />
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
