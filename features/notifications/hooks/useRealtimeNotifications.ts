'use client'

import * as React from 'react'
import { createClient } from '@/lib/supabase/client'
import { useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@/features/auth/AuthProvider'
import { NotificationWithSender } from '../actions/notifications'

export function useRealtimeNotifications(onNewNotification?: (notification: NotificationWithSender) => void) {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const supabase = createClient()

  React.useEffect(() => {
    if (!user) return

    const channel = supabase
      .channel('notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `receiver_id=eq.${user.id}`,
        },
        async (payload) => {
          const notification = payload.new as NotificationWithSender
          
          if (notification.sender_id) {
            const { data: sender } = await supabase
              .from('profiles')
              .select('id, username, full_name, avatar_url')
              .eq('id', notification.sender_id)
              .single()

            queryClient.invalidateQueries({ queryKey: ['notifications'] })
            queryClient.invalidateQueries({ queryKey: ['unread-notifications'] })

            onNewNotification?.({
              ...notification,
              sender,
            })
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [user?.id, supabase, queryClient, onNewNotification])
}
