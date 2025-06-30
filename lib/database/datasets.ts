import { supabase } from "../supabase"
import type { Database } from "./types"

type Dataset = Database["public"]["Tables"]["datasets"]["Row"]
type DatasetInsert = Database["public"]["Tables"]["datasets"]["Insert"]
type DatasetUpdate = Database["public"]["Tables"]["datasets"]["Update"]

export class DatasetService {
  static async getDatasets(projectId?: string) {
    let query = supabase
      .from("datasets")
      .select(`
        *,
        projects (
          id,
          name,
          owner_id
        )
      `)
      .order("created_at", { ascending: false })

    if (projectId) {
      query = query.eq("project_id", projectId)
    }

    const { data, error } = await query

    if (error) {
      throw new Error(`Failed to fetch datasets: ${error.message}`)
    }

    return data || []
  }

  static async getDataset(id: string) {
    const { data, error } = await supabase
      .from("datasets")
      .select(`
        *,
        projects (
          id,
          name,
          owner_id
        )
      `)
      .eq("id", id)
      .single()

    if (error) {
      throw new Error(`Failed to fetch dataset: ${error.message}`)
    }

    return data
  }

  static async createDataset(dataset: DatasetInsert) {
    const { data, error } = await supabase.from("datasets").insert(dataset).select().single()

    if (error) {
      throw new Error(`Failed to create dataset: ${error.message}`)
    }

    return data
  }

  static async updateDataset(id: string, updates: DatasetUpdate) {
    const { data, error } = await supabase.from("datasets").update(updates).eq("id", id).select().single()

    if (error) {
      throw new Error(`Failed to update dataset: ${error.message}`)
    }

    return data
  }

  static async deleteDataset(id: string) {
    const { error } = await supabase.from("datasets").delete().eq("id", id)

    if (error) {
      throw new Error(`Failed to delete dataset: ${error.message}`)
    }

    return true
  }

  static async uploadFile(file: File, projectId: string) {
    const fileExt = file.name.split(".").pop()
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
    const filePath = `datasets/${projectId}/${fileName}`

    // Upload file to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage.from("datasets").upload(filePath, file)

    if (uploadError) {
      throw new Error(`Failed to upload file: ${uploadError.message}`)
    }

    // Create dataset record
    const dataset = await this.createDataset({
      project_id: projectId,
      name: file.name,
      file_path: filePath,
      file_size: file.size,
      file_type: file.type,
      upload_status: "completed",
      metadata: {
        originalName: file.name,
        uploadedAt: new Date().toISOString(),
      },
    })

    return dataset
  }

  static async getFileUrl(filePath: string) {
    const { data } = await supabase.storage.from("datasets").getPublicUrl(filePath)

    return data.publicUrl
  }

  static async deleteFile(filePath: string) {
    const { error } = await supabase.storage.from("datasets").remove([filePath])

    if (error) {
      throw new Error(`Failed to delete file: ${error.message}`)
    }

    return true
  }
}
