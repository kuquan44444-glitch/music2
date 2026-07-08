'use client'

import * as React from 'react'
import { Moon, Sun, Globe, Lock, LogOut } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { changePasswordSchema, ChangePasswordInput } from '@/lib/validations/auth.schema'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { useAuth } from '@/features/auth/AuthProvider'
import { useToast } from '@/components/ui/Toast'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'

export function ThemeToggle() {
  const [theme, setTheme] = React.useState<'light' | 'dark'>('dark')

  React.useEffect(() => {
    const stored = localStorage.getItem('theme') as 'light' | 'dark' | null
    if (stored) {
      setTheme(stored)
      document.documentElement.classList.toggle('dark', stored === 'dark')
    } else {
      document.documentElement.classList.add('dark')
    }
  }, [])

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark'
    setTheme(newTheme)
    localStorage.setItem('theme', newTheme)
    document.documentElement.classList.toggle('dark', newTheme === 'dark')
  }

  return (
    <button
      onClick={toggleTheme}
      className="flex items-center gap-3 p-3 rounded-xl hover:bg-accent transition-colors w-full"
    >
      {theme === 'dark' ? (
        <>
          <Moon className="h-5 w-5" />
          <span>Chế độ tối</span>
        </>
      ) : (
        <>
          <Sun className="h-5 w-5" />
          <span>Chế độ sáng</span>
        </>
      )}
    </button>
  )
}

export function LanguageSwitcher() {
  const [language, setLanguage] = React.useState('vi')

  React.useEffect(() => {
    const stored = localStorage.getItem('language')
    if (stored) setLanguage(stored)
  }, [])

  const changeLanguage = (lang: string) => {
    setLanguage(lang)
    localStorage.setItem('language', lang)
  }

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium flex items-center gap-2">
        <Globe className="h-4 w-4" />
        Ngôn ngữ
      </label>
      <div className="flex gap-2">
        <button
          onClick={() => changeLanguage('vi')}
          className={cn(
            'px-4 py-2 rounded-lg text-sm transition-colors',
            language === 'vi'
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted hover:bg-accent'
          )}
        >
          Tiếng Việt
        </button>
        <button
          onClick={() => changeLanguage('en')}
          className={cn(
            'px-4 py-2 rounded-lg text-sm transition-colors',
            language === 'en'
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted hover:bg-accent'
          )}
        >
          English
        </button>
      </div>
    </div>
  )
}

export function ChangePasswordForm() {
  const [isLoading, setIsLoading] = React.useState(false)
  const { addToast } = useToast()
  const supabase = createClient()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ChangePasswordInput>({
    resolver: zodResolver(changePasswordSchema),
  })

  const onSubmit = async (data: ChangePasswordInput) => {
    setIsLoading(true)
    try {
      const { error } = await supabase.auth.updateUser({
        password: data.newPassword,
      })

      if (error) throw error

      addToast('Đã đổi mật khẩu thành công', 'success')
      reset()
    } catch (error) {
      addToast(error instanceof Error ? error.message : 'Không thể đổi mật khẩu', 'error')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium">Mật khẩu hiện tại</label>
        <Input
          type="password"
          placeholder="••••••••"
          {...register('currentPassword')}
        />
        {errors.currentPassword && (
          <p className="text-xs text-destructive">{errors.currentPassword.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Mật khẩu mới</label>
        <Input
          type="password"
          placeholder="••••••••"
          {...register('newPassword')}
        />
        {errors.newPassword && (
          <p className="text-xs text-destructive">{errors.newPassword.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Xác nhận mật khẩu mới</label>
        <Input
          type="password"
          placeholder="••••••••"
          {...register('confirmPassword')}
        />
        {errors.confirmPassword && (
          <p className="text-xs text-destructive">{errors.confirmPassword.message}</p>
        )}
      </div>

      <Button type="submit" isLoading={isLoading} className="w-full">
        Đổi mật khẩu
      </Button>
    </form>
  )
}

export function LogoutButton() {
  const { signOut } = useAuth()

  return (
    <Button
      variant="destructive"
      onClick={() => signOut()}
      className="w-full"
    >
      <LogOut className="h-4 w-4 mr-2" />
      Đăng xuất
    </Button>
  )
}

export function SettingsPage() {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Cài đặt</h1>

      <Card>
        <CardHeader>
          <CardTitle>Giao diện</CardTitle>
          <CardDescription>Tùy chỉnh giao diện ứng dụng</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <ThemeToggle />
          <LanguageSwitcher />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Bảo mật</CardTitle>
          <CardDescription>Quản lý mật khẩu và bảo mật tài khoản</CardDescription>
        </CardHeader>
        <CardContent>
          <ChangePasswordForm />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-destructive">Nguy hiểm</CardTitle>
          <CardDescription>Các thao tác không thể hoàn tác</CardDescription>
        </CardHeader>
        <CardContent>
          <LogoutButton />
        </CardContent>
      </Card>
    </div>
  )
}
