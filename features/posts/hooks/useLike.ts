'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { likePost } from '../actions/likePost'
import { useToast } from '@/components/ui/Toast'

export function useLike() {
  const queryClient = useQueryClient()
  const { addToast } = useToast()

  return useMutation({
    mutationFn: likePost,
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
                  isLiked: true,
                  _count: {
                    ...post._count,
                    post_likes: post._count.post_likes + 1,
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
      addToast('Không thể thích bài viết', 'error')
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feed'] })
    },
  })
}
