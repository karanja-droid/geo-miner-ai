import apiClient from "@/lib/api"
import jest from "jest" // Import jest to declare the variable

// Mock fetch globally
const mockFetch = jest.fn()
global.fetch = mockFetch

// Mock localStorage
const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}

Object.defineProperty(window, "localStorage", {
  value: mockLocalStorage,
  writable: true,
})

// Mock window.location
delete (window as any).location
window.location = { href: "" } as any

beforeEach(() => {
  jest.clearAllMocks()
  mockFetch.mockClear()
  mockLocalStorage.getItem.mockReturnValue(null)
})

describe("API Client Error Handling", () => {
  describe("Network Errors", () => {
    test("handles fetch timeout", async () => {
      mockFetch.mockImplementation(
        () => new Promise((_, reject) => setTimeout(() => reject(new Error("The operation was aborted")), 100)),
      )

      const result = await apiClient.login("test@example.com", "password")

      expect(result.error).toContain("timeout")
      expect(result.status).toBe(0)
    })

    test("handles network connection failure", async () => {
      mockFetch.mockRejectedValue(new Error("Failed to fetch"))

      const result = await apiClient.login("test@example.com", "password")

      expect(result.error).toContain("Network error")
      expect(result.status).toBe(0)
    })

    test("handles DNS resolution failure", async () => {
      mockFetch.mockRejectedValue(new Error("getaddrinfo ENOTFOUND api.example.com"))

      const result = await apiClient.login("test@example.com", "password")

      expect(result.error).toBeTruthy()
      expect(result.status).toBe(0)
    })
  })

  describe("HTTP Status Code Handling", () => {
    test("handles 401 unauthorized", async () => {
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
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith("geominer_token")
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith("geominer_user")
    })

    test("handles 403 forbidden", async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 403,
        statusText: "Forbidden",
        headers: new Headers({ "content-type": "application/json" }),
        text: async () => JSON.stringify({ detail: "Access denied" }),
      })

      const result = await apiClient.getProjects()

      expect(result.error).toContain("permission")
      expect(result.status).toBe(403)
    })

    test("handles 404 not found", async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 404,
        statusText: "Not Found",
        headers: new Headers({ "content-type": "application/json" }),
        text: async () => JSON.stringify({ detail: "Resource not found" }),
      })

      const result = await apiClient.getProjects()

      expect(result.error).toContain("not found")
      expect(result.status).toBe(404)
    })

    test("handles 429 rate limit", async () => {
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

      const result = await apiClient.login("test@example.com", "password")

      expect(result.error).toContain("Rate limit exceeded")
      expect(result.status).toBe(429)
      expect(result.retryAfter).toBe(120)
    })

    test("handles 500 server error", async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 500,
        statusText: "Internal Server Error",
        headers: new Headers({ "content-type": "application/json" }),
        text: async () => JSON.stringify({ detail: "Server error" }),
      })

      const result = await apiClient.getProjects()

      expect(result.error).toContain("Server error")
      expect(result.status).toBe(500)
    })

    test("handles 502 bad gateway", async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 502,
        statusText: "Bad Gateway",
        headers: new Headers({ "content-type": "application/json" }),
        text: async () => JSON.stringify({ detail: "Bad gateway" }),
      })

      const result = await apiClient.getProjects()

      expect(result.error).toContain("temporarily unavailable")
      expect(result.status).toBe(502)
    })
  })

  describe("Response Parsing Errors", () => {
    test("handles non-JSON content type", async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 500,
        statusText: "Internal Server Error",
        headers: new Headers({ "content-type": "text/html" }),
        text: async () => "<html><body>Error</body></html>",
      })

      const result = await apiClient.login("test@example.com", "password")

      expect(result.error).toContain("non-JSON response")
      expect(result.status).toBe(500)
    })

    test("handles empty response body", async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 400,
        statusText: "Bad Request",
        headers: new Headers({ "content-type": "application/json" }),
        text: async () => "",
      })

      const result = await apiClient.login("test@example.com", "password")

      expect(result.error).toContain("Empty response")
      expect(result.status).toBe(400)
    })

    test("handles malformed JSON", async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 400,
        statusText: "Bad Request",
        headers: new Headers({ "content-type": "application/json" }),
        text: async () => '{"invalid": json}',
      })

      const result = await apiClient.login("test@example.com", "password")

      expect(result.error).toContain("Invalid JSON")
      expect(result.status).toBe(400)
    })

    test("handles successful response with malformed JSON", async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        statusText: "OK",
        headers: new Headers({ "content-type": "application/json" }),
        text: async () => '{"access_token": "token", "user":}',
      })

      const result = await apiClient.login("test@example.com", "password")

      expect(result.error).toContain("Invalid JSON")
      expect(result.status).toBe(0)
    })
  })

  describe("Input Validation", () => {
    test("validates login parameters", async () => {
      const result1 = await apiClient.login("", "password")
      expect(result1.error).toContain("required")
      expect(result1.status).toBe(400)

      const result2 = await apiClient.login("test@example.com", "")
      expect(result2.error).toContain("required")
      expect(result2.status).toBe(400)
    })

    test("validates registration parameters", async () => {
      const result = await apiClient.register({
        name: "",
        email: "test@example.com",
        password: "password",
      })

      expect(result.error).toContain("required")
      expect(result.status).toBe(400)
    })
  })

  describe("Token Management", () => {
    test("includes token in authenticated requests", async () => {
      apiClient.setToken("test-token")

      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        headers: new Headers({ "content-type": "application/json" }),
        text: async () => JSON.stringify({ projects: [] }),
      })

      await apiClient.getProjects()

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: "Bearer test-token",
          }),
        }),
      )
    })

    test("handles requests without token", async () => {
      apiClient.setToken(null)

      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        headers: new Headers({ "content-type": "application/json" }),
        text: async () =>
          JSON.stringify({ access_token: "token", user: { id: 1, name: "Test", email: "test@example.com" } }),
      })

      await apiClient.login("test@example.com", "password")

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.not.objectContaining({
            Authorization: expect.any(String),
          }),
        }),
      )
    })
  })

  describe("FormData Handling", () => {
    test("handles FormData uploads correctly", async () => {
      const formData = new FormData()
      formData.append("file", new Blob(["test"], { type: "text/plain" }))

      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        headers: new Headers({ "content-type": "application/json" }),
        text: async () => JSON.stringify({ success: true }),
      })

      await apiClient.uploadDataset(formData)

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          method: "POST",
          body: formData,
          headers: expect.not.objectContaining({
            "Content-Type": expect.any(String),
          }),
        }),
      )
    })
  })
})
