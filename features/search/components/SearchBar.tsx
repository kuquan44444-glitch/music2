'use client'

import * as React from 'react'
import { Search as SearchIcon, X, Users, FileText, Hash, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Input } from '@/components/ui/Input'
import { Avatar } from '@/components/ui/Avatar'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/Tabs'
import { useSearch } from '../hooks/useSearch'
import Link from 'next/link'
import Image from 'next/image'

interface SearchBarProps {
  defaultQuery?: string
  autoFocus?: boolean
  onSearch?: (query: string) => void
}

export function SearchBar({ defaultQuery = '', autoFocus = false, onSearch }: SearchBarProps) {
  const [query, setQuery] = React.useState(defaultQuery)

  React.useEffect(() => {
    if (onSearch) {
      const timer = setTimeout(() => onSearch(query), 300)
      return () => clearTimeout(timer)
    }
  }, [query, onSearch])

  return (
    <div className="relative">
      <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
      <Input
        type="search"
        placeholder="Tìm kiếm người dùng, bài viết, hashtag..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="pl-10 pr-10"
        autoFocus={autoFocus}
      />
      {query && (
        <button
          onClick={() => setQuery('')}
          className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-accent rounded-full"
        >
          <X className="h-4 w-4 text-muted-foreground" />
        </button>
      )}
    </div>
  )
}

interface SearchResultsProps {
  query: string
  type?: 'all' | 'users' | 'posts' | 'hashtags'
}

export function SearchResults({ query, type = 'all' }: SearchResultsProps) {
  const { users, posts, hashtags, isLoading, isEmpty } = useSearch({ query, type })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (isEmpty) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <SearchIcon className="h-12 w-12 text-muted-foreground mb-4" />
        <p className="text-muted-foreground">Không tìm thấy kết quả cho "{query}"</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {type === 'all' || type === 'users' ? (
        <section>
          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <Users className="h-5 w-5" />
            Người dùng
          </h3>
          {users.length === 0 ? (
            <p className="text-muted-foreground text-sm">Không có người dùng phù hợp</p>
          ) : (
            <div className="space-y-2">
              {users.map((user) => (
                <Link
                  key={user.id}
                  href={`/profile/${user.id}`}
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-accent transition-colors"
                >
                  <Avatar src={user.avatar_url} alt={user.full_name || user.username} size="lg" />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold truncate">{user.full_name || user.username}</p>
                    <p className="text-sm text-muted-foreground">@{user.username}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      )}

      {type === 'all' || type === 'posts' ? (
        <section>
          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Bài viết
          </h3>
          {posts.length === 0 ? (
            <p className="text-muted-foreground text-sm">Không có bài viết phù hợp</p>
          ) : (
            <div className="space-y-2">
              {posts.map((post) => (
                <Link
                  key={post.id}
                  href={`/posts/${post.id}`}
                  className="block p-3 rounded-xl hover:bg-accent transition-colors"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <Avatar
                      src={post.profiles.avatar_url}
                      alt={post.profiles.full_name || post.profiles.username}
                      size="sm"
                    />
                    <div>
                      <p className="font-medium text-sm">
                        {post.profiles.full_name || post.profiles.username}
                      </p>
                      <p className="text-xs text-muted-foreground">@{post.profiles.username}</p>
                    </div>
                  </div>
                  {post.content && (
                    <p className="text-sm line-clamp-2">{post.content}</p>
                  )}
                  {post.post_images && post.post_images.length > 0 && (
                    <div className="mt-2 flex gap-1">
                      {post.post_images.slice(0, 3).map((img) => (
                        <div key={img.id} className="relative w-16 h-16 rounded-lg overflow-hidden">
                          <Image src={img.image_url} alt="" fill className="object-cover" />
                        </div>
                      ))}
                    </div>
                  )}
                </Link>
              ))}
            </div>
          )}
        </section>
      )}

      {type === 'all' || type === 'hashtags' ? (
        <section>
          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <Hash className="h-5 w-5" />
            Hashtags
          </h3>
          {hashtags.length === 0 ? (
            <p className="text-muted-foreground text-sm">Không có hashtag phù hợp</p>
          ) : (
            <div className="space-y-2">
              {hashtags.map((tag) => (
                <Link
                  key={tag.id}
                  href={`/hashtags/${tag.name}`}
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-accent transition-colors"
                >
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Hash className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold">#{tag.name}</p>
                    <p className="text-sm text-muted-foreground">{tag.post_count} bài viết</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  )
}
