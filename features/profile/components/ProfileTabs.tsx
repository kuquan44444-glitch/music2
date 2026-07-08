'use client'

import * as React from 'react'
import { useInfiniteQuery } from '@tanstack/react-query'
import { ImageGrid } from '@/components/ui/ImageGrid'
import { VideoPlayer } from '@/components/ui/VideoPlayer'
import { AudioPlayer } from '@/components/ui/AudioPlayer'
import { Skeleton } from '@/components/ui/Skeleton'
import { PostCard } from '@/features/posts/components/PostCard'
import { getUserPosts, getUserPhotos, getUserVideos, getUserMusic, getSavedPosts } from '../actions/getUserContent'
import { useAuth } from '@/features/auth/AuthProvider'
import { PostWithDetails } from '@/features/posts/hooks/useFeed'

interface ProfileTabsProps {
  userId: string
}

export function ProfileTabs({ userId }: ProfileTabsProps) {
  const { user } = useAuth()
  const isOwner = user?.id === userId

  return (
    <Tabs defaultValue="posts" className="w-full">
      <TabsList className="w-full justify-start overflow-x-auto">
        <TabsTrigger value="posts">Bài viết</TabsTrigger>
        <TabsTrigger value="photos">Ảnh</TabsTrigger>
        <TabsTrigger value="videos">Video</TabsTrigger>
        <TabsTrigger value="music">Nhạc</TabsTrigger>
        {isOwner && <TabsTrigger value="saved">Đã lưu</TabsTrigger>}
      </TabsList>
      
      <TabsContent value="posts">
        <PostsTab userId={userId} isOwner={isOwner} />
      </TabsContent>
      
      <TabsContent value="photos">
        <PhotosTab userId={userId} />
      </TabsContent>
      
      <TabsContent value="videos">
        <VideosTab userId={userId} />
      </TabsContent>
      
      <TabsContent value="music">
        <MusicTab userId={userId} />
      </TabsContent>
      
      {isOwner && (
        <TabsContent value="saved">
          <SavedTab userId={userId} />
        </TabsContent>
      )}
    </Tabs>
  )
}

function PostsTab({ userId, isOwner }: { userId: string; isOwner: boolean }) {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
  } = useInfiniteQuery({
    queryKey: ['user-posts', userId],
    queryFn: async ({ pageParam }) => {
      return getUserPosts(userId, isOwner ? undefined : 'public', pageParam)
    },
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  })

  if (isLoading) {
    return <div className="space-y-4">{Array.from({ length: 2 }).map((_, i) => <PostSkeleton key={i} />)}</div>
  }

  if (isError) {
    return <p className="text-center py-8 text-muted-foreground">Đã xảy ra lỗi</p>
  }

  const posts = data?.pages.flatMap((page) => page.data || []) || []

  if (posts.length === 0) {
    return <p className="text-center py-8 text-muted-foreground">Chưa có bài viết nào</p>
  }

  return (
    <div className="space-y-4">
      {posts.map((post) => (
        <PostCard key={post.id} post={post as PostWithDetails} />
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
  )
}

function PhotosTab({ userId }: { userId: string }) {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  } = useInfiniteQuery({
    queryKey: ['user-photos', userId],
    queryFn: async ({ pageParam }) => {
      return getUserPhotos(userId, pageParam)
    },
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  })

  if (isLoading) {
    return <div className="grid grid-cols-3 gap-1">{Array.from({ length: 9 }).map((_, i) => <Skeleton key={i} className="aspect-square" />)}</div>
  }

  const photos = data?.pages.flatMap((page) => page.data || []) || []

  if (photos.length === 0) {
    return <p className="text-center py-8 text-muted-foreground">Chưa có ảnh nào</p>
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-1">
        {photos.map((photo: any) => (
          <div key={photo.id} className="relative aspect-square">
            <ImageGrid images={[photo.image_url]} />
          </div>
        ))}
      </div>
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
  )
}

function VideosTab({ userId }: { userId: string }) {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  } = useInfiniteQuery({
    queryKey: ['user-videos', userId],
    queryFn: async ({ pageParam }) => {
      return getUserVideos(userId, pageParam)
    },
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  })

  if (isLoading) {
    return <div className="space-y-4">{Array.from({ length: 2 }).map((_, i) => <Skeleton key={i} className="aspect-video rounded-xl" />)}</div>
  }

  const videos = data?.pages.flatMap((page) => page.data || []) || []

  if (videos.length === 0) {
    return <p className="text-center py-8 text-muted-foreground">Chưa có video nào</p>
  }

  return (
    <div className="space-y-4">
      {videos.map((video: any) => (
        <VideoPlayer key={video.id} src={video.video_url} />
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
  )
}

function MusicTab({ userId }: { userId: string }) {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  } = useInfiniteQuery({
    queryKey: ['user-music', userId],
    queryFn: async ({ pageParam }) => {
      return getUserMusic(userId, pageParam)
    },
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  })

  if (isLoading) {
    return <div className="space-y-4">{Array.from({ length: 2 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}</div>
  }

  const music = data?.pages.flatMap((page) => page.data || []) || []

  if (music.length === 0) {
    return <p className="text-center py-8 text-muted-foreground">Chưa có nhạc nào</p>
  }

  return (
    <div className="space-y-4">
      {music.map((item: any) => (
        <AudioPlayer
          key={item.id}
          src={item.file_url}
          title={item.title}
          artist={item.artist}
          coverUrl={item.cover_url || undefined}
        />
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
  )
}

function SavedTab({ userId }: { userId: string }) {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  } = useInfiniteQuery({
    queryKey: ['saved-posts', userId],
    queryFn: async ({ pageParam }) => {
      return getSavedPosts(userId, pageParam)
    },
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  })

  if (isLoading) {
    return <div className="space-y-4">{Array.from({ length: 2 }).map((_, i) => <PostSkeleton key={i} />)}</div>
  }

  const posts = data?.pages.flatMap((page) => page.data || []) as PostWithDetails[]

  if (posts.length === 0) {
    return <p className="text-center py-8 text-muted-foreground">Chưa có bài viết nào được lưu</p>
  }

  return (
    <div className="space-y-4">
      {posts.map((post) => (
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
  )
}

function PostSkeleton() {
  return (
    <div className="rounded-xl border bg-card p-4 space-y-4">
      <div className="flex items-center gap-3">
        <Skeleton className="h-10 w-10 rounded-full" />
        <div className="space-y-2 flex-1">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-20" />
        </div>
      </div>
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-48 w-full rounded-lg" />
    </div>
  )
}
