"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import type { User, LoginRequest, RegisterRequest, AuthResponse } from "@/types/auth"
import type { ReactNode } from "react"

interface AuthContextType {
  user: User | null
  token: string | null
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  register: (userData: RegisterRequest) => Promise<void>
  isLoading: boolean
  isAuthenticated: boolean
  refreshToken: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }): JSX.Element {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const { toast } = useToast()

  const isAuthenticated = Boolean(user && token)

  // Enhanced JSON parsing with error handling
  const safeJsonParse = <T,>(jsonString: string, fallback: T): T => {
    try {
      const parsed = JSON.parse(jsonString)
      return parsed
    } catch (error) {
      console.error("JSON parsing error:", error, "Raw string:", jsonString)
      return fallback
    }
  }

  // Enhanced fetch with comprehensive error handling
  const safeFetch = async (url: string, options: RequestInit = {}): Promise<Response> => {
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout

      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers: {
          "Content-Type": "application/json",
          ...options.headers,
        },
      })

      clearTimeout(timeoutId)
      return response
    } catch (error) {
      if (error instanceof Error) {
        if (error.name === "AbortError") {
          throw new Error("Request timeout - please check your connection")
        }
        if (error.message.includes("Failed to fetch")) {
          throw new Error("Network error - please check your internet connection")
        }
      }
      throw error
    }
  }

  // Enhanced response parsing with detailed error handling
  const parseResponse = async (response: Response): Promise<any> => {
    const contentType = response.headers.get("content-type")

    if (!contentType || !contentType.includes("application/json")) {
      const textContent = await response.text()
      console.error("Non-JSON response received:", {
        status: response.status,
        statusText: response.statusText,
        contentType,
        content: textContent.substring(0, 500), // Log first 500 chars
      })

      throw new Error(`Server returned ${response.status}: ${response.statusText}. Expected JSON response.`)
    }

    const responseText = await response.text()

    if (!responseText.trim()) {
      console.error("Empty response received:", {
        status: response.status,
        statusText: response.statusText,
      })
      throw new Error("Empty response from server")
    }

    try {
      return JSON.parse(responseText)
    } catch (parseError) {
      console.error("JSON parsing failed:", {
        error: parseError,
        responseText: responseText.substring(0, 500),
        status: response.status,
        statusText: response.statusText,
      })
      throw new Error("Invalid JSON response from server")
    }
  }

  // Check for existing token on mount
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const storedToken = localStorage.getItem("geominer_token")
        const storedUser = localStorage.getItem("geominer_user")

        if (storedToken && storedUser) {
          const userData = safeJsonParse<User | null>(storedUser, null)

          if (userData) {
            setToken(storedToken)
            setUser(userData)

            // Verify token is still valid
            await verifyToken(storedToken)
          } else {
            console.warn("Invalid stored user data, clearing storage")
            logout()
          }
        }
      } catch (error) {
        console.error("Error initializing auth:", error)
        logout()
      } finally {
        setIsLoading(false)
      }
    }

    initializeAuth()
  }, [])

  const verifyToken = async (tokenToVerify: string): Promise<void> => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
      const response = await safeFetch(`${apiUrl}/api/v1/auth/verify`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${tokenToVerify}`,
        },
      })

      if (!response.ok) {
        throw new Error(`Token verification failed: ${response.status}`)
      }

      await parseResponse(response)
    } catch (error) {
      console.error("Token verification failed:", error)
      logout()
    }
  }

  const login = async (email: string, password: string): Promise<void> => {
    setIsLoading(true)

    try {
      // Validate input
      if (!email || !password) {
        throw new Error("Email and password are required")
      }

      if (!email.includes("@")) {
        throw new Error("Please enter a valid email address")
      }

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
      const loginData: LoginRequest = { email: email.trim(), password }

      console.log("Attempting login to:", `${apiUrl}/api/v1/auth/login`)

      const response = await safeFetch(`${apiUrl}/api/v1/auth/login`, {
        method: "POST",
        body: JSON.stringify(loginData),
      })

      console.log("Login response status:", response.status)

      if (!response.ok) {
        let errorMessage = "Login failed"

        try {
          const errorData = await parseResponse(response)

          switch (response.status) {
            case 400:
              errorMessage = errorData.detail || errorData.message || "Invalid request data"
              break
            case 401:
              errorMessage = "Invalid email or password"
              break
            case 403:
              errorMessage = "Account is disabled or not verified"
              break
            case 429:
              errorMessage = "Too many login attempts. Please try again later."
              break
            case 500:
              errorMessage = "Server error. Please try again later."
              break
            default:
              errorMessage = errorData.detail || errorData.message || `Login failed (${response.status})`
          }
        } catch (parseError) {
          console.error("Error parsing error response:", parseError)
          errorMessage = `Login failed with status ${response.status}`
        }

        throw new Error(errorMessage)
      }

      const data = await parseResponse(response)

      // Validate response structure
      if (!data.access_token || !data.user) {
        console.error("Invalid login response structure:", data)
        throw new Error("Invalid response from server")
      }

      const { access_token, user: userData } = data as AuthResponse

      // Validate user data
      if (!userData.id || !userData.email || !userData.name) {
        console.error("Invalid user data received:", userData)
        throw new Error("Invalid user data from server")
      }

      setToken(access_token)
      setUser(userData)

      // Store in localStorage with error handling
      try {
        localStorage.setItem("geominer_token", access_token)
        localStorage.setItem("geominer_user", JSON.stringify(userData))
      } catch (storageError) {
        console.error("Failed to store auth data:", storageError)
        // Continue anyway, user is still logged in for this session
      }

      toast({
        title: "Login Successful",
        description: `Welcome back, ${userData.name}!`,
      })

      router.push("/dashboard")
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred during login"

      console.error("Login error:", {
        error,
        message: errorMessage,
        timestamp: new Date().toISOString(),
      })

      toast({
        title: "Login Failed",
        description: errorMessage,
        variant: "destructive",
      })
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const register = async (userData: RegisterRequest): Promise<void> => {
    setIsLoading(true)

    try {
      // Validate input
      if (!userData.email || !userData.password || !userData.name) {
        throw new Error("Name, email, and password are required")
      }

      if (!userData.email.includes("@")) {
        throw new Error("Please enter a valid email address")
      }

      if (userData.password.length < 6) {
        throw new Error("Password must be at least 6 characters long")
      }

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
      const registrationData = {
        name: userData.name.trim(),
        email: userData.email.trim(),
        password: userData.password,
        organization: userData.organization?.trim() || undefined,
      }

      console.log("Attempting registration to:", `${apiUrl}/api/v1/auth/register`)

      const response = await safeFetch(`${apiUrl}/api/v1/auth/register`, {
        method: "POST",
        body: JSON.stringify(registrationData),
      })

      console.log("Registration response status:", response.status)

      if (!response.ok) {
        let errorMessage = "Registration failed"

        try {
          const errorData = await parseResponse(response)

          switch (response.status) {
            case 400:
              errorMessage = errorData.detail || errorData.message || "Invalid registration data"
              break
            case 409:
              errorMessage = "An account with this email already exists"
              break
            case 429:
              errorMessage = "Too many registration attempts. Please try again later."
              break
            case 500:
              errorMessage = "Server error. Please try again later."
              break
            default:
              errorMessage = errorData.detail || errorData.message || `Registration failed (${response.status})`
          }
        } catch (parseError) {
          console.error("Error parsing registration error response:", parseError)
          errorMessage = `Registration failed with status ${response.status}`
        }

        throw new Error(errorMessage)
      }

      const data = await parseResponse(response)

      // Validate response structure
      if (!data.access_token || !data.user) {
        console.error("Invalid registration response structure:", data)
        throw new Error("Invalid response from server")
      }

      const { access_token, user: newUser } = data as AuthResponse

      // Validate user data
      if (!newUser.id || !newUser.email || !newUser.name) {
        console.error("Invalid user data received:", newUser)
        throw new Error("Invalid user data from server")
      }

      setToken(access_token)
      setUser(newUser)

      // Store in localStorage with error handling
      try {
        localStorage.setItem("geominer_token", access_token)
        localStorage.setItem("geominer_user", JSON.stringify(newUser))
      } catch (storageError) {
        console.error("Failed to store auth data:", storageError)
        // Continue anyway, user is still logged in for this session
      }

      toast({
        title: "Registration Successful",
        description: `Welcome to GeoMiner AI, ${newUser.name}!`,
      })

      router.push("/dashboard")
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred during registration"

      console.error("Registration error:", {
        error,
        message: errorMessage,
        timestamp: new Date().toISOString(),
      })

      toast({
        title: "Registration Failed",
        description: errorMessage,
        variant: "destructive",
      })
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const logout = (): void => {
    setUser(null)
    setToken(null)

    try {
      localStorage.removeItem("geominer_token")
      localStorage.removeItem("geominer_user")
    } catch (error) {
      console.error("Error clearing localStorage:", error)
    }

    toast({
      title: "Logged Out",
      description: "You have been successfully logged out",
    })

    router.push("/login")
  }

  const refreshToken = async (): Promise<void> => {
    try {
      if (!token) {
        throw new Error("No token available for refresh")
      }

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
      const response = await safeFetch(`${apiUrl}/api/v1/auth/refresh`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error(`Token refresh failed: ${response.status}`)
      }

      const data = await parseResponse(response)

      if (!data.access_token) {
        throw new Error("Invalid refresh response")
      }

      setToken(data.access_token)
      localStorage.setItem("geominer_token", data.access_token)
    } catch (error) {
      console.error("Token refresh failed:", error)
      logout()
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        logout,
        register,
        isLoading,
        isAuthenticated,
        refreshToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
