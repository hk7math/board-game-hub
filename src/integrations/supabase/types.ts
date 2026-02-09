export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      board_games: {
        Row: {
          bgg_id: number | null
          categories: string[] | null
          created_at: string
          description: string | null
          id: string
          image: string | null
          max_players: number | null
          mechanics: string[] | null
          min_age: number | null
          min_players: number | null
          name: string
          playing_time: number | null
          rating: number | null
          thumbnail: string | null
          weight: number | null
          year_published: number | null
        }
        Insert: {
          bgg_id?: number | null
          categories?: string[] | null
          created_at?: string
          description?: string | null
          id?: string
          image?: string | null
          max_players?: number | null
          mechanics?: string[] | null
          min_age?: number | null
          min_players?: number | null
          name: string
          playing_time?: number | null
          rating?: number | null
          thumbnail?: string | null
          weight?: number | null
          year_published?: number | null
        }
        Update: {
          bgg_id?: number | null
          categories?: string[] | null
          created_at?: string
          description?: string | null
          id?: string
          image?: string | null
          max_players?: number | null
          mechanics?: string[] | null
          min_age?: number | null
          min_players?: number | null
          name?: string
          playing_time?: number | null
          rating?: number | null
          thumbnail?: string | null
          weight?: number | null
          year_published?: number | null
        }
        Relationships: []
      }
      game_listings: {
        Row: {
          condition: string
          created_at: string
          description: string | null
          game_id: string
          id: string
          location: string | null
          price: number
          seller_id: string
          status: string
          updated_at: string
        }
        Insert: {
          condition: string
          created_at?: string
          description?: string | null
          game_id: string
          id?: string
          location?: string | null
          price: number
          seller_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          condition?: string
          created_at?: string
          description?: string | null
          game_id?: string
          id?: string
          location?: string | null
          price?: number
          seller_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "game_listings_game_id_fkey"
            columns: ["game_id"]
            isOneToOne: false
            referencedRelation: "board_games"
            referencedColumns: ["id"]
          },
        ]
      }
      game_records: {
        Row: {
          created_at: string
          duration: number | null
          game_id: string
          id: string
          notes: string | null
          played_at: string
          players: string[] | null
          scores: Json | null
          user_id: string
          winner: string | null
        }
        Insert: {
          created_at?: string
          duration?: number | null
          game_id: string
          id?: string
          notes?: string | null
          played_at?: string
          players?: string[] | null
          scores?: Json | null
          user_id: string
          winner?: string | null
        }
        Update: {
          created_at?: string
          duration?: number | null
          game_id?: string
          id?: string
          notes?: string | null
          played_at?: string
          players?: string[] | null
          scores?: Json | null
          user_id?: string
          winner?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "game_records_game_id_fkey"
            columns: ["game_id"]
            isOneToOne: false
            referencedRelation: "board_games"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          id: string
          updated_at: string
          user_id: string
          username: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          id?: string
          updated_at?: string
          user_id: string
          username?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          id?: string
          updated_at?: string
          user_id?: string
          username?: string | null
        }
        Relationships: []
      }
      user_collections: {
        Row: {
          added_at: string
          game_id: string
          id: string
          notes: string | null
          plays: number | null
          status: string
          user_id: string
        }
        Insert: {
          added_at?: string
          game_id: string
          id?: string
          notes?: string | null
          plays?: number | null
          status: string
          user_id: string
        }
        Update: {
          added_at?: string
          game_id?: string
          id?: string
          notes?: string | null
          plays?: number | null
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_collections_game_id_fkey"
            columns: ["game_id"]
            isOneToOne: false
            referencedRelation: "board_games"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
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
