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
      restaurants: {
        Row: {
          id: string
          owner_user_id: string
          name: string
          slug: string
          logo_url: string | null
          hero_url: string | null
          slogan: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          owner_user_id: string
          name: string
          slug: string
          logo_url?: string | null
          hero_url?: string | null
          slogan?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          owner_user_id?: string
          name?: string
          slug?: string
          logo_url?: string | null
          hero_url?: string | null
          slogan?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      categories: {
        Row: {
          id: string
          restaurant_id: string
          name: string
          sort_order: number
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          restaurant_id: string
          name: string
          sort_order?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          restaurant_id?: string
          name?: string
          sort_order?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      products: {
        Row: {
          id: string
          restaurant_id: string
          category_id: string | null
          name: string
          description: string | null
          price: number
          image_url: string | null
          sort_order: number
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          restaurant_id: string
          category_id?: string | null
          name: string
          description?: string | null
          price: number
          image_url?: string | null
          sort_order?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          restaurant_id?: string
          category_id?: string | null
          name?: string
          description?: string | null
          price?: number
          image_url?: string | null
          sort_order?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      scan_events: {
        Row: {
          id: string
          restaurant_id: string
          scanned_at: string
          user_agent: string | null
          referrer: string | null
          ip_hash: string | null
          created_at: string
        }
        Insert: {
          id?: string
          restaurant_id: string
          scanned_at?: string
          user_agent?: string | null
          referrer?: string | null
          ip_hash?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          restaurant_id?: string
          scanned_at?: string
          user_agent?: string | null
          referrer?: string | null
          ip_hash?: string | null
          created_at?: string
        }
      }
      subscriptions: {
        Row: {
          id: string
          restaurant_id: string
          plan: 'free' | 'pro'
          status: 'active' | 'inactive' | 'past_due' | 'canceled' | 'trialing'
          current_period_start: string | null
          current_period_end: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          restaurant_id: string
          plan?: 'free' | 'pro'
          status?: 'active' | 'inactive' | 'past_due' | 'canceled' | 'trialing'
          current_period_start?: string | null
          current_period_end?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          restaurant_id?: string
          plan?: 'free' | 'pro'
          status?: 'active' | 'inactive' | 'past_due' | 'canceled' | 'trialing'
          current_period_start?: string | null
          current_period_end?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      payments: {
        Row: {
          id: string
          restaurant_id: string
          amount: number
          currency: string
          status: 'paid' | 'failed' | 'refunded' | 'pending'
          provider: string
          provider_payment_id: string | null
          paid_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          restaurant_id: string
          amount: number
          currency?: string
          status: 'paid' | 'failed' | 'refunded' | 'pending'
          provider?: string
          provider_payment_id?: string | null
          paid_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          restaurant_id?: string
          amount?: number
          currency?: string
          status?: 'paid' | 'failed' | 'refunded' | 'pending'
          provider?: string
          provider_payment_id?: string | null
          paid_at?: string | null
          created_at?: string
        }
      }
      admin_users: {
        Row: {
          user_id: string
          created_at: string
        }
        Insert: {
          user_id: string
          created_at?: string
        }
        Update: {
          user_id?: string
          created_at?: string
        }
      }
    }
    Functions: {
      is_admin: {
        Args: Record<string, never>
        Returns: boolean
      }
      generate_unique_slug: {
        Args: { base_name: string }
        Returns: string
      }
      get_scan_metrics: {
        Args: { rest_id: string; days?: number }
        Returns: { date: string; scan_count: number }[]
      }
      get_restaurant_scan_stats: {
        Args: { rest_id: string }
        Returns: {
          scans_today: number
          scans_7d: number
          scans_30d: number
          scans_total: number
        }[]
      }
    }
  }
}