import { screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { jest } from "@jest/globals"
import LoginPage from "@/app/login/page"
import { render } from "../utils/test-utils"

// Mock the auth context
const mockLogin = jest.fn()
const mockAuthContext = {
  user: null,
  token: null,
  login: mockLogin,
  logout: jest.fn(),
  register: jest.fn(),
  isLoading: false,
  isAuthenticated: false,
  refreshToken: jest.fn(),
}

// Mock fetch globally
const mockFetch = jest.fn()
global.fetch = mockFetch

describe("Login Error Scenarios", () => {
  const user = userEvent.setup()

  beforeEach(() => {
    jest.clearAllMocks()
    mockFetch.mockReset()
  })

  describe("Network Errors", () => {
    it("should handle network timeout", async () => {
      mockFetch.mockImplementation(
        () => new Promise((_, reject) => setTimeout(() => reject(new Error("AbortError")), 100)),
      )

      render(<LoginPage />, { authContext: mockAuthContext })

      const emailInput = screen.getByLabelText(/email/i)
      const passwordInput = screen.getByLabelText(/password/i)
      const submitButton = screen.getByRole("button", { name: /sign in/i })

      await user.type(emailInput, "test@example.com")
      await user.type(passwordInput, "password123")
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText(/request timeout/i)).toBeInTheDocument()
      })
    })

    it("should handle network connection failure", async () => {
      mockFetch.mockRejectedValue(new Error("Failed to fetch"))

      render(<LoginPage />, { authContext: mockAuthContext })

      const emailInput = screen.getByLabelText(/email/i)
      const passwordInput = screen.getByLabelText(/password/i)
      const submitButton = screen.getByRole("button", { name: /sign in/i })

      await user.type(emailInput, "test@example.com")
      await user.type(passwordInput, "password123")
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText(/network error/i)).toBeInTheDocument()
      })
    })

    it("should handle server unavailable (503)", async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 503,
        statusText: "Service Unavailable",
        headers: new Headers({ "content-type": "application/json" }),
        json: async () => ({ detail: "Service temporarily unavailable" }),
        text: async () => JSON.stringify({ detail: "Service temporarily unavailable" }),
      })

      render(<LoginPage />, { authContext: mockAuthContext })

      const emailInput = screen.getByLabelText(/email/i)
      const passwordInput = screen.getByLabelText(/password/i)
      const submitButton = screen.getByRole("button", { name: /sign in/i })

      await user.type(emailInput, "test@example.com")
      await user.type(passwordInput, "password123")
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText(/service temporarily unavailable/i)).toBeInTheDocument()
      })
    })
  })

  describe("JSON Parsing Errors", () => {
    it("should handle malformed JSON response", async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 400,
        statusText: "Bad Request",
        headers: new Headers({ "content-type": "application/json" }),
        json: async () => {
          throw new Error("Unexpected token")
        },
        text: async () => "{ invalid json }",
      })

      render(<LoginPage />, { authContext: mockAuthContext })

      const emailInput = screen.getByLabelText(/email/i)
      const passwordInput = screen.getByLabelText(/password/i)
      const submitButton = screen.getByRole("button", { name: /sign in/i })

      await user.type(emailInput, "test@example.com")
      await user.type(passwordInput, "password123")
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText(/invalid json response/i)).toBeInTheDocument()
      })
    })

    it("should handle empty response", async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 500,
        statusText: "Internal Server Error",
        headers: new Headers({ "content-type": "application/json" }),
        json: async () => ({}),
        text: async () => "",
      })

      render(<LoginPage />, { authContext: mockAuthContext })

      const emailInput = screen.getByLabelText(/email/i)
      const passwordInput = screen.getByLabelText(/password/i)
      const submitButton = screen.getByRole("button", { name: /sign in/i })

      await user.type(emailInput, "test@example.com")
      await user.type(passwordInput, "password123")
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText(/empty response/i)).toBeInTheDocument()
      })
    })

    it("should handle non-JSON response", async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 500,
        statusText: "Internal Server Error",
        headers: new Headers({ "content-type": "text/html" }),
        json: async () => {
          throw new Error("Not JSON")
        },
        text: async () => "<html><body>Server Error</body></html>",
      })

      render(<LoginPage />, { authContext: mockAuthContext })

      const emailInput = screen.getByLabelText(/email/i)
      const passwordInput = screen.getByLabelText(/password/i)
      const submitButton = screen.getByRole("button", { name: /sign in/i })

      await user.type(emailInput, "test@example.com")
      await user.type(passwordInput, "password123")
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText(/expected json response/i)).toBeInTheDocument()
      })
    })
  })

  describe("Authentication Errors", () => {
    it("should handle invalid credentials (401)", async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 401,
        statusText: "Unauthorized",
        headers: new Headers({ "content-type": "application/json" }),
        json: async () => ({ detail: "Invalid credentials" }),
        text: async () => JSON.stringify({ detail: "Invalid credentials" }),
      })

      render(<LoginPage />, { authContext: mockAuthContext })

      const emailInput = screen.getByLabelText(/email/i)
      const passwordInput = screen.getByLabelText(/password/i)
      const submitButton = screen.getByRole("button", { name: /sign in/i })

      await user.type(emailInput, "wrong@example.com")
      await user.type(passwordInput, "wrongpassword")
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText(/invalid email or password/i)).toBeInTheDocument()
      })
    })

    it("should handle account disabled (403)", async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 403,
        statusText: "Forbidden",
        headers: new Headers({ "content-type": "application/json" }),
        json: async () => ({ detail: "Account is disabled" }),
        text: async () => JSON.stringify({ detail: "Account is disabled" }),
      })

      render(<LoginPage />, { authContext: mockAuthContext })

      const emailInput = screen.getByLabelText(/email/i)
      const passwordInput = screen.getByLabelText(/password/i)
      const submitButton = screen.getByRole("button", { name: /sign in/i })

      await user.type(emailInput, "disabled@example.com")
      await user.type(passwordInput, "password123")
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText(/account is disabled/i)).toBeInTheDocument()
      })
    })

    it("should handle rate limiting (429)", async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 429,
        statusText: "Too Many Requests",
        headers: new Headers({
          "content-type": "application/json",
          "retry-after": "60",
        }),
        json: async () => ({ detail: "Rate limit exceeded" }),
        text: async () => JSON.stringify({ detail: "Rate limit exceeded" }),
      })

      render(<LoginPage />, { authContext: mockAuthContext })

      const emailInput = screen.getByLabelText(/email/i)
      const passwordInput = screen.getByLabelText(/password/i)
      const submitButton = screen.getByRole("button", { name: /sign in/i })

      await user.type(emailInput, "test@example.com")
      await user.type(passwordInput, "password123")
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText(/too many login attempts/i)).toBeInTheDocument()
      })
    })
  })

  describe("Response Structure Errors", () => {
    it("should handle missing access_token in response", async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        statusText: "OK",
        headers: new Headers({ "content-type": "application/json" }),
        json: async () => ({ user: { id: "123", email: "test@example.com", name: "Test" } }),
        text: async () => JSON.stringify({ user: { id: "123", email: "test@example.com", name: "Test" } }),
      })

      render(<LoginPage />, { authContext: mockAuthContext })

      const emailInput = screen.getByLabelText(/email/i)
      const passwordInput = screen.getByLabelText(/password/i)
      const submitButton = screen.getByRole("button", { name: /sign in/i })

      await user.type(emailInput, "test@example.com")
      await user.type(passwordInput, "password123")
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText(/invalid response from server/i)).toBeInTheDocument()
      })
    })

    it("should handle missing user data in response", async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        statusText: "OK",
        headers: new Headers({ "content-type": "application/json" }),
        json: async () => ({ access_token: "token123" }),
        text: async () => JSON.stringify({ access_token: "token123" }),
      })

      render(<LoginPage />, { authContext: mockAuthContext })

      const emailInput = screen.getByLabelText(/email/i)
      const passwordInput = screen.getByLabelText(/password/i)
      const submitButton = screen.getByRole("button", { name: /sign in/i })

      await user.type(emailInput, "test@example.com")
      await user.type(passwordInput, "password123")
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText(/invalid response from server/i)).toBeInTheDocument()
      })
    })

    it("should handle incomplete user data", async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        statusText: "OK",
        headers: new Headers({ "content-type": "application/json" }),
        json: async () => ({
          access_token: "token123",
          user: { email: "test@example.com" }, // Missing id and name
        }),
        text: async () =>
          JSON.stringify({
            access_token: "token123",
            user: { email: "test@example.com" },
          }),
      })

      render(<LoginPage />, { authContext: mockAuthContext })

      const emailInput = screen.getByLabelText(/email/i)
      const passwordInput = screen.getByLabelText(/password/i)
      const submitButton = screen.getByRole("button", { name: /sign in/i })

      await user.type(emailInput, "test@example.com")
      await user.type(passwordInput, "password123")
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText(/invalid user data from server/i)).toBeInTheDocument()
      })
    })
  })

  describe("Form Validation Errors", () => {
    it("should handle empty email", async () => {
      render(<LoginPage />, { authContext: mockAuthContext })

      const passwordInput = screen.getByLabelText(/password/i)
      const submitButton = screen.getByRole("button", { name: /sign in/i })

      await user.type(passwordInput, "password123")
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText(/email is required/i)).toBeInTheDocument()
      })
    })

    it("should handle invalid email format", async () => {
      render(<LoginPage />, { authContext: mockAuthContext })

      const emailInput = screen.getByLabelText(/email/i)
      const passwordInput = screen.getByLabelText(/password/i)
      const submitButton = screen.getByRole("button", { name: /sign in/i })

      await user.type(emailInput, "invalid-email")
      await user.type(passwordInput, "password123")
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText(/please enter a valid email address/i)).toBeInTheDocument()
      })
    })

    it("should handle empty password", async () => {
      render(<LoginPage />, { authContext: mockAuthContext })

      const emailInput = screen.getByLabelText(/email/i)
      const submitButton = screen.getByRole("button", { name: /sign in/i })

      await user.type(emailInput, "test@example.com")
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText(/password is required/i)).toBeInTheDocument()
      })
    })

    it("should handle short password", async () => {
      render(<LoginPage />, { authContext: mockAuthContext })

      const emailInput = screen.getByLabelText(/email/i)
      const passwordInput = screen.getByLabelText(/password/i)
      const submitButton = screen.getByRole("button", { name: /sign in/i })

      await user.type(emailInput, "test@example.com")
      await user.type(passwordInput, "12")
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText(/password must be at least 3 characters/i)).toBeInTheDocument()
      })
    })
  })

  describe("Error Recovery", () => {
    it("should clear errors when user starts typing", async () => {
      render(<LoginPage />, { authContext: mockAuthContext })

      const emailInput = screen.getByLabelText(/email/i)
      const submitButton = screen.getByRole("button", { name: /sign in/i })

      // Trigger validation error
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText(/email is required/i)).toBeInTheDocument()
      })

      // Start typing to clear error
      await user.type(emailInput, "test@example.com")

      await waitFor(() => {
        expect(screen.queryByText(/email is required/i)).not.toBeInTheDocument()
      })
    })

    it("should clear login error when user modifies input", async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 401,
        statusText: "Unauthorized",
        headers: new Headers({ "content-type": "application/json" }),
        json: async () => ({ detail: "Invalid credentials" }),
        text: async () => JSON.stringify({ detail: "Invalid credentials" }),
      })

      render(<LoginPage />, { authContext: mockAuthContext })

      const emailInput = screen.getByLabelText(/email/i)
      const passwordInput = screen.getByLabelText(/password/i)
      const submitButton = screen.getByRole("button", { name: /sign in/i })

      await user.type(emailInput, "wrong@example.com")
      await user.type(passwordInput, "wrongpassword")
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText(/invalid email or password/i)).toBeInTheDocument()
      })

      // Modify input to clear error
      await user.clear(emailInput)
      await user.type(emailInput, "correct@example.com")

      await waitFor(() => {
        expect(screen.queryByText(/invalid email or password/i)).not.toBeInTheDocument()
      })
    })
  })
})
