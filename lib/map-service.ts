interface MapConfig {
  center: [number, number]
  zoom: number
  style: string
  layers: Array<{
    id: string
    name: string
    type: "geological" | "topographic" | "satellite" | "mineral"
    visible: boolean
    opacity: number
  }>
}

interface TileCoordinates {
  z: number
  x: number
  y: number
}

export class MapService {
  private static instance: MapService
  private config: MapConfig | null = null

  private constructor() {}

  static getInstance(): MapService {
    if (!MapService.instance) {
      MapService.instance = new MapService()
    }
    return MapService.instance
  }

  async getMapConfig(): Promise<MapConfig> {
    if (this.config) {
      return this.config
    }

    try {
      const response = await fetch("/api/map/config", {
        headers: {
          Authorization: `Bearer ${this.getAuthToken()}`,
        },
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch map config: ${response.status}`)
      }

      this.config = await response.json()
      return this.config!
    } catch (error) {
      console.error("Error fetching map config:", error)
      // Return fallback config
      return {
        center: [-74.006, 40.7128],
        zoom: 10,
        style: "satellite-v9",
        layers: [],
      }
    }
  }

  async getTileUrl(coordinates: TileCoordinates, style?: string): Promise<string> {
    const params = new URLSearchParams({
      z: coordinates.z.toString(),
      x: coordinates.x.toString(),
      y: coordinates.y.toString(),
    })

    if (style) {
      params.set("style", style)
    }

    return `/api/map/tiles?${params.toString()}`
  }

  private getAuthToken(): string {
    // Get auth token from your auth context/localStorage/cookies
    // This is a placeholder - implement based on your auth system
    return localStorage.getItem("authToken") || ""
  }

  clearCache(): void {
    this.config = null
  }
}

export const mapService = MapService.getInstance()
