import { supabase } from "../supabase"
import type { Dataset, InsertDataset, UpdateDataset } from "./types"

export class DatasetService {
  // Get all datasets for a project
  static async getDatasets(projectId: string): Promise<{ data: Dataset[] | null; error: Error | null }> {
    try {
      const { data, error } = await supabase
        .from("datasets")
        .select("*")
        .eq("project_id", projectId)
        .order("created_at", { ascending: false })

      if (error) {
        return { data: null, error: new Error(error.message) }
      }

      return { data, error: null }
    } catch (error) {
      return { data: null, error: error as Error }
    }
  }

  // Get a single dataset by ID
  static async getDataset(id: string): Promise<{ data: Dataset | null; error: Error | null }> {
    try {
      const { data, error } = await supabase.from("datasets").select("*").eq("id", id).single()

      if (error) {
        return { data: null, error: new Error(error.message) }
      }

      return { data, error: null }
    } catch (error) {
      return { data: null, error: error as Error }
    }
  }

  // Create a new dataset
  static async createDataset(dataset: InsertDataset): Promise<{ data: Dataset | null; error: Error | null }> {
    try {
      const { data, error } = await supabase.from("datasets").insert(dataset).select().single()

      if (error) {
        return { data: null, error: new Error(error.message) }
      }

      return { data, error: null }
    } catch (error) {
      return { data: null, error: error as Error }
    }
  }

  // Update a dataset
  static async updateDataset(
    id: string,
    updates: UpdateDataset,
  ): Promise<{ data: Dataset | null; error: Error | null }> {
    try {
      const { data, error } = await supabase.from("datasets").update(updates).eq("id", id).select().single()

      if (error) {
        return { data: null, error: new Error(error.message) }
      }

      return { data, error: null }
    } catch (error) {
      return { data: null, error: error as Error }
    }
  }

  // Delete a dataset
  static async deleteDataset(id: string): Promise<{ error: Error | null }> {
    try {
      const { error } = await supabase.from("datasets").delete().eq("id", id)

      if (error) {
        return { error: new Error(error.message) }
      }

      return { error: null }
    } catch (error) {
      return { error: error as Error }
    }
  }

  // Upload file to Supabase Storage
  static async uploadFile(
    file: File,
    projectId: string,
  ): Promise<{ data: { path: string } | null; error: Error | null }> {
    try {
      const fileExt = file.name.split(".").pop()
      const fileName = `${projectId}/${Date.now()}.${fileExt}`

      const { data, error } = await supabase.storage.from("datasets").upload(fileName, file, {
        cacheControl: "3600",
        upsert: false,
      })

      if (error) {
        return { data: null, error: new Error(error.message) }
      }

      return { data: { path: data.path }, error: null }
    } catch (error) {
      return { data: null, error: error as Error }
    }
  }

  // Get file URL from Supabase Storage
  static async getFileUrl(path: string): Promise<{ data: { publicUrl: string } | null; error: Error | null }> {
    try {
      const { data } = supabase.storage.from("datasets").getPublicUrl(path)

      return { data, error: null }
    } catch (error) {
      return { data: null, error: error as Error }
    }
  }

  // Delete file from Supabase Storage
  static async deleteFile(path: string): Promise<{ error: Error | null }> {
    try {
      const { error } = await supabase.storage.from("datasets").remove([path])

      if (error) {
        return { error: new Error(error.message) }
      }

      return { error: null }
    } catch (error) {
      return { error: error as Error }
    }
  }

  // Get datasets with analysis counts
  static async getDatasetsWithStats(
    projectId: string,
  ): Promise<{ data: (Dataset & { analysis_count: number })[] | null; error: Error | null }> {
    try {
      const { data, error } = await supabase
        .from("datasets")
        .select(`
          *,
          ai_analyses(count)
        `)
        .eq("project_id", projectId)
        .order("created_at", { ascending: false })

      if (error) {
        return { data: null, error: new Error(error.message) }
      }

      // Transform the data to include analysis count
      const datasetsWithStats =
        data?.map((dataset) => ({
          ...dataset,
          analysis_count: dataset.ai_analyses?.[0]?.count || 0,
        })) || []

      return { data: datasetsWithStats, error: null }
    } catch (error) {
      return { data: null, error: error as Error }
    }
  }

  // Subscribe to dataset changes
  static subscribeToDatasets(projectId: string, callback: (payload: any) => void) {
    return supabase
      .channel(`datasets:${projectId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "datasets",
          filter: `project_id=eq.${projectId}`,
        },
        callback,
      )
      .subscribe()
  }

  // Unsubscribe from dataset changes
  static unsubscribeFromDatasets(subscription: any) {
    return supabase.removeChannel(subscription)
  }
}
