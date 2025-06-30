import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    // Verify the request is authenticated (add your auth logic here)
    const authHeader = request.headers.get("authorization")
    if (!authHeader) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Return map configuration without exposing the token
    const mapConfig = {
      center: [-74.006, 40.7128] as [number, number],
      zoom: 10,
      style: "mapbox://styles/mapbox/satellite-v9",
      layers: [
        {
          id: "geological-formations",
          name: "Geological Formations",
          type: "geological" as const,
          visible: true,
          opacity: 0.8,
        },
        {
          id: "topographic-base",
          name: "Topographic Base",
          type: "topographic" as const,
          visible: true,
          opacity: 1.0,
        },
        {
          id: "mineral-deposits",
          name: "Mineral Deposits",
          type: "mineral" as const,
          visible: false,
          opacity: 0.6,
        },
      ],
    }

    return NextResponse.json(mapConfig)
  } catch (error) {
    console.error("Map config error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
