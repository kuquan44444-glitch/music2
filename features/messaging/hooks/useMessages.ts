'use client'

import * as React from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getConversations, getMessages, sendMessage, markAsSeen, recallMessage, createConversation } from '../actions/messages'
import { useToast } from '@/components/ui/Toast'

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
