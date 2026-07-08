'use client'

import * as React from 'react'
import { useInfiniteQuery } from '@tanstack/react-query'
import { useNotifications } from '@/features/notifications/hooks/useNotifications'
import { NotificationList } from '@/features/notifications/components/NotificationList'
import { NotificationWithSender } from '@/features/notifications/actions/notifications'
import { Skeleton } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/ui/EmptyState'
import { Bell } from 'lucide-react'
import { useAuth } from '@/features/auth/AuthProvider'

export default function NotificationsPage() {
  const { user } = useAuth()
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  } = useNotifications(user?.id)

  const notifications = data?.pages.flatMap((page: { data: NotificationWithSender[], nextCursor?: string }) => page.data) || []

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto py-4 px-4 space-y-4">
        <h1 className="text-2xl font-bold">Thông báo</h1>
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 p-3">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-3 w-24" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto py-4 px-4">
      <h1 className="text-2xl font-bold mb-6">Thông báo</h1>

      {notifications.length === 0 ? (
        <EmptyState
          icon="inbox"
          title="Chưa có thông báo nào"
          description="Các thông báo về hoạt động của bạn sẽ xuất hiện ở đây"
        />
      ) : (
        <div className="space-y-2">
          <NotificationList notifications={notifications} />
          
          {hasNextPage && (
            <button
              onClick={() => fetchNextPage()}
              disabled={isFetchingNextPage}
              className="w-full py-3 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              {isFetchingNextPage ? 'Đang tải...' : 'Xem thêm'}
            </button>
          )}
        </div>
      )}
    </div>
  )
}
