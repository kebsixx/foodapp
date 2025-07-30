export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      category: {
        Row: {
          created_at: string
          id: number
          imageUrl: string
          name: string
          products: number[] | null
          slug: string
        }
        Insert: {
          created_at?: string
          id?: number
          imageUrl: string
          name: string
          products?: number[] | null
          slug: string
        }
        Update: {
          created_at?: string
          id?: number
          imageUrl?: string
          name?: string
          products?: number[] | null
          slug?: string
        }
        Relationships: []
      }
      feedbacks: {
        Row: {
          created_at: string
          feedback: string
          id: string
          name: string | null
          status: string | null
          user_email: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          feedback: string
          id?: string
          name?: string | null
          status?: string | null
          user_email?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          feedback?: string
          id?: string
          name?: string | null
          status?: string | null
          user_email?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      order: {
        Row: {
          created_at: string
          description: string | null
          id: number
          payment_proof: string | null
          pickup_method: string | null
          slug: string
          status: string
          totalPrice: number
          user: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: number
          payment_proof?: string | null
          pickup_method?: string | null
          slug: string
          status: string
          totalPrice: number
          user: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: number
          payment_proof?: string | null
          pickup_method?: string | null
          slug?: string
          status?: string
          totalPrice?: number
          user?: string
        }
        Relationships: [
          {
            foreignKeyName: "order_user_fkey"
            columns: ["user"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      order_item: {
        Row: {
          created_at: string
          id: number
          order: number
          product: number
          quantity: number
          variant_id: string | null
        }
        Insert: {
          created_at?: string
          id?: number
          order: number
          product: number
          quantity: number
          variant_id?: string | null
        }
        Update: {
          created_at?: string
          id?: number
          order?: number
          product?: number
          quantity?: number
          variant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "order_item_order_fkey"
            columns: ["order"]
            isOneToOne: false
            referencedRelation: "order"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_item_product_fkey"
            columns: ["product"]
            isOneToOne: false
            referencedRelation: "product"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          created_at: string
          id: number
          order_id: number | null
          payment_token: string | null
          status: string
        }
        Insert: {
          amount: number
          created_at?: string
          id?: number
          order_id?: number | null
          payment_token?: string | null
          status: string
        }
        Update: {
          amount?: number
          created_at?: string
          id?: number
          order_id?: number | null
          payment_token?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "order"
            referencedColumns: ["id"]
          },
        ]
      }
      product: {
        Row: {
          category: number
          created_at: string
          heroImage: string | null
          heroimageurls: Json | null
          id: number
          maxQuantity: number
          price: number | null
          slug: string
          title: string
          variants: Json | null
        }
        Insert: {
          category: number
          created_at?: string
          heroImage?: string | null
          heroimageurls?: Json | null
          id?: number
          maxQuantity: number
          price?: number | null
          slug: string
          title: string
          variants?: Json | null
        }
        Update: {
          category?: number
          created_at?: string
          heroImage?: string | null
          heroimageurls?: Json | null
          id?: number
          maxQuantity?: number
          price?: number | null
          slug?: string
          title?: string
          variants?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "product_category_fkey"
            columns: ["category"]
            isOneToOne: false
            referencedRelation: "category"
            referencedColumns: ["id"]
          },
        ]
      }
      store_settings: {
        Row: {
          close_time: string
          created_at: string | null
          id: string
          is_open: boolean | null
          manual_override: boolean | null
          open_time: string
          updated_at: string | null
        }
        Insert: {
          close_time: string
          created_at?: string | null
          id?: string
          is_open?: boolean | null
          manual_override?: boolean | null
          open_time: string
          updated_at?: string | null
        }
        Update: {
          close_time?: string
          created_at?: string | null
          id?: string
          is_open?: boolean | null
          manual_override?: boolean | null
          open_time?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      users: {
        Row: {
          address: string | null
          create_at: string | null
          email: string
          expo_notification_token: string | null
          gender: boolean | null
          id: string
          name: string | null
          phone: string | null
          type: string | null
          updated_at: string | null
          username: string | null
        }
        Insert: {
          address?: string | null
          create_at?: string | null
          email: string
          expo_notification_token?: string | null
          gender?: boolean | null
          id: string
          name?: string | null
          phone?: string | null
          type?: string | null
          updated_at?: string | null
          username?: string | null
        }
        Update: {
          address?: string | null
          create_at?: string | null
          email?: string
          expo_notification_token?: string | null
          gender?: boolean | null
          id?: string
          name?: string | null
          phone?: string | null
          type?: string | null
          updated_at?: string | null
          username?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      auth_with_username_or_email: {
        Args: { p_login: string; p_password: string }
        Returns: Json
      }
      decrement_product_quantity: {
        Args: { product_id: number; quantity: number }
        Returns: undefined
      }
      is_store_open: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      login_with_username_or_email: {
        Args: { p_identifier: string; p_password: string }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
