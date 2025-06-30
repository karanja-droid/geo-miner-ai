import type { Meta, StoryObj } from "@storybook/react"
import { within, userEvent, expect } from "@storybook/test"
import LoginPage from "./page"
import { ThemeProvider } from "@/components/theme-provider"
import { AuthProvider } from "@/lib/auth-context"
import type React from "react"

const LoginDecorator = (Story: React.ComponentType) => (
  <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
    <AuthProvider>
      <Story />
    </AuthProvider>
  </ThemeProvider>
)

const meta: Meta<typeof LoginPage> = {
  title: "Pages/Login",
  component: LoginPage,
  decorators: [LoginDecorator],
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component: "Login page for GeoMiner AI platform authentication",
      },
    },
    chromatic: {
      viewports: [375, 768, 1024],
      delay: 300,
    },
  },
  tags: ["autodocs"],
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  name: "Default Login",
  parameters: {
    docs: {
      description: {
        story: "Default login page with empty form",
      },
    },
  },
}

export const WithCredentials: Story = {
  name: "With Demo Credentials",
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const emailInput = canvas.getByLabelText(/email/i)
    const passwordInput = canvas.getByLabelText(/password/i)

    await userEvent.type(emailInput, "demo@geominer.com")
    await userEvent.type(passwordInput, "demo123")
  },
  parameters: {
    docs: {
      description: {
        story: "Login page with demo credentials filled in",
      },
    },
  },
}

export const ValidationErrors: Story = {
  name: "Validation Errors",
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const submitButton = canvas.getByRole("button", { name: /sign in/i })
    await userEvent.click(submitButton)

    // Wait for validation errors
    await expect(canvas.getByText(/email is required/i)).toBeInTheDocument()
    await expect(canvas.getByText(/password is required/i)).toBeInTheDocument()
  },
  parameters: {
    docs: {
      description: {
        story: "Login page showing validation errors for empty fields",
      },
    },
  },
}

export const PasswordVisible: Story = {
  name: "Password Visible",
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const passwordInput = canvas.getByLabelText(/password/i)
    const toggleButton = canvas.getByRole("button", { name: "" }) // Eye icon button

    await userEvent.type(passwordInput, "secretpassword")
    await userEvent.click(toggleButton)
  },
  parameters: {
    docs: {
      description: {
        story: "Login page with password visibility toggled on",
      },
    },
  },
}

export const LoadingState: Story = {
  name: "Loading State",
  decorators: [
    (Story) => {
      // Mock loading state
      const mockAuthContext = {
        user: null,
        token: null,
        login: async () => {},
        logout: () => {},
        register: async () => {},
        isLoading: true,
        isAuthenticated: false,
        refreshToken: async () => {},
      }

      return (
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
          <div
            style={
              {
                // Mock the auth context with loading state
                "--auth-loading": "true",
              } as React.CSSProperties
            }
          >
            <Story />
          </div>
        </ThemeProvider>
      )
    },
  ],
  parameters: {
    docs: {
      description: {
        story: "Login page in loading state during authentication",
      },
    },
  },
}

export const DarkTheme: Story = {
  name: "Dark Theme",
  decorators: [
    (Story) => (
      <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
        <AuthProvider>
          <div className="dark">
            <Story />
          </div>
        </AuthProvider>
      </ThemeProvider>
    ),
  ],
  parameters: {
    backgrounds: { default: "dark" },
    docs: {
      description: {
        story: "Login page in dark theme mode",
      },
    },
  },
}

export const MobileView: Story = {
  name: "Mobile View",
  parameters: {
    viewport: {
      defaultViewport: "mobile",
    },
    docs: {
      description: {
        story: "Login page optimized for mobile devices",
      },
    },
  },
}

export const TabletView: Story = {
  name: "Tablet View",
  parameters: {
    viewport: {
      defaultViewport: "tablet",
    },
    docs: {
      description: {
        story: "Login page on tablet devices",
      },
    },
  },
}
