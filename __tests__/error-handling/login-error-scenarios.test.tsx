import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import { useRouter } from "next/navigation"
import LoginPage from "@/app/login/page"
import { AuthProvider } from "@/lib/auth-context"
import { useToast } from "@/hooks/use-toast"
import jest from "jest" // Import jest to fix the undeclared variable error

// Mock dependencies
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}))

jest.mock("@/hooks/use-toast", () => ({
  useToast: jest.fn(),
}))

// Mock fetch globally
const mockFetch = jest.fn()
global.fetch = mockFetch

const mockPush = jest.fn()
const mockToast = jest.fn()

beforeEach(() => {
  jest.clearAllMocks()
  ;(useRouter as jest.Mock).mockReturnValue({ push: mockPush })
  ;(useToast as jest.Mock).mockReturnValue({ toast: mockToast })

  // Clear localStorage
  Object.defineProperty(window, "localStorage", {
    value: {
      getItem: jest.fn(() => null),
      setItem: jest.fn(),
      removeItem: jest.fn(),
      clear: jest.fn(),
    },
    writable: true,
  })
})

const renderLoginPage = () => {
  return render(
    <AuthProvider>
      <LoginPage />
    </AuthProvider>,
  )
}

describe("Login Error Scenarios", () => {
  describe("Network Errors", () => {
    test("handles network timeout error", async () => {
      mockFetch.mockRejectedValueOnce(new Error("The operation was aborted"))

      renderLoginPage()

      fireEvent.change(screen.getByLabelText(/email/i), {
        target: { value: "test@example.com" },
      })
      fireEvent.change(screen.getByLabelText(/password/i), {
        target: { value: "password123" },
      })

      fireEvent.click(screen.getByRole("button", { name: /sign in/i }))

      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith({
          title: "Login Failed",
          description: expect.stringContaining("timeout"),
          variant: "destructive",
        })
      })
    })

    test("handles network connection error", async () => {
      mockFetch.mockRejectedValueOnce(new Error("Failed to fetch"))

      renderLoginPage()

      fireEvent.change(screen.getByLabelText(/email/i), {
        target: { value: "test@example.com" },
      })
      fireEvent.change(screen.getByLabelText(/password/i), {
        target: { value: "password123" },
      })

      fireEvent.click(screen.getByRole("button", { name: /sign in/i }))

      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith({
          title: "Login Failed",
          description: expect.stringContaining("Network error"),
          variant: "destructive",
        })
      })
    })

    test("handles DNS resolution error", async () => {
      mockFetch.mockRejectedValueOnce(new Error("getaddrinfo ENOTFOUND"))

      renderLoginPage()

      fireEvent.change(screen.getByLabelText(/email/i), {
        target: { value: "test@example.com" },
      })
      fireEvent.change(screen.getByLabelText(/password/i), {
        target: { value: "password123" },
      })

      fireEvent.click(screen.getByRole("button", { name: /sign in/i }))

      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith({
          title: "Login Failed",
          description: expect.stringContaining("connection"),
          variant: "destructive",
        })
      })
    })
  })

  describe("Server Response Errors", () => {
    test("handles 401 unauthorized error", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        statusText: "Unauthorized",
        headers: new Headers({ "content-type": "application/json" }),
        json: async () => ({ detail: "Invalid credentials" }),
        text: async () => JSON.stringify({ detail: "Invalid credentials" }),
      })

      renderLoginPage()

      fireEvent.change(screen.getByLabelText(/email/i), {
        target: { value: "wrong@example.com" },
      })
      fireEvent.change(screen.getByLabelText(/password/i), {
        target: { value: "wrongpassword" },
      })

      fireEvent.click(screen.getByRole("button", { name: /sign in/i }))

      await waitFor(() => {
        expect(screen.getByText(/Invalid email or password/i)).toBeInTheDocument()
      })
    })

    test("handles 429 rate limit error", async () => {
      mockFetch.mockResolvedValueOnce({
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

      renderLoginPage()

      fireEvent.change(screen.getByLabelText(/email/i), {
        target: { value: "test@example.com" },
      })
      fireEvent.change(screen.getByLabelText(/password/i), {
        target: { value: "password123" },
      })

      fireEvent.click(screen.getByRole("button", { name: /sign in/i }))

      await waitFor(() => {
        expect(screen.getByText(/Too many login attempts/i)).toBeInTheDocument()
      })
    })

    test("handles 500 server error", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: "Internal Server Error",
        headers: new Headers({ "content-type": "application/json" }),
        json: async () => ({ detail: "Internal server error" }),
        text: async () => JSON.stringify({ detail: "Internal server error" }),
      })

      renderLoginPage()

      fireEvent.change(screen.getByLabelText(/email/i), {
        target: { value: "test@example.com" },
      })
      fireEvent.change(screen.getByLabelText(/password/i), {
        target: { value: "password123" },
      })

      fireEvent.click(screen.getByRole("button", { name: /sign in/i }))

      await waitFor(() => {
        expect(screen.getByText(/Server error. Please try again later/i)).toBeInTheDocument()
      })
    })
  })

  describe("JSON Parsing Errors", () => {
    test("handles malformed JSON response", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        statusText: "Bad Request",
        headers: new Headers({ "content-type": "application/json" }),
        text: async () => '{"invalid": json}',
      })

      renderLoginPage()

      fireEvent.change(screen.getByLabelText(/email/i), {
        target: { value: "test@example.com" },
      })
      fireEvent.change(screen.getByLabelText(/password/i), {
        target: { value: "password123" },
      })

      fireEvent.click(screen.getByRole("button", { name: /sign in/i }))

      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith({
          title: "Login Failed",
          description: expect.stringContaining("Invalid JSON"),
          variant: "destructive",
        })
      })
    })

    test("handles empty response", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        statusText: "Bad Request",
        headers: new Headers({ "content-type": "application/json" }),
        text: async () => "",
      })

      renderLoginPage()

      fireEvent.change(screen.getByLabelText(/email/i), {
        target: { value: "test@example.com" },
      })
      fireEvent.change(screen.getByLabelText(/password/i), {
        target: { value: "password123" },
      })

      fireEvent.click(screen.getByRole("button", { name: /sign in/i }))

      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith({
          title: "Login Failed",
          description: expect.stringContaining("Empty response"),
          variant: "destructive",
        })
      })
    })

    test("handles non-JSON response", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: "Internal Server Error",
        headers: new Headers({ "content-type": "text/html" }),
        text: async () => "<html><body>Server Error</body></html>",
      })

      renderLoginPage()

      fireEvent.change(screen.getByLabelText(/email/i), {
        target: { value: "test@example.com" },
      })
      fireEvent.change(screen.getByLabelText(/password/i), {
        target: { value: "password123" },
      })

      fireEvent.click(screen.getByRole("button", { name: /sign in/i }))

      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith({
          title: "Login Failed",
          description: expect.stringContaining("Expected JSON response"),
          variant: "destructive",
        })
      })
    })
  })

  describe("Form Validation Errors", () => {
    test("shows error for empty email", async () => {
      renderLoginPage()

      fireEvent.change(screen.getByLabelText(/password/i), {
        target: { value: "password123" },
      })

      fireEvent.click(screen.getByRole("button", { name: /sign in/i }))

      await waitFor(() => {
        expect(screen.getByText(/Email is required/i)).toBeInTheDocument()
      })
    })

    test("shows error for invalid email format", async () => {
      renderLoginPage()

      fireEvent.change(screen.getByLabelText(/email/i), {
        target: { value: "invalid-email" },
      })
      fireEvent.change(screen.getByLabelText(/password/i), {
        target: { value: "password123" },
      })

      fireEvent.click(screen.getByRole("button", { name: /sign in/i }))

      await waitFor(() => {
        expect(screen.getByText(/Please enter a valid email address/i)).toBeInTheDocument()
      })
    })

    test("shows error for empty password", async () => {
      renderLoginPage()

      fireEvent.change(screen.getByLabelText(/email/i), {
        target: { value: "test@example.com" },
      })

      fireEvent.click(screen.getByRole("button", { name: /sign in/i }))

      await waitFor(() => {
        expect(screen.getByText(/Password is required/i)).toBeInTheDocument()
      })
    })
  })

  describe("Success Response Validation", () => {
    test("handles missing access_token in response", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Headers({ "content-type": "application/json" }),
        text: async () => JSON.stringify({ user: { id: 1, name: "Test", email: "test@example.com" } }),
      })

      renderLoginPage()

      fireEvent.change(screen.getByLabelText(/email/i), {
        target: { value: "test@example.com" },
      })
      fireEvent.change(screen.getByLabelText(/password/i), {
        target: { value: "password123" },
      })

      fireEvent.click(screen.getByRole("button", { name: /sign in/i }))

      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith({
          title: "Login Failed",
          description: expect.stringContaining("Invalid response"),
          variant: "destructive",
        })
      })
    })

    test("handles missing user data in response", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Headers({ "content-type": "application/json" }),
        text: async () => JSON.stringify({ access_token: "token123" }),
      })

      renderLoginPage()

      fireEvent.change(screen.getByLabelText(/email/i), {
        target: { value: "test@example.com" },
      })
      fireEvent.change(screen.getByLabelText(/password/i), {
        target: { value: "password123" },
      })

      fireEvent.click(screen.getByRole("button", { name: /sign in/i }))

      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith({
          title: "Login Failed",
          description: expect.stringContaining("Invalid response"),
          variant: "destructive",
        })
      })
    })
  })

  describe("Error Recovery", () => {
    test("clears errors when user starts typing", async () => {
      renderLoginPage()

      // Trigger validation error
      fireEvent.click(screen.getByRole("button", { name: /sign in/i }))

      await waitFor(() => {
        expect(screen.getByText(/Email is required/i)).toBeInTheDocument()
      })

      // Start typing to clear error
      fireEvent.change(screen.getByLabelText(/email/i), {
        target: { value: "t" },
      })

      await waitFor(() => {
        expect(screen.queryByText(/Email is required/i)).not.toBeInTheDocument()
      })
    })

    test("clears login error when user modifies input", async () => {
      mockFetch.mockRejectedValueOnce(new Error("Network error"))

      renderLoginPage()

      fireEvent.change(screen.getByLabelText(/email/i), {
        target: { value: "test@example.com" },
      })
      fireEvent.change(screen.getByLabelText(/password/i), {
        target: { value: "password123" },
      })

      fireEvent.click(screen.getByRole("button", { name: /sign in/i }))

      await waitFor(() => {
        expect(screen.getByText(/Network error/i)).toBeInTheDocument()
      })

      // Modify input to clear error
      fireEvent.change(screen.getByLabelText(/email/i), {
        target: { value: "test2@example.com" },
      })

      await waitFor(() => {
        expect(screen.queryByText(/Network error/i)).not.toBeInTheDocument()
      })
    })
  })
})
