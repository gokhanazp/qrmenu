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
          tenant_id: string | null
          name: string
          slug: string
          logo_url: string | null
          logo_size: string
          hero_url: string | null
          header_bg_url: string | null
          currency: string
          slogan: string | null
          is_active: boolean
          whatsapp: string | null
          ordering_enabled: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          owner_user_id: string
          tenant_id?: string | null
          name: string
          slug: string
          logo_url?: string | null
          logo_size?: string
          whatsapp?: string | null
          ordering_enabled?: boolean
          hero_url?: string | null
          header_bg_url?: string | null
          currency?: string
          slogan?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          owner_user_id?: string
          tenant_id?: string | null
          name?: string
          slug?: string
          logo_url?: string | null
          logo_size?: string
          whatsapp?: string | null
          ordering_enabled?: boolean
          hero_url?: string | null
          header_bg_url?: string | null
          currency?: string
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
          is_available: boolean
          track_stock: boolean
          stock_quantity: number | null
          sku: string | null
          availability_manual_override: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          restaurant_id: string
          category_id?: string | null
          is_available?: boolean
          track_stock?: boolean
          stock_quantity?: number | null
          sku?: string | null
          availability_manual_override?: boolean
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
          is_available?: boolean
          track_stock?: boolean
          stock_quantity?: number | null
          sku?: string | null
          availability_manual_override?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      inventory_transactions: {
        Row: {
          id: string
          tenant_id: string
          restaurant_id: string
          product_id: string
          order_id: string | null
          type: 'order_sale' | 'order_cancel_restore' | 'manual_adjustment' | 'stock_in' | 'stock_out' | 'correction'
          quantity: number
          previous_quantity: number | null
          new_quantity: number | null
          source: string
          idempotency_key: string | null
          note: string | null
          created_by: string | null
          created_at: string
        }
        Insert: never
        Update: never
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
          trial_ends_at: string | null
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
          trial_ends_at?: string | null
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
          trial_ends_at?: string | null
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
      reviews: {
        Row: {
          id: string
          restaurant_id: string
          topic: 'oneri' | 'sikayet' | 'diger'
          rating: number | null
          message: string
          author_name: string | null
          contact: string | null
          is_published: boolean
          created_at: string
        }
        Insert: {
          id?: string
          restaurant_id: string
          topic?: 'oneri' | 'sikayet' | 'diger'
          rating?: number | null
          message: string
          author_name?: string | null
          contact?: string | null
          is_published?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          restaurant_id?: string
          topic?: 'oneri' | 'sikayet' | 'diger'
          rating?: number | null
          message?: string
          author_name?: string | null
          contact?: string | null
          is_published?: boolean
          created_at?: string
        }
      }
      tenants: {
        Row: {
          id: string
          name: string
          slug: string
          status: 'active' | 'suspended'
          plan: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          status?: 'active' | 'suspended'
          plan?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          status?: 'active' | 'suspended'
          plan?: string
          created_at?: string
          updated_at?: string
        }
      }
      tenant_users: {
        Row: {
          id: string
          tenant_id: string
          user_id: string
          role: 'owner' | 'admin' | 'accountant'
          created_at: string
        }
        Insert: {
          id?: string
          tenant_id: string
          user_id: string
          role: 'owner' | 'admin' | 'accountant'
          created_at?: string
        }
        Update: {
          id?: string
          tenant_id?: string
          user_id?: string
          role?: 'owner' | 'admin' | 'accountant'
          created_at?: string
        }
      }
      restaurant_users: {
        Row: {
          id: string
          restaurant_id: string
          user_id: string
          role: 'branch_manager' | 'staff' | 'kitchen'
          created_at: string
        }
        Insert: {
          id?: string
          restaurant_id: string
          user_id: string
          role: 'branch_manager' | 'staff' | 'kitchen'
          created_at?: string
        }
        Update: {
          id?: string
          restaurant_id?: string
          user_id?: string
          role?: 'branch_manager' | 'staff' | 'kitchen'
          created_at?: string
        }
      }
      restaurant_features: {
        Row: {
          id: string
          restaurant_id: string
          feature_key: string
          enabled: boolean
          config: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          restaurant_id: string
          feature_key: string
          enabled?: boolean
          config?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          restaurant_id?: string
          feature_key?: string
          enabled?: boolean
          config?: Json
          created_at?: string
          updated_at?: string
        }
      }
      integrations: {
        Row: {
          id: string
          tenant_id: string
          restaurant_id: string
          platform: 'trendyol_food' | 'yemeksepeti' | 'getir_food' | 'migros_food'
          status: 'active' | 'disabled'
          health_status: 'active' | 'warning' | 'error' | 'disabled'
          environment: 'production' | 'stage'
          external_chain_id: string | null
          external_store_id: string | null
          credentials_encrypted: string | null
          credentials_meta: Json
          config: Json
          last_health_check_at: string | null
          last_successful_sync_at: string | null
          last_error: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          tenant_id?: string
          restaurant_id: string
          platform: 'trendyol_food' | 'yemeksepeti' | 'getir_food' | 'migros_food'
          status?: 'active' | 'disabled'
          health_status?: 'active' | 'warning' | 'error' | 'disabled'
          environment?: 'production' | 'stage'
          external_chain_id?: string | null
          external_store_id?: string | null
          credentials_encrypted?: string | null
          credentials_meta?: Json
          config?: Json
          last_health_check_at?: string | null
          last_successful_sync_at?: string | null
          last_error?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          tenant_id?: string
          restaurant_id?: string
          platform?: 'trendyol_food' | 'yemeksepeti' | 'getir_food' | 'migros_food'
          status?: 'active' | 'disabled'
          health_status?: 'active' | 'warning' | 'error' | 'disabled'
          environment?: 'production' | 'stage'
          external_chain_id?: string | null
          external_store_id?: string | null
          credentials_encrypted?: string | null
          credentials_meta?: Json
          config?: Json
          last_health_check_at?: string | null
          last_successful_sync_at?: string | null
          last_error?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      integration_jobs: {
        Row: {
          id: string
          tenant_id: string
          restaurant_id: string
          integration_id: string | null
          type: string
          status: 'pending' | 'running' | 'completed' | 'failed'
          payload: Json
          result: Json | null
          attempt_count: number
          max_attempts: number
          last_error: string | null
          run_after: string
          created_at: string
          started_at: string | null
          processed_at: string | null
        }
        Insert: {
          id?: string
          tenant_id: string
          restaurant_id: string
          integration_id?: string | null
          type: string
          status?: 'pending' | 'running' | 'completed' | 'failed'
          payload?: Json
          result?: Json | null
          attempt_count?: number
          max_attempts?: number
          last_error?: string | null
          run_after?: string
          created_at?: string
          started_at?: string | null
          processed_at?: string | null
        }
        Update: {
          id?: string
          tenant_id?: string
          restaurant_id?: string
          integration_id?: string | null
          type?: string
          status?: 'pending' | 'running' | 'completed' | 'failed'
          payload?: Json
          result?: Json | null
          attempt_count?: number
          max_attempts?: number
          last_error?: string | null
          run_after?: string
          created_at?: string
          started_at?: string | null
          processed_at?: string | null
        }
      }
      integration_events: {
        Row: {
          id: string
          integration_id: string
          event_key: string
          event_type: string
          payload: Json
          received_at: string
          processed_at: string | null
          error: string | null
        }
        Insert: {
          id?: string
          integration_id: string
          event_key: string
          event_type: string
          payload?: Json
          received_at?: string
          processed_at?: string | null
          error?: string | null
        }
        Update: {
          id?: string
          integration_id?: string
          event_key?: string
          event_type?: string
          payload?: Json
          received_at?: string
          processed_at?: string | null
          error?: string | null
        }
      }
      orders: {
        Row: {
          id: string
          tenant_id: string
          restaurant_id: string
          integration_id: string | null
          source: 'qrmenulist' | 'trendyol_food' | 'yemeksepeti' | 'getir_food' | 'migros_food'
          external_order_id: string | null
          external_order_number: string | null
          platform_status: string | null
          order_number: string
          status: 'new' | 'accepted' | 'preparing' | 'ready' | 'completed' | 'cancelled'
          customer_name: string | null
          customer_phone: string | null
          delivery_type: 'delivery' | 'pickup' | 'dine_in'
          delivery_address: string | null
          payment_type: string | null
          subtotal: number
          discount: number
          delivery_fee: number
          total: number
          currency: string
          customer_note: string | null
          cancel_reason: string | null
          raw_payload: Json | null
          stock_deducted_at: string | null
          stock_restored_at: string | null
          created_at: string
          updated_at: string
          accepted_at: string | null
          preparing_at: string | null
          ready_at: string | null
          completed_at: string | null
          cancelled_at: string | null
        }
        Insert: {
          id?: string
          tenant_id?: string
          restaurant_id: string
          integration_id?: string | null
          source: 'qrmenulist' | 'trendyol_food' | 'yemeksepeti' | 'getir_food' | 'migros_food'
          external_order_id?: string | null
          external_order_number?: string | null
          platform_status?: string | null
          order_number: string
          status?: 'new' | 'accepted' | 'preparing' | 'ready' | 'completed' | 'cancelled'
          customer_name?: string | null
          customer_phone?: string | null
          delivery_type?: 'delivery' | 'pickup' | 'dine_in'
          delivery_address?: string | null
          payment_type?: string | null
          subtotal?: number
          discount?: number
          delivery_fee?: number
          total?: number
          currency?: string
          customer_note?: string | null
          cancel_reason?: string | null
          raw_payload?: Json | null
          stock_deducted_at?: string | null
          stock_restored_at?: string | null
          created_at?: string
          updated_at?: string
          accepted_at?: string | null
          preparing_at?: string | null
          ready_at?: string | null
          completed_at?: string | null
          cancelled_at?: string | null
        }
        Update: {
          status?: 'new' | 'accepted' | 'preparing' | 'ready' | 'completed' | 'cancelled'
          platform_status?: string | null
          cancel_reason?: string | null
          stock_deducted_at?: string | null
          stock_restored_at?: string | null
          accepted_at?: string | null
          preparing_at?: string | null
          ready_at?: string | null
          completed_at?: string | null
          cancelled_at?: string | null
          updated_at?: string
        }
      }
      order_items: {
        Row: {
          id: string
          order_id: string
          local_product_id: string | null
          external_product_id: string | null
          name: string
          quantity: number
          unit_price: number
          total_price: number
          options: Json
          note: string | null
          created_at: string
        }
        Insert: {
          id?: string
          order_id: string
          local_product_id?: string | null
          external_product_id?: string | null
          name: string
          quantity: number
          unit_price: number
          total_price: number
          options?: Json
          note?: string | null
          created_at?: string
        }
        Update: {
          name?: string
          quantity?: number
          unit_price?: number
          total_price?: number
          options?: Json
          note?: string | null
        }
      }
      external_products: {
        Row: {
          id: string
          tenant_id: string
          restaurant_id: string
          integration_id: string
          platform: 'trendyol_food' | 'yemeksepeti' | 'getir_food' | 'migros_food'
          external_product_id: string
          external_sku: string | null
          name: string
          description: string | null
          price: number | null
          quantity: number | null
          available: boolean
          category: string | null
          image_url: string | null
          raw_payload: Json | null
          source: 'sync' | 'manual'
          last_synced_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          tenant_id?: string
          restaurant_id?: string
          integration_id: string
          platform?: 'trendyol_food' | 'yemeksepeti' | 'getir_food' | 'migros_food'
          external_product_id: string
          external_sku?: string | null
          name: string
          description?: string | null
          price?: number | null
          quantity?: number | null
          available?: boolean
          category?: string | null
          image_url?: string | null
          raw_payload?: Json | null
          source?: 'sync' | 'manual'
          last_synced_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          external_sku?: string | null
          name?: string
          description?: string | null
          price?: number | null
          quantity?: number | null
          available?: boolean
          category?: string | null
          image_url?: string | null
          raw_payload?: Json | null
          source?: 'sync' | 'manual'
          last_synced_at?: string | null
          updated_at?: string
        }
      }
      product_channel_links: {
        Row: {
          id: string
          tenant_id: string
          restaurant_id: string
          local_product_id: string
          integration_id: string
          external_product_row_id: string
          external_product_id: string
          use_master_price: boolean
          price_override: number | null
          last_availability_sync_at: string | null
          last_availability_sync_ok: boolean | null
          last_sync_error: string | null
          synced_price: number | null
          last_price_sync_at: string | null
          last_price_sync_ok: boolean | null
          last_price_sync_error: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          tenant_id?: string
          restaurant_id?: string
          local_product_id: string
          integration_id: string
          external_product_row_id: string
          external_product_id?: string
          use_master_price?: boolean
          price_override?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          use_master_price?: boolean
          price_override?: number | null
          last_availability_sync_at?: string | null
          last_availability_sync_ok?: boolean | null
          last_sync_error?: string | null
          synced_price?: number | null
          last_price_sync_at?: string | null
          last_price_sync_ok?: boolean | null
          last_price_sync_error?: string | null
          updated_at?: string
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
      apply_inventory_transaction: {
        Args: { p_product_id: string; p_type: string; p_delta: number; p_source?: string; p_idempotency_key?: string | null; p_order_id?: string | null; p_note?: string | null; p_absolute?: number | null }
        Returns: Json
      }
      set_product_availability: {
        Args: { p_product_id: string; p_available: boolean }
        Returns: Json
      }
      deduct_order_stock: {
        Args: { p_order_id: string }
        Returns: Json
      }
      restore_order_stock: {
        Args: { p_order_id: string }
        Returns: Json
      }
      create_public_order: {
        Args: {
          p_restaurant_id: string
          p_items: Json
          p_payment_type: string
          p_delivery_address: string
          p_customer_note?: string | null
          p_customer_name?: string | null
          p_customer_phone?: string | null
        }
        Returns: Json
      }
      restaurant_role: {
        Args: { r_id: string }
        Returns: string | null
      }
      has_restaurant_access: {
        Args: { r_id: string }
        Returns: boolean
      }
      has_restaurant_role: {
        Args: { r_id: string; roles: string[] }
        Returns: boolean
      }
      user_tenant_role: {
        Args: { t_id: string }
        Returns: string | null
      }
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