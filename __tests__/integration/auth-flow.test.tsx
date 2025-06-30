import { screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { render } from "../utils/test-utils"
import LoginPage from "@/app/login/page"
import { Dashboard } from "@/components/dashboard"
import { setupFetchMocks } from "../utils/api-mocks"
import jest from "jest" // Import jest to declare the variable

describe("Authentication Flow Integration", () => {
  const fetchMocks = setupFetchMocks()
  const user = userEvent.setup()

  beforeEach(() => {
    fetchMocks.reset()
    localStorage.clear()
    jest.clearAllMocks()
  })

  it("should complete full login flow", async () => {
    fetchMocks.mockLoginSuccess()

    // Start with login page
    const { rerender } = render(<LoginPage />)

    // Fill in login form
    await user.type(screen.getByLabelText(/email/i), "test@example.com")
    await user.type(screen.getByLabelText(/password/i), "password123")
    await user.click(screen.getByRole("button", { name: /sign in/i }))

    // Wait for login to complete
    await waitFor(() => {
      expect(fetchMocks.mockFetch).toHaveBeenCalledWith(
        "http://localhost:8000/api/v1/auth/login",
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify({
            email: "test@example.com",
            password: "password123",
          }),
        }),
      )
    })

    // Simulate navigation to dashboard
    rerender(<Dashboard />)

    // Verify dashboard is rendered
    expect(screen.getByText(/geological exploration dashboard/i)).toBeInTheDocument()
  })

  it("should handle login failure gracefully", async () => {
    fetchMocks.mockLoginFailure()

    render(<LoginPage />)

    await user.type(screen.getByLabelText(/email/i), "test@example.com")
    await user.type(screen.getByLabelText(/password/i), "wrongpassword")
    await user.click(screen.getByRole("button", { name: /sign in/i }))

    await waitFor(() => {
      expect(screen.getByText(/login failed/i)).toBeInTheDocument()
    })

    // Should still be on login page
    expect(screen.getByRole("heading", { name: /sign in/i })).toBeInTheDocument()
  })
})
