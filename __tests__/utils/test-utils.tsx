import type React from "react"
import { render, type RenderOptions } from "@testing-library/react"
import { ThemeProvider } from "@/components/theme-provider"
import { AuthProvider } from "@/lib/auth-context"
import { Toaster } from "@/components/ui/toaster"
import type { User } from "@/types/auth"
import { jest } from "@jest/globals"

// Mock user data for testing
export const mockUser: User = {
  id: "test-user-id",
  email: "test@example.com",
  name: "Test User",
  role: "geologist",
  is_active: true,
  created_at: "2024-01-01T00:00:00Z",
  updated_at: "2024-01-01T00:00:00Z",
}

// Mock auth context values
export const mockAuthContext = {
  user: mockUser,
  token: "mock-token",
  login: jest.fn(),
  logout: jest.fn(),
  register: jest.fn(),
  isLoading: false,
  isAuthenticated: true,
  refreshToken: jest.fn(),
}

// Custom render function with providers
interface CustomRenderOptions extends Omit<RenderOptions, "wrapper"> {
  authContext?: Partial<typeof mockAuthContext>
  theme?: "light" | "dark" | "system"
}

export function renderWithProviders(ui: React.ReactElement, options: CustomRenderOptions = {}) {
  const { authContext = mockAuthContext, theme = "light", ...renderOptions } = options

  // Mock the auth context
  jest.doMock("@/lib/auth-context", () => ({
    useAuth: () => authContext,
    AuthProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  }))

  function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <ThemeProvider attribute="class" defaultTheme={theme} enableSystem={false}>
        <AuthProvider>
          {children}
          <Toaster />
        </AuthProvider>
      </ThemeProvider>
    )
  }

  return render(ui, { wrapper: Wrapper, ...renderOptions })
}

// Re-export everything from React Testing Library
export * from "@testing-library/react"
export { renderWithProviders as render }
