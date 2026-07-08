'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { savePost } from '../actions/savePost'
import { useToast } from '@/components/ui/Toast'

export function useSave() {
  const queryClient = useQueryClient()
  const { addToast } = useToast()

  return useMutation({
    mutationFn: savePost,
    onMutate: async (postId) => {
      await queryClient.cancelQueries({ queryKey: ['feed'] })
      
      const previousFeed = queryClient.getQueryData(['feed'])
      
      queryClient.setQueryData(['feed'], (old: any) => {
        if (!old?.pages) return old
        return {
          ...old,
          pages: old.pages.map((page: any) => ({
            ...page,
            data: page.data.map((post: any) => {
              if (post.id === postId) {
                return {
                  ...post,
                  isSaved: true,
                }
              }
              return post
            }),
          })),
        }
      })
      
      return { previousFeed }
    },
    onError: (err, postId, context) => {
      if (context?.previousFeed) {
        queryClient.setQueryData(['feed'], context.previousFeed)
      }
      addToast('Không thể lưu bài viết', 'error')
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feed'] })
      addToast('Đã lưu bài viết', 'success')
    },
  })
}
