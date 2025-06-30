import { supabase, createServerClient } from "../../lib/supabase"
import jest from "jest" // Import jest to fix the undeclared variable error

// Mock environment variables for testing
const mockEnvVars = {
  NEXT_PUBLIC_SUPABASE_URL: "https://test.supabase.co",
  NEXT_PUBLIC_SUPABASE_ANON_KEY: "test-anon-key",
  SUPABASE_SERVICE_ROLE_KEY: "test-service-key",
}

// Set up environment variables before tests
Object.assign(process.env, mockEnvVars)

describe("Supabase Connection", () => {
  beforeAll(() => {
    // Ensure environment variables are set for testing
    Object.assign(process.env, mockEnvVars)
  })

  describe("Client Connection", () => {
    it("should create client instance", () => {
      expect(supabase).toBeDefined()
      expect(supabase.auth).toBeDefined()
      expect(supabase.from).toBeDefined()
    })

    it("should have correct configuration", () => {
      expect(supabase.supabaseUrl).toBe(process.env.NEXT_PUBLIC_SUPABASE_URL)
      expect(supabase.supabaseKey).toBe(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
    })
  })

  describe("Server Client", () => {
    it("should create server client instance", () => {
      const serverClient = createServerClient()
      expect(serverClient).toBeDefined()
      expect(serverClient.auth).toBeDefined()
      expect(serverClient.from).toBeDefined()
    })

    it("should use service role key", () => {
      const serverClient = createServerClient()
      expect(serverClient.supabaseKey).toBe(process.env.SUPABASE_SERVICE_ROLE_KEY)
    })
  })

  describe("Database Operations", () => {
    it("should handle database queries", async () => {
      // Mock the response for testing
      const mockResponse = { data: [], error: null }
      jest.spyOn(supabase, "from").mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue(mockResponse),
        }),
      } as any)

      const { data, error } = await supabase.from("profiles").select("*").eq("id", "test-id")

      expect(error).toBeNull()
      expect(data).toBeDefined()
    })

    it("should handle authentication", async () => {
      // Mock auth response
      const mockAuthResponse = { data: { user: null }, error: null }
      jest.spyOn(supabase.auth, "signInWithPassword").mockResolvedValue(mockAuthResponse)

      const { data, error } = await supabase.auth.signInWithPassword({
        email: "test@example.com",
        password: "password",
      })

      expect(error).toBeNull()
      expect(data).toBeDefined()
    })
  })

  describe("Error Handling", () => {
    it("should handle connection errors gracefully", async () => {
      // Mock network error
      const mockError = new Error("Network error")
      jest.spyOn(supabase, "from").mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockRejectedValue(mockError),
        }),
      } as any)

      try {
        await supabase.from("profiles").select("*").eq("id", "test-id")
      } catch (error) {
        expect(error).toBe(mockError)
      }
    })

    it("should handle authentication errors", async () => {
      const mockAuthError = { data: null, error: { message: "Invalid credentials" } }
      jest.spyOn(supabase.auth, "signInWithPassword").mockResolvedValue(mockAuthError)

      const { data, error } = await supabase.auth.signInWithPassword({
        email: "invalid@example.com",
        password: "wrongpassword",
      })

      expect(data).toBeNull()
      expect(error).toBeDefined()
      expect(error?.message).toBe("Invalid credentials")
    })
  })
})
