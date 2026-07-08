'use client'

import * as React from 'react'
import { useParams } from 'next/navigation'
import { ConversationList, ChatWindow } from '@/features/messaging'
import { useConversations } from '@/features/messaging/hooks/useMessages'
import { useAuth } from '@/features/auth/AuthProvider'
import { Skeleton } from '@/components/ui/Skeleton'

export default function MessagesPage() {
  const params = useParams()
  const conversationId = params?.id as string | undefined
  const { user } = useAuth()
  const { data: conversations, isLoading } = useConversations(user?.id)
  const [selectedConversation, setSelectedConversation] = React.useState<typeof conversations>[0] | null>(null)

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
          <p className="text-muted-foreground">Chọn một cuộc trò chuyện</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-[calc(100vh-64px)]">
      <div className={`w-full md:w-80 border-r border-border ${conversationId ? 'hidden md:block' : 'block'}`}>
        <div className="p-4 border-b border-border">
          <h1 className="text-xl font-bold">Tin nhắn</h1>
        </div>
        <ConversationList
          conversations={conversations || []}
          selectedId={conversationId}
        />
      </div>

      <div className={`flex-1 ${conversationId ? 'block' : 'hidden md:block'}`}>
        {selectedConversation ? (
          <ChatWindow
            conversationId={selectedConversation.id}
            otherUser={selectedConversation.other_member}
            onBack={() => setSelectedConversation(null)}
          />
        ) : (
          <div className="hidden md:flex flex-col items-center justify-center h-full text-center">
            <MessageIcon className="h-16 w-16 text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">Chào mừng đến với Messages</h2>
            <p className="text-muted-foreground max-w-sm">
              Chọn một cuộc trò chuyện từ danh sách bên trái để bắt đầu nhắn tin
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

function MessageIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
      />
    </svg>
  )
}
