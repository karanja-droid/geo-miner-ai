import React from "react"
interface MetricData {
  name: string
  value: number
  timestamp: Date
  tags?: Record<string, string>
}

interface ErrorData {
  message: string
  stack?: string
  url: string
  userAgent: string
  timestamp: Date
  userId?: string
}

class MonitoringService {
  private metrics: MetricData[] = []
  private errors: ErrorData[] = []
  private maxStoredItems = 1000

  // Track performance metrics
  trackMetric(name: string, value: number, tags?: Record<string, string>) {
    const metric: MetricData = {
      name,
      value,
      timestamp: new Date(),
      tags,
    }

    this.metrics.push(metric)

    // Keep only recent metrics
    if (this.metrics.length > this.maxStoredItems) {
      this.metrics = this.metrics.slice(-this.maxStoredItems)
    }

    // Send to external monitoring service if configured
    this.sendToExternalService("metric", metric)
  }

  // Track errors
  trackError(error: Error | string, context?: Record<string, any>) {
    const errorData: ErrorData = {
      message: typeof error === "string" ? error : error.message,
      stack: typeof error === "object" ? error.stack : undefined,
      url: typeof window !== "undefined" ? window.location.href : "server",
      userAgent: typeof window !== "undefined" ? window.navigator.userAgent : "server",
      timestamp: new Date(),
      ...context,
    }

    this.errors.push(errorData)

    // Keep only recent errors
    if (this.errors.length > this.maxStoredItems) {
      this.errors = this.errors.slice(-this.maxStoredItems)
    }

    // Send to external monitoring service
    this.sendToExternalService("error", errorData)

    // Log to console in development
    if (process.env.NODE_ENV === "development") {
      console.error("Monitoring Error:", errorData)
    }
  }

  // Get metrics for dashboard
  getMetrics(timeRange?: { start: Date; end: Date }) {
    let filteredMetrics = this.metrics

    if (timeRange) {
      filteredMetrics = this.metrics.filter(
        (metric) => metric.timestamp >= timeRange.start && metric.timestamp <= timeRange.end,
      )
    }

    return filteredMetrics
  }

  // Get errors for dashboard
  getErrors(timeRange?: { start: Date; end: Date }) {
    let filteredErrors = this.errors

    if (timeRange) {
      filteredErrors = this.errors.filter(
        (error) => error.timestamp >= timeRange.start && error.timestamp <= timeRange.end,
      )
    }

    return filteredErrors
  }

  // Send data to external monitoring service
  private async sendToExternalService(type: "metric" | "error", data: any) {
    try {
      // Example: Send to your monitoring endpoint
      if (typeof window !== "undefined") {
        await fetch("/api/monitoring/" + type, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        })
      }
    } catch (error) {
      // Silently fail to avoid infinite error loops
      console.warn("Failed to send monitoring data:", error)
    }
  }

  // Track page views
  trackPageView(page: string, userId?: string) {
    this.trackMetric("page_view", 1, {
      page,
      userId,
    })
  }

  // Track user interactions
  trackInteraction(action: string, element: string, userId?: string) {
    this.trackMetric("user_interaction", 1, {
      action,
      element,
      userId,
    })
  }

  // Track API calls
  trackAPICall(endpoint: string, method: string, duration: number, status: number) {
    this.trackMetric("api_call_duration", duration, {
      endpoint,
      method,
      status: status.toString(),
    })
  }
}

// Create singleton instance
export const monitoring = new MonitoringService()

// React hook for easy usage
export function useMonitoring() {
  return {
    trackMetric: monitoring.trackMetric.bind(monitoring),
    trackError: monitoring.trackError.bind(monitoring),
    trackPageView: monitoring.trackPageView.bind(monitoring),
    trackInteraction: monitoring.trackInteraction.bind(monitoring),
    trackAPICall: monitoring.trackAPICall.bind(monitoring),
  }
}

// Higher-order component for error boundary integration
export function withErrorTracking<P extends object>(Component: React.ComponentType<P>) {
  return function TrackedComponent(props: P) {
    const handleError = (error: Error, errorInfo: any) => {
      monitoring.trackError(error, { errorInfo })
    }

    return (
      <ErrorBoundary onError={handleError}>
        <Component {...props} />
      </ErrorBoundary>
    )
  }
}

// Error Boundary component
class ErrorBoundary extends React.Component<
  { children: React.ReactNode; onError?: (error: Error, errorInfo: any) => void },
  { hasError: boolean }
> {
  constructor(props: any) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true }
  }

  componentDidCatch(error: Error, errorInfo: any) {
    this.props.onError?.(error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 border border-red-200 rounded-lg bg-red-50">
          <h2 className="text-lg font-semibold text-red-800">Something went wrong</h2>
          <p className="text-red-600">Please refresh the page or contact support if the problem persists.</p>
        </div>
      )
    }

    return this.props.children
  }
}
