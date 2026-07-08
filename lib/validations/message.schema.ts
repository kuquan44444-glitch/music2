import { z } from 'zod'

export const sendMessageSchema = z.object({
  conversationId: z.string().uuid(),
  textContent: z.string().max(5000, 'Tin nhắn quá dài').optional(),
  imageUrl: z.string().url().optional(),
}).refine((data) => data.textContent || data.imageUrl, {
  message: 'Tin nhắn phải có nội dung text hoặc hình ảnh',
})

export const createConversationSchema = z.object({
  userId: z.string().uuid(),
})

export type SendMessageInput = z.infer<typeof sendMessageSchema>
export type CreateConversationInput = z.infer<typeof createConversationSchema>
