export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          name: string
          organization: string | null
          role: "user" | "admin" | "geologist"
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          name: string
          organization?: string | null
          role?: "user" | "admin" | "geologist"
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          name?: string
          organization?: string | null
          role?: "user" | "admin" | "geologist"
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      projects: {
        Row: {
          id: string
          name: string
          description: string | null
          location: any | null
          owner_id: string
          status: "active" | "completed" | "archived"
          metadata: any
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          location?: any | null
          owner_id: string
          status?: "active" | "completed" | "archived"
          metadata?: any
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          location?: any | null
          owner_id?: string
          status?: "active" | "completed" | "archived"
          metadata?: any
          created_at?: string
          updated_at?: string
        }
      }
      datasets: {
        Row: {
          id: string
          project_id: string | null
          name: string
          file_path: string
          file_size: number | null
          file_type: string
          upload_status: "pending" | "processing" | "completed" | "failed"
          metadata: any
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          project_id?: string | null
          name: string
          file_path: string
          file_size?: number | null
          file_type: string
          upload_status?: "pending" | "processing" | "completed" | "failed"
          metadata?: any
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          project_id?: string | null
          name?: string
          file_path?: string
          file_size?: number | null
          file_type?: string
          upload_status?: "pending" | "processing" | "completed" | "failed"
          metadata?: any
          created_at?: string
          updated_at?: string
        }
      }
      ai_analyses: {
        Row: {
          id: string
          dataset_id: string | null
          analysis_type: string
          provider: string
          prompt: string
          result: any | null
          status: "pending" | "running" | "completed" | "failed"
          error_message: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          dataset_id?: string | null
          analysis_type: string
          provider: string
          prompt: string
          result?: any | null
          status?: "pending" | "running" | "completed" | "failed"
          error_message?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          dataset_id?: string | null
          analysis_type?: string
          provider?: string
          prompt?: string
          result?: any | null
          status?: "pending" | "running" | "completed" | "failed"
          error_message?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      geological_nodes: {
        Row: {
          id: string
          project_id: string | null
          node_type: string
          name: string
          properties: any
          location: any | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          project_id?: string | null
          node_type: string
          name: string
          properties?: any
          location?: any | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          project_id?: string | null
          node_type?: string
          name?: string
          properties?: any
          location?: any | null
          created_at?: string
          updated_at?: string
        }
      }
      geological_relationships: {
        Row: {
          id: string
          from_node_id: string | null
          to_node_id: string | null
          relationship_type: string
          properties: any
          created_at: string
        }
        Insert: {
          id?: string
          from_node_id?: string | null
          to_node_id?: string | null
          relationship_type: string
          properties?: any
          created_at?: string
        }
        Update: {
          id?: string
          from_node_id?: string | null
          to_node_id?: string | null
          relationship_type?: string
          properties?: any
          created_at?: string
        }
      }
      webhooks: {
        Row: {
          id: string
          project_id: string | null
          url: string
          events: string[]
          secret: string | null
          active: boolean | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          project_id?: string | null
          url: string
          events: string[]
          secret?: string | null
          active?: boolean | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          project_id?: string | null
          url?: string
          events?: string[]
          secret?: string | null
          active?: boolean | null
          created_at?: string
          updated_at?: string
        }
      }
      chained_analyses: {
        Row: {
          id: string
          project_id: string | null
          name: string
          workflow: any
          status: "pending" | "running" | "completed" | "failed"
          result: any | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          project_id?: string | null
          name: string
          workflow: any
          status?: "pending" | "running" | "completed" | "failed"
          result?: any | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          project_id?: string | null
          name?: string
          workflow?: any
          status?: "pending" | "running" | "completed" | "failed"
          result?: any | null
          created_at?: string
          updated_at?: string
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
