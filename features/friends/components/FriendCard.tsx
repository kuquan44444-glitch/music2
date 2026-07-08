'use client'

import * as React from 'react'
import Link from 'next/link'
import { UserCheck, UserPlus, UserX, MessageCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Avatar } from '@/components/ui/Avatar'
import { Button } from '@/components/ui/Button'
import { formatTimeAgo } from '@/lib/utils'
import { useSendFriendRequest, useAcceptRequest, useRejectRequest, useCancelRequest, useUnfriend } from '../hooks/useFriendActions'
import { useAuth } from '@/features/auth/AuthProvider'

interface FriendCardProps {
  friend: {
    id: string
    friendId: string
    username: string
    full_name: string | null
    avatar_url: string | null
    created_at: string
  }
  onUnfriend?: () => void
}

export function FriendCard({ friend, onUnfriend }: FriendCardProps) {
  const { user } = useAuth()
  const unfriendMutation = useUnfriend()

  const handleUnfriend = () => {
    if (confirm('Bạn có chắc muốn hủy kết bạn?')) {
      unfriendMutation.mutate(friend.friendId)
      onUnfriend?.()
    }
  }

  return (
    <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-accent transition-colors">
      <Link href={`/profile/${friend.friendId}`} className="shrink-0">
        <Avatar
          src={friend.avatar_url}
          alt={friend.full_name || friend.username}
          size="lg"
        />
      </Link>
      
      <div className="flex-1 min-w-0">
        <Link href={`/profile/${friend.friendId}`} className="font-semibold hover:underline block truncate">
          {friend.full_name || friend.username}
        </Link>
        <p className="text-sm text-muted-foreground truncate">
          @{friend.username}
        </p>
      </div>

      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon">
          <MessageCircle className="h-5 w-5" />
        </Button>
        <Button variant="ghost" size="sm" onClick={handleUnfriend}>
          <UserX className="h-4 w-4 mr-1" />
          Hủy
        </Button>
      </div>
    </div>
  )
}

interface FriendRequestCardProps {
  request: {
    id: string
    sender_id: string
    profiles: {
      id: string
      username: string
      full_name: string | null
      avatar_url: string | null
    }
    created_at: string
  }
}

export function FriendRequestCard({ request }: FriendRequestCardProps) {
  const acceptMutation = useAcceptRequest()
  const rejectMutation = useRejectRequest()

  return (
    <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-accent transition-colors">
      <Link href={`/profile/${request.sender_id}`} className="shrink-0">
        <Avatar
          src={request.profiles.avatar_url}
          alt={request.profiles.full_name || request.profiles.username}
          size="lg"
        />
      </Link>
      
      <div className="flex-1 min-w-0">
        <Link href={`/profile/${request.sender_id}`} className="font-semibold hover:underline block truncate">
          {request.profiles.full_name || request.profiles.username}
        </Link>
        <p className="text-sm text-muted-foreground">
          @{request.profiles.username} · {formatTimeAgo(request.created_at)}
        </p>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="default"
          size="sm"
          onClick={() => acceptMutation.mutate(request.id)}
          disabled={acceptMutation.isPending}
        >
          <UserCheck className="h-4 w-4 mr-1" />
          Chấp nhận
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => rejectMutation.mutate(request.id)}
          disabled={rejectMutation.isPending}
        >
          Từ chối
        </Button>
      </div>
    </div>
  )
}

interface FriendButtonProps {
  userId: string
  targetUserId: string
  status?: {
    isFriend: boolean
    requestSent?: boolean
    requestReceived?: boolean
    requestId?: string
  }
}

export function FriendButton({ userId, targetUserId, status }: FriendButtonProps) {
  const sendRequestMutation = useSendFriendRequest()
  const cancelRequestMutation = useCancelRequest()
  const acceptMutation = useAcceptRequest()
  const rejectMutation = useRejectRequest()
  const unfriendMutation = useUnfriend()

  if (userId === targetUserId) return null

  if (status?.isFriend) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={() => unfriendMutation.mutate(targetUserId)}
        disabled={unfriendMutation.isPending}
      >
        <UserCheck className="h-4 w-4 mr-1" />
        Bạn bè
      </Button>
    )
  }

  if (status?.requestSent) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={() => cancelRequestMutation.mutate(targetUserId)}
        disabled={cancelRequestMutation.isPending}
      >
        Hủy lời mời
      </Button>
    )
  }

  if (status?.requestReceived) {
    return (
      <div className="flex gap-2">
        <Button
          variant="default"
          size="sm"
          onClick={() => acceptMutation.mutate(status.requestId!)}
          disabled={acceptMutation.isPending}
        >
          Chấp nhận
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => rejectMutation.mutate(status.requestId!)}
          disabled={rejectMutation.isPending}
        >
          Từ chối
        </Button>
      </div>
    )
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => sendRequestMutation.mutate(targetUserId)}
      disabled={sendRequestMutation.isPending}
    >
      <UserPlus className="h-4 w-4 mr-1" />
      Kết bạn
    </Button>
  )
}
