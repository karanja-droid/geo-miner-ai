import { render, screen } from "@testing-library/react"
import { ErrorBoundary } from "@/components/error-boundary"
import jest from "jest" // Import jest to declare the variable

// Component that throws an error
const ThrowError = ({ shouldThrow }: { shouldThrow: boolean }) => {
  if (shouldThrow) {
    throw new Error("Test error")
  }
  return <div>No error</div>
}

// Mock console.error to avoid noise in tests
const originalError = console.error
beforeAll(() => {
  console.error = jest.fn()
})

afterAll(() => {
  console.error = originalError
})

describe("Error Boundary", () => {
  test("renders children when there is no error", () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={false} />
      </ErrorBoundary>,
    )

    expect(screen.getByText("No error")).toBeInTheDocument()
  })

  test("renders error UI when there is an error", () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>,
    )

    expect(screen.getByText(/Something went wrong/i)).toBeInTheDocument()
    expect(screen.getByText(/An unexpected error occurred/i)).toBeInTheDocument()
  })

  test("displays error details in development", () => {
    const originalEnv = process.env.NODE_ENV
    process.env.NODE_ENV = "development"

    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>,
    )

    expect(screen.getByText(/Test error/i)).toBeInTheDocument()

    process.env.NODE_ENV = originalEnv
  })

  test("hides error details in production", () => {
    const originalEnv = process.env.NODE_ENV
    process.env.NODE_ENV = "production"

    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>,
    )

    expect(screen.queryByText(/Test error/i)).not.toBeInTheDocument()

    process.env.NODE_ENV = originalEnv
  })

  test("provides retry functionality", () => {
    const { rerender } = render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>,
    )

    expect(screen.getByText(/Something went wrong/i)).toBeInTheDocument()

    // Click retry button
    const retryButton = screen.getByRole("button", { name: /try again/i })
    retryButton.click()

    // Re-render with no error
    rerender(
      <ErrorBoundary>
        <ThrowError shouldThrow={false} />
      </ErrorBoundary>,
    )

    expect(screen.getByText("No error")).toBeInTheDocument()
  })

  test("logs errors for monitoring", () => {
    const consoleSpy = jest.spyOn(console, "error").mockImplementation()

    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>,
    )

    expect(consoleSpy).toHaveBeenCalledWith("Error caught by boundary:", expect.any(Error), expect.any(Object))

    consoleSpy.mockRestore()
  })
})
