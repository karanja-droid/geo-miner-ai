import { render } from "@testing-library/react"
import { Dashboard } from "@/components/dashboard"
import { AIAnalysisPanel } from "@/components/ai-analysis-panel"

describe("Component Performance", () => {
  it("should render Dashboard within performance budget", () => {
    const startTime = performance.now()

    render(<Dashboard />)

    const endTime = performance.now()
    const renderTime = endTime - startTime

    // Should render within 100ms
    expect(renderTime).toBeLessThan(100)
  })

  it("should render AIAnalysisPanel efficiently", () => {
    const startTime = performance.now()

    render(<AIAnalysisPanel />)

    const endTime = performance.now()
    const renderTime = endTime - startTime

    // Should render within 50ms
    expect(renderTime).toBeLessThan(50)
  })
})
