export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          username: string
          full_name: string | null
          avatar_url: string | null
          cover_url: string | null
          bio: string | null
          created_at: string
        }
        Insert: {
          id: string
          username: string
          full_name?: string | null
          avatar_url?: string | null
          cover_url?: string | null
          bio?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          username?: string
          full_name?: string | null
          avatar_url?: string | null
          cover_url?: string | null
          bio?: string | null
          created_at?: string
        }
      }
      posts: {
        Row: {
          id: string
          user_id: string
          content: string | null
          visibility: 'public' | 'private'
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          content?: string | null
          visibility?: 'public' | 'private'
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          content?: string | null
          visibility?: 'public' | 'private'
          created_at?: string
        }
      }
      post_images: {
        Row: {
          id: string
          post_id: string
          image_url: string
        }
        Insert: {
          id?: string
          post_id: string
          image_url: string
        }
        Update: {
          id?: string
          post_id?: string
          image_url?: string
        }
      }
      post_videos: {
        Row: {
          id: string
          post_id: string
          video_url: string
          view_count: number
        }
        Insert: {
          id?: string
          post_id: string
          video_url: string
          view_count?: number
        }
        Update: {
          id?: string
          post_id?: string
          video_url?: string
          view_count?: number
        }
      }
      post_music: {
        Row: {
          id: string
          post_id: string
          title: string
          artist: string | null
          file_url: string
          cover_url: string | null
        }
        Insert: {
          id?: string
          post_id: string
          title: string
          artist?: string | null
          file_url: string
          cover_url?: string | null
        }
        Update: {
          id?: string
          post_id?: string
          title?: string
          artist?: string | null
          file_url?: string
          cover_url?: string | null
        }
      }
      comments: {
        Row: {
          id: string
          post_id: string
          user_id: string
          parent_id: string | null
          content: string
          created_at: string
        }
        Insert: {
          id?: string
          post_id: string
          user_id: string
          parent_id?: string | null
          content: string
          created_at?: string
        }
        Update: {
          id?: string
          post_id?: string
          user_id?: string
          parent_id?: string | null
          content?: string
          created_at?: string
        }
      }
      comment_likes: {
        Row: {
          id: string
          comment_id: string
          user_id: string
        }
        Insert: {
          id?: string
          comment_id: string
          user_id: string
        }
        Update: {
          id?: string
          comment_id?: string
          user_id?: string
        }
      }
      post_likes: {
        Row: {
          id: string
          post_id: string
          user_id: string
          created_at: string
        }
        Insert: {
          id?: string
          post_id: string
          user_id: string
          created_at?: string
        }
        Update: {
          id?: string
          post_id?: string
          user_id?: string
          created_at?: string
        }
      }
      saved_posts: {
        Row: {
          id: string
          user_id: string
          post_id: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          post_id: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          post_id?: string
          created_at?: string
        }
      }
      friend_requests: {
        Row: {
          id: string
          sender_id: string
          receiver_id: string
          status: 'pending' | 'accepted' | 'rejected'
          created_at: string
        }
        Insert: {
          id?: string
          sender_id: string
          receiver_id: string
          status?: 'pending' | 'accepted' | 'rejected'
          created_at?: string
        }
        Update: {
          id?: string
          sender_id?: string
          receiver_id?: string
          status?: 'pending' | 'accepted' | 'rejected'
          created_at?: string
        }
      }
      friends: {
        Row: {
          id: string
          user_id: string
          friend_id: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          friend_id: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          friend_id?: string
          created_at?: string
        }
      }
      conversations: {
        Row: {
          id: string
          created_at: string
        }
        Insert: {
          id?: string
          created_at?: string
        }
        Update: {
          id?: string
          created_at?: string
        }
      }
      conversation_members: {
        Row: {
          id: string
          conversation_id: string
          user_id: string
        }
        Insert: {
          id?: string
          conversation_id: string
          user_id: string
        }
        Update: {
          id?: string
          conversation_id?: string
          user_id?: string
        }
      }
      messages: {
        Row: {
          id: string
          conversation_id: string
          sender_id: string
          text_content: string | null
          image_url: string | null
          is_seen: boolean
          is_recalled: boolean
          created_at: string
        }
        Insert: {
          id?: string
          conversation_id: string
          sender_id: string
          text_content?: string | null
          image_url?: string | null
          is_seen?: boolean
          is_recalled?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          conversation_id?: string
          sender_id?: string
          text_content?: string | null
          image_url?: string | null
          is_seen?: boolean
          is_recalled?: boolean
          created_at?: string
        }
      }
      notifications: {
        Row: {
          id: string
          receiver_id: string
          sender_id: string | null
          type: 'like' | 'comment' | 'reply' | 'friend_request' | 'friend_accepted' | 'message' | 'share'
          post_id: string | null
          is_read: boolean
          created_at: string
        }
        Insert: {
          id?: string
          receiver_id: string
          sender_id?: string | null
          type: 'like' | 'comment' | 'reply' | 'friend_request' | 'friend_accepted' | 'message' | 'share'
          post_id?: string | null
          is_read?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          receiver_id?: string
          sender_id?: string | null
          type?: 'like' | 'comment' | 'reply' | 'friend_request' | 'friend_accepted' | 'message' | 'share'
          post_id?: string | null
          is_read?: boolean
          created_at?: string
        }
      }
      hashtags: {
        Row: {
          id: string
          name: string
        }
        Insert: {
          id?: string
          name: string
        }
        Update: {
          id?: string
          name?: string
        }
      }
      post_hashtags: {
        Row: {
          id: string
          post_id: string
          hashtag_id: string
        }
        Insert: {
          id?: string
          post_id: string
          hashtag_id: string
        }
        Update: {
          id?: string
          post_id?: string
          hashtag_id?: string
        }
      }
    }
    Views: {}
    Functions: {}
    Enums: {}
  }
}

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type InsertTables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert']
export type UpdateTables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update']

export type Profile = Tables<'profiles'>
export type Post = Tables<'posts'>
export type PostImage = Tables<'post_images'>
export type PostVideo = Tables<'post_videos'>
export type PostMusic = Tables<'post_music'>
export type Comment = Tables<'comments'>
export type CommentLike = Tables<'comment_likes'>
export type PostLike = Tables<'post_likes'>
export type SavedPost = Tables<'saved_posts'>
export type FriendRequest = Tables<'friend_requests'>
export type Friend = Tables<'friends'>
export type Conversation = Tables<'conversations'>
export type ConversationMember = Tables<'conversation_members'>
export type Message = Tables<'messages'>
export type Notification = Tables<'notifications'>
export type Hashtag = Tables<'hashtags'>
export type PostHashtag = Tables<'post_hashtags'>
