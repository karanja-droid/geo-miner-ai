import { screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { Dashboard } from "@/components/dashboard"
import { render } from "../utils/test-utils"

describe("Dashboard", () => {
  const user = userEvent.setup()

  it("should render dashboard with all sections", () => {
    render(<Dashboard />)

    expect(screen.getByText(/geological exploration dashboard/i)).toBeInTheDocument()
    expect(screen.getByText(/active projects/i)).toBeInTheDocument()
    expect(screen.getByText(/total datasets/i)).toBeInTheDocument()
    expect(screen.getByText(/ai analyses/i)).toBeInTheDocument()
    expect(screen.getByText(/team members/i)).toBeInTheDocument()
  })

  it("should display stats cards with correct values", () => {
    render(<Dashboard />)

    expect(screen.getByText("12")).toBeInTheDocument() // Active projects
    expect(screen.getByText("847")).toBeInTheDocument() // Total datasets
    expect(screen.getByText("156")).toBeInTheDocument() // AI analyses
    expect(screen.getByText("8")).toBeInTheDocument() // Team members
  })

  it("should render all tabs", () => {
    render(<Dashboard />)

    expect(screen.getByRole("tab", { name: /overview/i })).toBeInTheDocument()
    expect(screen.getByRole("tab", { name: /ai analysis/i })).toBeInTheDocument()
    expect(screen.getByRole("tab", { name: /geological maps/i })).toBeInTheDocument()
    expect(screen.getByRole("tab", { name: /datasets/i })).toBeInTheDocument()
    expect(screen.getByRole("tab", { name: /real-time/i })).toBeInTheDocument()
  })

  it("should switch between tabs", async () => {
    render(<Dashboard />)

    const analysisTab = screen.getByRole("tab", { name: /ai analysis/i })
    await user.click(analysisTab)

    expect(screen.getByText(/create ai analysis/i)).toBeInTheDocument()
  })

  it("should show overview tab by default", () => {
    render(<Dashboard />)

    const overviewTab = screen.getByRole("tab", { name: /overview/i })
    expect(overviewTab).toHaveAttribute("data-state", "active")
  })
})
