import { NextResponse } from "next/server"

export async function GET() {
  try {
    // Check database connection if applicable
    // const dbStatus = await checkDatabaseConnection()

    // Check external API connectivity
    // const apiStatus = await checkExternalAPIs()

    const healthData = {
      status: "healthy",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV,
      version: process.env.npm_package_version || "1.0.0",
      build: process.env.BUILD_ID || "unknown",
      checks: {
        database: "healthy", // Replace with actual check
        externalAPI: "healthy", // Replace with actual check
        memory: {
          used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
          total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
        },
      },
    }

    return NextResponse.json(healthData, { status: 200 })
  } catch (error) {
    console.error("Health check failed:", error)

    return NextResponse.json(
      {
        status: "unhealthy",
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 503 },
    )
  }
}

// Optional: Add a simple HEAD request for load balancer health checks
export async function HEAD() {
  return new Response(null, { status: 200 })
}
