import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { errors } = await request.json()

    // Log errors to your monitoring service (e.g., Sentry, DataDog, etc.)
    for (const error of errors) {
      console.error("Frontend Error:", {
        message: error.message,
        stack: error.stack,
        url: error.url,
        userAgent: error.userAgent,
        timestamp: error.timestamp,
        userId: error.userId,
        sessionId: error.sessionId,
      })

      // Send to external monitoring service
      // await sendToSentry(error)
      // await sendToDataDog(error)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error processing error reports:", error)
    return NextResponse.json({ error: "Failed to process error reports" }, { status: 500 })
  }
}
