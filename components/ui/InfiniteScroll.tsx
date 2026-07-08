'use client'

import * as React from 'react'
import { useInfiniteQuery } from '@tanstack/react-query'

interface InfiniteScrollProps<T> {
  queryKey: string
  queryFn: (pageParam: string | undefined) => Promise<{ data: T[]; nextCursor?: string }>
  renderItem: (item: T) => React.ReactNode
  className?: string
  emptyMessage?: string
}

export function InfiniteScroll<T>({
  queryKey,
  queryFn,
  renderItem,
  className,
  emptyMessage = 'No items found',
}: InfiniteScrollProps<T>) {
  const observerRef = React.useRef<HTMLDivElement>(null)

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
  } = useInfiniteQuery({
    queryKey: [queryKey],
    queryFn: async ({ pageParam }) => {
      return queryFn(pageParam)
    },
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  })

  React.useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage()
        }
      },
      { threshold: 0.1 }
    )

    if (observerRef.current) {
      observer.observe(observerRef.current)
    }

    return () => observer.disconnect()
  }, [fetchNextPage, hasNextPage, isFetchingNextPage])

  const items = data?.pages.flatMap((page) => page.data) ?? []

  if (isLoading) {
    return (
      <div className={className}>
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="animate-pulse rounded-xl border bg-card p-4 mb-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 rounded-full bg-muted" />
              <div className="space-y-2 flex-1">
                <div className="h-4 w-32 bg-muted rounded" />
                <div className="h-3 w-20 bg-muted rounded" />
              </div>
            </div>
            <div className="h-4 w-full bg-muted rounded mb-2" />
            <div className="h-4 w-3/4 bg-muted rounded" />
          </div>
        ))}
      </div>
    )
  }

  if (isError) {
    return (
      <div className={`flex items-center justify-center py-8 ${className}`}>
        <p className="text-muted-foreground">Đã xảy ra lỗi khi tải dữ liệu</p>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className={`flex items-center justify-center py-8 ${className}`}>
        <p className="text-muted-foreground">{emptyMessage}</p>
      </div>
    )
  }

  return (
    <div className={className}>
      {items.map((item, index) => (
        <div key={`${(item as { id?: string }).id || index}`}>
          {renderItem(item)}
        </div>
      ))}
      
      <div ref={observerRef} className="py-4 flex justify-center">
        {isFetchingNextPage && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <svg
              className="h-5 w-5 animate-spin"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
            <span className="text-sm">Đang tải...</span>
          </div>
        )}
      </div>
    </div>
  )
}
