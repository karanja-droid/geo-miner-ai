import type { Meta, StoryObj } from "@storybook/react"
import { within, userEvent, expect } from "@storybook/test"
import { AIAnalysisPanel } from "./ai-analysis-panel"
import { ThemeProvider } from "@/components/theme-provider"
import type React from "react"

const AIAnalysisPanelDecorator = (Story: React.ComponentType) => (
  <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
    <div className="p-6 bg-background min-h-screen">
      <Story />
    </div>
  </ThemeProvider>
)

const meta: Meta<typeof AIAnalysisPanel> = {
  title: "Components/AIAnalysisPanel",
  component: AIAnalysisPanel,
  decorators: [AIAnalysisPanelDecorator],
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component: "AI Analysis Panel for creating and managing geological AI analyses",
      },
    },
    chromatic: {
      viewports: [768, 1024, 1440],
      delay: 300,
    },
  },
  tags: ["autodocs"],
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  name: "Default State",
  parameters: {
    docs: {
      description: {
        story: "Default AI analysis panel with empty form and existing analyses",
      },
    },
  },
}

export const WithPrompt: Story = {
  name: "With Analysis Prompt",
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const promptTextarea = canvas.getByLabelText(/analysis prompt/i)
    await userEvent.type(
      promptTextarea,
      "Analyze the geological formations in the uploaded dataset and identify potential copper mineralization zones based on alteration patterns and geochemical signatures.",
    )
  },
  parameters: {
    docs: {
      description: {
        story: "Analysis panel with a detailed geological analysis prompt entered",
      },
    },
  },
}

export const DifferentProvider: Story = {
  name: "Different AI Provider",
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const providerSelect = canvas.getByLabelText(/ai provider/i)
    await userEvent.click(providerSelect)
    const anthropicOption = canvas.getByText(/anthropic claude/i)
    await userEvent.click(anthropicOption)
  },
  parameters: {
    docs: {
      description: {
        story: "Analysis panel with Anthropic Claude selected as the AI provider",
      },
    },
  },
}

export const GeochemicalAnalysis: Story = {
  name: "Geochemical Analysis Type",
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const typeSelect = canvas.getByLabelText(/analysis type/i)
    await userEvent.click(typeSelect)
    const geochemicalOption = canvas.getByText(/geochemical assessment/i)
    await userEvent.click(geochemicalOption)
  },
  parameters: {
    docs: {
      description: {
        story: "Analysis panel configured for geochemical assessment",
      },
    },
  },
}

export const FormValidation: Story = {
  name: "Form Validation Error",
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const startButton = canvas.getByRole("button", { name: /start analysis/i })
    await userEvent.click(startButton)
    // Wait for validation error to appear
    await expect(canvas.getByText(/please enter an analysis prompt/i)).toBeInTheDocument()
  },
  parameters: {
    docs: {
      description: {
        story: "Analysis panel showing validation error when trying to submit without prompt",
      },
    },
  },
}

export const AnalysisInProgress: Story = {
  name: "Analysis in Progress",
  parameters: {
    docs: {
      description: {
        story: "Analysis panel showing running analysis with progress indicator",
      },
    },
  },
}

export const CompletedAnalysis: Story = {
  name: "Completed Analysis",
  parameters: {
    docs: {
      description: {
        story: "Analysis panel showing completed analysis with results",
      },
    },
  },
}

export const DarkTheme: Story = {
  name: "Dark Theme",
  decorators: [
    (Story) => (
      <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
        <div className="p-6 bg-background min-h-screen dark">
          <Story />
        </div>
      </ThemeProvider>
    ),
  ],
  parameters: {
    backgrounds: { default: "dark" },
    docs: {
      description: {
        story: "AI Analysis panel in dark theme",
      },
    },
  },
}

export const MobileView: Story = {
  name: "Mobile Layout",
  parameters: {
    viewport: {
      defaultViewport: "mobile",
    },
    docs: {
      description: {
        story: "AI Analysis panel optimized for mobile devices",
      },
    },
  },
}
