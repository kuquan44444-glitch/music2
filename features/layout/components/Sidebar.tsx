'use client'

import * as React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import { Home, Search, PlusCircle, MessageCircle, User, Settings, Users, Bookmark } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/features/auth/AuthProvider'
import { Avatar } from '@/components/ui/Avatar'

export function Sidebar() {
  const pathname = usePathname()
  const { user } = useAuth()

  const mainNavItems = [
    { href: '/', icon: Home, label: 'Trang chủ' },
    { href: '/search', icon: Search, label: 'Tìm kiếm' },
    { href: '/create', icon: PlusCircle, label: 'Tạo bài viết' },
    { href: '/messages', icon: MessageCircle, label: 'Tin nhắn' },
    { href: '/friends', icon: Users, label: 'Bạn bè' },
    { href: '/saved', icon: Bookmark, label: 'Đã lưu' },
  ]

  const bottomNavItems = [
    { href: '/settings', icon: Settings, label: 'Cài đặt' },
  ]

  return (
    <aside className="hidden md:flex flex-col w-64 h-screen sticky top-0 border-r border-border bg-background/95 backdrop-blur-lg">
      <div className="p-6">
        <Link href="/" className="flex items-center gap-2">
          <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-xl">M</span>
          </div>
          <span className="text-xl font-bold">MixFlow</span>
        </Link>
      </div>

      <nav className="flex-1 px-3 space-y-1">
        {mainNavItems.map((item) => {
          const isActive = pathname === item.href || 
            (item.href !== '/' && pathname.startsWith(item.href))
          const Icon = item.icon

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'relative flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200',
                isActive 
                  ? 'bg-primary/10 text-primary font-semibold' 
                  : 'text-muted-foreground hover:bg-accent hover:text-foreground'
              )}
            >
              {isActive && (
                <motion.div
                  layoutId="sidebar-indicator"
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-primary rounded-r-full"
                  transition={{ type: 'spring', bounce: 0.3, duration: 0.5 }}
                />
              )}
              <Icon className={cn('h-5 w-5', isActive && 'stroke-[2.5px]')} />
              <span>{item.label}</span>
            </Link>
          )
        })}
      </nav>

      <div className="p-3 border-t border-border">
        {bottomNavItems.map((item) => {
          const isActive = pathname === item.href
          const Icon = item.icon

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200',
                isActive 
                  ? 'bg-primary/10 text-primary font-semibold' 
                  : 'text-muted-foreground hover:bg-accent hover:text-foreground'
              )}
            >
              <Icon className="h-5 w-5" />
              <span>{item.label}</span>
            </Link>
          )
        })}

        <Link
          href={`/profile/${user?.id}`}
          className="flex items-center gap-3 px-4 py-3 mt-2 rounded-xl transition-all duration-200 hover:bg-accent"
        >
          <Avatar 
            src={user?.user_metadata?.avatar_url} 
            alt={user?.user_metadata?.full_name || 'User'}
            size="sm"
          />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">
              {user?.user_metadata?.full_name || 'User'}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              @{user?.user_metadata?.username || 'user'}
            </p>
          </div>
        </Link>
      </div>
    </aside>
  )
}
