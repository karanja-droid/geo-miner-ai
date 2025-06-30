import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const headers = Object.fromEntries(request.headers.entries())

    console.log("Debug endpoint received:", {
      method: request.method,
      url: request.url,
      headers,
      body: body.substring(0, 1000), // Log first 1000 chars
      timestamp: new Date().toISOString(),
    })

    // Try to parse as JSON
    let parsedBody = null
    try {
      parsedBody = JSON.parse(body)
    } catch (parseError) {
      console.log("Body is not valid JSON:", parseError)
    }

    return NextResponse.json({
      success: true,
      received: {
        method: request.method,
        headers,
        body: parsedBody || body,
        timestamp: new Date().toISOString(),
      },
    })
  } catch (error) {
    console.error("Debug endpoint error:", error)

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}

export async function GET() {
  return NextResponse.json({
    status: "Debug endpoint is working",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    apiUrl: process.env.NEXT_PUBLIC_API_URL,
  })
}
