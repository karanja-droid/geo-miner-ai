import { jest, beforeEach, afterEach, expect } from "@jest/globals"

// Mock window.location
delete (window as any).location
window.location = {
  href: "",
  assign: jest.fn(),
  replace: jest.fn(),
  reload: jest.fn(),
  load: jest.fn(),
} as any

// Mock console methods to reduce noise in tests
const originalConsoleError = console.error
const originalConsoleWarn = console.warn
const originalConsoleLog = console.log

beforeEach(() => {
  // Reset mocks before each test
  jest.clearAllMocks()

  // Mock console methods
  console.error = jest.fn()
  console.warn = jest.fn()
  console.log = jest.fn()
})

afterEach(() => {
  // Restore console methods after each test
  console.error = originalConsoleError
  console.warn = originalConsoleWarn
  console.log = originalConsoleLog
})

// Global test utilities
global.testUtils = {
  createMockResponse: (data: any, status = 200, contentType = "application/json") => ({
    ok: status >= 200 && status < 300,
    status,
    statusText: status === 200 ? "OK" : "Error",
    headers: new Headers({ "content-type": contentType }),
    json: async () => data,
    text: async () => (typeof data === "string" ? data : JSON.stringify(data)),
  }),

  createNetworkError: (message = "Network error") => {
    const error = new Error(message)
    error.name = "NetworkError"
    return error
  },

  createTimeoutError: () => {
    const error = new Error("Request timeout")
    error.name = "AbortError"
    return error
  },

  waitForAsync: (ms = 0) => new Promise((resolve) => setTimeout(resolve, ms)),
}

// Extend Jest matchers
expect.extend({
  toBeNetworkError(received) {
    const pass = received instanceof Error && received.name === "NetworkError"
    return {
      message: () => `expected ${received} to be a network error`,
      pass,
    }
  },

  toBeTimeoutError(received) {
    const pass = received instanceof Error && received.name === "AbortError"
    return {
      message: () => `expected ${received} to be a timeout error`,
      pass,
    }
  },
})
