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
      business_credentials: {
        Row: {
          business_id: string
          created_at: string
          google_refresh_token: string | null
          id: string
          updated_at: string
        }
        Insert: {
          business_id: string
          created_at?: string
          google_refresh_token?: string | null
          id?: string
          updated_at?: string
        }
        Update: {
          business_id?: string
          created_at?: string
          google_refresh_token?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "business_credentials_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: true
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      businesses: {
        Row: {
          booking_hotel_id: string | null
          city: string | null
          created_at: string
          expedia_hotel_id: string | null
          google_account_id: string | null
          google_connected: boolean | null
          google_location_id: string | null
          hotelscom_url: string | null
          id: string
          language: string | null
          lat: number | null
          lng: number | null
          name: string
          parent_business_id: string | null
          place_id: string | null
          price_tier: number | null
          review_notification_type: string
          room_count: number | null
          segment: string | null
          star_rating: number | null
          tone: string | null
          tripadvisor_id: string | null
          tripcom_hotel_id: string | null
          trustpilot_url: string | null
          user_id: string
          weekly_report_enabled: boolean
        }
        Insert: {
          booking_hotel_id?: string | null
          city?: string | null
          created_at?: string
          expedia_hotel_id?: string | null
          google_account_id?: string | null
          google_connected?: boolean | null
          google_location_id?: string | null
          hotelscom_url?: string | null
          id?: string
          language?: string | null
          lat?: number | null
          lng?: number | null
          name: string
          parent_business_id?: string | null
          place_id?: string | null
          price_tier?: number | null
          review_notification_type?: string
          room_count?: number | null
          segment?: string | null
          star_rating?: number | null
          tone?: string | null
          tripadvisor_id?: string | null
          tripcom_hotel_id?: string | null
          trustpilot_url?: string | null
          user_id: string
          weekly_report_enabled?: boolean
        }
        Update: {
          booking_hotel_id?: string | null
          city?: string | null
          created_at?: string
          expedia_hotel_id?: string | null
          google_account_id?: string | null
          google_connected?: boolean | null
          google_location_id?: string | null
          hotelscom_url?: string | null
          id?: string
          language?: string | null
          lat?: number | null
          lng?: number | null
          name?: string
          parent_business_id?: string | null
          place_id?: string | null
          price_tier?: number | null
          review_notification_type?: string
          room_count?: number | null
          segment?: string | null
          star_rating?: number | null
          tone?: string | null
          tripadvisor_id?: string | null
          tripcom_hotel_id?: string | null
          trustpilot_url?: string | null
          user_id?: string
          weekly_report_enabled?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "businesses_parent_business_id_fkey"
            columns: ["parent_business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_conversations: {
        Row: {
          business_id: string
          created_at: string
          id: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          business_id: string
          created_at?: string
          id?: string
          title?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          business_id?: string
          created_at?: string
          id?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_conversations_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string
          id: string
          role: string
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string
          id?: string
          role: string
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string
          id?: string
          role?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "chat_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      ci_competitor_reviews: {
        Row: {
          author_country: string | null
          author_name: string | null
          body: string | null
          competitor_id: string
          external_id: string
          id: string
          language: string | null
          platform: string
          posted_at: string | null
          rating: number | null
          raw_payload: Json | null
          scraped_at: string
          sentiment: string | null
          title: string | null
          topics_extracted_at: string | null
          trip_type: string | null
        }
        Insert: {
          author_country?: string | null
          author_name?: string | null
          body?: string | null
          competitor_id: string
          external_id: string
          id?: string
          language?: string | null
          platform: string
          posted_at?: string | null
          rating?: number | null
          raw_payload?: Json | null
          scraped_at?: string
          sentiment?: string | null
          title?: string | null
          topics_extracted_at?: string | null
          trip_type?: string | null
        }
        Update: {
          author_country?: string | null
          author_name?: string | null
          body?: string | null
          competitor_id?: string
          external_id?: string
          id?: string
          language?: string | null
          platform?: string
          posted_at?: string | null
          rating?: number | null
          raw_payload?: Json | null
          scraped_at?: string
          sentiment?: string | null
          title?: string | null
          topics_extracted_at?: string | null
          trip_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ci_competitor_reviews_competitor_id_fkey"
            columns: ["competitor_id"]
            isOneToOne: false
            referencedRelation: "ci_competitors"
            referencedColumns: ["id"]
          },
        ]
      }
      ci_competitors: {
        Row: {
          added_by: string | null
          business_id: string
          category: string | null
          city: string | null
          created_at: string
          discovered_at: string | null
          id: string
          is_active: boolean
          last_scraped_at: string | null
          lat: number | null
          lng: number | null
          match_score: number | null
          match_score_breakdown: Json | null
          name: string
          place_id: string | null
          price_tier: number | null
          proximity_m: number | null
          rating: number | null
          review_count: number | null
          room_count: number | null
          segment: string | null
          source: string
          source_urls: Json
          star_rating: number | null
          status: string
          updated_at: string
        }
        Insert: {
          added_by?: string | null
          business_id: string
          category?: string | null
          city?: string | null
          created_at?: string
          discovered_at?: string | null
          id?: string
          is_active?: boolean
          last_scraped_at?: string | null
          lat?: number | null
          lng?: number | null
          match_score?: number | null
          match_score_breakdown?: Json | null
          name: string
          place_id?: string | null
          price_tier?: number | null
          proximity_m?: number | null
          rating?: number | null
          review_count?: number | null
          room_count?: number | null
          segment?: string | null
          source?: string
          source_urls?: Json
          star_rating?: number | null
          status?: string
          updated_at?: string
        }
        Update: {
          added_by?: string | null
          business_id?: string
          category?: string | null
          city?: string | null
          created_at?: string
          discovered_at?: string | null
          id?: string
          is_active?: boolean
          last_scraped_at?: string | null
          lat?: number | null
          lng?: number | null
          match_score?: number | null
          match_score_breakdown?: Json | null
          name?: string
          place_id?: string | null
          price_tier?: number | null
          proximity_m?: number | null
          rating?: number | null
          review_count?: number | null
          room_count?: number | null
          segment?: string | null
          source?: string
          source_urls?: Json
          star_rating?: number | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "ci_competitors_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      ci_discovery_runs: {
        Row: {
          business_id: string
          candidates_found: number | null
          id: string
          radius_m: number
          ran_at: string
          rating_tolerance: number | null
          suggested_count: number | null
        }
        Insert: {
          business_id: string
          candidates_found?: number | null
          id?: string
          radius_m: number
          ran_at?: string
          rating_tolerance?: number | null
          suggested_count?: number | null
        }
        Update: {
          business_id?: string
          candidates_found?: number | null
          id?: string
          radius_m?: number
          ran_at?: string
          rating_tolerance?: number | null
          suggested_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "ci_discovery_runs_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      ci_monday_briefs: {
        Row: {
          bucket_week: string
          business_id: string
          competitors_count: number | null
          emailed_at: string | null
          generated_at: string
          id: string
          opened_at: string | null
          reviews_analysed: number | null
          sections: Json
          signal_strength: number | null
        }
        Insert: {
          bucket_week: string
          business_id: string
          competitors_count?: number | null
          emailed_at?: string | null
          generated_at?: string
          id?: string
          opened_at?: string | null
          reviews_analysed?: number | null
          sections: Json
          signal_strength?: number | null
        }
        Update: {
          bucket_week?: string
          business_id?: string
          competitors_count?: number | null
          emailed_at?: string | null
          generated_at?: string
          id?: string
          opened_at?: string | null
          reviews_analysed?: number | null
          sections?: Json
          signal_strength?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "ci_monday_briefs_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      ci_review_topics: {
        Row: {
          business_id: string
          competitor_id: string | null
          confidence: number
          excerpt: string | null
          extracted_at: string
          id: number
          language: string | null
          review_id: string
          review_posted_at: string | null
          review_source: string
          sentiment: number
          topic_id: string
        }
        Insert: {
          business_id: string
          competitor_id?: string | null
          confidence?: number
          excerpt?: string | null
          extracted_at?: string
          id?: number
          language?: string | null
          review_id: string
          review_posted_at?: string | null
          review_source: string
          sentiment: number
          topic_id: string
        }
        Update: {
          business_id?: string
          competitor_id?: string | null
          confidence?: number
          excerpt?: string | null
          extracted_at?: string
          id?: number
          language?: string | null
          review_id?: string
          review_posted_at?: string | null
          review_source?: string
          sentiment?: number
          topic_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ci_review_topics_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ci_review_topics_competitor_id_fkey"
            columns: ["competitor_id"]
            isOneToOne: false
            referencedRelation: "ci_competitors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ci_review_topics_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "ci_topics"
            referencedColumns: ["id"]
          },
        ]
      }
      ci_topics: {
        Row: {
          applies_to_verticals: string[]
          category: string
          created_at: string
          display_name: Json
          id: string
          is_decision_driver: boolean
          parent_id: string | null
        }
        Insert: {
          applies_to_verticals?: string[]
          category: string
          created_at?: string
          display_name: Json
          id: string
          is_decision_driver?: boolean
          parent_id?: string | null
        }
        Update: {
          applies_to_verticals?: string[]
          category?: string
          created_at?: string
          display_name?: Json
          id?: string
          is_decision_driver?: boolean
          parent_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ci_topics_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "ci_topics"
            referencedColumns: ["id"]
          },
        ]
      }
      customer_contacts: {
        Row: {
          business_id: string
          created_at: string
          email: string
          id: string
          name: string | null
          source: string
          subscribed: boolean
          tags: string[] | null
          updated_at: string
        }
        Insert: {
          business_id: string
          created_at?: string
          email: string
          id?: string
          name?: string | null
          source?: string
          subscribed?: boolean
          tags?: string[] | null
          updated_at?: string
        }
        Update: {
          business_id?: string
          created_at?: string
          email?: string
          id?: string
          name?: string | null
          source?: string
          subscribed?: boolean
          tags?: string[] | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "customer_contacts_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      demo_requests: {
        Row: {
          business_name: string
          contact: string
          created_at: string
          id: string
          name: string
        }
        Insert: {
          business_name: string
          contact: string
          created_at?: string
          id?: string
          name: string
        }
        Update: {
          business_name?: string
          contact?: string
          created_at?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      email_campaigns: {
        Row: {
          body_html: string
          business_id: string
          created_at: string
          created_by: string | null
          failed_count: number
          id: string
          recipient_count: number
          sent_at: string | null
          sent_count: number
          status: string
          subject: string
          template_type: string
        }
        Insert: {
          body_html: string
          business_id: string
          created_at?: string
          created_by?: string | null
          failed_count?: number
          id?: string
          recipient_count?: number
          sent_at?: string | null
          sent_count?: number
          status?: string
          subject: string
          template_type?: string
        }
        Update: {
          body_html?: string
          business_id?: string
          created_at?: string
          created_by?: string | null
          failed_count?: number
          id?: string
          recipient_count?: number
          sent_at?: string | null
          sent_count?: number
          status?: string
          subject?: string
          template_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "email_campaigns_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      email_logs: {
        Row: {
          business_id: string
          campaign_id: string | null
          contact_id: string | null
          created_at: string
          error_message: string | null
          id: string
          recipient_email: string
          resend_id: string | null
          status: string
          subject: string
        }
        Insert: {
          business_id: string
          campaign_id?: string | null
          contact_id?: string | null
          created_at?: string
          error_message?: string | null
          id?: string
          recipient_email: string
          resend_id?: string | null
          status?: string
          subject: string
        }
        Update: {
          business_id?: string
          campaign_id?: string | null
          contact_id?: string | null
          created_at?: string
          error_message?: string | null
          id?: string
          recipient_email?: string
          resend_id?: string | null
          status?: string
          subject?: string
        }
        Relationships: [
          {
            foreignKeyName: "email_logs_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "email_logs_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "email_campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "email_logs_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "customer_contacts"
            referencedColumns: ["id"]
          },
        ]
      }
      integration_logs: {
        Row: {
          action: string
          business_id: string
          created_at: string
          error_code: string | null
          error_message: string | null
          http_status: number | null
          id: string
          meta: Json | null
          provider: string
          status: string
        }
        Insert: {
          action: string
          business_id: string
          created_at?: string
          error_code?: string | null
          error_message?: string | null
          http_status?: number | null
          id?: string
          meta?: Json | null
          provider: string
          status: string
        }
        Update: {
          action?: string
          business_id?: string
          created_at?: string
          error_code?: string | null
          error_message?: string | null
          http_status?: number | null
          id?: string
          meta?: Json | null
          provider?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "integration_logs_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      performance_metrics_cache: {
        Row: {
          business_id: string
          created_at: string
          fetched_at: string
          id: string
          location_id: string
          metric_data: Json
          period_end: string
          period_start: string
          search_keywords: Json | null
        }
        Insert: {
          business_id: string
          created_at?: string
          fetched_at?: string
          id?: string
          location_id: string
          metric_data?: Json
          period_end: string
          period_start: string
          search_keywords?: Json | null
        }
        Update: {
          business_id?: string
          created_at?: string
          fetched_at?: string
          id?: string
          location_id?: string
          metric_data?: Json
          period_end?: string
          period_start?: string
          search_keywords?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "performance_metrics_cache_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      platform_rankings: {
        Row: {
          area_name: string | null
          business_id: string
          created_at: string
          fetched_at: string
          id: string
          platform: string
          rank: number | null
          raw: Json | null
          source_url: string | null
          total_in_area: number | null
        }
        Insert: {
          area_name?: string | null
          business_id: string
          created_at?: string
          fetched_at?: string
          id?: string
          platform: string
          rank?: number | null
          raw?: Json | null
          source_url?: string | null
          total_in_area?: number | null
        }
        Update: {
          area_name?: string | null
          business_id?: string
          created_at?: string
          fetched_at?: string
          id?: string
          platform?: string
          rank?: number | null
          raw?: Json | null
          source_url?: string | null
          total_in_area?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "platform_rankings_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      platform_ratings: {
        Row: {
          business_id: string
          created_at: string
          fetched_at: string
          id: string
          platform: string
          rating: number | null
          rating_scale: number
          raw: Json | null
          review_count: number | null
          source_url: string | null
        }
        Insert: {
          business_id: string
          created_at?: string
          fetched_at?: string
          id?: string
          platform: string
          rating?: number | null
          rating_scale?: number
          raw?: Json | null
          review_count?: number | null
          source_url?: string | null
        }
        Update: {
          business_id?: string
          created_at?: string
          fetched_at?: string
          id?: string
          platform?: string
          rating?: number | null
          rating_scale?: number
          raw?: Json | null
          review_count?: number | null
          source_url?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          full_name: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          full_name: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          full_name?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      reply_logs: {
        Row: {
          business_id: string
          created_at: string
          google_status: string | null
          id: string
          reply_source: string | null
          reply_text: string
          response_time_hours: number | null
          review_id: string
          tone: string | null
          user_id: string
        }
        Insert: {
          business_id: string
          created_at?: string
          google_status?: string | null
          id?: string
          reply_source?: string | null
          reply_text: string
          response_time_hours?: number | null
          review_id: string
          tone?: string | null
          user_id: string
        }
        Update: {
          business_id?: string
          created_at?: string
          google_status?: string | null
          id?: string
          reply_source?: string | null
          reply_text?: string
          response_time_hours?: number | null
          review_id?: string
          tone?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reply_logs_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reply_logs_review_id_fkey"
            columns: ["review_id"]
            isOneToOne: false
            referencedRelation: "reviews"
            referencedColumns: ["id"]
          },
        ]
      }
      reviews: {
        Row: {
          approved_reply: string | null
          business_id: string
          created_at: string
          edited_at: string | null
          google_reply_error_message: string | null
          google_reply_status: string | null
          google_review_id: string | null
          google_review_name: string | null
          id: string
          is_edited: boolean
          issues: Json | null
          photos: Json | null
          platform: string
          posted_at: string
          praises: Json | null
          previous_rating: number | null
          previous_text: string | null
          rating: number
          replied_at: string | null
          reply_source: string | null
          reviewer_name: string
          sentiment: string | null
          status: string | null
          suggested_reply: string | null
          summary: string | null
          text: string | null
          topics_extracted_at: string | null
        }
        Insert: {
          approved_reply?: string | null
          business_id: string
          created_at?: string
          edited_at?: string | null
          google_reply_error_message?: string | null
          google_reply_status?: string | null
          google_review_id?: string | null
          google_review_name?: string | null
          id?: string
          is_edited?: boolean
          issues?: Json | null
          photos?: Json | null
          platform?: string
          posted_at: string
          praises?: Json | null
          previous_rating?: number | null
          previous_text?: string | null
          rating: number
          replied_at?: string | null
          reply_source?: string | null
          reviewer_name: string
          sentiment?: string | null
          status?: string | null
          suggested_reply?: string | null
          summary?: string | null
          text?: string | null
          topics_extracted_at?: string | null
        }
        Update: {
          approved_reply?: string | null
          business_id?: string
          created_at?: string
          edited_at?: string | null
          google_reply_error_message?: string | null
          google_reply_status?: string | null
          google_review_id?: string | null
          google_review_name?: string | null
          id?: string
          is_edited?: boolean
          issues?: Json | null
          photos?: Json | null
          platform?: string
          posted_at?: string
          praises?: Json | null
          previous_rating?: number | null
          previous_text?: string | null
          rating?: number
          replied_at?: string | null
          reply_source?: string | null
          reviewer_name?: string
          sentiment?: string | null
          status?: string | null
          suggested_reply?: string | null
          summary?: string | null
          text?: string | null
          topics_extracted_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reviews_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      social_connection_credentials: {
        Row: {
          access_token: string | null
          created_at: string
          expires_at: string | null
          id: string
          refresh_token: string | null
          social_connection_id: string
          updated_at: string
        }
        Insert: {
          access_token?: string | null
          created_at?: string
          expires_at?: string | null
          id?: string
          refresh_token?: string | null
          social_connection_id: string
          updated_at?: string
        }
        Update: {
          access_token?: string | null
          created_at?: string
          expires_at?: string | null
          id?: string
          refresh_token?: string | null
          social_connection_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "social_connection_credentials_social_connection_id_fkey"
            columns: ["social_connection_id"]
            isOneToOne: true
            referencedRelation: "social_connections"
            referencedColumns: ["id"]
          },
        ]
      }
      social_connections: {
        Row: {
          avatar_url: string | null
          business_id: string | null
          connected_at: string
          created_at: string
          id: string
          provider: string
          provider_user_id: string
          scopes: string[] | null
          updated_at: string
          user_id: string | null
          username: string | null
        }
        Insert: {
          avatar_url?: string | null
          business_id?: string | null
          connected_at?: string
          created_at?: string
          id?: string
          provider: string
          provider_user_id: string
          scopes?: string[] | null
          updated_at?: string
          user_id?: string | null
          username?: string | null
        }
        Update: {
          avatar_url?: string | null
          business_id?: string | null
          connected_at?: string
          created_at?: string
          id?: string
          provider?: string
          provider_user_id?: string
          scopes?: string[] | null
          updated_at?: string
          user_id?: string | null
          username?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "social_connections_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      story_kit_shares: {
        Row: {
          business_id: string
          customer_message: string | null
          downloaded_at: string
          id: string
          ip_hash: string | null
          platform: string | null
          template_id: string
        }
        Insert: {
          business_id: string
          customer_message?: string | null
          downloaded_at?: string
          id?: string
          ip_hash?: string | null
          platform?: string | null
          template_id: string
        }
        Update: {
          business_id?: string
          customer_message?: string | null
          downloaded_at?: string
          id?: string
          ip_hash?: string | null
          platform?: string | null
          template_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "story_kit_shares_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "story_kit_shares_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "story_kit_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      story_kit_templates: {
        Row: {
          accent_color: string | null
          background_color: string | null
          business_id: string
          created_at: string
          custom_message_placeholder: string | null
          hashtag: string | null
          id: string
          is_active: boolean | null
          logo_url: string | null
          qr_code_enabled: boolean | null
          tagline: string | null
          template_name: string
          text_color: string | null
          updated_at: string
        }
        Insert: {
          accent_color?: string | null
          background_color?: string | null
          business_id: string
          created_at?: string
          custom_message_placeholder?: string | null
          hashtag?: string | null
          id?: string
          is_active?: boolean | null
          logo_url?: string | null
          qr_code_enabled?: boolean | null
          tagline?: string | null
          template_name?: string
          text_color?: string | null
          updated_at?: string
        }
        Update: {
          accent_color?: string | null
          background_color?: string | null
          business_id?: string
          created_at?: string
          custom_message_placeholder?: string | null
          hashtag?: string | null
          id?: string
          is_active?: boolean | null
          logo_url?: string | null
          qr_code_enabled?: boolean | null
          tagline?: string | null
          template_name?: string
          text_color?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "story_kit_templates_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      tiktok_comment_replies: {
        Row: {
          business_id: string
          comment_id: string
          created_at: string
          error_message: string | null
          id: string
          reply_text: string
          send_status: string
          sent_at: string | null
          sent_by_user_id: string | null
          tiktok_reply_id: string | null
        }
        Insert: {
          business_id: string
          comment_id: string
          created_at?: string
          error_message?: string | null
          id?: string
          reply_text: string
          send_status?: string
          sent_at?: string | null
          sent_by_user_id?: string | null
          tiktok_reply_id?: string | null
        }
        Update: {
          business_id?: string
          comment_id?: string
          created_at?: string
          error_message?: string | null
          id?: string
          reply_text?: string
          send_status?: string
          sent_at?: string | null
          sent_by_user_id?: string | null
          tiktok_reply_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tiktok_comment_replies_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tiktok_comment_replies_comment_id_fkey"
            columns: ["comment_id"]
            isOneToOne: false
            referencedRelation: "tiktok_comments"
            referencedColumns: ["id"]
          },
        ]
      }
      tiktok_comments: {
        Row: {
          author_avatar_url: string | null
          author_display_name: string | null
          author_username: string | null
          business_id: string
          comment_text: string
          commented_at: string | null
          created_at: string
          id: string
          like_count: number | null
          parent_comment_id: string | null
          raw: Json | null
          reply_count: number | null
          social_connection_id: string
          status: string
          tiktok_comment_id: string
          tiktok_video_id: string
          updated_at: string
          video_id: string
        }
        Insert: {
          author_avatar_url?: string | null
          author_display_name?: string | null
          author_username?: string | null
          business_id: string
          comment_text: string
          commented_at?: string | null
          created_at?: string
          id?: string
          like_count?: number | null
          parent_comment_id?: string | null
          raw?: Json | null
          reply_count?: number | null
          social_connection_id: string
          status?: string
          tiktok_comment_id: string
          tiktok_video_id: string
          updated_at?: string
          video_id: string
        }
        Update: {
          author_avatar_url?: string | null
          author_display_name?: string | null
          author_username?: string | null
          business_id?: string
          comment_text?: string
          commented_at?: string | null
          created_at?: string
          id?: string
          like_count?: number | null
          parent_comment_id?: string | null
          raw?: Json | null
          reply_count?: number | null
          social_connection_id?: string
          status?: string
          tiktok_comment_id?: string
          tiktok_video_id?: string
          updated_at?: string
          video_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tiktok_comments_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tiktok_comments_social_connection_id_fkey"
            columns: ["social_connection_id"]
            isOneToOne: false
            referencedRelation: "social_connections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tiktok_comments_video_id_fkey"
            columns: ["video_id"]
            isOneToOne: false
            referencedRelation: "tiktok_videos"
            referencedColumns: ["id"]
          },
        ]
      }
      tiktok_reply_suggestions: {
        Row: {
          business_id: string
          comment_id: string
          confidence: number | null
          created_at: string
          id: string
          intent: string | null
          language: string
          model: string
          rationale: string | null
          safe_to_reply: boolean | null
          suggested_text: string
          tone: string
        }
        Insert: {
          business_id: string
          comment_id: string
          confidence?: number | null
          created_at?: string
          id?: string
          intent?: string | null
          language?: string
          model?: string
          rationale?: string | null
          safe_to_reply?: boolean | null
          suggested_text: string
          tone?: string
        }
        Update: {
          business_id?: string
          comment_id?: string
          confidence?: number | null
          created_at?: string
          id?: string
          intent?: string | null
          language?: string
          model?: string
          rationale?: string | null
          safe_to_reply?: boolean | null
          suggested_text?: string
          tone?: string
        }
        Relationships: [
          {
            foreignKeyName: "tiktok_reply_suggestions_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tiktok_reply_suggestions_comment_id_fkey"
            columns: ["comment_id"]
            isOneToOne: false
            referencedRelation: "tiktok_comments"
            referencedColumns: ["id"]
          },
        ]
      }
      tiktok_videos: {
        Row: {
          business_id: string
          caption: string | null
          comment_count: number | null
          created_at: string
          id: string
          like_count: number | null
          permalink: string | null
          published_at: string | null
          raw: Json | null
          share_count: number | null
          social_connection_id: string
          thumbnail_url: string | null
          tiktok_video_id: string
          updated_at: string
          view_count: number | null
        }
        Insert: {
          business_id: string
          caption?: string | null
          comment_count?: number | null
          created_at?: string
          id?: string
          like_count?: number | null
          permalink?: string | null
          published_at?: string | null
          raw?: Json | null
          share_count?: number | null
          social_connection_id: string
          thumbnail_url?: string | null
          tiktok_video_id: string
          updated_at?: string
          view_count?: number | null
        }
        Update: {
          business_id?: string
          caption?: string | null
          comment_count?: number | null
          created_at?: string
          id?: string
          like_count?: number | null
          permalink?: string | null
          published_at?: string | null
          raw?: Json | null
          share_count?: number | null
          social_connection_id?: string
          thumbnail_url?: string | null
          tiktok_video_id?: string
          updated_at?: string
          view_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "tiktok_videos_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tiktok_videos_social_connection_id_fkey"
            columns: ["social_connection_id"]
            isOneToOne: false
            referencedRelation: "social_connections"
            referencedColumns: ["id"]
          },
        ]
      }
      user_first_action_notified: {
        Row: {
          action: string | null
          email: string | null
          notified_at: string
          user_id: string
        }
        Insert: {
          action?: string | null
          email?: string | null
          notified_at?: string
          user_id: string
        }
        Update: {
          action?: string | null
          email?: string | null
          notified_at?: string
          user_id?: string
        }
        Relationships: []
      }
      youtube_comments: {
        Row: {
          analyzed_at: string | null
          author_avatar_url: string | null
          author_channel_id: string | null
          author_display_name: string | null
          business_id: string
          comment_text: string
          commented_at: string | null
          created_at: string
          id: string
          like_count: number | null
          raw: Json | null
          reply_count: number | null
          sentiment: string | null
          sentiment_score: number | null
          sentiment_summary: string | null
          sentiment_topics: Json | null
          sentiment_translated_text: string | null
          status: string
          updated_at: string
          video_id: string
          youtube_comment_id: string
          youtube_video_id: string
        }
        Insert: {
          analyzed_at?: string | null
          author_avatar_url?: string | null
          author_channel_id?: string | null
          author_display_name?: string | null
          business_id: string
          comment_text: string
          commented_at?: string | null
          created_at?: string
          id?: string
          like_count?: number | null
          raw?: Json | null
          reply_count?: number | null
          sentiment?: string | null
          sentiment_score?: number | null
          sentiment_summary?: string | null
          sentiment_topics?: Json | null
          sentiment_translated_text?: string | null
          status?: string
          updated_at?: string
          video_id: string
          youtube_comment_id: string
          youtube_video_id: string
        }
        Update: {
          analyzed_at?: string | null
          author_avatar_url?: string | null
          author_channel_id?: string | null
          author_display_name?: string | null
          business_id?: string
          comment_text?: string
          commented_at?: string | null
          created_at?: string
          id?: string
          like_count?: number | null
          raw?: Json | null
          reply_count?: number | null
          sentiment?: string | null
          sentiment_score?: number | null
          sentiment_summary?: string | null
          sentiment_topics?: Json | null
          sentiment_translated_text?: string | null
          status?: string
          updated_at?: string
          video_id?: string
          youtube_comment_id?: string
          youtube_video_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "youtube_comments_video_id_fkey"
            columns: ["video_id"]
            isOneToOne: false
            referencedRelation: "youtube_videos"
            referencedColumns: ["id"]
          },
        ]
      }
      youtube_videos: {
        Row: {
          business_id: string
          channel_id: string | null
          channel_title: string | null
          comment_count: number | null
          created_at: string
          description: string | null
          id: string
          like_count: number | null
          permalink: string | null
          published_at: string | null
          raw: Json | null
          thumbnail_url: string | null
          title: string | null
          updated_at: string
          view_count: number | null
          youtube_video_id: string
        }
        Insert: {
          business_id: string
          channel_id?: string | null
          channel_title?: string | null
          comment_count?: number | null
          created_at?: string
          description?: string | null
          id?: string
          like_count?: number | null
          permalink?: string | null
          published_at?: string | null
          raw?: Json | null
          thumbnail_url?: string | null
          title?: string | null
          updated_at?: string
          view_count?: number | null
          youtube_video_id: string
        }
        Update: {
          business_id?: string
          channel_id?: string | null
          channel_title?: string | null
          comment_count?: number | null
          created_at?: string
          description?: string | null
          id?: string
          like_count?: number | null
          permalink?: string | null
          published_at?: string | null
          raw?: Json | null
          thumbnail_url?: string | null
          title?: string | null
          updated_at?: string
          view_count?: number | null
          youtube_video_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      admin_get_cron_jobs: {
        Args: never
        Returns: {
          active: boolean
          command: string
          jobid: number
          jobname: string
          schedule: string
        }[]
      }
      get_user_role: {
        Args: { user_id: string }
        Returns: Database["public"]["Enums"]["app_role"]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "owner" | "admin" | "staff"
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
    Enums: {
      app_role: ["owner", "admin", "staff"],
    },
  },
} as const
