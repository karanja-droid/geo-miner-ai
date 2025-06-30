"use client"

import { act, waitFor } from "@testing-library/react"
import { useAuth } from "@/lib/auth-context"
import { renderHookWithProviders } from "../utils/test-hooks"
import { setupFetchMocks } from "../utils/api-mocks"
import jest from "jest" // Import jest to fix the undeclared variable error

describe("AuthContext", () => {
  const fetchMocks = setupFetchMocks()

  beforeEach(() => {
    fetchMocks.reset()
    localStorage.clear()
    jest.clearAllMocks()
  })

  describe("useAuth hook", () => {
    it("should provide initial auth state", () => {
      const { result } = renderHookWithProviders(() => useAuth())

      expect(result.current.user).toBeNull()
      expect(result.current.token).toBeNull()
      expect(result.current.isAuthenticated).toBe(false)
      expect(result.current.isLoading).toBe(true)
    })

    it("should handle successful login", async () => {
      fetchMocks.mockLoginSuccess()
      const { result } = renderHookWithProviders(() => useAuth())

      await act(async () => {
        await result.current.login({
          email: "test@example.com",
          password: "password123",
        })
      })

      await waitFor(() => {
        expect(result.current.isAuthenticated).toBe(true)
        expect(result.current.user).toBeTruthy()
        expect(result.current.token).toBe("mock-access-token")
      })

      expect(localStorage.setItem).toHaveBeenCalledWith("geominer_token", "mock-access-token")
      expect(localStorage.setItem).toHaveBeenCalledWith("geominer_user", expect.stringContaining("test@example.com"))
    })

    it("should handle login failure", async () => {
      fetchMocks.mockLoginFailure()
      const { result } = renderHookWithProviders(() => useAuth())

      await act(async () => {
        try {
          await result.current.login({
            email: "test@example.com",
            password: "wrongpassword",
          })
        } catch (error) {
          expect(error).toBeInstanceOf(Error)
        }
      })

      expect(result.current.isAuthenticated).toBe(false)
      expect(result.current.user).toBeNull()
      expect(result.current.token).toBeNull()
    })

    it("should handle logout", async () => {
      // First login
      fetchMocks.mockLoginSuccess()
      const { result } = renderHookWithProviders(() => useAuth())

      await act(async () => {
        await result.current.login({
          email: "test@example.com",
          password: "password123",
        })
      })

      // Then logout
      act(() => {
        result.current.logout()
      })

      expect(result.current.isAuthenticated).toBe(false)
      expect(result.current.user).toBeNull()
      expect(result.current.token).toBeNull()
      expect(localStorage.removeItem).toHaveBeenCalledWith("geominer_token")
      expect(localStorage.removeItem).toHaveBeenCalledWith("geominer_user")
    })

    it("should restore session from localStorage", () => {
      const mockUser = {
        id: "user-123",
        email: "test@example.com",
        name: "Test User",
        role: "geologist" as const,
        is_active: true,
        created_at: "2024-01-01T00:00:00Z",
        updated_at: "2024-01-01T00:00:00Z",
      }

      localStorage.getItem = jest.fn().mockReturnValueOnce("stored-token").mockReturnValueOnce(JSON.stringify(mockUser))

      const { result } = renderHookWithProviders(() => useAuth())

      expect(result.current.token).toBe("stored-token")
      expect(result.current.user).toEqual(mockUser)
    })
  })
})
