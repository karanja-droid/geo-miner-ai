"use client"

import { renderHook, act, waitFor } from "@testing-library/react"
import { jest } from "@jest/globals"
import { AuthProvider, useAuth } from "@/lib/auth-context"
import type { ReactNode } from "react"

// Mock Next.js router
const mockPush = jest.fn()
jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}))

// Mock toast
const mockToast = jest.fn()
jest.mock("@/hooks/use-toast", () => ({
  useToast: () => ({
    toast: mockToast,
  }),
}))

// Mock fetch
const mockFetch = jest.fn()
global.fetch = mockFetch

// Mock localStorage
const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}
Object.defineProperty(window, "localStorage", { value: mockLocalStorage })

const wrapper = ({ children }: { children: ReactNode }) => <AuthProvider>{children}</AuthProvider>

describe("Auth Context Error Handling", () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockFetch.mockReset()
    mockLocalStorage.getItem.mockReturnValue(null)
    mockPush.mockReset()
    mockToast.mockReset()
  })

  describe("Login Error Scenarios", () => {
    it("should handle network timeout during login", async () => {
      mockFetch.mockImplementation(
        () =>
          new Promise((_, reject) => {
            const error = new Error("Request timeout")
            error.name = "AbortError"
            setTimeout(() => reject(error), 100)
          }),
      )

      const { result } = renderHook(() => useAuth(), { wrapper })

      await act(async () => {
        try {
          await result.current.login("test@example.com", "password123")
        } catch (error) {
          expect(error).toBeInstanceOf(Error)
        }
      })

      expect(mockToast).toHaveBeenCalledWith({
        title: "Login Failed",
        description: expect.stringContaining("timeout"),
        variant: "destructive",
      })
    })

    it("should handle malformed JSON response during login", async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        statusText: "OK",
        headers: new Headers({ "content-type": "application/json" }),
        text: async () => "{ invalid json }",
      })

      const { result } = renderHook(() => useAuth(), { wrapper })

      await act(async () => {
        try {
          await result.current.login("test@example.com", "password123")
        } catch (error) {
          expect(error).toBeInstanceOf(Error)
        }
      })

      expect(mockToast).toHaveBeenCalledWith({
        title: "Login Failed",
        description: expect.stringContaining("Invalid JSON"),
        variant: "destructive",
      })
    })

    it("should handle missing access_token in login response", async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        statusText: "OK",
        headers: new Headers({ "content-type": "application/json" }),
        text: async () =>
          JSON.stringify({
            user: { id: "123", email: "test@example.com", name: "Test User" },
          }),
      })

      const { result } = renderHook(() => useAuth(), { wrapper })

      await act(async () => {
        try {
          await result.current.login("test@example.com", "password123")
        } catch (error) {
          expect(error).toBeInstanceOf(Error)
        }
      })

      expect(mockToast).toHaveBeenCalledWith({
        title: "Login Failed",
        description: "Invalid response from server",
        variant: "destructive",
      })
    })

    it("should handle missing user data in login response", async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        statusText: "OK",
        headers: new Headers({ "content-type": "application/json" }),
        text: async () =>
          JSON.stringify({
            access_token: "token123",
          }),
      })

      const { result } = renderHook(() => useAuth(), { wrapper })

      await act(async () => {
        try {
          await result.current.login("test@example.com", "password123")
        } catch (error) {
          expect(error).toBeInstanceOf(Error)
        }
      })

      expect(mockToast).toHaveBeenCalledWith({
        title: "Login Failed",
        description: "Invalid response from server",
        variant: "destructive",
      })
    })

    it("should handle incomplete user data in login response", async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        statusText: "OK",
        headers: new Headers({ "content-type": "application/json" }),
        text: async () =>
          JSON.stringify({
            access_token: "token123",
            user: { email: "test@example.com" }, // Missing id and name
          }),
      })

      const { result } = renderHook(() => useAuth(), { wrapper })

      await act(async () => {
        try {
          await result.current.login("test@example.com", "password123")
        } catch (error) {
          expect(error).toBeInstanceOf(Error)
        }
      })

      expect(mockToast).toHaveBeenCalledWith({
        title: "Login Failed",
        description: "Invalid user data from server",
        variant: "destructive",
      })
    })

    it("should handle localStorage errors during login", async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        statusText: "OK",
        headers: new Headers({ "content-type": "application/json" }),
        text: async () =>
          JSON.stringify({
            access_token: "token123",
            user: {
              id: "123",
              email: "test@example.com",
              name: "Test User",
              role: "user",
              is_active: true,
              created_at: "2024-01-01",
              updated_at: "2024-01-01",
            },
          }),
      })

      mockLocalStorage.setItem.mockImplementation(() => {
        throw new Error("Storage quota exceeded")
      })

      const { result } = renderHook(() => useAuth(), { wrapper })

      await act(async () => {
        await result.current.login("test@example.com", "password123")
      })

      // Should still succeed even if localStorage fails
      expect(result.current.isAuthenticated).toBe(true)
      expect(mockToast).toHaveBeenCalledWith({
        title: "Login Successful",
        description: expect.stringContaining("Welcome back"),
      })
    })
  })

  describe("Registration Error Scenarios", () => {
    it("should handle validation errors during registration", async () => {
      const { result } = renderHook(() => useAuth(), { wrapper })

      await act(async () => {
        try {
          await result.current.register({
            name: "",
            email: "test@example.com",
            password: "password123",
          })
        } catch (error) {
          expect(error).toBeInstanceOf(Error)
        }
      })

      expect(mockToast).toHaveBeenCalledWith({
        title: "Registration Failed",
        description: "Name, email, and password are required",
        variant: "destructive",
      })
    })

    it("should handle invalid email during registration", async () => {
      const { result } = renderHook(() => useAuth(), { wrapper })

      await act(async () => {
        try {
          await result.current.register({
            name: "Test User",
            email: "invalid-email",
            password: "password123",
          })
        } catch (error) {
          expect(error).toBeInstanceOf(Error)
        }
      })

      expect(mockToast).toHaveBeenCalledWith({
        title: "Registration Failed",
        description: "Please enter a valid email address",
        variant: "destructive",
      })
    })

    it("should handle short password during registration", async () => {
      const { result } = renderHook(() => useAuth(), { wrapper })

      await act(async () => {
        try {
          await result.current.register({
            name: "Test User",
            email: "test@example.com",
            password: "123",
          })
        } catch (error) {
          expect(error).toBeInstanceOf(Error)
        }
      })

      expect(mockToast).toHaveBeenCalledWith({
        title: "Registration Failed",
        description: "Password must be at least 6 characters long",
        variant: "destructive",
      })
    })

    it("should handle 409 conflict during registration", async () => {
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
          expect(error).toBeInstanceOf(Error)
        }
      })

      expect(mockToast).toHaveBeenCalledWith({
        title: "Registration Failed",
        description: "An account with this email already exists",
        variant: "destructive",
      })
    })
  })

  describe("Token Verification Errors", () => {
    it("should handle token verification failure", async () => {
      mockLocalStorage.getItem.mockImplementation((key) => {
        if (key === "geominer_token") return "invalid-token"
        if (key === "geominer_user")
          return JSON.stringify({
            id: "123",
            email: "test@example.com",
            name: "Test User",
          })
        return null
      })

      mockFetch.mockResolvedValue({
        ok: false,
        status: 401,
        statusText: "Unauthorized",
        headers: new Headers({ "content-type": "application/json" }),
        text: async () => JSON.stringify({ detail: "Invalid token" }),
      })

      const { result } = renderHook(() => useAuth(), { wrapper })

      await waitFor(() => {
        expect(result.current.isAuthenticated).toBe(false)
      })

      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith("geominer_token")
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith("geominer_user")
    })

    it("should handle corrupted stored user data", async () => {
      mockLocalStorage.getItem.mockImplementation((key) => {
        if (key === "geominer_token") return "valid-token"
        if (key === "geominer_user") return "{ invalid json }"
        return null
      })

      const { result } = renderHook(() => useAuth(), { wrapper })

      await waitFor(() => {
        expect(result.current.isAuthenticated).toBe(false)
      })

      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith("geominer_token")
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith("geominer_user")
    })
  })

  describe("Token Refresh Errors", () => {
    it("should handle token refresh failure", async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 401,
        statusText: "Unauthorized",
        headers: new Headers({ "content-type": "application/json" }),
        text: async () => JSON.stringify({ detail: "Refresh token expired" }),
      })

      const { result } = renderHook(() => useAuth(), { wrapper })

      // Set initial authenticated state
      act(() => {
        result.current.user = {
          id: "123",
          email: "test@example.com",
          name: "Test User",
          role: "user",
          is_active: true,
          created_at: "2024-01-01",
          updated_at: "2024-01-01",
        }
        result.current.token = "expired-token"
      })

      await act(async () => {
        await result.current.refreshToken()
      })

      expect(result.current.isAuthenticated).toBe(false)
      expect(mockPush).toHaveBeenCalledWith("/login")
    })

    it("should handle invalid refresh response", async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        statusText: "OK",
        headers: new Headers({ "content-type": "application/json" }),
        text: async () => JSON.stringify({}), // Missing access_token
      })

      const { result } = renderHook(() => useAuth(), { wrapper })

      // Set initial authenticated state
      act(() => {
        result.current.user = {
          id: "123",
          email: "test@example.com",
          name: "Test User",
          role: "user",
          is_active: true,
          created_at: "2024-01-01",
          updated_at: "2024-01-01",
        }
        result.current.token = "valid-token"
      })

      await act(async () => {
        await result.current.refreshToken()
      })

      expect(result.current.isAuthenticated).toBe(false)
      expect(mockPush).toHaveBeenCalledWith("/login")
    })
  })

  describe("Logout Error Handling", () => {
    it("should handle localStorage errors during logout", async () => {
      mockLocalStorage.removeItem.mockImplementation(() => {
        throw new Error("Storage access denied")
      })

      const { result } = renderHook(() => useAuth(), { wrapper })

      // Set initial authenticated state
      act(() => {
        result.current.user = {
          id: "123",
          email: "test@example.com",
          name: "Test User",
          role: "user",
          is_active: true,
          created_at: "2024-01-01",
          updated_at: "2024-01-01",
        }
        result.current.token = "valid-token"
      })

      act(() => {
        result.current.logout()
      })

      // Should still log out even if localStorage fails
      expect(result.current.isAuthenticated).toBe(false)
      expect(mockPush).toHaveBeenCalledWith("/login")
      expect(mockToast).toHaveBeenCalledWith({
        title: "Logged Out",
        description: "You have been successfully logged out",
      })
    })
  })
})
