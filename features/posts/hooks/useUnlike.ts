'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { unlikePost } from '../actions/unlikePost'
import { useToast } from '@/components/ui/Toast'

export function useUnlike() {
  const queryClient = useQueryClient()
  const { addToast } = useToast()

  return useMutation({
    mutationFn: unlikePost,
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
                  isLiked: false,
                  _count: {
                    ...post._count,
                    post_likes: Math.max(0, post._count.post_likes - 1),
                  },
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
      addToast('Không thể bỏ thích bài viết', 'error')
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feed'] })
    },
  })
}
