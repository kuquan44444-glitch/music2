import { z } from 'zod'

export const updateProfileSchema = z.object({
  fullName: z.string().min(2, 'Tên phải có ít nhất 2 ký tự').optional(),
  username: z.string().min(3, 'Tên người dùng phải có ít nhất 3 ký tự').max(30, 'Tên người dùng quá dài').optional(),
  bio: z.string().max(500, 'Bio quá dài').optional(),
})

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>
