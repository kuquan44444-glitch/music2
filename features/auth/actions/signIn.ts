import { createClient } from '@/lib/supabase/server'
import { signInSchema, SignInInput } from '@/lib/validations/auth.schema'

export async function signIn(input: SignInInput) {
  const validatedData = signInSchema.parse(input)
  
  const supabase = await createClient()
  
  const { data, error } = await supabase.auth.signInWithPassword({
    email: validatedData.email,
    password: validatedData.password,
  })

  if (error) {
    throw new Error(error.message)
  }

  return data
}
