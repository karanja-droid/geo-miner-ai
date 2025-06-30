"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import type { User, Session, AuthError } from "@supabase/supabase-js"
import { supabase } from "./supabase"
import type { Profile, InsertProfile, UpdateProfile } from "./database/types"

interface AuthContextType {
  user: User | null
  profile: Profile | null
  session: Session | null
  loading: boolean
  signUp: (email: string, password: string, userData?: Partial<InsertProfile>) => Promise<{ error: AuthError | null }>
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>
  signOut: () => Promise<{ error: AuthError | null }>
  updateProfile: (updates: UpdateProfile) => Promise<{ error: Error | null }>
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  // Fetch user profile from database
  const fetchProfile = async (userId: string): Promise<Profile | null> => {
    try {
      const { data, error } = await supabase.from("profiles").select("*").eq("id", userId).single()

      if (error) {
        console.error("Error fetching profile:", error)
        return null
      }

      return data
    } catch (error) {
      console.error("Error fetching profile:", error)
      return null
    }
  }

  // Create profile for new user
  const createProfile = async (user: User, userData?: Partial<InsertProfile>): Promise<Profile | null> => {
    try {
      const profileData: InsertProfile = {
        id: user.id,
        email: user.email!,
        name: userData?.name || user.user_metadata?.name || user.email!.split("@")[0],
        organization: userData?.organization || null,
        role: userData?.role || "user",
        avatar_url: userData?.avatar_url || user.user_metadata?.avatar_url || null,
      }

      const { data, error } = await supabase.from("profiles").insert(profileData).select().single()

      if (error) {
        console.error("Error creating profile:", error)
        return null
      }

      return data
    } catch (error) {
      console.error("Error creating profile:", error)
      return null
    }
  }

  // Initialize auth state
  useEffect(() => {
    let mounted = true

    const initializeAuth = async () => {
      try {
        // Get initial session
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession()

        if (error) {
          console.error("Error getting session:", error)
          return
        }

        if (mounted) {
          setSession(session)
          setUser(session?.user ?? null)

          if (session?.user) {
            const userProfile = await fetchProfile(session.user.id)
            setProfile(userProfile)
          }
        }
      } catch (error) {
        console.error("Error initializing auth:", error)
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    initializeAuth()

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return

      console.log("Auth state changed:", event, session?.user?.id)

      setSession(session)
      setUser(session?.user ?? null)

      if (session?.user) {
        let userProfile = await fetchProfile(session.user.id)

        // Create profile if it doesn't exist (for new users)
        if (!userProfile && event === "SIGNED_IN") {
          userProfile = await createProfile(session.user)
        }

        setProfile(userProfile)
      } else {
        setProfile(null)
      }

      setLoading(false)
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  const signUp = async (email: string, password: string, userData?: Partial<InsertProfile>) => {
    try {
      setLoading(true)

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: userData || {},
        },
      })

      if (error) {
        return { error }
      }

      // Profile will be created automatically via onAuthStateChange
      return { error: null }
    } catch (error) {
      console.error("Sign up error:", error)
      return { error: error as AuthError }
    } finally {
      setLoading(false)
    }
  }

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true)

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        return { error }
      }

      return { error: null }
    } catch (error) {
      console.error("Sign in error:", error)
      return { error: error as AuthError }
    } finally {
      setLoading(false)
    }
  }

  const signOut = async () => {
    try {
      setLoading(true)

      const { error } = await supabase.auth.signOut()

      if (error) {
        return { error }
      }

      return { error: null }
    } catch (error) {
      console.error("Sign out error:", error)
      return { error: error as AuthError }
    } finally {
      setLoading(false)
    }
  }

  const updateProfile = async (updates: UpdateProfile) => {
    try {
      if (!user) {
        return { error: new Error("No user logged in") }
      }

      const { data, error } = await supabase.from("profiles").update(updates).eq("id", user.id).select().single()

      if (error) {
        console.error("Error updating profile:", error)
        return { error: new Error(error.message) }
      }

      setProfile(data)
      return { error: null }
    } catch (error) {
      console.error("Error updating profile:", error)
      return { error: error as Error }
    }
  }

  const refreshProfile = async () => {
    if (!user) return

    const userProfile = await fetchProfile(user.id)
    setProfile(userProfile)
  }

  const value: AuthContextType = {
    user,
    profile,
    session,
    loading,
    signUp,
    signIn,
    signOut,
    updateProfile,
    refreshProfile,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
