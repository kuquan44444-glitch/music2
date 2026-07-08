'use server'

import { createClient } from '@/lib/supabase/server'
import { signUpSchema, SignUpInput } from '@/lib/validations/auth.schema'

export async function signUp(input: SignUpInput) {
  const validatedData = signUpSchema.parse(input)
  
  const supabase = await createClient()
  
  const { data, error } = await supabase.auth.signUp({
    email: validatedData.email,
    password: validatedData.password,
    options: {
      data: {
        full_name: validatedData.fullName,
      },
    },
  }) as { data: { user: { id: string } | null }; error: { message: string } | null }

  if (error) {
    throw new Error(error.message)
  }

  if (data.user) {
    const username = validatedData.email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '') + '_' + Date.now().toString(36)
    
    const { error: profileError } = await supabase
      .from('profiles')
      .upsert({
        id: data.user.id,
        username,
        full_name: validatedData.fullName,
      } as any)

    if (profileError) {
      console.error('Error creating profile:', profileError)
    }
  }

  return data
}
