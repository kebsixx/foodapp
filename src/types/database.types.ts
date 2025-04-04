export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
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
        }
        Insert: {
          created_at?: string
          id?: number
          order: number
          product: number
          quantity: number
        }
        Update: {
          created_at?: string
          id?: number
          order?: number
          product?: number
          quantity?: number
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
          heroImage: string
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
          heroImage: string
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
          heroImage?: string
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
          avatar_url: string
          create_at: string | null
          email: string
          expo_notification_token: string | null
          gender: boolean | null
          id: string
          name: string | null
          phone: string | null
          type: string | null
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          avatar_url: string
          create_at?: string | null
          email: string
          expo_notification_token?: string | null
          gender?: boolean | null
          id: string
          name?: string | null
          phone?: string | null
          type?: string | null
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          avatar_url?: string
          create_at?: string | null
          email?: string
          expo_notification_token?: string | null
          gender?: boolean | null
          id?: string
          name?: string | null
          phone?: string | null
          type?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      decrement_product_quantity: {
        Args: {
          product_id: number
          quantity: number
        }
        Returns: undefined
      }
      is_store_open: {
        Args: Record<PropertyKey, never>
        Returns: boolean
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

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
