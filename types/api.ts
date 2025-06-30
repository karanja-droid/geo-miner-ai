export interface Project {
  id: string
  name: string
  description: string
  location?: string
  status: ProjectStatus
  created_at: string
  updated_at: string
  owner_id: string
  team_members?: ProjectMember[]
  datasets_count?: number
  analyses_count?: number
}

export type ProjectStatus = "active" | "completed" | "on-hold" | "archived"

export interface ProjectMember {
  user_id: string
  user_name: string
  role: ProjectRole
  joined_at: string
}

export type ProjectRole = "owner" | "editor" | "viewer"

export interface Dataset {
  id: string
  name: string
  description?: string
  type: DatasetType
  project_id: string
  file_path?: string
  file_size?: number
  status: DatasetStatus
  created_at: string
  updated_at: string
  metadata?: Record<string, unknown>
  records_count?: number
}

export type DatasetType = "geochemical" | "geological" | "geophysical" | "spatial" | "other"
export type DatasetStatus = "uploading" | "processing" | "ready" | "error"

export interface AIAnalysis {
  id: string
  analysis_type: AnalysisType
  provider: AIProvider
  dataset_id: string
  user_id: string
  status: AnalysisStatus
  progress: number
  prompt: string
  result?: AnalysisResult
  error_message?: string
  created_at: string
  completed_at?: string
  processing_time?: number
  webhook_url?: string
}

export type AnalysisType = "geological" | "geochemical" | "structural" | "mineral_assessment"
export type AIProvider = "openai" | "anthropic" | "qwen"
export type AnalysisStatus = "pending" | "processing" | "completed" | "failed" | "cancelled"

export interface AnalysisResult {
  summary: string
  recommendations: string[]
  confidence_score: number
  metadata?: Record<string, unknown>
}

export interface ChainedAnalysis {
  id: string
  workflow_name: string
  user_id: string
  status: AnalysisStatus
  steps: AnalysisStep[]
  results: StepResult[]
  created_at: string
  completed_at?: string
  webhook_url?: string
}

export interface AnalysisStep {
  step_number: number
  type: StepType
  description: string
  status: AnalysisStatus
  input_data?: Record<string, unknown>
  processing_time?: number
}

export type StepType =
  | "data_processing"
  | "ml_analysis"
  | "llm_analysis"
  | "geological_analysis"
  | "geochemical_analysis"

export interface StepResult {
  step_id: string
  status: AnalysisStatus
  result?: Record<string, unknown>
  error_message?: string
}

export interface GeologicalNode {
  id: string
  node_type: NodeType
  properties: Record<string, unknown>
  coordinates?: [number, number]
  created_at: string
  updated_at: string
}

export type NodeType = "formation" | "fault" | "ore_body" | "drill_hole" | "sample_point"

export interface GeologicalRelationship {
  id: string
  source_node_id: string
  target_node_id: string
  relationship_type: RelationshipType
  properties?: Record<string, unknown>
  created_at: string
}

export type RelationshipType = "intersects" | "adjacent" | "contains" | "similar" | "connected"
