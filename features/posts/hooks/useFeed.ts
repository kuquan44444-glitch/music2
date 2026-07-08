'use client'

import { useInfiniteQuery } from '@tanstack/react-query'
import { getFeed, PostWithDetails } from '../actions/getFeed'

export function useFeed() {
  return useInfiniteQuery({
    queryKey: ['feed'],
    queryFn: async ({ pageParam }) => {
      return getFeed(pageParam)
    },
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    select: (data) => ({
      pages: data.pages,
      pageParams: data.pageParams,
    }),
  })
}

export type { PostWithDetails }
