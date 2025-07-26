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
      ai_conversations: {
        Row: {
          created_at: string
          id: string
          messages: Json
          title: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          messages?: Json
          title?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          messages?: Json
          title?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      bible_books: {
        Row: {
          book_number: number
          chapters: number
          created_at: string
          id: string
          name: string
          testament: string
        }
        Insert: {
          book_number: number
          chapters: number
          created_at?: string
          id?: string
          name: string
          testament: string
        }
        Update: {
          book_number?: number
          chapters?: number
          created_at?: string
          id?: string
          name?: string
          testament?: string
        }
        Relationships: []
      }
      bible_verses: {
        Row: {
          book_id: string
          chapter: number
          created_at: string
          id: string
          text_esv: string | null
          text_kjv: string | null
          text_nasb: string | null
          text_niv: string | null
          verse: number
        }
        Insert: {
          book_id: string
          chapter: number
          created_at?: string
          id?: string
          text_esv?: string | null
          text_kjv?: string | null
          text_nasb?: string | null
          text_niv?: string | null
          verse: number
        }
        Update: {
          book_id?: string
          chapter?: number
          created_at?: string
          id?: string
          text_esv?: string | null
          text_kjv?: string | null
          text_nasb?: string | null
          text_niv?: string | null
          verse?: number
        }
        Relationships: [
          {
            foreignKeyName: "bible_verses_book_id_fkey"
            columns: ["book_id"]
            isOneToOne: false
            referencedRelation: "bible_books"
            referencedColumns: ["id"]
          },
        ]
      }
      bookmarks: {
        Row: {
          color: string | null
          created_at: string
          id: string
          notes: string | null
          tags: string[] | null
          updated_at: string
          user_id: string
          verse_id: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          tags?: string[] | null
          updated_at?: string
          user_id: string
          verse_id: string
        }
        Update: {
          color?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          tags?: string[] | null
          updated_at?: string
          user_id?: string
          verse_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bookmarks_verse_id_fkey"
            columns: ["verse_id"]
            isOneToOne: false
            referencedRelation: "bible_verses"
            referencedColumns: ["id"]
          },
        ]
      }
      journal_entries: {
        Row: {
          content: string
          created_at: string
          id: string
          mood: string | null
          spiritual_state: string | null
          title: string | null
          updated_at: string
          user_id: string
          verse_references: string[] | null
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          mood?: string | null
          spiritual_state?: string | null
          title?: string | null
          updated_at?: string
          user_id: string
          verse_references?: string[] | null
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          mood?: string | null
          spiritual_state?: string | null
          title?: string | null
          updated_at?: string
          user_id?: string
          verse_references?: string[] | null
        }
        Relationships: []
      }
      prayer_requests: {
        Row: {
          answered_at: string | null
          created_at: string
          description: string | null
          id: string
          is_private: boolean | null
          status: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          answered_at?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_private?: boolean | null
          status?: string | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          answered_at?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_private?: boolean | null
          status?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string
          display_name: string | null
          favorite_translation: string | null
          id: string
          reading_streak: number | null
          total_reading_days: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          display_name?: string | null
          favorite_translation?: string | null
          id?: string
          reading_streak?: number | null
          total_reading_days?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          display_name?: string | null
          favorite_translation?: string | null
          id?: string
          reading_streak?: number | null
          total_reading_days?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      reading_plans: {
        Row: {
          created_at: string
          description: string | null
          duration_days: number
          id: string
          is_active: boolean | null
          name: string
          plan_data: Json
        }
        Insert: {
          created_at?: string
          description?: string | null
          duration_days: number
          id?: string
          is_active?: boolean | null
          name: string
          plan_data: Json
        }
        Update: {
          created_at?: string
          description?: string | null
          duration_days?: number
          id?: string
          is_active?: boolean | null
          name?: string
          plan_data?: Json
        }
        Relationships: []
      }
      reading_progress: {
        Row: {
          completed_at: string | null
          completed_days: number[] | null
          current_day: number | null
          id: string
          last_read_at: string | null
          plan_id: string
          started_at: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          completed_days?: number[] | null
          current_day?: number | null
          id?: string
          last_read_at?: string | null
          plan_id: string
          started_at?: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          completed_days?: number[] | null
          current_day?: number | null
          id?: string
          last_read_at?: string | null
          plan_id?: string
          started_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reading_progress_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "reading_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      sermons: {
        Row: {
          content: string | null
          created_at: string
          id: string
          outline: Json | null
          scripture_references: string[] | null
          status: string | null
          tags: string[] | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          content?: string | null
          created_at?: string
          id?: string
          outline?: Json | null
          scripture_references?: string[] | null
          status?: string | null
          tags?: string[] | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string | null
          created_at?: string
          id?: string
          outline?: Json | null
          scripture_references?: string[] | null
          status?: string | null
          tags?: string[] | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      verse_analyses: {
        Row: {
          analysis_content: Json
          analysis_type: string
          created_at: string
          id: string
          updated_at: string
          user_id: string
          verse_id: string
        }
        Insert: {
          analysis_content: Json
          analysis_type: string
          created_at?: string
          id?: string
          updated_at?: string
          user_id: string
          verse_id: string
        }
        Update: {
          analysis_content?: Json
          analysis_type?: string
          created_at?: string
          id?: string
          updated_at?: string
          user_id?: string
          verse_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "verse_analyses_verse_id_fkey"
            columns: ["verse_id"]
            isOneToOne: false
            referencedRelation: "bible_verses"
            referencedColumns: ["id"]
          },
        ]
      }
      verse_highlights: {
        Row: {
          category: string
          color: string
          created_at: string
          id: string
          is_favorite: boolean
          updated_at: string
          user_id: string
          verse_id: string
        }
        Insert: {
          category?: string
          color?: string
          created_at?: string
          id?: string
          is_favorite?: boolean
          updated_at?: string
          user_id: string
          verse_id: string
        }
        Update: {
          category?: string
          color?: string
          created_at?: string
          id?: string
          is_favorite?: boolean
          updated_at?: string
          user_id?: string
          verse_id?: string
        }
        Relationships: []
      }
      daily_verses: {
        Row: {
          ai_context: string
          created_at: string
          daily_theme: string
          id: string
          user_id: string
          verse_date: string
          verse_reference: string
          verse_text: string
        }
        Insert: {
          ai_context: string
          created_at?: string
          daily_theme: string
          id?: string
          user_id: string
          verse_date: string
          verse_reference: string
          verse_text: string
        }
        Update: {
          ai_context?: string
          created_at?: string
          daily_theme?: string
          id?: string
          user_id?: string
          verse_date?: string
          verse_reference?: string
          verse_text?: string
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
