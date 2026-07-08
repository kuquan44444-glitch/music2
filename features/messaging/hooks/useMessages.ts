'use client'

import * as React from 'react'
import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query'
import { getConversations, getMessages, sendMessage, markAsSeen, recallMessage, createConversation } from '../actions/messages'
import { useToast } from '@/components/ui/Toast'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/features/auth/AuthProvider'

export function useConversations(userId: string | undefined) {
  return useQuery({
    queryKey: ['conversations', userId],
    queryFn: () => getConversations(userId!),
    enabled: !!userId,
    refetchInterval: 30000,
  })
}

export function useMessages(conversationId: string | undefined) {
  return useInfiniteQuery({
    queryKey: ['messages', conversationId],
    queryFn: async ({ pageParam }) => {
      return getMessages(conversationId!, pageParam)
    },
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    enabled: !!conversationId,
  })
}

export function useSendMessage() {
  const { addToast } = useToast()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ conversationId, content, imageUrl }: { conversationId: string; content?: string; imageUrl?: string }) => {
      return sendMessage(conversationId, content, imageUrl)
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['messages', variables.conversationId] })
      queryClient.invalidateQueries({ queryKey: ['conversations'] })
    },
    onError: (error) => {
      addToast(error instanceof Error ? error.message : 'Không thể gửi tin nhắn', 'error')
    },
  })
}

export function useMarkAsSeen() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: markAsSeen,
    onSuccess: (_, conversationId) => {
      queryClient.invalidateQueries({ queryKey: ['messages', conversationId] })
      queryClient.invalidateQueries({ queryKey: ['conversations'] })
    },
  })
}

export function useRecallMessage() {
  const { addToast } = useToast()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: recallMessage,
    onSuccess: () => {
      addToast('Đã thu hồi tin nhắn', 'success')
    },
    onError: (error) => {
      addToast(error instanceof Error ? error.message : 'Không thể thu hồi', 'error')
    },
  })
}

export function useCreateConversation() {
  const { addToast } = useToast()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createConversation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] })
    },
    onError: (error) => {
      addToast(error instanceof Error ? error.message : 'Không thể tạo cuộc trò chuyện', 'error')
    },
  })
}

export function useRealtimeMessages(conversationId: string | undefined, onNewMessage?: (message: any) => void) {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const supabase = createClient()

  React.useEffect(() => {
    if (!conversationId) return

    const channel = supabase
      .channel(`messages:${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        async (payload) => {
          const newMessage = payload.new as any
          
          if (newMessage.sender_id !== user?.id) {
            const { data: sender } = await supabase
              .from('profiles')
              .select('id, username, full_name, avatar_url')
              .eq('id', newMessage.sender_id)
              .single()

            queryClient.invalidateQueries({ queryKey: ['messages', conversationId] })
            queryClient.invalidateQueries({ queryKey: ['conversations'] })

            onNewMessage?.({
              ...newMessage,
              sender,
            })
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [conversationId, user?.id, supabase, queryClient, onNewMessage])
}
