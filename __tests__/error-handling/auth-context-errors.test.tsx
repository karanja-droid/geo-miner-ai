"use client"

import type React from "react"
import { renderHook, act } from "@testing-library/react"
import { useRouter } from "next/navigation"
import { AuthProvider, useAuth } from "@/lib/auth-context"
import { useToast } from "@/hooks/use-toast"
import jest from "jest" // Import jest to declare it

// Mock dependencies
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}))

jest.mock("@/hooks/use-toast", () => ({
  useToast: jest.fn(),
}))

const mockFetch = jest.fn()
global.fetch = mockFetch

const mockPush = jest.fn()
const mockToast = jest.fn()

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

beforeEach(() => {
  jest.clearAllMocks()
  ;(useRouter as jest.Mock).mockReturnValue({ push: mockPush })
  ;(useToast as jest.Mock).mockReturnValue({ toast: mockToast })
  mockLocalStorage.getItem.mockReturnValue(null)
})

const wrapper = ({ children }: { children: React.ReactNode }) => <AuthProvider>{children}</AuthProvider>

describe("Auth Context Error Handling", () => {
  describe("Login Errors", () => {
    test("handles network error during login", async () => {
      mockFetch.mockRejectedValue(new Error("Failed to fetch"))

      const { result } = renderHook(() => useAuth(), { wrapper })

      await act(async () => {
        try {
          await result.current.login("test@example.com", "password")
        } catch (error) {
          // Expected to throw
        }
      })

      expect(mockToast).toHaveBeenCalledWith({
        title: "Login Failed",
        description: expect.stringContaining("Network error"),
        variant: "destructive",
      })
    })

    test("handles invalid credentials error", async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 401,
        statusText: "Unauthorized",
        headers: new Headers({ "content-type": "application/json" }),
        text: async () => JSON.stringify({ detail: "Invalid credentials" }),
      })

      const { result } = renderHook(() => useAuth(), { wrapper })

      await act(async () => {
        try {
          await result.current.login("wrong@example.com", "wrongpassword")
        } catch (error) {
          // Expected to throw
        }
      })

      expect(mockToast).toHaveBeenCalledWith({
        title: "Login Failed",
        description: "Invalid email or password",
        variant: "destructive",
      })
    })

    test("handles malformed response during login", async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        headers: new Headers({ "content-type": "application/json" }),
        text: async () => '{"invalid": json}',
      })

      const { result } = renderHook(() => useAuth(), { wrapper })

      await act(async () => {
        try {
          await result.current.login("test@example.com", "password")
        } catch (error) {
          // Expected to throw
        }
      })

      expect(mockToast).toHaveBeenCalledWith({
        title: "Login Failed",
        description: expect.stringContaining("Invalid JSON"),
        variant: "destructive",
      })
    })

    test("handles missing access_token in login response", async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        headers: new Headers({ "content-type": "application/json" }),
        text: async () => JSON.stringify({ user: { id: 1, name: "Test", email: "test@example.com" } }),
      })

      const { result } = renderHook(() => useAuth(), { wrapper })

      await act(async () => {
        try {
          await result.current.login("test@example.com", "password")
        } catch (error) {
          // Expected to throw
        }
      })

      expect(mockToast).toHaveBeenCalledWith({
        title: "Login Failed",
        description: expect.stringContaining("Invalid response"),
        variant: "destructive",
      })
    })
  })

  describe("Registration Errors", () => {
    test("handles validation error during registration", async () => {
      const { result } = renderHook(() => useAuth(), { wrapper })

      await act(async () => {
        try {
          await result.current.register({
            name: "",
            email: "test@example.com",
            password: "password",
          })
        } catch (error) {
          // Expected to throw
        }
      })

      expect(mockToast).toHaveBeenCalledWith({
        title: "Registration Failed",
        description: expect.stringContaining("required"),
        variant: "destructive",
      })
    })

    test("handles duplicate email error", async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 409,
        statusText: "Conflict",
        headers: new Headers({ "content-type": "application/json" }),
        text: async () => JSON.stringify({ detail: "Email already exists" }),
      })

      const { result } = renderHook(() => useAuth(), { wrapper })

      await act(async () => {
        try {
          await result.current.register({
            name: "Test User",
            email: "existing@example.com",
            password: "password123",
          })
        } catch (error) {
          // Expected to throw
        }
      })

      expect(mockToast).toHaveBeenCalledWith({
        title: "Registration Failed",
        description: expect.stringContaining("already exists"),
        variant: "destructive",
      })
    })
  })

  describe("Token Verification Errors", () => {
    test("handles token verification failure", async () => {
      mockLocalStorage.getItem.mockImplementation((key) => {
        if (key === "geominer_token") return "invalid-token"
        if (key === "geominer_user") return JSON.stringify({ id: 1, name: "Test", email: "test@example.com" })
        return null
      })

      mockFetch.mockResolvedValue({
        ok: false,
        status: 401,
        statusText: "Unauthorized",
        headers: new Headers({ "content-type": "application/json" }),
        text: async () => JSON.stringify({ detail: "Invalid token" }),
      })

      renderHook(() => useAuth(), { wrapper })

      // Wait for useEffect to complete
      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 0))
      })

      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith("geominer_token")
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith("geominer_user")
    })

    test("handles corrupted localStorage data", async () => {
      mockLocalStorage.getItem.mockImplementation((key) => {
        if (key === "geominer_token") return "valid-token"
        if (key === "geominer_user") return "invalid-json"
        return null
      })

      const { result } = renderHook(() => useAuth(), { wrapper })

      // Wait for useEffect to complete
      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 0))
      })

      expect(result.current.user).toBeNull()
      expect(result.current.token).toBeNull()
    })
  })

  describe("Token Refresh Errors", () => {
    test("handles token refresh failure", async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 401,
        statusText: "Unauthorized",
        headers: new Headers({ "content-type": "application/json" }),
        text: async () => JSON.stringify({ detail: "Token expired" }),
      })

      const { result } = renderHook(() => useAuth(), { wrapper })

      // Set initial token
      act(() => {
        result.current.login = jest.fn()
      })

      await act(async () => {
        try {
          await result.current.refreshToken()
        } catch (error) {
          // Expected to fail
        }
      })

      expect(mockPush).toHaveBeenCalledWith("/login")
    })

    test("handles refresh with no token", async () => {
      const { result } = renderHook(() => useAuth(), { wrapper })

      await act(async () => {
        try {
          await result.current.refreshToken()
        } catch (error) {
          // Expected to fail
        }
      })

      expect(mockPush).toHaveBeenCalledWith("/login")
    })
  })

  describe("Storage Errors", () => {
    test("handles localStorage quota exceeded", async () => {
      mockLocalStorage.setItem.mockImplementation(() => {
        throw new Error("QuotaExceededError")
      })

      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        headers: new Headers({ "content-type": "application/json" }),
        text: async () =>
          JSON.stringify({
            access_token: "token123",
            user: { id: 1, name: "Test", email: "test@example.com" },
          }),
      })

      const { result } = renderHook(() => useAuth(), { wrapper })

      await act(async () => {
        await result.current.login("test@example.com", "password")
      })

      // Should still login successfully even if storage fails
      expect(result.current.isAuthenticated).toBe(true)
      expect(mockPush).toHaveBeenCalledWith("/dashboard")
    })

    test("handles localStorage access denied", async () => {
      mockLocalStorage.removeItem.mockImplementation(() => {
        throw new Error("Access denied")
      })

      const { result } = renderHook(() => useAuth(), { wrapper })

      // Should not throw error during logout
      act(() => {
        result.current.logout()
      })

      expect(mockPush).toHaveBeenCalledWith("/login")
    })
  })

  describe("Input Validation", () => {
    test("validates email format in login", async () => {
      const { result } = renderHook(() => useAuth(), { wrapper })

      await act(async () => {
        try {
          await result.current.login("invalid-email", "password")
        } catch (error) {
          // Expected to throw
        }
      })

      expect(mockToast).toHaveBeenCalledWith({
        title: "Login Failed",
        description: expect.stringContaining("valid email"),
        variant: "destructive",
      })
    })

    test("validates password length in registration", async () => {
      const { result } = renderHook(() => useAuth(), { wrapper })

      await act(async () => {
        try {
          await result.current.register({
            name: "Test User",
            email: "test@example.com",
            password: "123",
          })
        } catch (error) {
          // Expected to throw
        }
      })

      expect(mockToast).toHaveBeenCalledWith({
        title: "Registration Failed",
        description: expect.stringContaining("6 characters"),
        variant: "destructive",
      })
    })
  })
})
