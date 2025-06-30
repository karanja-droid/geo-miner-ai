import type { Meta, StoryObj } from "@storybook/react"
import { Dashboard } from "./dashboard"
import { AuthProvider } from "@/lib/auth-context"
import { ThemeProvider } from "@/components/theme-provider"
import type React from "react"

// Mock auth context for stories
const mockAuthContext = {
  user: {
    id: "user-123",
    email: "geologist@example.com",
    name: "Dr. Sarah Johnson",
    role: "geologist" as const,
    is_active: true,
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
    organization: "GeoTech Mining Corp",
  },
  token: "mock-token",
  login: async () => {},
  logout: () => {},
  register: async () => {},
  isLoading: false,
  isAuthenticated: true,
  refreshToken: async () => {},
}

const DashboardDecorator = (Story: React.ComponentType) => (
  <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
    <AuthProvider>
      <div className="min-h-screen bg-background p-4">
        <Story />
      </div>
    </AuthProvider>
  </ThemeProvider>
)

const meta: Meta<typeof Dashboard> = {
  title: "Pages/Dashboard",
  component: Dashboard,
  decorators: [DashboardDecorator],
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component: "Main dashboard component showing geological exploration overview and analytics",
      },
    },
    chromatic: {
      viewports: [375, 768, 1024, 1440],
      delay: 500,
    },
  },
  tags: ["autodocs"],
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  name: "Default Dashboard",
  parameters: {
    docs: {
      description: {
        story: "Default dashboard view with all sections visible",
      },
    },
  },
}

export const OverviewTab: Story = {
  name: "Overview Tab Active",
  parameters: {
    docs: {
      description: {
        story: "Dashboard with overview tab selected showing project overview",
      },
    },
  },
}

export const AnalysisTab: Story = {
  name: "AI Analysis Tab",
  play: async ({ canvasElement }) => {
    const canvas = canvasElement
    const analysisTab = canvas.querySelector('[data-value="analysis"]') as HTMLElement
    if (analysisTab) {
      analysisTab.click()
    }
  },
  parameters: {
    docs: {
      description: {
        story: "Dashboard with AI analysis tab active",
      },
    },
  },
}

export const MapsTab: Story = {
  name: "Geological Maps Tab",
  play: async ({ canvasElement }) => {
    const canvas = canvasElement
    const mapsTab = canvas.querySelector('[data-value="maps"]') as HTMLElement
    if (mapsTab) {
      mapsTab.click()
    }
  },
  parameters: {
    docs: {
      description: {
        story: "Dashboard with geological maps tab active",
      },
    },
  },
}

export const DatasetsTab: Story = {
  name: "Datasets Tab",
  play: async ({ canvasElement }) => {
    const canvas = canvasElement
    const datasetsTab = canvas.querySelector('[data-value="datasets"]') as HTMLElement
    if (datasetsTab) {
      datasetsTab.click()
    }
  },
  parameters: {
    docs: {
      description: {
        story: "Dashboard with datasets management tab active",
      },
    },
  },
}

export const RealtimeTab: Story = {
  name: "Real-time Updates Tab",
  play: async ({ canvasElement }) => {
    const canvas = canvasElement
    const realtimeTab = canvas.querySelector('[data-value="realtime"]') as HTMLElement
    if (realtimeTab) {
      realtimeTab.click()
    }
  },
  parameters: {
    docs: {
      description: {
        story: "Dashboard with real-time updates tab active",
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
          <div className="min-h-screen bg-background p-4 dark">
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
        story: "Dashboard in dark theme mode",
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
        story: "Dashboard optimized for mobile devices",
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
        story: "Dashboard optimized for tablet devices",
      },
    },
  },
}
