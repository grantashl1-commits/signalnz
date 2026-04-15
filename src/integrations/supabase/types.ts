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
      attachment_quiz_results: {
        Row: {
          answers: Json
          attachment_style: string | null
          created_at: string
          id: string
          self_esteem_score: number | null
          style_scores: Json | null
          updated_at: string
          user_id: string
        }
        Insert: {
          answers?: Json
          attachment_style?: string | null
          created_at?: string
          id?: string
          self_esteem_score?: number | null
          style_scores?: Json | null
          updated_at?: string
          user_id: string
        }
        Update: {
          answers?: Json
          attachment_style?: string | null
          created_at?: string
          id?: string
          self_esteem_score?: number | null
          style_scores?: Json | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      body_measurements: {
        Row: {
          arms: string | null
          body_fat: string | null
          chest: string | null
          height: string | null
          hips: string | null
          id: string
          recorded_at: string
          thighs: string | null
          user_id: string
          waist: string | null
          weight: string | null
        }
        Insert: {
          arms?: string | null
          body_fat?: string | null
          chest?: string | null
          height?: string | null
          hips?: string | null
          id?: string
          recorded_at?: string
          thighs?: string | null
          user_id: string
          waist?: string | null
          weight?: string | null
        }
        Update: {
          arms?: string | null
          body_fat?: string | null
          chest?: string | null
          height?: string | null
          hips?: string | null
          id?: string
          recorded_at?: string
          thighs?: string | null
          user_id?: string
          waist?: string | null
          weight?: string | null
        }
        Relationships: []
      }
      challenge_participants: {
        Row: {
          challenge_id: string
          completed_at: string | null
          joined_at: string | null
          user_id: string
        }
        Insert: {
          challenge_id: string
          completed_at?: string | null
          joined_at?: string | null
          user_id: string
        }
        Update: {
          challenge_id?: string
          completed_at?: string | null
          joined_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "challenge_participants_challenge_id_fkey"
            columns: ["challenge_id"]
            isOneToOne: false
            referencedRelation: "community_challenges"
            referencedColumns: ["id"]
          },
        ]
      }
      community_challenges: {
        Row: {
          created_at: string | null
          description: string | null
          ends_at: string | null
          id: string
          is_admin_created: boolean | null
          participant_count: number | null
          starts_at: string | null
          title: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          ends_at?: string | null
          id?: string
          is_admin_created?: boolean | null
          participant_count?: number | null
          starts_at?: string | null
          title: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          ends_at?: string | null
          id?: string
          is_admin_created?: boolean | null
          participant_count?: number | null
          starts_at?: string | null
          title?: string
        }
        Relationships: []
      }
      community_comments: {
        Row: {
          content: string
          created_at: string | null
          heart_count: number | null
          id: string
          is_helpful: boolean | null
          is_removed: boolean | null
          post_id: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string | null
          heart_count?: number | null
          id?: string
          is_helpful?: boolean | null
          is_removed?: boolean | null
          post_id: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string | null
          heart_count?: number | null
          id?: string
          is_helpful?: boolean | null
          is_removed?: boolean | null
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "community_comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "community_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      community_groups: {
        Row: {
          challenges: Json | null
          city: string | null
          country: string | null
          created_at: string
          created_by: string | null
          description: string | null
          group_type: string
          id: string
          members_count: number | null
          name: string
          parent_group_id: string | null
          questions: Json | null
          status: string
          suburb: string
          updated_at: string
        }
        Insert: {
          challenges?: Json | null
          city?: string | null
          country?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          group_type?: string
          id?: string
          members_count?: number | null
          name: string
          parent_group_id?: string | null
          questions?: Json | null
          status?: string
          suburb: string
          updated_at?: string
        }
        Update: {
          challenges?: Json | null
          city?: string | null
          country?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          group_type?: string
          id?: string
          members_count?: number | null
          name?: string
          parent_group_id?: string | null
          questions?: Json | null
          status?: string
          suburb?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "community_groups_parent_group_id_fkey"
            columns: ["parent_group_id"]
            isOneToOne: false
            referencedRelation: "community_groups"
            referencedColumns: ["id"]
          },
        ]
      }
      community_hearts: {
        Row: {
          created_at: string | null
          post_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          post_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "community_hearts_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "community_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      community_memberships: {
        Row: {
          group_id: string
          id: string
          joined_at: string
          user_id: string
        }
        Insert: {
          group_id: string
          id?: string
          joined_at?: string
          user_id: string
        }
        Update: {
          group_id?: string
          id?: string
          joined_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "community_memberships_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "community_groups"
            referencedColumns: ["id"]
          },
        ]
      }
      community_posts: {
        Row: {
          challenge_id: string | null
          comment_count: number | null
          content: string
          created_at: string | null
          heart_count: number | null
          id: string
          is_anonymous: boolean | null
          is_removed: boolean | null
          media_url: string | null
          phase_tag: string | null
          post_type: string | null
          resource_url: string | null
          user_id: string
        }
        Insert: {
          challenge_id?: string | null
          comment_count?: number | null
          content: string
          created_at?: string | null
          heart_count?: number | null
          id?: string
          is_anonymous?: boolean | null
          is_removed?: boolean | null
          media_url?: string | null
          phase_tag?: string | null
          post_type?: string | null
          resource_url?: string | null
          user_id: string
        }
        Update: {
          challenge_id?: string | null
          comment_count?: number | null
          content?: string
          created_at?: string | null
          heart_count?: number | null
          id?: string
          is_anonymous?: boolean | null
          is_removed?: boolean | null
          media_url?: string | null
          phase_tag?: string | null
          post_type?: string | null
          resource_url?: string | null
          user_id?: string
        }
        Relationships: []
      }
      community_profiles: {
        Row: {
          barter: string | null
          career: string | null
          community_vision: string | null
          created_at: string
          employer: string | null
          id: string
          looking_for: string | null
          offer: string | null
          photo_url: string | null
          skills: string | null
          updated_at: string
          user_id: string
          visibility: Json
        }
        Insert: {
          barter?: string | null
          career?: string | null
          community_vision?: string | null
          created_at?: string
          employer?: string | null
          id?: string
          looking_for?: string | null
          offer?: string | null
          photo_url?: string | null
          skills?: string | null
          updated_at?: string
          user_id: string
          visibility?: Json
        }
        Update: {
          barter?: string | null
          career?: string | null
          community_vision?: string | null
          created_at?: string
          employer?: string | null
          id?: string
          looking_for?: string | null
          offer?: string | null
          photo_url?: string | null
          skills?: string | null
          updated_at?: string
          user_id?: string
          visibility?: Json
        }
        Relationships: []
      }
      cycle_logs: {
        Row: {
          created_at: string
          cycle_day: number | null
          energy: number | null
          id: string
          log_date: string
          mood: string | null
          notes: string | null
          period_start: boolean | null
          phase: string | null
          symptom_severity: Json | null
          symptoms: string[] | null
          user_id: string
          weight: number | null
        }
        Insert: {
          created_at?: string
          cycle_day?: number | null
          energy?: number | null
          id?: string
          log_date: string
          mood?: string | null
          notes?: string | null
          period_start?: boolean | null
          phase?: string | null
          symptom_severity?: Json | null
          symptoms?: string[] | null
          user_id: string
          weight?: number | null
        }
        Update: {
          created_at?: string
          cycle_day?: number | null
          energy?: number | null
          id?: string
          log_date?: string
          mood?: string | null
          notes?: string | null
          period_start?: boolean | null
          phase?: string | null
          symptom_severity?: Json | null
          symptoms?: string[] | null
          user_id?: string
          weight?: number | null
        }
        Relationships: []
      }
      daily_stoic_readings: {
        Row: {
          author: string
          created_at: string
          day_of_month: number | null
          duration_sec: number | null
          id: string
          journal_prompt: string | null
          month: string | null
          quote: string
          reflection: string
          seq_day: number
          source: string
          tags: string[] | null
          title: string
          tts_script: string | null
        }
        Insert: {
          author?: string
          created_at?: string
          day_of_month?: number | null
          duration_sec?: number | null
          id?: string
          journal_prompt?: string | null
          month?: string | null
          quote: string
          reflection: string
          seq_day: number
          source?: string
          tags?: string[] | null
          title: string
          tts_script?: string | null
        }
        Update: {
          author?: string
          created_at?: string
          day_of_month?: number | null
          duration_sec?: number | null
          id?: string
          journal_prompt?: string | null
          month?: string | null
          quote?: string
          reflection?: string
          seq_day?: number
          source?: string
          tags?: string[] | null
          title?: string
          tts_script?: string | null
        }
        Relationships: []
      }
      dream_boards: {
        Row: {
          active_board_id: string | null
          board_data: Json
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          active_board_id?: string | null
          board_data?: Json
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          active_board_id?: string | null
          board_data?: Json
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      exercises: {
        Row: {
          body_part: string | null
          category: string | null
          cues: string[] | null
          difficulty: number | null
          equipment: string[] | null
          evidence_source: string | null
          gif_url: string | null
          id: string
          illustration_url: string | null
          instructions: string | null
          is_low_impact: boolean | null
          is_somatic: boolean | null
          name: string
          primary_muscles: string[] | null
          secondary_muscles: string[] | null
          slug: string | null
          target: string | null
        }
        Insert: {
          body_part?: string | null
          category?: string | null
          cues?: string[] | null
          difficulty?: number | null
          equipment?: string[] | null
          evidence_source?: string | null
          gif_url?: string | null
          id: string
          illustration_url?: string | null
          instructions?: string | null
          is_low_impact?: boolean | null
          is_somatic?: boolean | null
          name: string
          primary_muscles?: string[] | null
          secondary_muscles?: string[] | null
          slug?: string | null
          target?: string | null
        }
        Update: {
          body_part?: string | null
          category?: string | null
          cues?: string[] | null
          difficulty?: number | null
          equipment?: string[] | null
          evidence_source?: string | null
          gif_url?: string | null
          id?: string
          illustration_url?: string | null
          instructions?: string | null
          is_low_impact?: boolean | null
          is_somatic?: boolean | null
          name?: string
          primary_muscles?: string[] | null
          secondary_muscles?: string[] | null
          slug?: string | null
          target?: string | null
        }
        Relationships: []
      }
      feed_posts: {
        Row: {
          been_published: boolean
          book_title_author: string
          created_at: string
          id: string
          post_number: number
          post_title_description: string
          publish_date: string | null
          themes: string[]
        }
        Insert: {
          been_published?: boolean
          book_title_author: string
          created_at?: string
          id?: string
          post_number: number
          post_title_description: string
          publish_date?: string | null
          themes?: string[]
        }
        Update: {
          been_published?: boolean
          book_title_author?: string
          created_at?: string
          id?: string
          post_number?: number
          post_title_description?: string
          publish_date?: string | null
          themes?: string[]
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
      generated_plans: {
        Row: {
          generated_at: string
          id: string
          plan_content: string
          plan_type: string
          user_id: string
          week_start_date: string
        }
        Insert: {
          generated_at?: string
          id?: string
          plan_content: string
          plan_type: string
          user_id: string
          week_start_date: string
        }
        Update: {
          generated_at?: string
          id?: string
          plan_content?: string
          plan_type?: string
          user_id?: string
          week_start_date?: string
        }
        Relationships: []
      }
      goal_categories: {
        Row: {
          created_at: string
          description: string | null
          hormonal_notes: string | null
          id: string
          intensity_max: number
          intensity_min: number
          label: string
          slug: string
          sort_order: number
        }
        Insert: {
          created_at?: string
          description?: string | null
          hormonal_notes?: string | null
          id: string
          intensity_max?: number
          intensity_min?: number
          label: string
          slug: string
          sort_order?: number
        }
        Update: {
          created_at?: string
          description?: string | null
          hormonal_notes?: string | null
          id?: string
          intensity_max?: number
          intensity_min?: number
          label?: string
          slug?: string
          sort_order?: number
        }
        Relationships: []
      }
      goal_progress: {
        Row: {
          goal_id: string
          id: string
          logged_at: string
          note: string | null
          user_id: string
          value: number
        }
        Insert: {
          goal_id: string
          id?: string
          logged_at?: string
          note?: string | null
          user_id: string
          value: number
        }
        Update: {
          goal_id?: string
          id?: string
          logged_at?: string
          note?: string | null
          user_id?: string
          value?: number
        }
        Relationships: [
          {
            foreignKeyName: "goal_progress_goal_id_fkey"
            columns: ["goal_id"]
            isOneToOne: false
            referencedRelation: "user_goals"
            referencedColumns: ["id"]
          },
        ]
      }
      habit_completions: {
        Row: {
          completed_at: string
          completed_date: string
          habit_id: string
          id: string
          user_id: string
        }
        Insert: {
          completed_at?: string
          completed_date: string
          habit_id: string
          id?: string
          user_id: string
        }
        Update: {
          completed_at?: string
          completed_date?: string
          habit_id?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      habit_logs: {
        Row: {
          completed_count: number
          completion_pct: number
          created_at: string
          id: string
          log_date: string
          total_count: number
          user_id: string
        }
        Insert: {
          completed_count?: number
          completion_pct?: number
          created_at?: string
          id?: string
          log_date: string
          total_count?: number
          user_id: string
        }
        Update: {
          completed_count?: number
          completion_pct?: number
          created_at?: string
          id?: string
          log_date?: string
          total_count?: number
          user_id?: string
        }
        Relationships: []
      }
      hr_sessions: {
        Row: {
          avg_bpm: number | null
          bpm_trace: Json
          calories: number | null
          created_at: string
          cycle_day: number | null
          cycle_phase: string | null
          duration_minutes: number | null
          id: string
          max_bpm: number | null
          notes: string | null
          session_date: string
          user_id: string
          workout_name: string | null
          zone2_plus_percent: number | null
          zones_summary: Json
        }
        Insert: {
          avg_bpm?: number | null
          bpm_trace?: Json
          calories?: number | null
          created_at?: string
          cycle_day?: number | null
          cycle_phase?: string | null
          duration_minutes?: number | null
          id?: string
          max_bpm?: number | null
          notes?: string | null
          session_date?: string
          user_id: string
          workout_name?: string | null
          zone2_plus_percent?: number | null
          zones_summary?: Json
        }
        Update: {
          avg_bpm?: number | null
          bpm_trace?: Json
          calories?: number | null
          created_at?: string
          cycle_day?: number | null
          cycle_phase?: string | null
          duration_minutes?: number | null
          id?: string
          max_bpm?: number | null
          notes?: string | null
          session_date?: string
          user_id?: string
          workout_name?: string | null
          zone2_plus_percent?: number | null
          zones_summary?: Json
        }
        Relationships: []
      }
      journal_entries: {
        Row: {
          ai: Json | null
          content: string | null
          created_at: string
          cycle_day: number | null
          cycle_mode: string | null
          cycle_phase: string | null
          date: string
          emotional_tone: string | null
          entry_type: string | null
          id: string
          mood: string | null
          pinned_to_dream_studio: boolean | null
          prompts: Json
          saved_to_vault: boolean | null
          stoic_lens: Json | null
          stoic_seq_day: number | null
          stoic_title: string | null
          tags: Json
          timestamp: number
          title: string | null
          tracking: Json
          updated_at: string
          user_id: string
          vault_category: string | null
          word_count: number | null
        }
        Insert: {
          ai?: Json | null
          content?: string | null
          created_at?: string
          cycle_day?: number | null
          cycle_mode?: string | null
          cycle_phase?: string | null
          date: string
          emotional_tone?: string | null
          entry_type?: string | null
          id: string
          mood?: string | null
          pinned_to_dream_studio?: boolean | null
          prompts?: Json
          saved_to_vault?: boolean | null
          stoic_lens?: Json | null
          stoic_seq_day?: number | null
          stoic_title?: string | null
          tags?: Json
          timestamp: number
          title?: string | null
          tracking?: Json
          updated_at?: string
          user_id: string
          vault_category?: string | null
          word_count?: number | null
        }
        Update: {
          ai?: Json | null
          content?: string | null
          created_at?: string
          cycle_day?: number | null
          cycle_mode?: string | null
          cycle_phase?: string | null
          date?: string
          emotional_tone?: string | null
          entry_type?: string | null
          id?: string
          mood?: string | null
          pinned_to_dream_studio?: boolean | null
          prompts?: Json
          saved_to_vault?: boolean | null
          stoic_lens?: Json | null
          stoic_seq_day?: number | null
          stoic_title?: string | null
          tags?: Json
          timestamp?: number
          title?: string | null
          tracking?: Json
          updated_at?: string
          user_id?: string
          vault_category?: string | null
          word_count?: number | null
        }
        Relationships: []
      }
      journal_milestones: {
        Row: {
          analysis: Json | null
          count: number
          created_at: string
          date: string
          id: string
          milestone_type: string
          user_id: string
        }
        Insert: {
          analysis?: Json | null
          count: number
          created_at?: string
          date: string
          id?: string
          milestone_type: string
          user_id: string
        }
        Update: {
          analysis?: Json | null
          count?: number
          created_at?: string
          date?: string
          id?: string
          milestone_type?: string
          user_id?: string
        }
        Relationships: []
      }
      member_stoic_progress: {
        Row: {
          created_at: string
          current_seq_day: number
          id: string
          last_listened_at: string | null
          total_days_completed: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          current_seq_day?: number
          id?: string
          last_listened_at?: string | null
          total_days_completed?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          current_seq_day?: number
          id?: string
          last_listened_at?: string | null
          total_days_completed?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      membership_features: {
        Row: {
          category: string
          category_sort: number
          created_at: string
          feature_key: string
          feature_label: string
          feature_sort: number
          free_access: string
          free_note: string | null
          id: string
          nourished_access: string
          nourished_note: string | null
          rooted_access: string
          rooted_note: string | null
          thriving_access: string
          thriving_note: string | null
        }
        Insert: {
          category: string
          category_sort?: number
          created_at?: string
          feature_key: string
          feature_label: string
          feature_sort?: number
          free_access?: string
          free_note?: string | null
          id?: string
          nourished_access?: string
          nourished_note?: string | null
          rooted_access?: string
          rooted_note?: string | null
          thriving_access?: string
          thriving_note?: string | null
        }
        Update: {
          category?: string
          category_sort?: number
          created_at?: string
          feature_key?: string
          feature_label?: string
          feature_sort?: number
          free_access?: string
          free_note?: string | null
          id?: string
          nourished_access?: string
          nourished_note?: string | null
          rooted_access?: string
          rooted_note?: string | null
          thriving_access?: string
          thriving_note?: string | null
        }
        Relationships: []
      }
      mindfulness_logs: {
        Row: {
          completed: boolean
          created_at: string
          cycle_phase: string | null
          duration_sec: number | null
          id: string
          log_date: string
          practice_id: string
          practice_type: string
          user_id: string
        }
        Insert: {
          completed?: boolean
          created_at?: string
          cycle_phase?: string | null
          duration_sec?: number | null
          id?: string
          log_date?: string
          practice_id: string
          practice_type?: string
          user_id: string
        }
        Update: {
          completed?: boolean
          created_at?: string
          cycle_phase?: string | null
          duration_sec?: number | null
          id?: string
          log_date?: string
          practice_id?: string
          practice_type?: string
          user_id?: string
        }
        Relationships: []
      }
      moderation_queue: {
        Row: {
          comment_id: string | null
          created_at: string | null
          id: string
          post_id: string | null
          reason: string | null
          reporter_id: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string | null
        }
        Insert: {
          comment_id?: string | null
          created_at?: string | null
          id?: string
          post_id?: string | null
          reason?: string | null
          reporter_id?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string | null
        }
        Update: {
          comment_id?: string | null
          created_at?: string | null
          id?: string
          post_id?: string | null
          reason?: string | null
          reporter_id?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "moderation_queue_comment_id_fkey"
            columns: ["comment_id"]
            isOneToOne: false
            referencedRelation: "community_comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "moderation_queue_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "community_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      nps_responses: {
        Row: {
          comment: string | null
          created_at: string
          id: string
          score: number
          user_id: string
        }
        Insert: {
          comment?: string | null
          created_at?: string
          id?: string
          score: number
          user_id: string
        }
        Update: {
          comment?: string | null
          created_at?: string
          id?: string
          score?: number
          user_id?: string
        }
        Relationships: []
      }
      partner_connections: {
        Row: {
          created_at: string
          id: string
          join_code: string
          member_user_id: string
          partner_name: string | null
          partner_pin_hash: string
          partner_user_id: string | null
          shared_preferences: Json | null
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          join_code: string
          member_user_id: string
          partner_name?: string | null
          partner_pin_hash: string
          partner_user_id?: string | null
          shared_preferences?: Json | null
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          join_code?: string
          member_user_id?: string
          partner_name?: string | null
          partner_pin_hash?: string
          partner_user_id?: string | null
          shared_preferences?: Json | null
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      plan_generations: {
        Row: {
          created_at: string
          id: string
          input_json: Json | null
          month_key: string
          plan_category: string
          plan_type: string
          result_json: Json | null
          status: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          input_json?: Json | null
          month_key: string
          plan_category?: string
          plan_type?: string
          result_json?: Json | null
          status?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          input_json?: Json | null
          month_key?: string
          plan_category?: string
          plan_type?: string
          result_json?: Json | null
          status?: string
          user_id?: string
        }
        Relationships: []
      }
      plant_diversity_log: {
        Row: {
          created_at: string
          id: string
          plants: string[] | null
          updated_at: string
          user_id: string
          week_key: string
        }
        Insert: {
          created_at?: string
          id?: string
          plants?: string[] | null
          updated_at?: string
          user_id: string
          week_key: string
        }
        Update: {
          created_at?: string
          id?: string
          plants?: string[] | null
          updated_at?: string
          user_id?: string
          week_key?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          calorie_target: number | null
          carb_target_g: number | null
          created_at: string
          cycle_length: number | null
          cycle_mode: string
          cycle_status: string | null
          date_of_birth: string | null
          dietary_dislikes: string[] | null
          dietary_preferences: string[] | null
          display_name: string | null
          equipment_preference: string | null
          fat_target_g: number | null
          fitness_level: string | null
          goal_category_id: string | null
          goal_weight_kg: number | null
          height_cm: number | null
          id: string
          is_nearby_visible: boolean | null
          last_period_date: string | null
          meal_prep_day: string | null
          movement_goals: string[] | null
          onboarding_complete: boolean
          primary_goal: string | null
          profession: string | null
          protein_target_g: number | null
          referral_code: string | null
          suburb: string | null
          updated_at: string
          user_id: string
          weight_kg: number | null
        }
        Insert: {
          avatar_url?: string | null
          calorie_target?: number | null
          carb_target_g?: number | null
          created_at?: string
          cycle_length?: number | null
          cycle_mode?: string
          cycle_status?: string | null
          date_of_birth?: string | null
          dietary_dislikes?: string[] | null
          dietary_preferences?: string[] | null
          display_name?: string | null
          equipment_preference?: string | null
          fat_target_g?: number | null
          fitness_level?: string | null
          goal_category_id?: string | null
          goal_weight_kg?: number | null
          height_cm?: number | null
          id?: string
          is_nearby_visible?: boolean | null
          last_period_date?: string | null
          meal_prep_day?: string | null
          movement_goals?: string[] | null
          onboarding_complete?: boolean
          primary_goal?: string | null
          profession?: string | null
          protein_target_g?: number | null
          referral_code?: string | null
          suburb?: string | null
          updated_at?: string
          user_id: string
          weight_kg?: number | null
        }
        Update: {
          avatar_url?: string | null
          calorie_target?: number | null
          carb_target_g?: number | null
          created_at?: string
          cycle_length?: number | null
          cycle_mode?: string
          cycle_status?: string | null
          date_of_birth?: string | null
          dietary_dislikes?: string[] | null
          dietary_preferences?: string[] | null
          display_name?: string | null
          equipment_preference?: string | null
          fat_target_g?: number | null
          fitness_level?: string | null
          goal_category_id?: string | null
          goal_weight_kg?: number | null
          height_cm?: number | null
          id?: string
          is_nearby_visible?: boolean | null
          last_period_date?: string | null
          meal_prep_day?: string | null
          movement_goals?: string[] | null
          onboarding_complete?: boolean
          primary_goal?: string | null
          profession?: string | null
          protein_target_g?: number | null
          referral_code?: string | null
          suburb?: string | null
          updated_at?: string
          user_id?: string
          weight_kg?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_goal_category_id_fkey"
            columns: ["goal_category_id"]
            isOneToOne: false
            referencedRelation: "goal_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      program_phases: {
        Row: {
          created_at: string
          id: string
          phase_goal: string | null
          phase_number: number
          program_id: string
          rpe_target_max: number | null
          rpe_target_min: number | null
          title: string
          week_end: number | null
          week_start: number | null
        }
        Insert: {
          created_at?: string
          id: string
          phase_goal?: string | null
          phase_number: number
          program_id: string
          rpe_target_max?: number | null
          rpe_target_min?: number | null
          title: string
          week_end?: number | null
          week_start?: number | null
        }
        Update: {
          created_at?: string
          id?: string
          phase_goal?: string | null
          phase_number?: number
          program_id?: string
          rpe_target_max?: number | null
          rpe_target_min?: number | null
          title?: string
          week_end?: number | null
          week_start?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "program_phases_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "training_programs"
            referencedColumns: ["id"]
          },
        ]
      }
      push_tokens: {
        Row: {
          active: boolean
          created_at: string
          id: string
          platform: string
          token: string
          updated_at: string
          user_id: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          id?: string
          platform?: string
          token: string
          updated_at?: string
          user_id: string
        }
        Update: {
          active?: boolean
          created_at?: string
          id?: string
          platform?: string
          token?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      rate_limits: {
        Row: {
          created_at: string
          function_name: string
          id: string
          request_count: number
          user_identifier: string
          window_start: string
        }
        Insert: {
          created_at?: string
          function_name: string
          id?: string
          request_count?: number
          user_identifier: string
          window_start: string
        }
        Update: {
          created_at?: string
          function_name?: string
          id?: string
          request_count?: number
          user_identifier?: string
          window_start?: string
        }
        Relationships: []
      }
      referrals: {
        Row: {
          converted_at: string | null
          created_at: string
          id: string
          referred_user_id: string | null
          referrer_id: string
          status: string
        }
        Insert: {
          converted_at?: string | null
          created_at?: string
          id?: string
          referred_user_id?: string | null
          referrer_id: string
          status?: string
        }
        Update: {
          converted_at?: string | null
          created_at?: string
          id?: string
          referred_user_id?: string | null
          referrer_id?: string
          status?: string
        }
        Relationships: []
      }
      saved_parenting_scripts: {
        Row: {
          age_group: string
          id: string
          module_id: string | null
          saved_at: string
          script_id: string
          user_id: string
        }
        Insert: {
          age_group: string
          id?: string
          module_id?: string | null
          saved_at?: string
          script_id: string
          user_id: string
        }
        Update: {
          age_group?: string
          id?: string
          module_id?: string | null
          saved_at?: string
          script_id?: string
          user_id?: string
        }
        Relationships: []
      }
      shopping_lists: {
        Row: {
          checked_items: Json
          created_at: string
          custom_items: Json
          id: string
          updated_at: string
          user_id: string
          week_key: string
        }
        Insert: {
          checked_items?: Json
          created_at?: string
          custom_items?: Json
          id?: string
          updated_at?: string
          user_id: string
          week_key: string
        }
        Update: {
          checked_items?: Json
          created_at?: string
          custom_items?: Json
          id?: string
          updated_at?: string
          user_id?: string
          week_key?: string
        }
        Relationships: []
      }
      signal_announcements: {
        Row: {
          content: string
          created_at: string | null
          id: string
          is_active: boolean | null
          phase_target: string | null
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          phase_target?: string | null
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          phase_target?: string | null
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
      signal_messages: {
        Row: {
          created_at: string
          cycle_phase: string | null
          dao_chapter: string | null
          dao_verse: string | null
          fable_title: string | null
          id: string
          message: string
          moon_phase: string | null
          sun_sign: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          cycle_phase?: string | null
          dao_chapter?: string | null
          dao_verse?: string | null
          fable_title?: string | null
          id?: string
          message: string
          moon_phase?: string | null
          sun_sign?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          cycle_phase?: string | null
          dao_chapter?: string | null
          dao_verse?: string | null
          fable_title?: string | null
          id?: string
          message?: string
          moon_phase?: string | null
          sun_sign?: string | null
          user_id?: string
        }
        Relationships: []
      }
      sleep_logs: {
        Row: {
          bedtime: string | null
          created_at: string
          hours_slept: number | null
          id: string
          log_date: string
          quality_rating: number | null
          user_id: string
          wake_time: string | null
        }
        Insert: {
          bedtime?: string | null
          created_at?: string
          hours_slept?: number | null
          id?: string
          log_date: string
          quality_rating?: number | null
          user_id: string
          wake_time?: string | null
        }
        Update: {
          bedtime?: string | null
          created_at?: string
          hours_slept?: number | null
          id?: string
          log_date?: string
          quality_rating?: number | null
          user_id?: string
          wake_time?: string | null
        }
        Relationships: []
      }
      spatial_ref_sys: {
        Row: {
          auth_name: string | null
          auth_srid: number | null
          proj4text: string | null
          srid: number
          srtext: string | null
        }
        Insert: {
          auth_name?: string | null
          auth_srid?: number | null
          proj4text?: string | null
          srid: number
          srtext?: string | null
        }
        Update: {
          auth_name?: string | null
          auth_srid?: number | null
          proj4text?: string | null
          srid?: number
          srtext?: string | null
        }
        Relationships: []
      }
      stretches: {
        Row: {
          category: string
          created_at: string
          gif_url: string | null
          hold_duration: string
          id: string
          instructions: Json
          name: string
          target_muscle: string
        }
        Insert: {
          category?: string
          created_at?: string
          gif_url?: string | null
          hold_duration?: string
          id?: string
          instructions?: Json
          name: string
          target_muscle: string
        }
        Update: {
          category?: string
          created_at?: string
          gif_url?: string | null
          hold_duration?: string
          id?: string
          instructions?: Json
          name?: string
          target_muscle?: string
        }
        Relationships: []
      }
      todos: {
        Row: {
          archived: boolean
          completed: boolean
          completed_at: string | null
          created_at: string
          id: string
          sort_order: number
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          archived?: boolean
          completed?: boolean
          completed_at?: string | null
          created_at?: string
          id?: string
          sort_order?: number
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          archived?: boolean
          completed?: boolean
          completed_at?: string | null
          created_at?: string
          id?: string
          sort_order?: number
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      training_programs: {
        Row: {
          created_at: string
          description: string | null
          duration_weeks: number
          equipment_needed: string[] | null
          evidence_basis: string | null
          goal_category_id: string
          id: string
          intensity_level: number | null
          phase_structure: string | null
          sessions_per_week: number
          slug: string | null
          tags: string[] | null
          title: string
          who_its_for: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          duration_weeks?: number
          equipment_needed?: string[] | null
          evidence_basis?: string | null
          goal_category_id: string
          id: string
          intensity_level?: number | null
          phase_structure?: string | null
          sessions_per_week?: number
          slug?: string | null
          tags?: string[] | null
          title: string
          who_its_for?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          duration_weeks?: number
          equipment_needed?: string[] | null
          evidence_basis?: string | null
          goal_category_id?: string
          id?: string
          intensity_level?: number | null
          phase_structure?: string | null
          sessions_per_week?: number
          slug?: string | null
          tags?: string[] | null
          title?: string
          who_its_for?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "training_programs_goal_category_id_fkey"
            columns: ["goal_category_id"]
            isOneToOne: false
            referencedRelation: "goal_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      user_goals: {
        Row: {
          created_at: string
          goal_description: string
          goal_type: string
          id: string
          metric_label: string | null
          target_date: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          goal_description: string
          goal_type?: string
          id?: string
          metric_label?: string | null
          target_date?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          goal_description?: string
          goal_type?: string
          id?: string
          metric_label?: string | null
          target_date?: string | null
          updated_at?: string
          user_id?: string
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
      user_locations: {
        Row: {
          city: string | null
          fuzzed_lat: number
          fuzzed_lng: number
          id: string
          is_visible: boolean | null
          suburb: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          city?: string | null
          fuzzed_lat: number
          fuzzed_lng: number
          id?: string
          is_visible?: boolean | null
          suburb: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          city?: string | null
          fuzzed_lat?: number
          fuzzed_lng?: number
          id?: string
          is_visible?: boolean | null
          suburb?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_plans: {
        Row: {
          current_session_index: number | null
          cycle_phase_at_generation: string | null
          cycle_week: number | null
          generated_at: string
          id: string
          plan_data: Json
          plan_type: string
          user_id: string
          week_number: number | null
        }
        Insert: {
          current_session_index?: number | null
          cycle_phase_at_generation?: string | null
          cycle_week?: number | null
          generated_at?: string
          id?: string
          plan_data?: Json
          plan_type: string
          user_id: string
          week_number?: number | null
        }
        Update: {
          current_session_index?: number | null
          cycle_phase_at_generation?: string | null
          cycle_week?: number | null
          generated_at?: string
          id?: string
          plan_data?: Json
          plan_type?: string
          user_id?: string
          week_number?: number | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      user_saved_recipes: {
        Row: {
          id: string
          recipe_id: string
          saved_at: string
          user_id: string
        }
        Insert: {
          id?: string
          recipe_id: string
          saved_at?: string
          user_id: string
        }
        Update: {
          id?: string
          recipe_id?: string
          saved_at?: string
          user_id?: string
        }
        Relationships: []
      }
      vault_entries: {
        Row: {
          category: string
          created_at: string
          date: string
          entry_id: string | null
          id: string
          preview: string | null
          timestamp: number
          title: string
          user_id: string
        }
        Insert: {
          category: string
          created_at?: string
          date: string
          entry_id?: string | null
          id: string
          preview?: string | null
          timestamp: number
          title: string
          user_id: string
        }
        Update: {
          category?: string
          created_at?: string
          date?: string
          entry_id?: string | null
          id?: string
          preview?: string | null
          timestamp?: number
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      weekly_checkins: {
        Row: {
          created_at: string
          energy: number
          id: string
          notes: string | null
          sleep_quality: number
          soreness: string
          user_id: string
          week_start_date: string
        }
        Insert: {
          created_at?: string
          energy: number
          id?: string
          notes?: string | null
          sleep_quality: number
          soreness?: string
          user_id: string
          week_start_date: string
        }
        Update: {
          created_at?: string
          energy?: number
          id?: string
          notes?: string | null
          sleep_quality?: number
          soreness?: string
          user_id?: string
          week_start_date?: string
        }
        Relationships: []
      }
      workout_exercises: {
        Row: {
          created_at: string
          exercise_id: string
          id: string
          is_superset: boolean
          load_guidance: string | null
          order_index: number
          progression_notes: string | null
          reps: string | null
          rest_seconds: number | null
          rpe_target: number | null
          sets: number | null
          superset_group: string | null
          workout_id: string
        }
        Insert: {
          created_at?: string
          exercise_id: string
          id?: string
          is_superset?: boolean
          load_guidance?: string | null
          order_index?: number
          progression_notes?: string | null
          reps?: string | null
          rest_seconds?: number | null
          rpe_target?: number | null
          sets?: number | null
          superset_group?: string | null
          workout_id: string
        }
        Update: {
          created_at?: string
          exercise_id?: string
          id?: string
          is_superset?: boolean
          load_guidance?: string | null
          order_index?: number
          progression_notes?: string | null
          reps?: string | null
          rest_seconds?: number | null
          rpe_target?: number | null
          sets?: number | null
          superset_group?: string | null
          workout_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workout_exercises_exercise_id_fkey"
            columns: ["exercise_id"]
            isOneToOne: false
            referencedRelation: "exercises"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workout_exercises_workout_template_id_fkey"
            columns: ["workout_id"]
            isOneToOne: false
            referencedRelation: "workout_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      workout_logs: {
        Row: {
          avg_bpm: number | null
          calories: number | null
          completed: boolean
          created_at: string
          cycle_phase: string | null
          duration_minutes: number | null
          exercises: Json
          hr_session_id: string | null
          id: string
          max_bpm: number | null
          notes: string | null
          plan_id: string | null
          session_date: string
          user_id: string
          workout_template_id: string | null
          zone2_plus_percent: number | null
        }
        Insert: {
          avg_bpm?: number | null
          calories?: number | null
          completed?: boolean
          created_at?: string
          cycle_phase?: string | null
          duration_minutes?: number | null
          exercises?: Json
          hr_session_id?: string | null
          id?: string
          max_bpm?: number | null
          notes?: string | null
          plan_id?: string | null
          session_date?: string
          user_id: string
          workout_template_id?: string | null
          zone2_plus_percent?: number | null
        }
        Update: {
          avg_bpm?: number | null
          calories?: number | null
          completed?: boolean
          created_at?: string
          cycle_phase?: string | null
          duration_minutes?: number | null
          exercises?: Json
          hr_session_id?: string | null
          id?: string
          max_bpm?: number | null
          notes?: string | null
          plan_id?: string | null
          session_date?: string
          user_id?: string
          workout_template_id?: string | null
          zone2_plus_percent?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "workout_logs_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "user_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      workout_sessions: {
        Row: {
          completed_at: string
          duration_minutes: number | null
          id: string
          intensity: string | null
          notes: string | null
          user_id: string
          workout_type: string
        }
        Insert: {
          completed_at?: string
          duration_minutes?: number | null
          id?: string
          intensity?: string | null
          notes?: string | null
          user_id: string
          workout_type: string
        }
        Update: {
          completed_at?: string
          duration_minutes?: number | null
          id?: string
          intensity?: string | null
          notes?: string | null
          user_id?: string
          workout_type?: string
        }
        Relationships: []
      }
      workout_templates: {
        Row: {
          cooldown_notes: string | null
          created_at: string
          day_label: string | null
          estimated_duration_mins: number
          id: string
          phase_id: string
          program_id: string | null
          session_notes: string | null
          session_number: number | null
          session_type: string | null
          title: string
          warmup_notes: string | null
        }
        Insert: {
          cooldown_notes?: string | null
          created_at?: string
          day_label?: string | null
          estimated_duration_mins?: number
          id: string
          phase_id: string
          program_id?: string | null
          session_notes?: string | null
          session_number?: number | null
          session_type?: string | null
          title: string
          warmup_notes?: string | null
        }
        Update: {
          cooldown_notes?: string | null
          created_at?: string
          day_label?: string | null
          estimated_duration_mins?: number
          id?: string
          phase_id?: string
          program_id?: string | null
          session_notes?: string | null
          session_number?: number | null
          session_type?: string | null
          title?: string
          warmup_notes?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "workout_templates_phase_id_fkey"
            columns: ["phase_id"]
            isOneToOne: false
            referencedRelation: "program_phases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workout_templates_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "training_programs"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      geography_columns: {
        Row: {
          coord_dimension: number | null
          f_geography_column: unknown
          f_table_catalog: unknown
          f_table_name: unknown
          f_table_schema: unknown
          srid: number | null
          type: string | null
        }
        Relationships: []
      }
      geometry_columns: {
        Row: {
          coord_dimension: number | null
          f_geometry_column: unknown
          f_table_catalog: string | null
          f_table_name: unknown
          f_table_schema: unknown
          srid: number | null
          type: string | null
        }
        Insert: {
          coord_dimension?: number | null
          f_geometry_column?: unknown
          f_table_catalog?: string | null
          f_table_name?: unknown
          f_table_schema?: unknown
          srid?: number | null
          type?: string | null
        }
        Update: {
          coord_dimension?: number | null
          f_geometry_column?: unknown
          f_table_catalog?: string | null
          f_table_name?: unknown
          f_table_schema?: unknown
          srid?: number | null
          type?: string | null
        }
        Relationships: []
      }
      partner_connections_safe: {
        Row: {
          created_at: string | null
          id: string | null
          join_code: string | null
          member_user_id: string | null
          partner_name: string | null
          partner_user_id: string | null
          shared_preferences: Json | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string | null
          join_code?: string | null
          member_user_id?: string | null
          partner_name?: string | null
          partner_user_id?: string | null
          shared_preferences?: Json | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string | null
          join_code?: string | null
          member_user_id?: string | null
          partner_name?: string | null
          partner_user_id?: string | null
          shared_preferences?: Json | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      _postgis_deprecate: {
        Args: { newname: string; oldname: string; version: string }
        Returns: undefined
      }
      _postgis_index_extent: {
        Args: { col: string; tbl: unknown }
        Returns: unknown
      }
      _postgis_pgsql_version: { Args: never; Returns: string }
      _postgis_scripts_pgsql_version: { Args: never; Returns: string }
      _postgis_selectivity: {
        Args: { att_name: string; geom: unknown; mode?: string; tbl: unknown }
        Returns: number
      }
      _postgis_stats: {
        Args: { ""?: string; att_name: string; tbl: unknown }
        Returns: string
      }
      _st_3dintersects: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_contains: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_containsproperly: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_coveredby:
        | { Args: { geog1: unknown; geog2: unknown }; Returns: boolean }
        | { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      _st_covers:
        | { Args: { geog1: unknown; geog2: unknown }; Returns: boolean }
        | { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      _st_crosses: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_dwithin: {
        Args: {
          geog1: unknown
          geog2: unknown
          tolerance: number
          use_spheroid?: boolean
        }
        Returns: boolean
      }
      _st_equals: { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      _st_intersects: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_linecrossingdirection: {
        Args: { line1: unknown; line2: unknown }
        Returns: number
      }
      _st_longestline: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      _st_maxdistance: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      _st_orderingequals: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_overlaps: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_sortablehash: { Args: { geom: unknown }; Returns: number }
      _st_touches: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_voronoi: {
        Args: {
          clip?: unknown
          g1: unknown
          return_polygons?: boolean
          tolerance?: number
        }
        Returns: unknown
      }
      _st_within: { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      addauth: { Args: { "": string }; Returns: boolean }
      addgeometrycolumn:
        | {
            Args: {
              catalog_name: string
              column_name: string
              new_dim: number
              new_srid_in: number
              new_type: string
              schema_name: string
              table_name: string
              use_typmod?: boolean
            }
            Returns: string
          }
        | {
            Args: {
              column_name: string
              new_dim: number
              new_srid: number
              new_type: string
              schema_name: string
              table_name: string
              use_typmod?: boolean
            }
            Returns: string
          }
        | {
            Args: {
              column_name: string
              new_dim: number
              new_srid: number
              new_type: string
              table_name: string
              use_typmod?: boolean
            }
            Returns: string
          }
      check_rate_limit: {
        Args: {
          _function_name: string
          _max_per_minute?: number
          _user_id: string
        }
        Returns: Json
      }
      deduct_ai_credits: {
        Args: {
          p_cost: number
          p_function_name?: string
          p_user_identifier: string
        }
        Returns: number
      }
      disablelongtransactions: { Args: never; Returns: string }
      dropgeometrycolumn:
        | {
            Args: {
              catalog_name: string
              column_name: string
              schema_name: string
              table_name: string
            }
            Returns: string
          }
        | {
            Args: {
              column_name: string
              schema_name: string
              table_name: string
            }
            Returns: string
          }
        | { Args: { column_name: string; table_name: string }; Returns: string }
      dropgeometrytable:
        | {
            Args: {
              catalog_name: string
              schema_name: string
              table_name: string
            }
            Returns: string
          }
        | { Args: { schema_name: string; table_name: string }; Returns: string }
        | { Args: { table_name: string }; Returns: string }
      enablelongtransactions: { Args: never; Returns: string }
      equals: { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      geometry: { Args: { "": string }; Returns: unknown }
      geometry_above: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_below: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_cmp: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      geometry_contained_3d: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_contains: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_contains_3d: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_distance_box: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      geometry_distance_centroid: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      geometry_eq: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_ge: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_gt: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_le: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_left: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_lt: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_overabove: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_overbelow: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_overlaps: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_overlaps_3d: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_overleft: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_overright: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_right: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_same: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_same_3d: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_within: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geomfromewkt: { Args: { "": string }; Returns: unknown }
      gettransactionid: { Args: never; Returns: unknown }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      longtransactionsenabled: { Args: never; Returns: boolean }
      lookup_connection_by_code: {
        Args: { _code: string }
        Returns: {
          id: string
          partner_name: string
          status: string
        }[]
      }
      populate_geometry_columns:
        | { Args: { tbl_oid: unknown; use_typmod?: boolean }; Returns: number }
        | { Args: { use_typmod?: boolean }; Returns: string }
      postgis_constraint_dims: {
        Args: { geomcolumn: string; geomschema: string; geomtable: string }
        Returns: number
      }
      postgis_constraint_srid: {
        Args: { geomcolumn: string; geomschema: string; geomtable: string }
        Returns: number
      }
      postgis_constraint_type: {
        Args: { geomcolumn: string; geomschema: string; geomtable: string }
        Returns: string
      }
      postgis_extensions_upgrade: { Args: never; Returns: string }
      postgis_full_version: { Args: never; Returns: string }
      postgis_geos_version: { Args: never; Returns: string }
      postgis_lib_build_date: { Args: never; Returns: string }
      postgis_lib_revision: { Args: never; Returns: string }
      postgis_lib_version: { Args: never; Returns: string }
      postgis_libjson_version: { Args: never; Returns: string }
      postgis_liblwgeom_version: { Args: never; Returns: string }
      postgis_libprotobuf_version: { Args: never; Returns: string }
      postgis_libxml_version: { Args: never; Returns: string }
      postgis_proj_version: { Args: never; Returns: string }
      postgis_scripts_build_date: { Args: never; Returns: string }
      postgis_scripts_installed: { Args: never; Returns: string }
      postgis_scripts_released: { Args: never; Returns: string }
      postgis_svn_version: { Args: never; Returns: string }
      postgis_type_name: {
        Args: {
          coord_dimension: number
          geomname: string
          use_new_name?: boolean
        }
        Returns: string
      }
      postgis_version: { Args: never; Returns: string }
      postgis_wagyu_version: { Args: never; Returns: string }
      st_3dclosestpoint: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_3ddistance: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_3dintersects: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_3dlongestline: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_3dmakebox: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_3dmaxdistance: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_3dshortestline: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_addpoint: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_angle:
        | { Args: { line1: unknown; line2: unknown }; Returns: number }
        | {
            Args: { pt1: unknown; pt2: unknown; pt3: unknown; pt4?: unknown }
            Returns: number
          }
      st_area:
        | { Args: { geog: unknown; use_spheroid?: boolean }; Returns: number }
        | { Args: { "": string }; Returns: number }
      st_asencodedpolyline: {
        Args: { geom: unknown; nprecision?: number }
        Returns: string
      }
      st_asewkt: { Args: { "": string }; Returns: string }
      st_asgeojson:
        | {
            Args: { geog: unknown; maxdecimaldigits?: number; options?: number }
            Returns: string
          }
        | {
            Args: { geom: unknown; maxdecimaldigits?: number; options?: number }
            Returns: string
          }
        | {
            Args: {
              geom_column?: string
              maxdecimaldigits?: number
              pretty_bool?: boolean
              r: Record<string, unknown>
            }
            Returns: string
          }
        | { Args: { "": string }; Returns: string }
      st_asgml:
        | {
            Args: {
              geog: unknown
              id?: string
              maxdecimaldigits?: number
              nprefix?: string
              options?: number
            }
            Returns: string
          }
        | {
            Args: { geom: unknown; maxdecimaldigits?: number; options?: number }
            Returns: string
          }
        | { Args: { "": string }; Returns: string }
        | {
            Args: {
              geog: unknown
              id?: string
              maxdecimaldigits?: number
              nprefix?: string
              options?: number
              version: number
            }
            Returns: string
          }
        | {
            Args: {
              geom: unknown
              id?: string
              maxdecimaldigits?: number
              nprefix?: string
              options?: number
              version: number
            }
            Returns: string
          }
      st_askml:
        | {
            Args: { geog: unknown; maxdecimaldigits?: number; nprefix?: string }
            Returns: string
          }
        | {
            Args: { geom: unknown; maxdecimaldigits?: number; nprefix?: string }
            Returns: string
          }
        | { Args: { "": string }; Returns: string }
      st_aslatlontext: {
        Args: { geom: unknown; tmpl?: string }
        Returns: string
      }
      st_asmarc21: { Args: { format?: string; geom: unknown }; Returns: string }
      st_asmvtgeom: {
        Args: {
          bounds: unknown
          buffer?: number
          clip_geom?: boolean
          extent?: number
          geom: unknown
        }
        Returns: unknown
      }
      st_assvg:
        | {
            Args: { geog: unknown; maxdecimaldigits?: number; rel?: number }
            Returns: string
          }
        | {
            Args: { geom: unknown; maxdecimaldigits?: number; rel?: number }
            Returns: string
          }
        | { Args: { "": string }; Returns: string }
      st_astext: { Args: { "": string }; Returns: string }
      st_astwkb:
        | {
            Args: {
              geom: unknown
              prec?: number
              prec_m?: number
              prec_z?: number
              with_boxes?: boolean
              with_sizes?: boolean
            }
            Returns: string
          }
        | {
            Args: {
              geom: unknown[]
              ids: number[]
              prec?: number
              prec_m?: number
              prec_z?: number
              with_boxes?: boolean
              with_sizes?: boolean
            }
            Returns: string
          }
      st_asx3d: {
        Args: { geom: unknown; maxdecimaldigits?: number; options?: number }
        Returns: string
      }
      st_azimuth:
        | { Args: { geog1: unknown; geog2: unknown }; Returns: number }
        | { Args: { geom1: unknown; geom2: unknown }; Returns: number }
      st_boundingdiagonal: {
        Args: { fits?: boolean; geom: unknown }
        Returns: unknown
      }
      st_buffer:
        | {
            Args: { geom: unknown; options?: string; radius: number }
            Returns: unknown
          }
        | {
            Args: { geom: unknown; quadsegs: number; radius: number }
            Returns: unknown
          }
      st_centroid: { Args: { "": string }; Returns: unknown }
      st_clipbybox2d: {
        Args: { box: unknown; geom: unknown }
        Returns: unknown
      }
      st_closestpoint: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_collect: { Args: { geom1: unknown; geom2: unknown }; Returns: unknown }
      st_concavehull: {
        Args: {
          param_allow_holes?: boolean
          param_geom: unknown
          param_pctconvex: number
        }
        Returns: unknown
      }
      st_contains: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_containsproperly: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_coorddim: { Args: { geometry: unknown }; Returns: number }
      st_coveredby:
        | { Args: { geog1: unknown; geog2: unknown }; Returns: boolean }
        | { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      st_covers:
        | { Args: { geog1: unknown; geog2: unknown }; Returns: boolean }
        | { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      st_crosses: { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      st_curvetoline: {
        Args: { flags?: number; geom: unknown; tol?: number; toltype?: number }
        Returns: unknown
      }
      st_delaunaytriangles: {
        Args: { flags?: number; g1: unknown; tolerance?: number }
        Returns: unknown
      }
      st_difference: {
        Args: { geom1: unknown; geom2: unknown; gridsize?: number }
        Returns: unknown
      }
      st_disjoint: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_distance:
        | {
            Args: { geog1: unknown; geog2: unknown; use_spheroid?: boolean }
            Returns: number
          }
        | { Args: { geom1: unknown; geom2: unknown }; Returns: number }
      st_distancesphere:
        | { Args: { geom1: unknown; geom2: unknown }; Returns: number }
        | {
            Args: { geom1: unknown; geom2: unknown; radius: number }
            Returns: number
          }
      st_distancespheroid: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_dwithin: {
        Args: {
          geog1: unknown
          geog2: unknown
          tolerance: number
          use_spheroid?: boolean
        }
        Returns: boolean
      }
      st_equals: { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      st_expand:
        | { Args: { box: unknown; dx: number; dy: number }; Returns: unknown }
        | {
            Args: { box: unknown; dx: number; dy: number; dz?: number }
            Returns: unknown
          }
        | {
            Args: {
              dm?: number
              dx: number
              dy: number
              dz?: number
              geom: unknown
            }
            Returns: unknown
          }
      st_force3d: { Args: { geom: unknown; zvalue?: number }; Returns: unknown }
      st_force3dm: {
        Args: { geom: unknown; mvalue?: number }
        Returns: unknown
      }
      st_force3dz: {
        Args: { geom: unknown; zvalue?: number }
        Returns: unknown
      }
      st_force4d: {
        Args: { geom: unknown; mvalue?: number; zvalue?: number }
        Returns: unknown
      }
      st_generatepoints:
        | { Args: { area: unknown; npoints: number }; Returns: unknown }
        | {
            Args: { area: unknown; npoints: number; seed: number }
            Returns: unknown
          }
      st_geogfromtext: { Args: { "": string }; Returns: unknown }
      st_geographyfromtext: { Args: { "": string }; Returns: unknown }
      st_geohash:
        | { Args: { geog: unknown; maxchars?: number }; Returns: string }
        | { Args: { geom: unknown; maxchars?: number }; Returns: string }
      st_geomcollfromtext: { Args: { "": string }; Returns: unknown }
      st_geometricmedian: {
        Args: {
          fail_if_not_converged?: boolean
          g: unknown
          max_iter?: number
          tolerance?: number
        }
        Returns: unknown
      }
      st_geometryfromtext: { Args: { "": string }; Returns: unknown }
      st_geomfromewkt: { Args: { "": string }; Returns: unknown }
      st_geomfromgeojson:
        | { Args: { "": Json }; Returns: unknown }
        | { Args: { "": Json }; Returns: unknown }
        | { Args: { "": string }; Returns: unknown }
      st_geomfromgml: { Args: { "": string }; Returns: unknown }
      st_geomfromkml: { Args: { "": string }; Returns: unknown }
      st_geomfrommarc21: { Args: { marc21xml: string }; Returns: unknown }
      st_geomfromtext: { Args: { "": string }; Returns: unknown }
      st_gmltosql: { Args: { "": string }; Returns: unknown }
      st_hasarc: { Args: { geometry: unknown }; Returns: boolean }
      st_hausdorffdistance: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_hexagon: {
        Args: { cell_i: number; cell_j: number; origin?: unknown; size: number }
        Returns: unknown
      }
      st_hexagongrid: {
        Args: { bounds: unknown; size: number }
        Returns: Record<string, unknown>[]
      }
      st_interpolatepoint: {
        Args: { line: unknown; point: unknown }
        Returns: number
      }
      st_intersection: {
        Args: { geom1: unknown; geom2: unknown; gridsize?: number }
        Returns: unknown
      }
      st_intersects:
        | { Args: { geog1: unknown; geog2: unknown }; Returns: boolean }
        | { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      st_isvaliddetail: {
        Args: { flags?: number; geom: unknown }
        Returns: Database["public"]["CompositeTypes"]["valid_detail"]
        SetofOptions: {
          from: "*"
          to: "valid_detail"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      st_length:
        | { Args: { geog: unknown; use_spheroid?: boolean }; Returns: number }
        | { Args: { "": string }; Returns: number }
      st_letters: { Args: { font?: Json; letters: string }; Returns: unknown }
      st_linecrossingdirection: {
        Args: { line1: unknown; line2: unknown }
        Returns: number
      }
      st_linefromencodedpolyline: {
        Args: { nprecision?: number; txtin: string }
        Returns: unknown
      }
      st_linefromtext: { Args: { "": string }; Returns: unknown }
      st_linelocatepoint: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_linetocurve: { Args: { geometry: unknown }; Returns: unknown }
      st_locatealong: {
        Args: { geometry: unknown; leftrightoffset?: number; measure: number }
        Returns: unknown
      }
      st_locatebetween: {
        Args: {
          frommeasure: number
          geometry: unknown
          leftrightoffset?: number
          tomeasure: number
        }
        Returns: unknown
      }
      st_locatebetweenelevations: {
        Args: { fromelevation: number; geometry: unknown; toelevation: number }
        Returns: unknown
      }
      st_longestline: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_makebox2d: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_makeline: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_makevalid: {
        Args: { geom: unknown; params: string }
        Returns: unknown
      }
      st_maxdistance: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_minimumboundingcircle: {
        Args: { inputgeom: unknown; segs_per_quarter?: number }
        Returns: unknown
      }
      st_mlinefromtext: { Args: { "": string }; Returns: unknown }
      st_mpointfromtext: { Args: { "": string }; Returns: unknown }
      st_mpolyfromtext: { Args: { "": string }; Returns: unknown }
      st_multilinestringfromtext: { Args: { "": string }; Returns: unknown }
      st_multipointfromtext: { Args: { "": string }; Returns: unknown }
      st_multipolygonfromtext: { Args: { "": string }; Returns: unknown }
      st_node: { Args: { g: unknown }; Returns: unknown }
      st_normalize: { Args: { geom: unknown }; Returns: unknown }
      st_offsetcurve: {
        Args: { distance: number; line: unknown; params?: string }
        Returns: unknown
      }
      st_orderingequals: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_overlaps: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_perimeter: {
        Args: { geog: unknown; use_spheroid?: boolean }
        Returns: number
      }
      st_pointfromtext: { Args: { "": string }; Returns: unknown }
      st_pointm: {
        Args: {
          mcoordinate: number
          srid?: number
          xcoordinate: number
          ycoordinate: number
        }
        Returns: unknown
      }
      st_pointz: {
        Args: {
          srid?: number
          xcoordinate: number
          ycoordinate: number
          zcoordinate: number
        }
        Returns: unknown
      }
      st_pointzm: {
        Args: {
          mcoordinate: number
          srid?: number
          xcoordinate: number
          ycoordinate: number
          zcoordinate: number
        }
        Returns: unknown
      }
      st_polyfromtext: { Args: { "": string }; Returns: unknown }
      st_polygonfromtext: { Args: { "": string }; Returns: unknown }
      st_project: {
        Args: { azimuth: number; distance: number; geog: unknown }
        Returns: unknown
      }
      st_quantizecoordinates: {
        Args: {
          g: unknown
          prec_m?: number
          prec_x: number
          prec_y?: number
          prec_z?: number
        }
        Returns: unknown
      }
      st_reduceprecision: {
        Args: { geom: unknown; gridsize: number }
        Returns: unknown
      }
      st_relate: { Args: { geom1: unknown; geom2: unknown }; Returns: string }
      st_removerepeatedpoints: {
        Args: { geom: unknown; tolerance?: number }
        Returns: unknown
      }
      st_segmentize: {
        Args: { geog: unknown; max_segment_length: number }
        Returns: unknown
      }
      st_setsrid:
        | { Args: { geog: unknown; srid: number }; Returns: unknown }
        | { Args: { geom: unknown; srid: number }; Returns: unknown }
      st_sharedpaths: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_shortestline: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_simplifypolygonhull: {
        Args: { geom: unknown; is_outer?: boolean; vertex_fraction: number }
        Returns: unknown
      }
      st_split: { Args: { geom1: unknown; geom2: unknown }; Returns: unknown }
      st_square: {
        Args: { cell_i: number; cell_j: number; origin?: unknown; size: number }
        Returns: unknown
      }
      st_squaregrid: {
        Args: { bounds: unknown; size: number }
        Returns: Record<string, unknown>[]
      }
      st_srid:
        | { Args: { geog: unknown }; Returns: number }
        | { Args: { geom: unknown }; Returns: number }
      st_subdivide: {
        Args: { geom: unknown; gridsize?: number; maxvertices?: number }
        Returns: unknown[]
      }
      st_swapordinates: {
        Args: { geom: unknown; ords: unknown }
        Returns: unknown
      }
      st_symdifference: {
        Args: { geom1: unknown; geom2: unknown; gridsize?: number }
        Returns: unknown
      }
      st_symmetricdifference: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_tileenvelope: {
        Args: {
          bounds?: unknown
          margin?: number
          x: number
          y: number
          zoom: number
        }
        Returns: unknown
      }
      st_touches: { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      st_transform:
        | {
            Args: { from_proj: string; geom: unknown; to_proj: string }
            Returns: unknown
          }
        | {
            Args: { from_proj: string; geom: unknown; to_srid: number }
            Returns: unknown
          }
        | { Args: { geom: unknown; to_proj: string }; Returns: unknown }
      st_triangulatepolygon: { Args: { g1: unknown }; Returns: unknown }
      st_union:
        | { Args: { geom1: unknown; geom2: unknown }; Returns: unknown }
        | {
            Args: { geom1: unknown; geom2: unknown; gridsize: number }
            Returns: unknown
          }
      st_voronoilines: {
        Args: { extend_to?: unknown; g1: unknown; tolerance?: number }
        Returns: unknown
      }
      st_voronoipolygons: {
        Args: { extend_to?: unknown; g1: unknown; tolerance?: number }
        Returns: unknown
      }
      st_within: { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      st_wkbtosql: { Args: { wkb: string }; Returns: unknown }
      st_wkttosql: { Args: { "": string }; Returns: unknown }
      st_wrapx: {
        Args: { geom: unknown; move: number; wrap: number }
        Returns: unknown
      }
      unlockrows: { Args: { "": string }; Returns: number }
      updategeometrysrid: {
        Args: {
          catalogn_name: string
          column_name: string
          new_srid_in: number
          schema_name: string
          table_name: string
        }
        Returns: string
      }
      verify_partner_pin:
        | {
            Args: { _code: string; _pin_hash: string }
            Returns: {
              connection_id: string
              connection_status: string
              partner_name: string
            }[]
          }
        | { Args: { _connection_id: string; _pin: string }; Returns: boolean }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
    }
    CompositeTypes: {
      geometry_dump: {
        path: number[] | null
        geom: unknown
      }
      valid_detail: {
        valid: boolean | null
        reason: string | null
        location: unknown
      }
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
    Enums: {
      app_role: ["admin", "moderator", "user"],
    },
  },
} as const
