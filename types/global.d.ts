// Global type definitions for the GeoMiner AI application

declare global {
  interface Window {
    gtag?: (...args: any[]) => void
  }
}

// Environment variables
declare namespace NodeJS {
  interface ProcessEnv {
    readonly NODE_ENV: "development" | "production" | "test"
    readonly NEXT_PUBLIC_API_URL: string
    readonly NEXT_PUBLIC_WS_URL: string

    // Server-only environment variables
    readonly MAPBOX_TOKEN: string
    readonly DATABASE_URL: string
    readonly JWT_SECRET: string
    readonly API_SECRET_KEY: string
    readonly NEXT_PUBLIC_SENTRY_DSN?: string
    readonly NEXT_PUBLIC_GA_TRACKING_ID?: string
  }
}

// API Response types
export interface ApiError {
  code: string
  message: string
  details?: Record<string, unknown>
}

export interface ApiResponse<T = unknown> {
  data?: T
  error?: ApiError
  status: number
  retryAfter?: number
}

// Pagination types
export interface PaginationParams {
  skip?: number
  limit?: number
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    skip: number
    limit: number
    total: number
    has_more: boolean
  }
}

// Map types
export interface MapConfig {
  center: [number, number]
  zoom: number
  style: string
}

export interface GeologicalLayer {
  id: string
  name: string
  type: "geological" | "topographic" | "satellite" | "mineral"
  visible: boolean
  opacity: number
  data?: any
}
