'use client'

import * as React from 'react'
import { useAuth } from '@/features/auth/AuthProvider'
import { useFriends, useFriends as useFriendsData } from '@/features/friends/hooks/useFriends'
import { FriendCard, FriendRequestCard } from '@/features/friends/components'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/Tabs'
import { Skeleton } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/ui/EmptyState'

export default function FriendsPage() {
  const { user } = useAuth()
  const { friends, friendRequests, friendsLoading, requestsLoading } = useFriends(user?.id)

  if (friendsLoading || requestsLoading) {
    return (
      <div className="max-w-2xl mx-auto py-4 px-4 space-y-4">
        <h1 className="text-2xl font-bold">Bạn bè</h1>
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 p-3">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-24" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto py-4 px-4">
      <h1 className="text-2xl font-bold mb-6">Bạn bè</h1>

      <Tabs defaultValue="friends">
        <TabsList className="w-full">
          <TabsTrigger value="friends" className="flex-1">
            Bạn bè ({friends.length})
          </TabsTrigger>
          <TabsTrigger value="requests" className="flex-1">
            Lời mời ({friendRequests.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="friends">
          {friends.length === 0 ? (
            <EmptyState
              icon="users"
              title="Chưa có bạn bè"
              description="Kết nối với mọi người để mở rộng danh sách bạn bè"
            />
          ) : (
            <div className="mt-4 space-y-2">
              {friends.map((friend: any) => (
                <FriendCard key={friend.id} friend={friend} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="requests">
          {friendRequests.length === 0 ? (
            <EmptyState
              icon="users"
              title="Không có lời mời kết bạn"
              description="Lời mời kết bạn sẽ xuất hiện ở đây"
            />
          ) : (
            <div className="mt-4 space-y-2">
              {friendRequests.map((request: any) => (
                <FriendRequestCard key={request.id} request={request} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
