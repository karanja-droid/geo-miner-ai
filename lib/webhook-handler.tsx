"use client"

import { useEffect, useRef } from "react"
import { useAuth } from "./auth-context"
import { useToast } from "@/hooks/use-toast"

interface WebhookEvent {
  event_type: string
  analysis_id: string
  user_id: string
  analysis_type: string
  provider: string
  status: string
  result?: any
  processing_time?: number
  timestamp: string
}

export function useWebhookHandler() {
  const { user, token } = useAuth()
  const { toast } = useToast()
  const wsRef = useRef<WebSocket | null>(null)

  useEffect(() => {
    if (!user || !token) return

    // Connect to WebSocket for real-time updates
    const wsUrl = `${process.env.NEXT_PUBLIC_WS_URL}/ws?token=${token}`
    const ws = new WebSocket(wsUrl)
    wsRef.current = ws

    ws.onopen = () => {
      console.log("WebSocket connected")
    }

    ws.onmessage = (event) => {
      try {
        const data: WebhookEvent = JSON.parse(event.data)
        handleWebhookEvent(data)
      } catch (error) {
        console.error("Error parsing webhook data:", error)
      }
    }

    ws.onclose = () => {
      console.log("WebSocket disconnected")
      // Attempt to reconnect after 5 seconds
      setTimeout(() => {
        if (user && token) {
          // Reconnect logic here
        }
      }, 5000)
    }

    ws.onerror = (error) => {
      console.error("WebSocket error:", error)
    }

    return () => {
      if (wsRef.current) {
        wsRef.current.close()
      }
    }
  }, [user, token])

  const handleWebhookEvent = (event: WebhookEvent) => {
    switch (event.event_type) {
      case "analysis_completed":
        toast({
          title: "Analysis Complete",
          description: `Your ${event.analysis_type} analysis has finished processing`,
        })
        // Trigger UI updates
        window.dispatchEvent(new CustomEvent("analysisCompleted", { detail: event }))
        break

      case "analysis_failed":
        toast({
          title: "Analysis Failed",
          description: `Your ${event.analysis_type} analysis encountered an error`,
          variant: "destructive",
        })
        break

      case "chained_analysis_step_completed":
        toast({
          title: "Workflow Step Complete",
          description: `Step ${event.result?.step_number} of your workflow has completed`,
        })
        break

      case "data_processing_complete":
        toast({
          title: "Data Processing Complete",
          description: "Your dataset has been processed and is ready for analysis",
        })
        break

      default:
        console.log("Unknown webhook event:", event.event_type)
    }
  }

  return {
    isConnected: wsRef.current?.readyState === WebSocket.OPEN,
    sendMessage: (message: any) => {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify(message))
      }
    },
  }
}
