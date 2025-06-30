interface ApiResponse<T = any> {
  data?: T
  error?: string
  status: number
  retryAfter?: number
}

interface ApiError {
  message: string
  code?: string
  details?: any
}

class ApiClient {
  private baseURL: string
  private token: string | null = null
  private requestTimeout = 10000 // 10 seconds

  constructor(baseURL: string) {
    this.baseURL = baseURL.replace(/\/$/, "") // Remove trailing slash

    // Get token from localStorage if available
    if (typeof window !== "undefined") {
      this.token = localStorage.getItem("geominer_token")
    }
  }

  setToken(token: string | null) {
    this.token = token
  }

  private async safeJsonParse<T>(response: Response): Promise<T> {
    const contentType = response.headers.get("content-type")

    if (!contentType || !contentType.includes("application/json")) {
      const textContent = await response.text()
      console.error("Non-JSON response received:", {
        status: response.status,
        statusText: response.statusText,
        contentType,
        content: textContent.substring(0, 500),
      })
      throw new Error(`Server returned non-JSON response: ${response.status} ${response.statusText}`)
    }

    const responseText = await response.text()

    if (!responseText.trim()) {
      console.error("Empty response received:", {
        status: response.status,
        statusText: response.statusText,
      })
      throw new Error("Empty response from server")
    }

    try {
      return JSON.parse(responseText)
    } catch (parseError) {
      console.error("JSON parsing failed:", {
        error: parseError,
        responseText: responseText.substring(0, 500),
        status: response.status,
        statusText: response.statusText,
      })
      throw new Error("Invalid JSON response from server")
    }
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`

    const headers: HeadersInit = {
      "Content-Type": "application/json",
      ...options.headers,
    }

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`
    }

    try {
      // Add timeout to prevent hanging requests
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), this.requestTimeout)

      const response = await fetch(url, {
        ...options,
        headers,
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      // Handle different response scenarios
      if (!response.ok) {
        let errorMessage = `Request failed with status ${response.status}`
        let errorCode = "UNKNOWN_ERROR"

        try {
          const errorData = await this.safeJsonParse<{ detail?: string; message?: string; code?: string }>(response)
          errorMessage = errorData.detail || errorData.message || errorMessage
          errorCode = errorData.code || errorCode
        } catch (parseError) {
          console.warn("Could not parse error response:", parseError)
        }

        // Handle specific HTTP status codes
        switch (response.status) {
          case 401:
            // Token expired or invalid
            if (typeof window !== "undefined") {
              localStorage.removeItem("geominer_token")
              localStorage.removeItem("geominer_user")
              window.location.href = "/login"
            }
            return {
              error: "Authentication required. Please log in again.",
              status: response.status,
            }

          case 403:
            return {
              error: "You don't have permission to perform this action.",
              status: response.status,
            }

          case 404:
            return {
              error: "The requested resource was not found.",
              status: response.status,
            }

          case 429:
            // Rate limit exceeded
            const retryAfter = response.headers.get("Retry-After")
            return {
              error: `Rate limit exceeded. Please try again in ${retryAfter || "60"} seconds.`,
              status: response.status,
              retryAfter: Number.parseInt(retryAfter || "60", 10),
            }

          case 500:
            return {
              error: "Server error. Please try again later.",
              status: response.status,
            }

          case 502:
          case 503:
          case 504:
            return {
              error: "Service temporarily unavailable. Please try again later.",
              status: response.status,
            }

          default:
            return {
              error: errorMessage,
              status: response.status,
            }
        }
      }

      // Parse successful response
      const data = await this.safeJsonParse<T>(response)

      return {
        data,
        status: response.status,
      }
    } catch (error) {
      console.error("API request failed:", {
        url,
        error,
        timestamp: new Date().toISOString(),
      })

      if (error instanceof Error) {
        if (error.name === "AbortError") {
          return {
            error: "Request timeout. Please check your connection and try again.",
            status: 0,
          }
        }

        if (error.message.includes("Failed to fetch")) {
          return {
            error: "Network error. Please check your internet connection.",
            status: 0,
          }
        }

        return {
          error: error.message,
          status: 0,
        }
      }

      return {
        error: "An unexpected error occurred",
        status: 0,
      }
    }
  }

  // Auth endpoints with enhanced error handling
  async login(email: string, password: string) {
    if (!email || !password) {
      return {
        error: "Email and password are required",
        status: 400,
      }
    }

    return this.request("/api/v1/auth/login", {
      method: "POST",
      body: JSON.stringify({ email: email.trim(), password }),
    })
  }

  async register(userData: {
    name: string
    email: string
    password: string
    organization?: string
  }) {
    if (!userData.name || !userData.email || !userData.password) {
      return {
        error: "Name, email, and password are required",
        status: 400,
      }
    }

    return this.request("/api/v1/auth/register", {
      method: "POST",
      body: JSON.stringify({
        name: userData.name.trim(),
        email: userData.email.trim(),
        password: userData.password,
        organization: userData.organization?.trim(),
      }),
    })
  }

  async verifyToken() {
    return this.request("/api/v1/auth/verify")
  }

  async refreshToken() {
    return this.request("/api/v1/auth/refresh", {
      method: "POST",
    })
  }

  // Project endpoints
  async getProjects(skip = 0, limit = 10) {
    return this.request(`/api/v1/projects?skip=${skip}&limit=${limit}`)
  }

  async createProject(projectData: any) {
    return this.request("/api/v1/projects", {
      method: "POST",
      body: JSON.stringify(projectData),
    })
  }

  // Dataset endpoints
  async getDatasets() {
    return this.request("/api/v1/datasets")
  }

  async uploadDataset(formData: FormData) {
    return this.request("/api/v1/datasets/upload", {
      method: "POST",
      body: formData,
      headers: {}, // Don't set Content-Type for FormData
    })
  }

  // AI Analysis endpoints
  async createAnalysis(analysisData: {
    analysis_type: string
    provider: string
    dataset_id: string
    prompt: string
  }) {
    return this.request("/api/v1/ai/analysis", {
      method: "POST",
      body: JSON.stringify(analysisData),
    })
  }

  async getAnalyses() {
    return this.request("/api/v1/ai/analysis")
  }

  // Geological Graph endpoints
  async createGeologicalNode(nodeData: any) {
    return this.request("/api/v1/geological-graph/nodes", {
      method: "POST",
      body: JSON.stringify(nodeData),
    })
  }

  async getGeologicalNodes() {
    return this.request("/api/v1/geological-graph/nodes")
  }

  // Webhook endpoints
  async createWebhook(webhookData: any) {
    return this.request("/api/v1/webhooks", {
      method: "POST",
      body: JSON.stringify(webhookData),
    })
  }

  // Chained Analysis endpoints
  async createChainedAnalysis(workflowData: any) {
    return this.request("/api/v1/chained-analysis", {
      method: "POST",
      body: JSON.stringify(workflowData),
    })
  }

  async getChainedAnalysisTemplates() {
    return this.request("/api/v1/chained-analysis/templates")
  }
}

// Create singleton instance
const apiClient = new ApiClient(process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000")

export default apiClient
