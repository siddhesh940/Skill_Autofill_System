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
      users: {
        Row: {
          id: string
          email: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          created_at?: string
          updated_at?: string
        }
      }
      user_profiles: {
        Row: {
          id: string
          user_id: string
          full_name: string | null
          headline: string | null
          bio: string | null
          github_username: string | null
          linkedin_url: string | null
          portfolio_url: string | null
          resume_text: string | null
          years_experience: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          full_name?: string | null
          headline?: string | null
          bio?: string | null
          github_username?: string | null
          linkedin_url?: string | null
          portfolio_url?: string | null
          resume_text?: string | null
          years_experience?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          full_name?: string | null
          headline?: string | null
          bio?: string | null
          github_username?: string | null
          linkedin_url?: string | null
          portfolio_url?: string | null
          resume_text?: string | null
          years_experience?: number | null
          created_at?: string
          updated_at?: string
        }
      }
      user_skills: {
        Row: {
          id: string
          user_id: string
          skill_name: string
          skill_category: string
          proficiency_level: string
          years_experience: number | null
          is_verified: boolean
          source: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          skill_name: string
          skill_category?: string
          proficiency_level?: string
          years_experience?: number | null
          is_verified?: boolean
          source?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          skill_name?: string
          skill_category?: string
          proficiency_level?: string
          years_experience?: number | null
          is_verified?: boolean
          source?: string
          created_at?: string
          updated_at?: string
        }
      }
      job_requests: {
        Row: {
          id: string
          user_id: string
          job_url: string | null
          raw_text: string | null
          parsed_data: Json | null
          status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          job_url?: string | null
          raw_text?: string | null
          parsed_data?: Json | null
          status?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          job_url?: string | null
          raw_text?: string | null
          parsed_data?: Json | null
          status?: string
          created_at?: string
          updated_at?: string
        }
      }
      analysis_results: {
        Row: {
          id: string
          user_id: string
          job_request_id: string
          analysis_type: string
          result_data: Json
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          job_request_id: string
          analysis_type: string
          result_data: Json
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          job_request_id?: string
          analysis_type?: string
          result_data?: Json
          created_at?: string
        }
      }
      skill_taxonomy: {
        Row: {
          id: string
          canonical_name: string
          aliases: string[]
          category: string
          weight: number
          is_hot: boolean
          created_at: string
        }
        Insert: {
          id?: string
          canonical_name: string
          aliases?: string[]
          category?: string
          weight?: number
          is_hot?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          canonical_name?: string
          aliases?: string[]
          category?: string
          weight?: number
          is_hot?: boolean
          created_at?: string
        }
      }
      project_templates: {
        Row: {
          id: string
          title: string
          description: string
          difficulty: string
          estimated_hours: number
          tech_stack: string[]
          skills_demonstrated: string[]
          features: string[]
          github_structure: string[]
          created_at: string
        }
        Insert: {
          id?: string
          title: string
          description: string
          difficulty?: string
          estimated_hours?: number
          tech_stack?: string[]
          skills_demonstrated?: string[]
          features?: string[]
          github_structure?: string[]
          created_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string
          difficulty?: string
          estimated_hours?: number
          tech_stack?: string[]
          skills_demonstrated?: string[]
          features?: string[]
          github_structure?: string[]
          created_at?: string
        }
      }
      roadmap_templates: {
        Row: {
          id: string
          skill_name: string
          phase: string
          task_title: string
          task_description: string
          duration_hours: number
          resource_url: string | null
          resource_type: string | null
          order_index: number
          created_at: string
        }
        Insert: {
          id?: string
          skill_name: string
          phase: string
          task_title: string
          task_description: string
          duration_hours?: number
          resource_url?: string | null
          resource_type?: string | null
          order_index?: number
          created_at?: string
        }
        Update: {
          id?: string
          skill_name?: string
          phase?: string
          task_title?: string
          task_description?: string
          duration_hours?: number
          resource_url?: string | null
          resource_type?: string | null
          order_index?: number
          created_at?: string
        }
      }
      resume_patterns: {
        Row: {
          id: string
          pattern_type: string
          weak_pattern: string
          strong_replacement: string
          category: string | null
          created_at: string
        }
        Insert: {
          id?: string
          pattern_type: string
          weak_pattern: string
          strong_replacement: string
          category?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          pattern_type?: string
          weak_pattern?: string
          strong_replacement?: string
          category?: string | null
          created_at?: string
        }
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
  }
}
