'use client'

import * as React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Avatar } from '@/components/ui/Avatar'
import { formatTimeAgo, truncateText, isImageFile } from '@/lib/utils'
import { cn } from '@/lib/utils'
import { ConversationWithMember } from '../actions/messages'

interface ConversationListProps {
  conversations: ConversationWithMember[]
  selectedId?: string
}

export function ConversationList({ conversations, selectedId }: ConversationListProps) {
  if (conversations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
        <p className="text-muted-foreground">Chưa có cuộc trò chuyện nào</p>
        <p className="text-sm text-muted-foreground mt-1">Bắt đầu trò chuyện với bạn bè</p>
      </div>
    )
  }

  return (
    <div className="divide-y divide-border">
      {conversations.map((conv) => (
        <ConversationItem
          key={conv.id}
          conversation={conv}
          isSelected={conv.id === selectedId}
        />
      ))}
    </div>
  )
}

function ConversationItem({ conversation, isSelected }: { conversation: ConversationWithMember; isSelected: boolean }) {
  const lastMessage = conversation.last_message

  const getPreview = () => {
    if (!lastMessage) return 'Chưa có tin nhắn'
    if (lastMessage.is_recalled) return 'Tin nhắn đã được thu hồi'
    if (lastMessage.image_url) return 'Đã gửi một hình ảnh'
    return truncateText(lastMessage.text_content || '', 50)
  }

  return (
    <Link
      href={`/messages/${conversation.id}`}
      className={cn(
        'flex items-center gap-3 p-4 hover:bg-accent transition-colors',
        isSelected && 'bg-accent'
      )}
    >
      <Avatar
        src={conversation.other_member.avatar_url}
        alt={conversation.other_member.full_name || conversation.other_member.username}
        size="lg"
      />
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <p className="font-semibold truncate">
            {conversation.other_member.full_name || conversation.other_member.username}
          </p>
          {lastMessage && (
            <span className="text-xs text-muted-foreground shrink-0">
              {formatTimeAgo(lastMessage.created_at)}
            </span>
          )}
        </div>
        <div className="flex items-center justify-between">
          <p className={cn(
            'text-sm truncate',
            conversation.unread_count > 0 ? 'text-foreground font-medium' : 'text-muted-foreground'
          )}>
            {getPreview()}
          </p>
          {conversation.unread_count > 0 && (
            <span className="ml-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-xs text-primary-foreground font-medium">
              {conversation.unread_count}
            </span>
          )}
        </div>
      </div>
    </Link>
  )
}
