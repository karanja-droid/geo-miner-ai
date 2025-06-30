"use client"

import { useState } from "react"
import { useToast } from "@/hooks/use-toast"

interface RateLimitInfo {
  limit: number
  remaining: number
  resetTime: number
}

export function useRateLimit() {
  const [rateLimitInfo, setRateLimitInfo] = useState<RateLimitInfo | null>(null)
  const [isRateLimited, setIsRateLimited] = useState(false)
  const { toast } = useToast()

  const handleRateLimitHeaders = (headers: Headers) => {
    const limit = headers.get("X-RateLimit-Limit")
    const remaining = headers.get("X-RateLimit-Remaining")
    const reset = headers.get("X-RateLimit-Reset")

    if (limit && remaining && reset) {
      const info: RateLimitInfo = {
        limit: Number.parseInt(limit, 10),
        remaining: Number.parseInt(remaining, 10),
        resetTime: Number.parseInt(reset, 10) * 1000, // Convert to milliseconds
      }
      setRateLimitInfo(info)

      // Warn when approaching rate limit
      if (info.remaining <= 5 && info.remaining > 0) {
        toast({
          title: "Rate Limit Warning",
          description: `Only ${info.remaining} requests remaining. Limit resets at ${new Date(info.resetTime).toLocaleTimeString()}`,
          variant: "destructive",
        })
      }
    }
  }

  const handleRateLimitExceeded = (retryAfter?: number) => {
    setIsRateLimited(true)
    const waitTime = retryAfter || 60

    toast({
      title: "Rate Limit Exceeded",
      description: `Too many requests. Please wait ${waitTime} seconds before trying again.`,
      variant: "destructive",
    })

    // Auto-reset after wait time
    setTimeout(() => {
      setIsRateLimited(false)
    }, waitTime * 1000)
  }

  return {
    rateLimitInfo,
    isRateLimited,
    handleRateLimitHeaders,
    handleRateLimitExceeded,
  }
}
