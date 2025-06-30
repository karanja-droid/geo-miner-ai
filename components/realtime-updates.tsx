"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Activity, Zap, Bell, AlertTriangle, Info, Pause, Play } from "lucide-react"

interface RealtimeEvent {
  id: string
  type: "analysis" | "upload" | "alert" | "system"
  title: string
  description: string
  timestamp: string
  status: "info" | "success" | "warning" | "error"
  project?: string
}

export function RealtimeUpdates() {
  const [isConnected, setIsConnected] = useState(true)
  const [events, setEvents] = useState<RealtimeEvent[]>([
    {
      id: "1",
      type: "analysis",
      title: "AI Analysis Completed",
      description: "Geological formation analysis finished for Copper Ridge dataset",
      timestamp: new Date().toISOString(),
      status: "success",
      project: "Copper Ridge Exploration",
    },
    {
      id: "2",
      type: "upload",
      title: "Dataset Processing",
      description: "New geochemical data is being processed",
      timestamp: new Date(Date.now() - 300000).toISOString(),
      status: "info",
      project: "Gold Valley Assessment",
    },
    {
      id: "3",
      type: "alert",
      title: "Anomaly Detected",
      description: "Unusual mineral concentration patterns identified in sector 7",
      timestamp: new Date(Date.now() - 600000).toISOString(),
      status: "warning",
      project: "Iron Mountain Survey",
    },
  ])

  // Simulate real-time updates
  useEffect(() => {
    if (!isConnected) return

    const interval = setInterval(() => {
      const newEvent: RealtimeEvent = {
        id: Date.now().toString(),
        type: ["analysis", "upload", "alert", "system"][Math.floor(Math.random() * 4)] as RealtimeEvent["type"],
        title: ["New Analysis Started", "Data Upload Complete", "System Update", "Collaboration Update"][
          Math.floor(Math.random() * 4)
        ],
        description: "Real-time system update notification",
        timestamp: new Date().toISOString(),
        status: ["info", "success", "warning"][Math.floor(Math.random() * 3)] as RealtimeEvent["status"],
        project: ["Copper Ridge Exploration", "Gold Valley Assessment", "Iron Mountain Survey"][
          Math.floor(Math.random() * 3)
        ],
      }

      setEvents((prev) => [newEvent, ...prev.slice(0, 9)])
    }, 10000)

    return () => clearInterval(interval)
  }, [isConnected])

  const getEventIcon = (type: RealtimeEvent["type"]) => {
    switch (type) {
      case "analysis":
        return <Zap className="h-4 w-4" />
      case "upload":
        return <Activity className="h-4 w-4" />
      case "alert":
        return <AlertTriangle className="h-4 w-4" />
      case "system":
        return <Info className="h-4 w-4" />
    }
  }

  const getStatusColor = (status: RealtimeEvent["status"]) => {
    switch (status) {
      case "info":
        return "bg-blue-100 text-blue-800"
      case "success":
        return "bg-green-100 text-green-800"
      case "warning":
        return "bg-yellow-100 text-yellow-800"
      case "error":
        return "bg-red-100 text-red-800"
    }
  }

  const toggleConnection = () => {
    setIsConnected(!isConnected)
  }

  return (
    <div className="space-y-6">
      {/* Connection Status */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Real-time System Status
              </CardTitle>
              <CardDescription>Live updates from geological analysis and data processing</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${isConnected ? "bg-green-500" : "bg-red-500"}`} />
              <span className="text-sm font-medium">{isConnected ? "Connected" : "Disconnected"}</span>
              <Button variant="outline" size="sm" onClick={toggleConnection}>
                {isConnected ? (
                  <>
                    <Pause className="mr-2 h-4 w-4" />
                    Pause
                  </>
                ) : (
                  <>
                    <Play className="mr-2 h-4 w-4" />
                    Connect
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-green-600">3</div>
              <div className="text-sm text-muted-foreground">Active Analyses</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-600">12</div>
              <div className="text-sm text-muted-foreground">Processing Jobs</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-yellow-600">1</div>
              <div className="text-sm text-muted-foreground">Pending Alerts</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Live Event Feed */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Live Event Feed
          </CardTitle>
          <CardDescription>Real-time notifications and system updates</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {events.map((event) => (
              <div key={event.id} className="flex items-start space-x-3 p-3 border rounded-lg">
                <div className="flex items-center justify-center w-8 h-8 bg-muted rounded-full">
                  {getEventIcon(event.type)}
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <div className="font-medium">{event.title}</div>
                    <div className="flex items-center gap-2">
                      <Badge className={getStatusColor(event.status)}>{event.status}</Badge>
                      <span className="text-xs text-muted-foreground">
                        {new Date(event.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground">{event.description}</div>
                  {event.project && <div className="text-xs text-muted-foreground">Project: {event.project}</div>}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
