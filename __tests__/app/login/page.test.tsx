import { screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import LoginPage from "@/app/login/page"
import { render } from "../utils/test-utils"
import { setupFetchMocks } from "../utils/api-mocks"
import jest from "jest" // Import jest to declare the variable

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

describe("LoginPage", () => {
  const fetchMocks = setupFetchMocks()
  const user = userEvent.setup()

  beforeEach(() => {
    fetchMocks.reset()
    jest.clearAllMocks()
  })

  it("should render login form", () => {
    render(<LoginPage />, { authContext: mockAuthContext })

    expect(screen.getByRole("heading", { name: /sign in/i })).toBeInTheDocument()
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /sign in/i })).toBeInTheDocument()
  })

  it("should show validation errors for empty fields", async () => {
    render(<LoginPage />, { authContext: mockAuthContext })

    const submitButton = screen.getByRole("button", { name: /sign in/i })
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/email is required/i)).toBeInTheDocument()
      expect(screen.getByText(/password is required/i)).toBeInTheDocument()
    })
  })

  it("should handle successful login", async () => {
    mockLogin.mockResolvedValueOnce(undefined)
    render(<LoginPage />, { authContext: mockAuthContext })

    const emailInput = screen.getByLabelText(/email/i)
    const passwordInput = screen.getByLabelText(/password/i)
    const submitButton = screen.getByRole("button", { name: /sign in/i })

    await user.type(emailInput, "test@example.com")
    await user.type(passwordInput, "password123")
    await user.click(submitButton)

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith({
        email: "test@example.com",
        password: "password123",
      })
    })
  })

  it("should handle login failure", async () => {
    mockLogin.mockRejectedValueOnce(new Error("Invalid credentials"))
    render(<LoginPage />, { authContext: mockAuthContext })

    const emailInput = screen.getByLabelText(/email/i)
    const passwordInput = screen.getByLabelText(/password/i)
    const submitButton = screen.getByRole("button", { name: /sign in/i })

    await user.type(emailInput, "test@example.com")
    await user.type(passwordInput, "wrongpassword")
    await user.click(submitButton)

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalled()
    })
  })

  it("should toggle password visibility", async () => {
    render(<LoginPage />, { authContext: mockAuthContext })

    const passwordInput = screen.getByLabelText(/password/i)
    const toggleButton = screen.getByRole("button", { name: "" }) // Eye icon button

    expect(passwordInput).toHaveAttribute("type", "password")

    await user.click(toggleButton)
    expect(passwordInput).toHaveAttribute("type", "text")

    await user.click(toggleButton)
    expect(passwordInput).toHaveAttribute("type", "password")
  })

  it("should show loading state during submission", async () => {
    const mockLoadingContext = { ...mockAuthContext, isLoading: true }
    render(<LoginPage />, { authContext: mockLoadingContext })

    const submitButton = screen.getByRole("button", { name: /signing in/i })
    expect(submitButton).toBeDisabled()
    expect(screen.getByText(/signing in/i)).toBeInTheDocument()
  })
})
