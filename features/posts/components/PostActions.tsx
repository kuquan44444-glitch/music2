'use client'

import * as React from 'react'
import { Heart, MessageCircle, Bookmark, Share2, Eye } from 'lucide-react'
import { motion } from 'framer-motion'
import { cn, formatCount } from '@/lib/utils'
import { Tooltip } from '@/components/ui/Tooltip'

interface PostActionsProps {
  postId: string
  likeCount: number
  commentCount: number
  isLiked: boolean
  isSaved: boolean
  onLike: () => void
  onComment: () => void
  onSave: () => void
  onShare: () => void
  isLikeLoading?: boolean
}

export function PostActions({
  likeCount,
  commentCount,
  isLiked,
  isSaved,
  onLike,
  onComment,
  onSave,
  onShare,
  isLikeLoading,
}: PostActionsProps) {
  return (
    <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
      <div className="flex items-center gap-1">
        <Tooltip content={isLiked ? 'Bỏ thích' : 'Thích'}>
          <button
            onClick={onLike}
            disabled={isLikeLoading}
            className={cn(
              'flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200',
              isLiked 
                ? 'text-red-500 bg-red-500/10' 
                : 'text-muted-foreground hover:bg-accent hover:text-foreground'
            )}
          >
            <motion.div
              animate={isLiked ? { scale: [1, 1.3, 1] } : {}}
              transition={{ duration: 0.3 }}
            >
              <Heart className={cn('h-5 w-5', isLiked && 'fill-current')} />
            </motion.div>
            {likeCount > 0 && (
              <span className="text-sm font-medium">{formatCount(likeCount)}</span>
            )}
          </button>
        </Tooltip>

        <Tooltip content="Bình luận">
          <button
            onClick={onComment}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground transition-all duration-200"
          >
            <MessageCircle className="h-5 w-5" />
            {commentCount > 0 && (
              <span className="text-sm font-medium">{formatCount(commentCount)}</span>
            )}
          </button>
        </Tooltip>

        <Tooltip content="Chia sẻ">
          <button
            onClick={onShare}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground transition-all duration-200"
          >
            <Share2 className="h-5 w-5" />
          </button>
        </Tooltip>
      </div>

      <Tooltip content={isSaved ? 'Bỏ lưu' : 'Lưu'}>
        <button
          onClick={onSave}
          className={cn(
            'flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200',
            isSaved 
              ? 'text-primary bg-primary/10' 
              : 'text-muted-foreground hover:bg-accent hover:text-foreground'
          )}
        >
          <Bookmark className={cn('h-5 w-5', isSaved && 'fill-current')} />
        </button>
      </Tooltip>
    </div>
  )
}
