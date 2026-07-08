'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { sharePost } from '../actions/sharePost'
import { useToast } from '@/components/ui/Toast'
import { copyToClipboard, generateShareLink } from '@/lib/utils'

export function useShare() {
  const queryClient = useQueryClient()
  const { addToast } = useToast()

  return useMutation({
    mutationFn: sharePost,
    onSuccess: async (data, postId) => {
      const shareLink = generateShareLink(postId)
      const copied = await copyToClipboard(shareLink)
      if (copied) {
        addToast('Đã sao chép link bài viết', 'success')
      }
      queryClient.invalidateQueries({ queryKey: ['feed'] })
    },
    onError: (error) => {
      addToast(error instanceof Error ? error.message : 'Không thể chia sẻ bài viết', 'error')
    },
  })
}
