'use client'

import * as React from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { sendFriendRequest, acceptFriendRequest, rejectFriendRequest, cancelFriendRequest, unfriend } from '../actions/friends'
import { useToast } from '@/components/ui/Toast'

export function useSendFriendRequest() {
  const { addToast } = useToast()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: sendFriendRequest,
    onSuccess: () => {
      addToast('Đã gửi lời mời kết bạn', 'success')
      queryClient.invalidateQueries({ queryKey: ['friend-requests'] })
    },
    onError: (error) => {
      addToast(error instanceof Error ? error.message : 'Không thể gửi lời mời', 'error')
    },
  })
}

export function useAcceptRequest() {
  const { addToast } = useToast()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: acceptFriendRequest,
    onSuccess: () => {
      addToast('Đã chấp nhận lời mời kết bạn', 'success')
      queryClient.invalidateQueries({ queryKey: ['friends'] })
      queryClient.invalidateQueries({ queryKey: ['friend-requests'] })
    },
    onError: (error) => {
      addToast(error instanceof Error ? error.message : 'Không thể chấp nhận', 'error')
    },
  })
}

export function useRejectRequest() {
  const { addToast } = useToast()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: rejectFriendRequest,
    onSuccess: () => {
      addToast('Đã từ chối lời mời', 'success')
      queryClient.invalidateQueries({ queryKey: ['friend-requests'] })
    },
    onError: (error) => {
      addToast(error instanceof Error ? error.message : 'Không thể từ chối', 'error')
    },
  })
}

export function useCancelRequest() {
  const { addToast } = useToast()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: cancelFriendRequest,
    onSuccess: () => {
      addToast('Đã hủy lời mời', 'success')
      queryClient.invalidateQueries({ queryKey: ['friend-requests'] })
    },
    onError: (error) => {
      addToast(error instanceof Error ? error.message : 'Không thể hủy', 'error')
    },
  })
}

export function useUnfriend() {
  const { addToast } = useToast()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: unfriend,
    onSuccess: () => {
      addToast('Đã hủy kết bạn', 'success')
      queryClient.invalidateQueries({ queryKey: ['friends'] })
    },
    onError: (error) => {
      addToast(error instanceof Error ? error.message : 'Không thể hủy kết bạn', 'error')
    },
  })
}
