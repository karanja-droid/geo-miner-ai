import { screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { AIAnalysisPanel } from "@/components/ai-analysis-panel"
import { render } from "../utils/test-utils"

describe("AIAnalysisPanel", () => {
  const user = userEvent.setup()

  it("should render analysis creation form", () => {
    render(<AIAnalysisPanel />)

    expect(screen.getByText(/create ai analysis/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/analysis type/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/ai provider/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/analysis prompt/i)).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /start analysis/i })).toBeInTheDocument()
  })

  it("should show validation error for empty prompt", async () => {
    render(<AIAnalysisPanel />)

    const startButton = screen.getByRole("button", { name: /start analysis/i })
    await user.click(startButton)

    await waitFor(() => {
      expect(screen.getByText(/please enter an analysis prompt/i)).toBeInTheDocument()
    })
  })

  it("should create analysis with valid input", async () => {
    render(<AIAnalysisPanel />)

    const promptTextarea = screen.getByLabelText(/analysis prompt/i)
    const startButton = screen.getByRole("button", { name: /start analysis/i })

    await user.type(promptTextarea, "Analyze geological formations")
    await user.click(startButton)

    await waitFor(() => {
      expect(screen.getByText(/analysis started/i)).toBeInTheDocument()
    })
  })

  it("should display existing analyses", () => {
    render(<AIAnalysisPanel />)

    expect(screen.getByText(/geological analysis/i)).toBeInTheDocument()
    expect(screen.getByText(/geochemical analysis/i)).toBeInTheDocument()
    expect(screen.getByText(/completed/i)).toBeInTheDocument()
    expect(screen.getByText(/running/i)).toBeInTheDocument()
  })

  it("should show progress for running analyses", () => {
    render(<AIAnalysisPanel />)

    expect(screen.getByText(/processing\.\.\. 65%/i)).toBeInTheDocument()
  })

  it("should allow provider selection", async () => {
    render(<AIAnalysisPanel />)

    const providerSelect = screen.getByLabelText(/ai provider/i)
    await user.click(providerSelect)

    expect(screen.getByText(/openai gpt-4/i)).toBeInTheDocument()
    expect(screen.getByText(/anthropic claude/i)).toBeInTheDocument()
    expect(screen.getByText(/alibaba qwen/i)).toBeInTheDocument()
  })
})
