import { jest } from "@jest/globals"
import apiClient from "@/lib/api"

// Mock fetch globally
const mockFetch = jest.fn()
global.fetch = mockFetch

// Mock localStorage
const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}
Object.defineProperty(window, "localStorage", { value: mockLocalStorage })

describe("API Client Error Handling", () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockFetch.mockReset()
    mockLocalStorage.getItem.mockReturnValue(null)
  })

  describe("Network Errors", () => {
    it("should handle fetch timeout", async () => {
      mockFetch.mockImplementation(
        () =>
          new Promise((_, reject) => {
            const error = new Error("Request timeout")
            error.name = "AbortError"
            setTimeout(() => reject(error), 100)
          }),
      )

      const result = await apiClient.login("test@example.com", "password123")

      expect(result.error).toContain("Request timeout")
      expect(result.status).toBe(0)
    })

    it("should handle network connection failure", async () => {
      mockFetch.mockRejectedValue(new Error("Failed to fetch"))

      const result = await apiClient.login("test@example.com", "password123")

      expect(result.error).toContain("Network error")
      expect(result.status).toBe(0)
    })

    it("should handle DNS resolution failure", async () => {
      mockFetch.mockRejectedValue(new Error("getaddrinfo ENOTFOUND"))

      const result = await apiClient.login("test@example.com", "password123")

      expect(result.error).toBe("getaddrinfo ENOTFOUND")
      expect(result.status).toBe(0)
    })
  })

  describe("HTTP Status Code Errors", () => {
    it("should handle 401 Unauthorized", async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 401,
        statusText: "Unauthorized",
        headers: new Headers({ "content-type": "application/json" }),
        text: async () => JSON.stringify({ detail: "Invalid token" }),
      })

      const result = await apiClient.verifyToken()

      expect(result.error).toContain("Authentication required")
      expect(result.status).toBe(401)
    })

    it("should handle 403 Forbidden", async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 403,
        statusText: "Forbidden",
        headers: new Headers({ "content-type": "application/json" }),
        text: async () => JSON.stringify({ detail: "Access denied" }),
      })

      const result = await apiClient.getProjects()

      expect(result.error).toContain("don't have permission")
      expect(result.status).toBe(403)
    })

    it("should handle 404 Not Found", async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 404,
        statusText: "Not Found",
        headers: new Headers({ "content-type": "application/json" }),
        text: async () => JSON.stringify({ detail: "Resource not found" }),
      })

      const result = await apiClient.getProjects()

      expect(result.error).toContain("resource was not found")
      expect(result.status).toBe(404)
    })

    it("should handle 429 Rate Limit", async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 429,
        statusText: "Too Many Requests",
        headers: new Headers({
          "content-type": "application/json",
          "retry-after": "120",
        }),
        text: async () => JSON.stringify({ detail: "Rate limit exceeded" }),
      })

      const result = await apiClient.login("test@example.com", "password123")

      expect(result.error).toContain("Rate limit exceeded")
      expect(result.status).toBe(429)
      expect(result.retryAfter).toBe(120)
    })

    it("should handle 500 Internal Server Error", async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 500,
        statusText: "Internal Server Error",
        headers: new Headers({ "content-type": "application/json" }),
        text: async () => JSON.stringify({ detail: "Database connection failed" }),
      })

      const result = await apiClient.getProjects()

      expect(result.error).toContain("Server error")
      expect(result.status).toBe(500)
    })

    it("should handle 502 Bad Gateway", async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 502,
        statusText: "Bad Gateway",
        headers: new Headers({ "content-type": "text/html" }),
        text: async () => "<html><body>Bad Gateway</body></html>",
      })

      const result = await apiClient.getProjects()

      expect(result.error).toContain("Service temporarily unavailable")
      expect(result.status).toBe(502)
    })

    it("should handle 503 Service Unavailable", async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 503,
        statusText: "Service Unavailable",
        headers: new Headers({ "content-type": "application/json" }),
        text: async () => JSON.stringify({ detail: "Maintenance mode" }),
      })

      const result = await apiClient.getProjects()

      expect(result.error).toContain("Service temporarily unavailable")
      expect(result.status).toBe(503)
    })

    it("should handle 504 Gateway Timeout", async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 504,
        statusText: "Gateway Timeout",
        headers: new Headers({ "content-type": "application/json" }),
        text: async () => JSON.stringify({ detail: "Upstream timeout" }),
      })

      const result = await apiClient.getProjects()

      expect(result.error).toContain("Service temporarily unavailable")
      expect(result.status).toBe(504)
    })
  })

  describe("Response Parsing Errors", () => {
    it("should handle non-JSON response", async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 500,
        statusText: "Internal Server Error",
        headers: new Headers({ "content-type": "text/html" }),
        text: async () => "<html><body>Server Error</body></html>",
      })

      const result = await apiClient.login("test@example.com", "password123")

      expect(result.error).toContain("Expected JSON response")
      expect(result.status).toBe(500)
    })

    it("should handle empty response", async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 500,
        statusText: "Internal Server Error",
        headers: new Headers({ "content-type": "application/json" }),
        text: async () => "",
      })

      const result = await apiClient.login("test@example.com", "password123")

      expect(result.error).toContain("Empty response from server")
      expect(result.status).toBe(500)
    })

    it("should handle malformed JSON", async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 400,
        statusText: "Bad Request",
        headers: new Headers({ "content-type": "application/json" }),
        text: async () => "{ invalid json }",
      })

      const result = await apiClient.login("test@example.com", "password123")

      expect(result.error).toContain("Invalid JSON response")
      expect(result.status).toBe(400)
    })

    it("should handle successful response with malformed JSON", async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        statusText: "OK",
        headers: new Headers({ "content-type": "application/json" }),
        text: async () => "{ invalid json }",
      })

      const result = await apiClient.login("test@example.com", "password123")

      expect(result.error).toContain("Invalid JSON response")
      expect(result.status).toBe(0)
    })
  })

  describe("Input Validation", () => {
    it("should validate login parameters", async () => {
      const result1 = await apiClient.login("", "password123")
      expect(result1.error).toContain("Email and password are required")
      expect(result1.status).toBe(400)

      const result2 = await apiClient.login("test@example.com", "")
      expect(result2.error).toContain("Email and password are required")
      expect(result2.status).toBe(400)
    })

    it("should validate registration parameters", async () => {
      const result1 = await apiClient.register({
        name: "",
        email: "test@example.com",
        password: "password123",
      })
      expect(result1.error).toContain("Name, email, and password are required")
      expect(result1.status).toBe(400)

      const result2 = await apiClient.register({
        name: "Test User",
        email: "",
        password: "password123",
      })
      expect(result2.error).toContain("Name, email, and password are required")
      expect(result2.status).toBe(400)

      const result3 = await apiClient.register({
        name: "Test User",
        email: "test@example.com",
        password: "",
      })
      expect(result3.error).toContain("Name, email, and password are required")
      expect(result3.status).toBe(400)
    })
  })

  describe("Token Management", () => {
    it("should handle token expiration during request", async () => {
      // Mock localStorage to return an expired token
      mockLocalStorage.getItem.mockReturnValue("expired-token")

      // Mock window.location for redirect
      delete (window as any).location
      window.location = { href: "" } as any

      mockFetch.mockResolvedValue({
        ok: false,
        status: 401,
        statusText: "Unauthorized",
        headers: new Headers({ "content-type": "application/json" }),
        text: async () => JSON.stringify({ detail: "Token expired" }),
      })

      const result = await apiClient.getProjects()

      expect(result.error).toContain("Authentication required")
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith("geominer_token")
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith("geominer_user")
      expect(window.location.href).toBe("/login")
    })

    it("should include authorization header when token is available", async () => {
      mockLocalStorage.getItem.mockReturnValue("valid-token")

      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        statusText: "OK",
        headers: new Headers({ "content-type": "application/json" }),
        text: async () => JSON.stringify({ projects: [] }),
      })

      await apiClient.getProjects()

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: "Bearer valid-token",
          }),
        }),
      )
    })
  })

  describe("Content Type Handling", () => {
    it("should handle missing content-type header", async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 500,
        statusText: "Internal Server Error",
        headers: new Headers(),
        text: async () => "Server Error",
      })

      const result = await apiClient.login("test@example.com", "password123")

      expect(result.error).toContain("Expected JSON response")
      expect(result.status).toBe(500)
    })

    it("should handle text/plain content-type", async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 500,
        statusText: "Internal Server Error",
        headers: new Headers({ "content-type": "text/plain" }),
        text: async () => "Plain text error message",
      })

      const result = await apiClient.login("test@example.com", "password123")

      expect(result.error).toContain("Expected JSON response")
      expect(result.status).toBe(500)
    })
  })
})
