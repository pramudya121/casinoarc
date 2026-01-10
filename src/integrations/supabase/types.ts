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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      audit_logs: {
        Row: {
          action: string
          id: string
          metadata: Json | null
          timestamp: string | null
          user_id: string | null
          wallet_address: string | null
        }
        Insert: {
          action: string
          id?: string
          metadata?: Json | null
          timestamp?: string | null
          user_id?: string | null
          wallet_address?: string | null
        }
        Update: {
          action?: string
          id?: string
          metadata?: Json | null
          timestamp?: string | null
          user_id?: string | null
          wallet_address?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      game_history: {
        Row: {
          bet_amount: number
          created_at: string | null
          game_name: string
          id: string
          result: boolean
          tx_hash: string | null
          user_id: string | null
          wallet_address: string
          win_amount: number | null
        }
        Insert: {
          bet_amount: number
          created_at?: string | null
          game_name: string
          id?: string
          result: boolean
          tx_hash?: string | null
          user_id?: string | null
          wallet_address: string
          win_amount?: number | null
        }
        Update: {
          bet_amount?: number
          created_at?: string | null
          game_name?: string
          id?: string
          result?: boolean
          tx_hash?: string | null
          user_id?: string | null
          wallet_address?: string
          win_amount?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "game_history_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      game_settings: {
        Row: {
          enabled: boolean | null
          game_name: string
          house_edge: number
          id: string
          max_bet: number
          min_bet: number
          rtp: number
          updated_at: string | null
        }
        Insert: {
          enabled?: boolean | null
          game_name: string
          house_edge?: number
          id?: string
          max_bet?: number
          min_bet?: number
          rtp?: number
          updated_at?: string | null
        }
        Update: {
          enabled?: boolean | null
          game_name?: string
          house_edge?: number
          id?: string
          max_bet?: number
          min_bet?: number
          rtp?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      game_state: {
        Row: {
          game_name: string
          id: string
          state: Json | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          game_name: string
          id?: string
          state?: Json | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          game_name?: string
          id?: string
          state?: Json | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "game_state_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      leaderboard_casino: {
        Row: {
          biggest_win: number | null
          id: string
          last_updated: string | null
          total_wagered: number | null
          total_wins: number | null
          username: string | null
          wallet_address: string
        }
        Insert: {
          biggest_win?: number | null
          id?: string
          last_updated?: string | null
          total_wagered?: number | null
          total_wins?: number | null
          username?: string | null
          wallet_address: string
        }
        Update: {
          biggest_win?: number | null
          id?: string
          last_updated?: string | null
          total_wagered?: number | null
          total_wins?: number | null
          username?: string | null
          wallet_address?: string
        }
        Relationships: []
      }
      leaderboard_trader: {
        Row: {
          games_played: number | null
          id: string
          last_updated: string | null
          total_profit: number | null
          username: string | null
          wallet_address: string
          win_rate: number | null
        }
        Insert: {
          games_played?: number | null
          id?: string
          last_updated?: string | null
          total_profit?: number | null
          username?: string | null
          wallet_address: string
          win_rate?: number | null
        }
        Update: {
          games_played?: number | null
          id?: string
          last_updated?: string | null
          total_profit?: number | null
          username?: string | null
          wallet_address?: string
          win_rate?: number | null
        }
        Relationships: []
      }
      referral_codes: {
        Row: {
          commission_rate: number
          created_at: string
          id: string
          referral_code: string
          total_commission: number
          total_referrals: number
          wallet_address: string
        }
        Insert: {
          commission_rate?: number
          created_at?: string
          id?: string
          referral_code: string
          total_commission?: number
          total_referrals?: number
          wallet_address: string
        }
        Update: {
          commission_rate?: number
          created_at?: string
          id?: string
          referral_code?: string
          total_commission?: number
          total_referrals?: number
          wallet_address?: string
        }
        Relationships: []
      }
      referrals: {
        Row: {
          commission_claimed: number
          commission_earned: number
          created_at: string
          games_by_referred: number
          id: string
          referral_code: string
          referred_address: string
          referrer_address: string
          updated_at: string
        }
        Insert: {
          commission_claimed?: number
          commission_earned?: number
          created_at?: string
          games_by_referred?: number
          id?: string
          referral_code: string
          referred_address: string
          referrer_address: string
          updated_at?: string
        }
        Update: {
          commission_claimed?: number
          commission_earned?: number
          created_at?: string
          games_by_referred?: number
          id?: string
          referral_code?: string
          referred_address?: string
          referrer_address?: string
          updated_at?: string
        }
        Relationships: []
      }
      tournament_entries: {
        Row: {
          best_multiplier: number | null
          games_played: number | null
          id: string
          joined_at: string | null
          total_score: number | null
          total_wagered: number | null
          total_won: number | null
          tournament_id: string
          username: string | null
          wallet_address: string
        }
        Insert: {
          best_multiplier?: number | null
          games_played?: number | null
          id?: string
          joined_at?: string | null
          total_score?: number | null
          total_wagered?: number | null
          total_won?: number | null
          tournament_id: string
          username?: string | null
          wallet_address: string
        }
        Update: {
          best_multiplier?: number | null
          games_played?: number | null
          id?: string
          joined_at?: string | null
          total_score?: number | null
          total_wagered?: number | null
          total_won?: number | null
          tournament_id?: string
          username?: string | null
          wallet_address?: string
        }
        Relationships: [
          {
            foreignKeyName: "tournament_entries_tournament_id_fkey"
            columns: ["tournament_id"]
            isOneToOne: false
            referencedRelation: "tournaments"
            referencedColumns: ["id"]
          },
        ]
      }
      tournament_results: {
        Row: {
          created_at: string | null
          final_score: number
          id: string
          prize_amount: number
          rank: number
          tournament_id: string
          username: string | null
          wallet_address: string
        }
        Insert: {
          created_at?: string | null
          final_score: number
          id?: string
          prize_amount: number
          rank: number
          tournament_id: string
          username?: string | null
          wallet_address: string
        }
        Update: {
          created_at?: string | null
          final_score?: number
          id?: string
          prize_amount?: number
          rank?: number
          tournament_id?: string
          username?: string | null
          wallet_address?: string
        }
        Relationships: [
          {
            foreignKeyName: "tournament_results_tournament_id_fkey"
            columns: ["tournament_id"]
            isOneToOne: false
            referencedRelation: "tournaments"
            referencedColumns: ["id"]
          },
        ]
      }
      tournaments: {
        Row: {
          created_at: string | null
          description: string | null
          end_time: string
          entry_fee: number
          game_type: string
          id: string
          max_participants: number | null
          name: string
          prize_pool: number
          start_time: string
          status: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          end_time: string
          entry_fee?: number
          game_type: string
          id?: string
          max_participants?: number | null
          name: string
          prize_pool?: number
          start_time: string
          status?: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          end_time?: string
          entry_fee?: number
          game_type?: string
          id?: string
          max_participants?: number | null
          name?: string
          prize_pool?: number
          start_time?: string
          status?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      user_vip: {
        Row: {
          cashback_claimed: number
          cashback_earned: number
          created_at: string
          current_level: number
          id: string
          total_wagered: number
          updated_at: string
          wallet_address: string
        }
        Insert: {
          cashback_claimed?: number
          cashback_earned?: number
          created_at?: string
          current_level?: number
          id?: string
          total_wagered?: number
          updated_at?: string
          wallet_address: string
        }
        Update: {
          cashback_claimed?: number
          cashback_earned?: number
          created_at?: string
          current_level?: number
          id?: string
          total_wagered?: number
          updated_at?: string
          wallet_address?: string
        }
        Relationships: []
      }
      users: {
        Row: {
          created_at: string | null
          id: string
          username: string | null
          wallet_address: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          username?: string | null
          wallet_address: string
        }
        Update: {
          created_at?: string | null
          id?: string
          username?: string | null
          wallet_address?: string
        }
        Relationships: []
      }
      vip_levels: {
        Row: {
          bonus_multiplier: number
          cashback_rate: number
          color: string | null
          created_at: string
          icon: string | null
          id: string
          level: number
          min_wagered: number
          name: string
        }
        Insert: {
          bonus_multiplier?: number
          cashback_rate?: number
          color?: string | null
          created_at?: string
          icon?: string | null
          id?: string
          level: number
          min_wagered?: number
          name: string
        }
        Update: {
          bonus_multiplier?: number
          cashback_rate?: number
          color?: string | null
          created_at?: string
          icon?: string | null
          id?: string
          level?: number
          min_wagered?: number
          name?: string
        }
        Relationships: []
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
