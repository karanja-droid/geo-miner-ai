import { supabase } from "../supabase"
import type { Database } from "./types"

type Project = Database["public"]["Tables"]["projects"]["Row"]
type ProjectInsert = Database["public"]["Tables"]["projects"]["Insert"]
type ProjectUpdate = Database["public"]["Tables"]["projects"]["Update"]

export class ProjectService {
  static async getProjects(userId: string, skip = 0, limit = 10) {
    const { data, error, count } = await supabase
      .from("projects")
      .select("*", { count: "exact" })
      .eq("owner_id", userId)
      .order("created_at", { ascending: false })
      .range(skip, skip + limit - 1)

    if (error) {
      throw new Error(`Failed to fetch projects: ${error.message}`)
    }

    return {
      projects: data || [],
      total: count || 0,
    }
  }

  static async getProject(id: string, userId: string) {
    const { data, error } = await supabase.from("projects").select("*").eq("id", id).eq("owner_id", userId).single()

    if (error) {
      throw new Error(`Failed to fetch project: ${error.message}`)
    }

    return data
  }

  static async createProject(project: ProjectInsert) {
    const { data, error } = await supabase.from("projects").insert(project).select().single()

    if (error) {
      throw new Error(`Failed to create project: ${error.message}`)
    }

    return data
  }

  static async updateProject(id: string, updates: ProjectUpdate, userId: string) {
    const { data, error } = await supabase
      .from("projects")
      .update(updates)
      .eq("id", id)
      .eq("owner_id", userId)
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to update project: ${error.message}`)
    }

    return data
  }

  static async deleteProject(id: string, userId: string) {
    const { error } = await supabase.from("projects").delete().eq("id", id).eq("owner_id", userId)

    if (error) {
      throw new Error(`Failed to delete project: ${error.message}`)
    }

    return true
  }

  static async getProjectStats(userId: string) {
    const { data, error } = await supabase.from("projects").select("status").eq("owner_id", userId)

    if (error) {
      throw new Error(`Failed to fetch project stats: ${error.message}`)
    }

    const stats = {
      total: data.length,
      active: data.filter((p) => p.status === "active").length,
      completed: data.filter((p) => p.status === "completed").length,
      archived: data.filter((p) => p.status === "archived").length,
    }

    return stats
  }
}
