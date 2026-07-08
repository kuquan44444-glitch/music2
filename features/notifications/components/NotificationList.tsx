'use client'

import * as React from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Heart, MessageCircle, UserPlus, UserCheck, Share2, Bell, CheckCheck } from 'lucide-react'
import { cn, formatTimeAgo } from '@/lib/utils'
import { Avatar } from '@/components/ui/Avatar'
import { Button } from '@/components/ui/Button'
import { useNotifications, useMarkAsRead, useMarkAllAsRead } from '../hooks/useNotifications'
import { NotificationWithSender } from '../actions/notifications'

interface NotificationListProps {
  notifications: any[];
}

export function NotificationList({ notifications }: NotificationListProps) {
  const markAsReadMutation = useMarkAsRead()
  const markAllAsReadMutation = useMarkAllAsRead()

  const handleNotificationClick = (notification: any) => {
    if (!notification.is_read) {
      markAsReadMutation.mutate(notification.id)
    }
  }

  return (
    <div className="space-y-2">
      {notifications.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Bell className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground">Chưa có thông báo nào</p>
        </div>
      ) : (
        <>
          <div className="flex justify-end mb-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => markAllAsReadMutation.mutate()}
              disabled={markAllAsReadMutation.isPending}
            >
              <CheckCheck className="h-4 w-4 mr-1" />
              Đánh dấu tất cả đã đọc
            </Button>
          </div>
          {notifications.map((notification) => (
            <NotificationItem
              key={notification.id}
              notification={notification}
              onClick={() => handleNotificationClick(notification)}
            />
          ))}
        </>
      )}
    </div>
  )
}

interface NotificationItemProps {
  notification: {
    id: string
    type: 'like' | 'comment' | 'reply' | 'friend_request' | 'friend_accepted' | 'message' | 'share'
    post_id: string | null
    is_read: boolean
    created_at: string
    sender: {
      id: string
      username: string
      full_name: string | null
      avatar_url: string | null
    } | null
  }
  onClick?: () => void
}

export function NotificationItem({ notification, onClick }: NotificationItemProps) {
  const getIcon = () => {
    switch (notification.type) {
      case 'like':
        return <Heart className="h-4 w-4 text-red-500 fill-red-500" />
      case 'comment':
      case 'reply':
        return <MessageCircle className="h-4 w-4 text-blue-500" />
      case 'friend_request':
        return <UserPlus className="h-4 w-4 text-green-500" />
      case 'friend_accepted':
        return <UserCheck className="h-4 w-4 text-green-500" />
      case 'share':
        return <Share2 className="h-4 w-4 text-purple-500" />
      case 'message':
        return <MessageCircle className="h-4 w-4 text-blue-500" />
      default:
        return <Bell className="h-4 w-4 text-muted-foreground" />
    }
  }

  const getMessage = () => {
    const name = notification.sender?.full_name || notification.sender?.username || 'Người dùng'
    switch (notification.type) {
      case 'like':
        return `${name} đã thích bài viết của bạn`
      case 'comment':
        return `${name} đã bình luận bài viết của bạn`
      case 'reply':
        return `${name} đã trả lời bình luận của bạn`
      case 'friend_request':
        return `${name} đã gửi lời mời kết bạn`
      case 'friend_accepted':
        return `${name} đã chấp nhận lời mời kết bạn`
      case 'share':
        return `${name} đã chia sẻ bài viết của bạn`
      case 'message':
        return `${name} đã gửi tin nhắn cho bạn`
      default:
        return 'Bạn có thông báo mới'
    }
  }

  const href = notification.post_id
    ? `/posts/${notification.post_id}`
    : notification.type === 'friend_request' || notification.type === 'friend_accepted'
    ? notification.sender ? `/profile/${notification.sender.id}` : '/friends'
    : notification.type === 'message'
    ? '/messages'
    : '#'

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -100 }}
    >
      <Link
        href={href}
        onClick={onClick}
        className={cn(
          'flex items-start gap-3 p-3 rounded-xl hover:bg-accent transition-colors',
          !notification.is_read && 'bg-primary/5'
        )}
      >
        <div className="relative">
          <Avatar
            src={notification.sender?.avatar_url}
            alt={notification.sender?.full_name || notification.sender?.username || ''}
            size="md"
          />
          <div className="absolute -bottom-1 -right-1 p-1 bg-background rounded-full">
            {getIcon()}
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-sm">
            {getMessage()}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {formatTimeAgo(notification.created_at)}
          </p>
        </div>

        {!notification.is_read && (
          <div className="w-2 h-2 rounded-full bg-primary shrink-0 mt-2" />
        )}
      </Link>
    </motion.div>
  )
}
