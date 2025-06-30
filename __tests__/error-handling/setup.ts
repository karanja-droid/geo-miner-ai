import { jest, beforeEach, afterEach, expect } from "@jest/globals"
import "@testing-library/jest-dom"

// Mock Next.js router
jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
  }),
  useSearchParams: () => ({
    get: jest.fn(),
  }),
  usePathname: () => "/",
}))

// Mock toast hook
jest.mock("@/hooks/use-toast", () => ({
  useToast: () => ({
    toast: jest.fn(),
  }),
}))

// Global fetch mock
global.fetch = jest.fn()

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}

Object.defineProperty(window, "localStorage", {
  value: localStorageMock,
  writable: true,
})

// Mock window.location
delete (window as any).location
window.location = {
  href: "",
  origin: "http://localhost:3000",
  protocol: "http:",
  host: "localhost:3000",
  hostname: "localhost",
  port: "3000",
  pathname: "/",
  search: "",
  hash: "",
  assign: jest.fn(),
  replace: jest.fn(),
  reload: jest.fn(),
} as any

// Mock environment variables
process.env.NEXT_PUBLIC_API_URL = "http://localhost:8000"

// Suppress console warnings during tests
const originalWarn = console.warn
const originalError = console.error

beforeEach(() => {
  console.warn = jest.fn()
  console.error = jest.fn()
})

afterEach(() => {
  console.warn = originalWarn
  console.error = originalError
  jest.clearAllMocks()
})

// Custom Jest matchers
expect.extend({
  toHaveBeenCalledWithError(received, expectedMessage) {
    const calls = received.mock.calls
    const found = calls.some((call) => call.some((arg) => typeof arg === "string" && arg.includes(expectedMessage)))

    return {
      message: () => `expected ${received} to have been called with error message containing "${expectedMessage}"`,
      pass: found,
    }
  },
})

// Global error handler for unhandled promise rejections
process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason)
})

// Increase timeout for error handling tests
jest.setTimeout(10000)
