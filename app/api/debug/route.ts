import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const timestamp = new Date().toISOString()

  console.log("Debug endpoint accessed:", {
    timestamp,
    url: request.url,
    method: request.method,
    headers: Object.fromEntries(request.headers.entries()),
  })

  return NextResponse.json({
    status: "ok",
    timestamp,
    message: "Debug endpoint is working",
    environment: process.env.NODE_ENV,
    apiUrl: process.env.NEXT_PUBLIC_API_URL,
  })
}

export async function POST(request: NextRequest) {
  const timestamp = new Date().toISOString()

  try {
    const body = await request.json()

    console.log("Debug POST request:", {
      timestamp,
      url: request.url,
      method: request.method,
      headers: Object.fromEntries(request.headers.entries()),
      body: JSON.stringify(body, null, 2),
    })

    return NextResponse.json({
      status: "ok",
      timestamp,
      message: "Debug POST endpoint received data",
      receivedData: body,
    })
  } catch (error) {
    console.error("Debug POST error:", {
      timestamp,
      error: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
    })

    return NextResponse.json(
      {
        status: "error",
        timestamp,
        message: "Failed to parse request body",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 400 },
    )
  }
}

export async function PUT(request: NextRequest) {
  const timestamp = new Date().toISOString()

  // Simulate various error conditions for testing
  const errorType = request.nextUrl.searchParams.get("error")

  switch (errorType) {
    case "timeout":
      await new Promise((resolve) => setTimeout(resolve, 15000)) // Longer than typical timeout
      break

    case "malformed-json":
      return new Response('{"invalid": json}', {
        status: 400,
        headers: { "content-type": "application/json" },
      })

    case "empty-response":
      return new Response("", {
        status: 200,
        headers: { "content-type": "application/json" },
      })

    case "non-json":
      return new Response("<html><body>Error</body></html>", {
        status: 500,
        headers: { "content-type": "text/html" },
      })

    case "rate-limit":
      return NextResponse.json(
        {
          detail: "Rate limit exceeded",
        },
        {
          status: 429,
          headers: { "retry-after": "60" },
        },
      )

    case "server-error":
      return NextResponse.json(
        {
          detail: "Internal server error",
        },
        { status: 500 },
      )

    case "network-error":
      throw new Error("Simulated network error")

    default:
      return NextResponse.json({
        status: "ok",
        timestamp,
        message: "Debug PUT endpoint - no error simulation",
        availableErrors: [
          "timeout",
          "malformed-json",
          "empty-response",
          "non-json",
          "rate-limit",
          "server-error",
          "network-error",
        ],
      })
  }
}
