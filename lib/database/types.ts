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
          location: unknown | null // PostGIS geography type
          owner_id: string
          status: "active" | "completed" | "archived"
          metadata: Record<string, any>
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          location?: unknown | null
          owner_id: string
          status?: "active" | "completed" | "archived"
          metadata?: Record<string, any>
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          location?: unknown | null
          owner_id?: string
          status?: "active" | "completed" | "archived"
          metadata?: Record<string, any>
          created_at?: string
          updated_at?: string
        }
      }
      datasets: {
        Row: {
          id: string
          project_id: string
          name: string
          file_path: string
          file_size: number | null
          file_type: string
          upload_status: "pending" | "processing" | "completed" | "failed"
          metadata: Record<string, any>
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          project_id: string
          name: string
          file_path: string
          file_size?: number | null
          file_type: string
          upload_status?: "pending" | "processing" | "completed" | "failed"
          metadata?: Record<string, any>
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          name?: string
          file_path?: string
          file_size?: number | null
          file_type?: string
          upload_status?: "pending" | "processing" | "completed" | "failed"
          metadata?: Record<string, any>
          created_at?: string
          updated_at?: string
        }
      }
      ai_analyses: {
        Row: {
          id: string
          dataset_id: string
          analysis_type: string
          provider: string
          prompt: string
          result: Record<string, any> | null
          status: "pending" | "running" | "completed" | "failed"
          error_message: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          dataset_id: string
          analysis_type: string
          provider: string
          prompt: string
          result?: Record<string, any> | null
          status?: "pending" | "running" | "completed" | "failed"
          error_message?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          dataset_id?: string
          analysis_type?: string
          provider?: string
          prompt?: string
          result?: Record<string, any> | null
          status?: "pending" | "running" | "completed" | "failed"
          error_message?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      geological_nodes: {
        Row: {
          id: string
          project_id: string
          node_type: string
          name: string
          properties: Record<string, any>
          location: unknown | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          project_id: string
          node_type: string
          name: string
          properties?: Record<string, any>
          location?: unknown | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          node_type?: string
          name?: string
          properties?: Record<string, any>
          location?: unknown | null
          created_at?: string
          updated_at?: string
        }
      }
      geological_relationships: {
        Row: {
          id: string
          from_node_id: string
          to_node_id: string
          relationship_type: string
          properties: Record<string, any>
          created_at: string
        }
        Insert: {
          id?: string
          from_node_id: string
          to_node_id: string
          relationship_type: string
          properties?: Record<string, any>
          created_at?: string
        }
        Update: {
          id?: string
          from_node_id?: string
          to_node_id?: string
          relationship_type?: string
          properties?: Record<string, any>
          created_at?: string
        }
      }
      webhooks: {
        Row: {
          id: string
          project_id: string
          url: string
          events: string[]
          secret: string | null
          active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          project_id: string
          url: string
          events: string[]
          secret?: string | null
          active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          url?: string
          events?: string[]
          secret?: string | null
          active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      chained_analyses: {
        Row: {
          id: string
          project_id: string
          name: string
          workflow: Record<string, any>
          status: "pending" | "running" | "completed" | "failed"
          result: Record<string, any> | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          project_id: string
          name: string
          workflow: Record<string, any>
          status?: "pending" | "running" | "completed" | "failed"
          result?: Record<string, any> | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          name?: string
          workflow?: Record<string, any>
          status?: "pending" | "running" | "completed" | "failed"
          result?: Record<string, any> | null
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

export type Profile = Database["public"]["Tables"]["profiles"]["Row"]
export type Project = Database["public"]["Tables"]["projects"]["Row"]
export type Dataset = Database["public"]["Tables"]["datasets"]["Row"]
export type AIAnalysis = Database["public"]["Tables"]["ai_analyses"]["Row"]
export type GeologicalNode = Database["public"]["Tables"]["geological_nodes"]["Row"]
export type GeologicalRelationship = Database["public"]["Tables"]["geological_relationships"]["Row"]
export type Webhook = Database["public"]["Tables"]["webhooks"]["Row"]
export type ChainedAnalysis = Database["public"]["Tables"]["chained_analyses"]["Row"]

export type InsertProfile = Database["public"]["Tables"]["profiles"]["Insert"]
export type InsertProject = Database["public"]["Tables"]["projects"]["Insert"]
export type InsertDataset = Database["public"]["Tables"]["datasets"]["Insert"]
export type InsertAIAnalysis = Database["public"]["Tables"]["ai_analyses"]["Insert"]
export type InsertGeologicalNode = Database["public"]["Tables"]["geological_nodes"]["Insert"]
export type InsertGeologicalRelationship = Database["public"]["Tables"]["geological_relationships"]["Insert"]
export type InsertWebhook = Database["public"]["Tables"]["webhooks"]["Insert"]
export type InsertChainedAnalysis = Database["public"]["Tables"]["chained_analyses"]["Insert"]

export type UpdateProfile = Database["public"]["Tables"]["profiles"]["Update"]
export type UpdateProject = Database["public"]["Tables"]["projects"]["Update"]
export type UpdateDataset = Database["public"]["Tables"]["datasets"]["Update"]
export type UpdateAIAnalysis = Database["public"]["Tables"]["ai_analyses"]["Update"]
export type UpdateGeologicalNode = Database["public"]["Tables"]["geological_nodes"]["Update"]
export type UpdateGeologicalRelationship = Database["public"]["Tables"]["geological_relationships"]["Update"]
export type UpdateWebhook = Database["public"]["Tables"]["webhooks"]["Update"]
export type UpdateChainedAnalysis = Database["public"]["Tables"]["chained_analyses"]["Update"]
