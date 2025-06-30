"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Map, Layers, MapPin, Maximize, Download, Filter, Eye, EyeOff } from "lucide-react"
import { mapService } from "@/lib/map-service"

interface MapLayer {
  id: string
  name: string
  type: "geological" | "topographic" | "satellite" | "mineral"
  visible: boolean
  opacity: number
}

interface GeologicalSite {
  id: string
  name: string
  type: string
  coordinates: [number, number]
  status: "active" | "inactive" | "planned"
}

export function GeologicalMap() {
  const [layers, setLayers] = useState<MapLayer[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [sites] = useState<GeologicalSite[]>([
    { id: "1", name: "Copper Ridge Site", type: "Copper Deposit", coordinates: [-74.006, 40.7128], status: "active" },
    {
      id: "2",
      name: "Gold Valley Prospect",
      type: "Gold Prospect",
      coordinates: [-74.016, 40.7228],
      status: "planned",
    },
    { id: "3", name: "Iron Mountain", type: "Iron Ore", coordinates: [-73.996, 40.7028], status: "inactive" },
  ])

  useEffect(() => {
    const loadMapConfig = async () => {
      try {
        setLoading(true)
        const config = await mapService.getMapConfig()
        setLayers(config.layers)
        setError(null)
      } catch (err) {
        setError("Failed to load map configuration")
        console.error("Map config error:", err)
        // Set fallback layers
        setLayers([
          { id: "1", name: "Geological Formations", type: "geological", visible: true, opacity: 0.8 },
          { id: "2", name: "Topographic Base", type: "topographic", visible: true, opacity: 1.0 },
          { id: "3", name: "Mineral Deposits", type: "mineral", visible: false, opacity: 0.6 },
          { id: "4", name: "Satellite Imagery", type: "satellite", visible: false, opacity: 0.7 },
        ])
      } finally {
        setLoading(false)
      }
    }

    loadMapConfig()
  }, [])

  const toggleLayer = (layerId: string) => {
    setLayers((prev) => prev.map((layer) => (layer.id === layerId ? { ...layer, visible: !layer.visible } : layer)))
  }

  const getStatusColor = (status: GeologicalSite["status"]) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800"
      case "inactive":
        return "bg-gray-100 text-gray-800"
      case "planned":
        return "bg-blue-100 text-blue-800"
    }
  }

  if (loading) {
    return (
      <div className="grid gap-6 lg:grid-cols-4">
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Layers className="h-5 w-5" />
                Loading Map...
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="animate-pulse space-y-2">
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded"></div>
              </div>
            </CardContent>
          </Card>
        </div>
        <div className="lg:col-span-3">
          <Card className="h-[600px]">
            <CardContent className="flex items-center justify-center h-full">
              <div className="text-center">
                <Map className="h-16 w-16 text-muted-foreground mx-auto animate-pulse" />
                <p className="mt-4 text-muted-foreground">Loading map configuration...</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="grid gap-6 lg:grid-cols-4">
      {/* Map Controls */}
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Layers className="h-5 w-5" />
              Map Layers
            </CardTitle>
            {error && <div className="text-sm text-amber-600 bg-amber-50 p-2 rounded">{error}</div>}
          </CardHeader>
          <CardContent className="space-y-3">
            {layers.map((layer) => (
              <div key={layer.id} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Button variant="ghost" size="sm" onClick={() => toggleLayer(layer.id)} className="p-1">
                    {layer.visible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4 text-muted-foreground" />}
                  </Button>
                  <span className="text-sm">{layer.name}</span>
                </div>
                <Badge variant="outline" className="text-xs">
                  {layer.type}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Geological Sites
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {sites.map((site) => (
              <div key={site.id} className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{site.name}</span>
                  <Badge className={getStatusColor(site.status)}>{site.status}</Badge>
                </div>
                <div className="text-xs text-muted-foreground">
                  {site.type} • {site.coordinates[1].toFixed(4)}, {site.coordinates[0].toFixed(4)}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Main Map Area */}
      <div className="lg:col-span-3">
        <Card className="h-[600px]">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Map className="h-5 w-5" />
                Interactive Geological Map
              </CardTitle>
              <CardDescription>Secure geological data visualization and analysis</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Filter className="mr-2 h-4 w-4" />
                Filter
              </Button>
              <Button variant="outline" size="sm">
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
              <Button variant="outline" size="sm">
                <Maximize className="mr-2 h-4 w-4" />
                Fullscreen
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="relative h-full bg-gradient-to-br from-green-50 to-blue-50 rounded-b-lg overflow-hidden">
              {/* Secure map implementation placeholder */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center space-y-4">
                  <Map className="h-16 w-16 text-muted-foreground mx-auto" />
                  <div>
                    <h3 className="text-lg font-semibold">Secure Interactive Map</h3>
                    <p className="text-muted-foreground">
                      Geological formations, mineral deposits, and exploration sites
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">Map tiles loaded securely via server proxy</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mt-8">
                    {sites.map((site) => (
                      <div key={site.id} className="bg-white/80 backdrop-blur-sm rounded-lg p-3 border shadow-sm">
                        <div className="flex items-center gap-2 mb-1">
                          <MapPin className="h-4 w-4 text-primary" />
                          <span className="font-medium text-sm">{site.name}</span>
                        </div>
                        <div className="text-xs text-muted-foreground">{site.type}</div>
                        <Badge className={`${getStatusColor(site.status)} mt-1`} size="sm">
                          {site.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
