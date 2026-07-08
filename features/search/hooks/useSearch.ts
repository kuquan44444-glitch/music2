'use client'

import * as React from 'react'
import { useQuery } from '@tanstack/react-query'
import { searchUsers, searchPosts, searchHashtags } from '../actions/search'

interface UseSearchOptions {
  query: string
  type: 'all' | 'users' | 'posts' | 'hashtags'
  enabled?: boolean
}

export function useSearch({ query, type, enabled = true }: UseSearchOptions) {
  const shouldFetch = enabled && query.trim().length >= 2

  const { data: users, isLoading: usersLoading } = useQuery({
    queryKey: ['search-users', query],
    queryFn: () => searchUsers(query),
    enabled: shouldFetch && (type === 'all' || type === 'users'),
  })

  const { data: posts, isLoading: postsLoading } = useQuery({
    queryKey: ['search-posts', query],
    queryFn: () => searchPosts(query),
    enabled: shouldFetch && (type === 'all' || type === 'posts'),
  })

  const { data: hashtags, isLoading: hashtagsLoading } = useQuery({
    queryKey: ['search-hashtags', query],
    queryFn: () => searchHashtags(query),
    enabled: shouldFetch && (type === 'all' || type === 'hashtags'),
  })

  return {
    users: users || [],
    posts: posts || [],
    hashtags: hashtags || [],
    isLoading: usersLoading || postsLoading || hashtagsLoading,
    isEmpty: !usersLoading && !postsLoading && !hashtagsLoading && 
      (!users?.length) && (!posts?.length) && (!hashtags?.length),
  }
}
