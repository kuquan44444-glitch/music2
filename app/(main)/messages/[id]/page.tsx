'use client'

import * as React from 'react'
import { useParams } from 'next/navigation'
import { ConversationList, ChatWindow } from '@/features/messaging'
import { useConversations, useMessages } from '@/features/messaging/hooks/useMessages'
import { useAuth } from '@/features/auth/AuthProvider'
import { Skeleton } from '@/components/ui/Skeleton'

export default function ConversationPage() {
  const params = useParams()
  const conversationId = params.id as string
  const { user } = useAuth()
  const { data: conversations, isLoading } = useConversations(user?.id)
  const [selectedConversation, setSelectedConversation] = React.useState<NonNullable<typeof conversations>[number] | null>(null)

  React.useEffect(() => {
    if (conversationId && conversations) {
      const conv = conversations.find((c) => c.id === conversationId)
      if (conv) setSelectedConversation(conv)
    }
  }, [conversationId, conversations])

  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-64px)]">
        <div className="w-full md:w-80 border-r border-border p-4 space-y-4">
          <Skeleton className="h-8 w-32" />
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton className="h-12 w-12 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-3 w-32" />
              </div>
            </div>
          ))}
        </div>
        <div className="hidden md:flex flex-1 items-center justify-center">
          <p className="text-muted-foreground">Đang tải...</p>
        </div>
      </div>
    )
  }

  if (!selectedConversation) {
    return (
      <div className="flex h-[calc(100vh-64px)]">
        <div className="w-full md:w-80 border-r border-border">
          <div className="p-4 border-b border-border">
            <h1 className="text-xl font-bold">Tin nhắn</h1>
          </div>
          <ConversationList conversations={conversations || []} />
        </div>
        <div className="hidden md:flex flex-1 items-center justify-center">
          <p className="text-muted-foreground">Chọn một cuộc trò chuyện</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-[calc(100vh-64px)]">
      <div className="hidden md:block w-80 border-r border-border">
        <div className="p-4 border-b border-border">
          <h1 className="text-xl font-bold">Tin nhắn</h1>
        </div>
        <ConversationList conversations={conversations || []} selectedId={conversationId} />
      </div>

      <div className="flex-1">
        <ChatWindow
          conversationId={selectedConversation.id}
          otherUser={selectedConversation.other_member}
        />
      </div>
    </div>
  )
}
