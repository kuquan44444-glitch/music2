'use client'

import * as React from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getFriends, getFriendRequests } from '../actions/friends'
import { useToast } from '@/components/ui/Toast'

export function useFriends(userId: string | undefined) {
  const { addToast } = useToast()
  const queryClient = useQueryClient()

  const { data: friends, isLoading: friendsLoading } = useQuery({
    queryKey: ['friends', userId],
    queryFn: () => getFriends(userId!),
    enabled: !!userId,
  })

  const { data: requests, isLoading: requestsLoading } = useQuery({
    queryKey: ['friend-requests', userId],
    queryFn: () => getFriendRequests(userId!),
    enabled: !!userId,
    refetchInterval: 30000,
  })

  return {
    friends: friends || [],
    friendRequests: requests || [],
    friendsLoading,
    requestsLoading,
  }
}
