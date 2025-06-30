"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button-enhanced"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Download, Maximize, Eye, EyeOff } from "lucide-react"
import { colorSystem } from "@/lib/color-system"

interface DataPoint {
  x: number
  y: number
  value: number
  mineral?: string
  confidence?: number
  metadata?: Record<string, any>
}

interface ChartLayer {
  id: string
  name: string
  data: DataPoint[]
  visible: boolean
  color: string
  type: "scatter" | "heatmap" | "contour" | "geological"
}

interface GeologicalChartProps {
  title: string
  description?: string
  layers: ChartLayer[]
  width?: number
  height?: number
  interactive?: boolean
  exportable?: boolean
  mineralFilter?: string[]
  onDataPointClick?: (point: DataPoint, layer: ChartLayer) => void
}

export function GeologicalChart({
  title,
  description,
  layers: initialLayers,
  width,
  height,
  interactive = true,
  exportable = true,
  mineralFilter = [],
  onDataPointClick,
}: GeologicalChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [layers, setLayers] = useState(initialLayers)
  const [selectedLayer, setSelectedLayer] = useState<string>("all")
  const [chartType, setChartType] = useState<"2d" | "3d">("2d")
  const [zoomLevel, setZoomLevel] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [dimensions, setDimensions] = useState({ width: 800, height: 400 })

  // Responsive canvas sizing
  useEffect(() => {
    const updateDimensions = () => {
      const container = canvasRef.current?.parentElement
      if (container) {
        const containerWidth = container.clientWidth
        const isMobile = window.innerWidth < 768
        const isTablet = window.innerWidth < 1024

        setDimensions({
          width: width || containerWidth - 48, // Account for padding
          height: height || (isMobile ? 200 : isTablet ? 300 : 400),
        })
      }
    }

    updateDimensions()
    window.addEventListener("resize", updateDimensions)
    return () => window.removeEventListener("resize", updateDimensions)
  }, [width, height])

  // Enhanced drawing function with geological styling
  const drawChart = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas size
    canvas.width = dimensions.width
    canvas.height = dimensions.height

    // Clear canvas
    ctx.fillStyle = "#ffffff"
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Draw grid
    drawGrid(ctx)

    // Draw layers
    layers.forEach((layer) => {
      if (layer.visible && (selectedLayer === "all" || selectedLayer === layer.id)) {
        drawLayer(ctx, layer)
      }
    })

    // Draw legend
    drawLegend(ctx)
  }

  const drawGrid = (ctx: CanvasRenderingContext2D) => {
    ctx.strokeStyle = "#e5e7eb"
    ctx.lineWidth = 1

    const gridSize = 50 * zoomLevel
    const offsetX = pan.x % gridSize
    const offsetY = pan.y % gridSize

    // Vertical lines
    for (let x = offsetX; x < dimensions.width; x += gridSize) {
      ctx.beginPath()
      ctx.moveTo(x, 0)
      ctx.lineTo(x, dimensions.height)
      ctx.stroke()
    }

    // Horizontal lines
    for (let y = offsetY; y < dimensions.height; y += gridSize) {
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(dimensions.width, y)
      ctx.stroke()
    }
  }

  const drawLayer = (ctx: CanvasRenderingContext2D, layer: ChartLayer) => {
    switch (layer.type) {
      case "scatter":
        drawScatterLayer(ctx, layer)
        break
      case "heatmap":
        drawHeatmapLayer(ctx, layer)
        break
      case "geological":
        drawGeologicalLayer(ctx, layer)
        break
      default:
        drawScatterLayer(ctx, layer)
    }
  }

  const drawScatterLayer = (ctx: CanvasRenderingContext2D, layer: ChartLayer) => {
    layer.data.forEach((point) => {
      if (mineralFilter.length > 0 && point.mineral && !mineralFilter.includes(point.mineral)) {
        return
      }

      const x = point.x * zoomLevel + pan.x
      const y = point.y * zoomLevel + pan.y

      // Skip points outside canvas
      if (x < 0 || x > dimensions.width || y < 0 || y > dimensions.height) return

      // Color based on mineral type or value
      let color = layer.color
      if (
        point.mineral &&
        colorSystem.geological.minerals[point.mineral as keyof typeof colorSystem.geological.minerals]
      ) {
        color = colorSystem.geological.minerals[point.mineral as keyof typeof colorSystem.geological.minerals][500]
      }

      ctx.fillStyle = color
      ctx.beginPath()

      // Size based on value or confidence
      const size = Math.max(2, Math.min(8, (point.value || 1) * 3))
      ctx.arc(x, y, size, 0, 2 * Math.PI)
      ctx.fill()

      // Add confidence indicator
      if (point.confidence !== undefined) {
        ctx.strokeStyle = color
        ctx.lineWidth = 1
        ctx.globalAlpha = point.confidence
        ctx.beginPath()
        ctx.arc(x, y, size + 2, 0, 2 * Math.PI)
        ctx.stroke()
        ctx.globalAlpha = 1
      }
    })
  }

  const drawHeatmapLayer = (ctx: CanvasRenderingContext2D, layer: ChartLayer) => {
    // Create heatmap using ImageData for performance
    const imageData = ctx.createImageData(dimensions.width, dimensions.height)
    const data = imageData.data

    layer.data.forEach((point) => {
      const x = Math.floor(point.x * zoomLevel + pan.x)
      const y = Math.floor(point.y * zoomLevel + pan.y)

      if (x >= 0 && x < dimensions.width && y >= 0 && y < dimensions.height) {
        const index = (y * dimensions.width + x) * 4
        const intensity = Math.min(255, (point.value || 0) * 255)

        data[index] = intensity // Red
        data[index + 1] = 0 // Green
        data[index + 2] = 255 - intensity // Blue
        data[index + 3] = 128 // Alpha
      }
    })

    ctx.putImageData(imageData, 0, 0)
  }

  const drawGeologicalLayer = (ctx: CanvasRenderingContext2D, layer: ChartLayer) => {
    // Group points by geological formation
    const formations: Record<string, DataPoint[]> = {}

    layer.data.forEach((point) => {
      const formation = point.metadata?.formation || "unknown"
      if (!formations[formation]) {
        formations[formation] = []
      }
      formations[formation].push(point)
    })

    // Draw each formation as a polygon or area
    Object.entries(formations).forEach(([formation, points]) => {
      if (points.length < 3) return

      const color =
        colorSystem.geological.formations[formation as keyof typeof colorSystem.geological.formations]?.[300] ||
        layer.color

      ctx.fillStyle = color
      ctx.globalAlpha = 0.3
      ctx.beginPath()

      const firstPoint = points[0]
      ctx.moveTo(firstPoint.x * zoomLevel + pan.x, firstPoint.y * zoomLevel + pan.y)

      points.slice(1).forEach((point) => {
        ctx.lineTo(point.x * zoomLevel + pan.x, point.y * zoomLevel + pan.y)
      })

      ctx.closePath()
      ctx.fill()
      ctx.globalAlpha = 1
    })
  }

  const drawLegend = (ctx: CanvasRenderingContext2D) => {
    const legendX = dimensions.width - 150
    const legendY = 20
    let currentY = legendY

    ctx.fillStyle = "rgba(255, 255, 255, 0.9)"
    ctx.fillRect(legendX, legendY, 140, layers.length * 25 + 20)
    ctx.strokeStyle = "#e5e7eb"
    ctx.strokeRect(legendX, legendY, 140, layers.length * 25 + 20)

    layers.forEach((layer) => {
      if (layer.visible) {
        ctx.fillStyle = layer.color
        ctx.fillRect(legendX + 10, currentY + 10, 15, 10)

        ctx.fillStyle = "#374151"
        ctx.font = "12px Inter"
        ctx.fillText(layer.name, legendX + 35, currentY + 18)

        currentY += 25
      }
    })
  }

  // Canvas event handlers for interactivity
  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!interactive || !onDataPointClick) return

    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top

    // Find clicked data point
    layers.forEach((layer) => {
      if (!layer.visible) return

      layer.data.forEach((point) => {
        const pointX = point.x * zoomLevel + pan.x
        const pointY = point.y * zoomLevel + pan.y
        const distance = Math.sqrt((x - pointX) ** 2 + (y - pointY) ** 2)

        if (distance <= 8) {
          onDataPointClick(point, layer)
        }
      })
    })
  }

  const toggleLayerVisibility = (layerId: string) => {
    setLayers((prev) => prev.map((layer) => (layer.id === layerId ? { ...layer, visible: !layer.visible } : layer)))
  }

  const exportChart = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const link = document.createElement("a")
    link.download = `${title.replace(/\s+/g, "_")}.png`
    link.href = canvas.toDataURL()
    link.click()
  }

  // Redraw chart when dependencies change
  useEffect(() => {
    drawChart()
  }, [layers, selectedLayer, zoomLevel, pan, dimensions])

  return (
    <Card className={`${isFullscreen ? "fixed inset-0 z-50" : ""}`}>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">
            {title}
            <Badge variant="outline" className="text-xs">
              {layers.filter((l) => l.visible).length} layers
            </Badge>
          </CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </div>

        <div className="flex items-center gap-2">
          <Select value={selectedLayer} onValueChange={setSelectedLayer}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Layers</SelectItem>
              {layers.map((layer) => (
                <SelectItem key={layer.id} value={layer.id}>
                  {layer.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {exportable && (
            <Button variant="outline" size="sm" onClick={exportChart}>
              <Download className="h-4 w-4" />
            </Button>
          )}

          <Button variant="outline" size="sm" onClick={() => setIsFullscreen(!isFullscreen)}>
            <Maximize className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Layer Controls */}
        <div className="flex flex-wrap gap-2">
          {layers.map((layer) => (
            <Button
              key={layer.id}
              variant="outline"
              size="sm"
              onClick={() => toggleLayerVisibility(layer.id)}
              className={`${layer.visible ? "bg-blue-50" : "opacity-50"}`}
            >
              {layer.visible ? <Eye className="h-3 w-3 mr-1" /> : <EyeOff className="h-3 w-3 mr-1" />}
              {layer.name}
            </Button>
          ))}
        </div>

        {/* Chart Canvas */}
        <div className="relative border rounded-lg overflow-hidden">
          <canvas
            ref={canvasRef}
            onClick={handleCanvasClick}
            className="cursor-crosshair"
            style={{
              width: dimensions.width,
              height: dimensions.height,
              display: "block",
            }}
          />
        </div>

        {/* Chart Controls */}
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-4">
            <span>Zoom: {Math.round(zoomLevel * 100)}%</span>
            <Button variant="outline" size="sm" onClick={() => setZoomLevel((prev) => Math.min(3, prev * 1.2))}>
              +
            </Button>
            <Button variant="outline" size="sm" onClick={() => setZoomLevel((prev) => Math.max(0.1, prev / 1.2))}>
              -
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setZoomLevel(1)
                setPan({ x: 0, y: 0 })
              }}
            >
              Reset
            </Button>
          </div>

          <div>Total Points: {layers.reduce((sum, layer) => sum + (layer.visible ? layer.data.length : 0), 0)}</div>
        </div>
      </CardContent>
    </Card>
  )
}
