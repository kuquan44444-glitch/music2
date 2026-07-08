'use client'

import * as React from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Heart, MessageCircle, Share2, Bookmark, MoreHorizontal, Trash2, Edit3, Globe, Lock } from 'lucide-react'
import { cn, formatTimeAgo, parseHashtags } from '@/lib/utils'
import { Avatar } from '@/components/ui/Avatar'
import { Dropdown, DropdownItem, DropdownSeparator } from '@/components/ui/Dropdown'
import { ImageGrid } from '@/components/ui/ImageGrid'
import { VideoPlayer } from '@/components/ui/VideoPlayer'
import { AudioPlayer } from '@/components/ui/AudioPlayer'
import { PostActions } from './PostActions'
import { CommentSection } from './CommentSection'
import { useAuth } from '@/features/auth/AuthProvider'
import { useLike } from '../hooks/useLike'
import { useUnlike } from '../hooks/useUnlike'
import { useSave } from '../hooks/useSave'
import { useShare } from '../hooks/useShare'
import { deletePost } from '../actions/deletePost'
import { useToast } from '@/components/ui/Toast'
import { PostWithDetails } from '../hooks/useFeed'

interface PostCardProps {
  post: PostWithDetails
  onPostDeleted?: () => void
}

export function PostCard({ post, onPostDeleted }: PostCardProps) {
  const { user } = useAuth()
  const { addToast } = useToast()
  const likeMutation = useLike()
  const unlikeMutation = useUnlike()
  const saveMutation = useSave()
  const shareMutation = useShare()
  const [showComments, setShowComments] = React.useState(false)
  const [isDeleting, setIsDeleting] = React.useState(false)

  const isOwner = user?.id === post.user_id
  const hashtags = post.content ? parseHashtags(post.content) : []

  const handleLike = () => {
    if (!user) {
      addToast('Vui lòng đăng nhập để thích bài viết', 'info')
      return
    }
    if (post.isLiked) {
      unlikeMutation.mutate(post.id)
    } else {
      likeMutation.mutate(post.id)
    }
  }

  const handleSave = () => {
    if (!user) {
      addToast('Vui lòng đăng nhập để lưu bài viết', 'info')
      return
    }
    saveMutation.mutate(post.id)
  }

  const handleShare = () => {
    shareMutation.mutate(post.id)
  }

  const handleDelete = async () => {
    if (!confirm('Bạn có chắc muốn xóa bài viết này?')) return
    
    setIsDeleting(true)
    try {
      await deletePost(post.id)
      addToast('Đã xóa bài viết', 'success')
      onPostDeleted?.()
    } catch (error) {
      addToast(error instanceof Error ? error.message : 'Không thể xóa bài viết', 'error')
    } finally {
      setIsDeleting(false)
    }
  }

  const renderHashtags = (text: string) => {
    const parts = text.split(/(#[\w\u00C0-\u024F]+)/g)
    return parts.map((part, i) => {
      if (part.match(/^#[\w\u00C0-\u024F]+$/)) {
        return (
          <Link
            key={i}
            href={`/hashtags/${part.slice(1)}`}
            className="text-primary hover:underline"
          >
            {part}
          </Link>
        )
      }
      return part
    })
  }

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="rounded-xl border bg-card overflow-hidden"
    >
      <div className="p-4">
        <div className="flex items-start justify-between">
          <Link href={`/profile/${post.profiles.id}`} className="flex items-center gap-3 flex-1 min-w-0">
            <Avatar
              src={post.profiles.avatar_url}
              alt={post.profiles.full_name || post.profiles.username}
              size="md"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="font-semibold truncate">
                  {post.profiles.full_name || post.profiles.username}
                </p>
                {post.visibility === 'private' && (
                  <Lock className="h-3 w-3 text-muted-foreground shrink-0" />
                )}
              </div>
              <p className="text-sm text-muted-foreground truncate">
                @{post.profiles.username} · {formatTimeAgo(post.created_at)}
              </p>
            </div>
          </Link>

          {isOwner && (
            <Dropdown
              trigger={
                <button className="p-2 rounded-full hover:bg-accent transition-colors">
                  <MoreHorizontal className="h-5 w-5 text-muted-foreground" />
                </button>
              }
              align="right"
            >
              <DropdownItem onClick={() => {}}>
                <Edit3 className="h-4 w-4 mr-2" />
                Chỉnh sửa
              </DropdownItem>
              <DropdownSeparator />
              <DropdownItem destructive onClick={handleDelete} disabled={isDeleting}>
                <Trash2 className="h-4 w-4 mr-2" />
                Xóa
              </DropdownItem>
            </Dropdown>
          )}
        </div>

        {post.content && (
          <div className="mt-3">
            <p className="whitespace-pre-wrap">
              {renderHashtags(post.content)}
            </p>
          </div>
        )}

        {post.post_images && post.post_images.length > 0 && (
          <div className="mt-4">
            <ImageGrid
              images={post.post_images.map((img) => img.image_url)}
            />
          </div>
        )}

        {post.post_videos && post.post_videos.length > 0 && (
          <div className="mt-4">
            <VideoPlayer src={post.post_videos[0].video_url} />
          </div>
        )}

        {post.post_music && post.post_music.length > 0 && (
          <div className="mt-4">
            <AudioPlayer
              src={post.post_music[0].file_url}
              title={post.post_music[0].title}
              artist={post.post_music[0].artist}
              coverUrl={post.post_music[0].cover_url || undefined}
            />
          </div>
        )}

        <PostActions
          postId={post.id}
          likeCount={post._count.post_likes}
          commentCount={post._count.comments}
          isLiked={post.isLiked}
          isSaved={post.isSaved}
          onLike={handleLike}
          onComment={() => setShowComments(!showComments)}
          onSave={handleSave}
          onShare={handleShare}
          isLikeLoading={likeMutation.isPending || unlikeMutation.isPending}
        />
      </div>

      {showComments && (
        <CommentSection postId={post.id} />
      )}
    </motion.article>
  )
}
