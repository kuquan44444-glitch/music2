'use client'

import * as React from 'react'
import { useInfiniteQuery, useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getNotifications, markAsRead, markAllAsRead, getUnreadCount } from '../actions/notifications'
import { useToast } from '@/components/ui/Toast'

export function useNotifications(userId: string | undefined) {
  return useInfiniteQuery({
    queryKey: ['notifications', userId],
    queryFn: async ({ pageParam }) => {
      return getNotifications(userId!, pageParam)
    },
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    enabled: !!userId,
  })
}

export function useUnreadCount(userId: string | undefined) {
  return useQuery({
    queryKey: ['unread-notifications', userId],
    queryFn: () => getUnreadCount(userId!),
    enabled: !!userId,
    refetchInterval: 30000,
  })
}

export function useMarkAsRead() {
  const { addToast } = useToast()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: markAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
      queryClient.invalidateQueries({ queryKey: ['unread-notifications'] })
    },
    onError: (error) => {
      addToast('Không thể đánh dấu đã đọc', 'error')
    },
  })
}

export function useMarkAllAsRead() {
  const { addToast } = useToast()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: markAllAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
      queryClient.invalidateQueries({ queryKey: ['unread-notifications'] })
      addToast('Đã đánh dấu tất cả là đã đọc', 'success')
    },
    onError: (error) => {
      addToast('Không thể đánh dấu đã đọc', 'error')
    },
  })
}
