import { z } from 'zod'

export const createPostSchema = z.object({
  content: z.string().optional(),
  visibility: z.enum(['public', 'private']).default('public'),
})

export const updatePostSchema = z.object({
  postId: z.string().uuid(),
  content: z.string().optional(),
  visibility: z.enum(['public', 'private']).optional(),
})

export const createCommentSchema = z.object({
  postId: z.string().uuid(),
  parentId: z.string().uuid().optional(),
  content: z.string().min(1, 'Bình luận không được để trống').max(1000, 'Bình luận quá dài'),
})

export type CreatePostInput = z.infer<typeof createPostSchema>
export type UpdatePostInput = z.infer<typeof updatePostSchema>
export type CreateCommentInput = z.infer<typeof createCommentSchema>
