import type { AuthResponse } from "@/types/auth"
import type { Project, Dataset, AIAnalysis } from "@/types/api"
import { jest } from "@jest/globals"

// Mock fetch responses
export const createMockResponse = (data: any, status = 200): Response => {
  const response = {
    ok: status >= 200 && status < 300,
    status,
    json: async () => ({ data }),
    headers: new Headers(),
  } as Response

  return response
}

export const createMockErrorResponse = (error: string, code: string, status = 400): Response => {
  const response = {
    ok: false,
    status,
    json: async () => ({ error: { message: error, code } }),
    headers: new Headers(),
  } as Response

  return response
}

// Mock API responses
export const mockAuthResponse: AuthResponse = {
  access_token: "mock-access-token",
  token_type: "bearer",
  user: {
    id: "user-123",
    email: "test@example.com",
    name: "Test User",
    role: "geologist",
    is_active: true,
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  },
}

export const mockProject: Project = {
  id: "project-123",
  name: "Test Project",
  description: "A test geological project",
  location: "Test Location",
  status: "active",
  created_at: "2024-01-01T00:00:00Z",
  updated_at: "2024-01-01T00:00:00Z",
  owner_id: "user-123",
  datasets_count: 5,
  analyses_count: 3,
}

export const mockDataset: Dataset = {
  id: "dataset-123",
  name: "Test Dataset",
  description: "A test geological dataset",
  type: "geochemical",
  project_id: "project-123",
  status: "ready",
  created_at: "2024-01-01T00:00:00Z",
  updated_at: "2024-01-01T00:00:00Z",
  records_count: 1000,
}

export const mockAnalysis: AIAnalysis = {
  id: "analysis-123",
  analysis_type: "geological",
  provider: "openai",
  dataset_id: "dataset-123",
  user_id: "user-123",
  status: "completed",
  progress: 100,
  prompt: "Analyze geological formations",
  result: {
    summary: "Analysis completed successfully",
    recommendations: ["Recommendation 1", "Recommendation 2"],
    confidence_score: 0.85,
  },
  created_at: "2024-01-01T00:00:00Z",
  completed_at: "2024-01-01T00:30:00Z",
  processing_time: 1800,
}

// Setup fetch mocks
export const setupFetchMocks = () => {
  const mockFetch = jest.fn()
  global.fetch = mockFetch

  return {
    mockFetch,
    mockLoginSuccess: () => {
      mockFetch.mockResolvedValueOnce(createMockResponse(mockAuthResponse))
    },
    mockLoginFailure: () => {
      mockFetch.mockResolvedValueOnce(createMockErrorResponse("Invalid credentials", "AUTHENTICATION_ERROR", 401))
    },
    mockProjectsSuccess: () => {
      mockFetch.mockResolvedValueOnce(
        createMockResponse({
          projects: [mockProject],
          total: 1,
          skip: 0,
          limit: 10,
        }),
      )
    },
    mockAnalysisSuccess: () => {
      mockFetch.mockResolvedValueOnce(createMockResponse(mockAnalysis))
    },
    reset: () => {
      mockFetch.mockReset()
    },
  }
}
