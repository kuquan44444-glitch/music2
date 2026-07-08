'use client'

import * as React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Avatar } from '@/components/ui/Avatar'
import { Button } from '@/components/ui/Button'
import { Textarea } from '@/components/ui/Textarea'
import { useAuth } from '@/features/auth/AuthProvider'
import { useComment } from '../hooks/useComment'
import { formatTimeAgo } from '@/lib/utils'
import { Send, Trash2, Reply, Heart } from 'lucide-react'
import { motion } from 'framer-motion'

const commentSchema = z.object({
  content: z.string().min(1, 'Bình luận không được để trống').max(1000),
})

type CommentInput = z.infer<typeof commentSchema>

interface Comment {
  id: string
  post_id: string
  user_id: string
  parent_id: string | null
  content: string
  created_at: string
  profiles: {
    id: string
    username: string
    full_name: string | null
    avatar_url: string | null
  }
  post_likes: { id: string; user_id: string }[]
  replies?: Comment[]
}

interface CommentSectionProps {
  postId: string
}

export function CommentSection({ postId }: CommentSectionProps) {
  const { user } = useAuth()
  const commentMutation = useComment()
  const [replyingTo, setReplyingTo] = React.useState<string | null>(null)
  const [comments, setComments] = React.useState<Comment[]>([])

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CommentInput>({
    resolver: zodResolver(commentSchema),
  })

  const onSubmit = async (data: CommentInput) => {
    if (!user) return
    
    try {
      const newComment = await commentMutation.mutateAsync({
        postId,
        parentId: replyingTo || undefined,
        content: data.content,
      })
      
      if (replyingTo) {
        setComments((prev) =>
          prev.map((c) =>
            c.id === replyingTo
              ? { ...c, replies: [...(c.replies || []), newComment] }
              : c
          )
        )
        setReplyingTo(null)
      } else {
        setComments((prev) => [newComment, ...prev])
      }
      
      reset()
    } catch (error) {
      console.error('Failed to add comment:', error)
    }
  }

  return (
    <div className="border-t border-border bg-muted/30 p-4">
      {user && (
        <form onSubmit={handleSubmit(onSubmit)} className="flex items-start gap-3 mb-4">
          <Avatar
            src={user.user_metadata?.avatar_url}
            alt={user.user_metadata?.full_name || 'User'}
            size="sm"
          />
          <div className="flex-1 flex gap-2">
            <Textarea
              {...register('content')}
              placeholder={replyingTo ? 'Trả lời bình luận...' : 'Viết bình luận...'}
              className="min-h-[40px] max-h-32"
            />
            <Button type="submit" size="icon" disabled={commentMutation.isPending}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </form>
      )}

      {replyingTo && (
        <div className="mb-4 text-sm text-muted-foreground flex items-center gap-2">
          <Reply className="h-4 w-4" />
          Đang trả lời bình luận
          <button
            onClick={() => setReplyingTo(null)}
            className="text-primary hover:underline"
          >
            Hủy
          </button>
        </div>
      )}

      <div className="space-y-4">
        {comments.length === 0 ? (
          <p className="text-center text-muted-foreground py-4 text-sm">
            Chưa có bình luận nào. Hãy là người đầu tiên bình luận!
          </p>
        ) : (
          comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              onReply={() => setReplyingTo(comment.id)}
            />
          ))
        )}
      </div>
    </div>
  )
}

function CommentItem({ comment, onReply, depth = 0 }: { comment: Comment; onReply: () => void; depth?: number }) {
  const { user } = useAuth()
  const isOwner = user?.id === comment.user_id
  const isLiked = user ? comment.post_likes.some((like) => like.user_id === user.id) : false

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn('flex gap-3', depth > 0 && 'ml-8 mt-3')}
    >
      <Avatar
        src={comment.profiles.avatar_url}
        alt={comment.profiles.full_name || comment.profiles.username}
        size="sm"
      />
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className="font-medium text-sm">
            {comment.profiles.full_name || comment.profiles.username}
          </span>
          <span className="text-xs text-muted-foreground">
            {formatTimeAgo(comment.created_at)}
          </span>
        </div>
        <p className="text-sm mt-1">{comment.content}</p>
        
        <div className="flex items-center gap-4 mt-2">
          <button className={cn(
            'flex items-center gap-1 text-xs transition-colors',
            isLiked ? 'text-red-500' : 'text-muted-foreground hover:text-red-500'
          )}>
            <Heart className={cn('h-3 w-3', isLiked && 'fill-current')} />
            {comment.post_likes.length > 0 && comment.post_likes.length}
          </button>
          
          {depth === 0 && (
            <button
              onClick={onReply}
              className="text-xs text-muted-foreground hover:text-primary transition-colors"
            >
              Trả lời
            </button>
          )}
          
          {isOwner && (
            <button className="text-xs text-muted-foreground hover:text-destructive transition-colors flex items-center gap-1">
              <Trash2 className="h-3 w-3" />
            </button>
          )}
        </div>

        {comment.replies && comment.replies.map((reply) => (
          <CommentItem
            key={reply.id}
            comment={reply}
            onReply={onReply}
            depth={depth + 1}
          />
        ))}
      </div>
    </motion.div>
  )
}
