'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { addComment } from '../actions/addComment'
import { useToast } from '@/components/ui/Toast'
import { CreateCommentInput } from '@/lib/validations/post.schema'

export function useComment() {
  const queryClient = useQueryClient()
  const { addToast } = useToast()

  return useMutation({
    mutationFn: (input: CreateCommentInput) => addComment(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feed'] })
      addToast('Bình luận đã được thêm', 'success')
    },
    onError: (error) => {
      addToast(error instanceof Error ? error.message : 'Không thể thêm bình luận', 'error')
    },
  })
}
