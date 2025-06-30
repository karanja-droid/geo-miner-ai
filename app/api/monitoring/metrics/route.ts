import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { metrics } = await request.json()

    // Log metrics to your monitoring service
    for (const metric of metrics) {
      console.log("Performance Metric:", {
        name: metric.name,
        value: metric.value,
        timestamp: metric.timestamp,
        url: metric.url,
        userId: metric.userId,
      })

      // Send to external monitoring service
      // await sendToDataDog(metric)
      // await sendToNewRelic(metric)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error processing metrics:", error)
    return NextResponse.json({ error: "Failed to process metrics" }, { status: 500 })
  }
}
