import { supabase } from "../supabase"
import type { Project, InsertProject, UpdateProject } from "./types"

export class ProjectService {
  // Get all projects for the current user
  static async getProjects(): Promise<{ data: Project[] | null; error: Error | null }> {
    try {
      const { data, error } = await supabase.from("projects").select("*").order("created_at", { ascending: false })

      if (error) {
        return { data: null, error: new Error(error.message) }
      }

      return { data, error: null }
    } catch (error) {
      return { data: null, error: error as Error }
    }
  }

  // Get a single project by ID
  static async getProject(id: string): Promise<{ data: Project | null; error: Error | null }> {
    try {
      const { data, error } = await supabase.from("projects").select("*").eq("id", id).single()

      if (error) {
        return { data: null, error: new Error(error.message) }
      }

      return { data, error: null }
    } catch (error) {
      return { data: null, error: error as Error }
    }
  }

  // Create a new project
  static async createProject(project: InsertProject): Promise<{ data: Project | null; error: Error | null }> {
    try {
      const { data, error } = await supabase.from("projects").insert(project).select().single()

      if (error) {
        return { data: null, error: new Error(error.message) }
      }

      return { data, error: null }
    } catch (error) {
      return { data: null, error: error as Error }
    }
  }

  // Update a project
  static async updateProject(
    id: string,
    updates: UpdateProject,
  ): Promise<{ data: Project | null; error: Error | null }> {
    try {
      const { data, error } = await supabase.from("projects").update(updates).eq("id", id).select().single()

      if (error) {
        return { data: null, error: new Error(error.message) }
      }

      return { data, error: null }
    } catch (error) {
      return { data: null, error: error as Error }
    }
  }

  // Delete a project
  static async deleteProject(id: string): Promise<{ error: Error | null }> {
    try {
      const { error } = await supabase.from("projects").delete().eq("id", id)

      if (error) {
        return { error: new Error(error.message) }
      }

      return { error: null }
    } catch (error) {
      return { error: error as Error }
    }
  }

  // Get projects with dataset counts
  static async getProjectsWithStats(): Promise<{
    data: (Project & { dataset_count: number })[] | null
    error: Error | null
  }> {
    try {
      const { data, error } = await supabase
        .from("projects")
        .select(`
          *,
          datasets(count)
        `)
        .order("created_at", { ascending: false })

      if (error) {
        return { data: null, error: new Error(error.message) }
      }

      // Transform the data to include dataset count
      const projectsWithStats =
        data?.map((project) => ({
          ...project,
          dataset_count: project.datasets?.[0]?.count || 0,
        })) || []

      return { data: projectsWithStats, error: null }
    } catch (error) {
      return { data: null, error: error as Error }
    }
  }

  // Search projects
  static async searchProjects(query: string): Promise<{ data: Project[] | null; error: Error | null }> {
    try {
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
        .order("created_at", { ascending: false })

      if (error) {
        return { data: null, error: new Error(error.message) }
      }

      return { data, error: null }
    } catch (error) {
      return { data: null, error: error as Error }
    }
  }

  // Subscribe to project changes
  static subscribeToProjects(callback: (payload: any) => void) {
    return supabase
      .channel("projects")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "projects",
        },
        callback,
      )
      .subscribe()
  }

  // Unsubscribe from project changes
  static unsubscribeFromProjects(subscription: any) {
    return supabase.removeChannel(subscription)
  }
}
