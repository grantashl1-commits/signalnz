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
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      ai_credits: {
        Row: {
          credits_remaining: number | null
          id: string
          last_topup_at: string | null
          tier: string | null
          updated_at: string | null
          user_identifier: string
        }
        Insert: {
          credits_remaining?: number | null
          id?: string
          last_topup_at?: string | null
          tier?: string | null
          updated_at?: string | null
          user_identifier: string
        }
        Update: {
          credits_remaining?: number | null
          id?: string
          last_topup_at?: string | null
          tier?: string | null
          updated_at?: string | null
          user_identifier?: string
        }
        Relationships: []
      }
      ai_usage: {
        Row: {
          created_at: string | null
          function_name: string
          id: string
          tokens_used: number | null
          user_identifier: string
        }
        Insert: {
          created_at?: string | null
          function_name: string
          id?: string
          tokens_used?: number | null
          user_identifier: string
        }
        Update: {
          created_at?: string | null
          function_name?: string
          id?: string
          tokens_used?: number | null
          user_identifier?: string
        }
        Relationships: []
      }
      feedback: {
        Row: {
          admin_notes: string | null
          category: string
          created_at: string
          description: string
          id: string
          screenshot_url: string | null
          status: string
          subject: string
          updated_at: string
          user_email: string | null
          user_id: string | null
        }
        Insert: {
          admin_notes?: string | null
          category?: string
          created_at?: string
          description: string
          id?: string
          screenshot_url?: string | null
          status?: string
          subject: string
          updated_at?: string
          user_email?: string | null
          user_id?: string | null
        }
        Update: {
          admin_notes?: string | null
          category?: string
          created_at?: string
          description?: string
          id?: string
          screenshot_url?: string | null
          status?: string
          subject?: string
          updated_at?: string
          user_email?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          display_name: string | null
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          display_name?: string | null
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          display_name?: string | null
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      signal_memory: {
        Row: {
          created_at: string | null
          emotional_context: string | null
          headline: string | null
          id: string
          mode: string | null
          prompt: string | null
          signal_text: string
          theme: string | null
          user_identifier: string
        }
        Insert: {
          created_at?: string | null
          emotional_context?: string | null
          headline?: string | null
          id?: string
          mode?: string | null
          prompt?: string | null
          signal_text: string
          theme?: string | null
          user_identifier: string
        }
        Update: {
          created_at?: string | null
          emotional_context?: string | null
          headline?: string | null
          id?: string
          mode?: string | null
          prompt?: string | null
          signal_text?: string
          theme?: string | null
          user_identifier?: string
        }
        Relationships: []
      }
      user_insight_profiles: {
        Row: {
          common_stressors: Json | null
          emotional_patterns: Json | null
          entry_count: number | null
          growth_interests: Json | null
          id: string
          preferred_guidance_tone: string | null
          recommended_resources: Json | null
          recurring_topics: Json | null
          updated_at: string | null
          user_identifier: string
        }
        Insert: {
          common_stressors?: Json | null
          emotional_patterns?: Json | null
          entry_count?: number | null
          growth_interests?: Json | null
          id?: string
          preferred_guidance_tone?: string | null
          recommended_resources?: Json | null
          recurring_topics?: Json | null
          updated_at?: string | null
          user_identifier: string
        }
        Update: {
          common_stressors?: Json | null
          emotional_patterns?: Json | null
          entry_count?: number | null
          growth_interests?: Json | null
          id?: string
          preferred_guidance_tone?: string | null
          recommended_resources?: Json | null
          recurring_topics?: Json | null
          updated_at?: string | null
          user_identifier?: string
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
