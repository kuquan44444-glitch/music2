'use client'

import * as React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import { Home, Search, PlusCircle, MessageCircle, User } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/features/auth/AuthProvider'

const navItems = [
  { href: '/', icon: Home, label: 'Trang chủ' },
  { href: '/search', icon: Search, label: 'Tìm kiếm' },
  { href: '/create', icon: PlusCircle, label: 'Tạo' },
  { href: '/messages', icon: MessageCircle, label: 'Tin nhắn' },
]

export function BottomNav() {
  const pathname = usePathname()
  const { user } = useAuth()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-lg border-t border-border md:hidden">
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href || 
            (item.href !== '/' && pathname.startsWith(item.href))
          const Icon = item.icon

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'relative flex flex-col items-center justify-center gap-1 w-16 h-14 rounded-xl transition-colors',
                isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {isActive && (
                <motion.div
                  layoutId="nav-indicator"
                  className="absolute -top-0.5 left-1/2 -translate-x-1/2 w-12 h-1 bg-primary rounded-full"
                  transition={{ type: 'spring', bounce: 0.3, duration: 0.5 }}
                />
              )}
              <Icon className={cn('h-6 w-6', isActive && 'stroke-[2.5px]')} />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          )
        })}
        
        <Link
          href={`/profile/${user?.id}`}
          className={cn(
            'relative flex flex-col items-center justify-center gap-1 w-16 h-14 rounded-xl transition-colors',
            pathname.startsWith('/profile') ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
          )}
        >
          {pathname.startsWith('/profile') && (
            <motion.div
              layoutId="nav-indicator"
              className="absolute -top-0.5 left-1/2 -translate-x-1/2 w-12 h-1 bg-primary rounded-full"
              transition={{ type: 'spring', bounce: 0.3, duration: 0.5 }}
            />
          )}
          <User className="h-6 w-6" />
          <span className="text-[10px] font-medium">Profile</span>
        </Link>
      </div>
    </nav>
  )
}
