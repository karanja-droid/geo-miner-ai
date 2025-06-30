import { renderHook, type RenderHookOptions } from "@testing-library/react"
import { ThemeProvider } from "@/components/theme-provider"
import { AuthProvider } from "@/lib/auth-context"
import type React from "react"

interface CustomRenderHookOptions<TProps> extends RenderHookOptions<TProps> {
  authContext?: any
}

export function renderHookWithProviders<TResult, TProps>(
  hook: (props: TProps) => TResult,
  options: CustomRenderHookOptions<TProps> = {},
) {
  const { authContext, ...renderHookOptions } = options

  function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
        <AuthProvider>{children}</AuthProvider>
      </ThemeProvider>
    )
  }

  return renderHook(hook, { wrapper: Wrapper, ...renderHookOptions })
}
