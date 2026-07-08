'use server'

import { createClient } from '@/lib/supabase/server'
import { forgotPasswordSchema, ForgotPasswordInput } from '@/lib/validations/auth.schema'

export async function forgotPassword(input: ForgotPasswordInput) {
  const validatedData = forgotPasswordSchema.parse(input)

  const supabase = await createClient()

  const { error } = await supabase.auth.resetPasswordForEmail(validatedData.email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/callback?next=/settings`,
  })

  if (error) {
    throw new Error(error.message)
  }

  return { success: true }
}
