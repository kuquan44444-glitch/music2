'use client'

import * as React from 'react'
import { createClient } from '@/lib/supabase/client'
import { useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@/features/auth/AuthProvider'

export function useRealtimeMessages(conversationId: string | undefined, onNewMessage?: (message: any) => void) {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const supabase = createClient()

  React.useEffect(() => {
    if (!conversationId) return

    const channel = supabase
      .channel(`messages:${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        async (payload) => {
          const newMessage = payload.new as any
          
          if (newMessage.sender_id !== user?.id) {
            const { data: sender } = await supabase
              .from('profiles')
              .select('id, username, full_name, avatar_url')
              .eq('id', newMessage.sender_id)
              .single()

            queryClient.invalidateQueries({ queryKey: ['messages', conversationId] })
            queryClient.invalidateQueries({ queryKey: ['conversations'] })

            onNewMessage?.({
              ...newMessage,
              sender,
            })
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [conversationId, user?.id, supabase, queryClient, onNewMessage])
}
