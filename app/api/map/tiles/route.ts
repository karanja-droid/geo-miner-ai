import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const z = searchParams.get("z")
    const x = searchParams.get("x")
    const y = searchParams.get("y")
    const style = searchParams.get("style") || "satellite-v9"

    if (!z || !x || !y) {
      return NextResponse.json({ error: "Missing tile coordinates" }, { status: 400 })
    }

    // Verify authentication
    const authHeader = request.headers.get("authorization")
    if (!authHeader) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Use the server-side MAPBOX_TOKEN to fetch tiles
    const mapboxToken = process.env.MAPBOX_TOKEN
    if (!mapboxToken) {
      return NextResponse.json({ error: "Map service unavailable" }, { status: 503 })
    }

    // Proxy the request to Mapbox
    const tileUrl = `https://api.mapbox.com/styles/v1/mapbox/${style}/tiles/256/${z}/${x}/${y}?access_token=${mapboxToken}`

    const response = await fetch(tileUrl)

    if (!response.ok) {
      throw new Error(`Mapbox API error: ${response.status}`)
    }

    const tileData = await response.arrayBuffer()

    return new NextResponse(tileData, {
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "public, max-age=86400", // Cache for 24 hours
      },
    })
  } catch (error) {
    console.error("Tile proxy error:", error)
    return NextResponse.json({ error: "Failed to fetch map tiles" }, { status: 500 })
  }
}
