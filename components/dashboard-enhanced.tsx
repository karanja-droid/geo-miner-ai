"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { GeologicalCard } from "@/components/ui/geological-card"
import { Button } from "@/components/ui/button-enhanced"
import { ProjectOverview } from "./project-overview-enhanced"
import { AIAnalysisPanel } from "./ai-analysis-panel-enhanced"
import { GeologicalMap } from "./geological-map-enhanced"
import { DatasetManager } from "./dataset-manager-enhanced"
import { RealtimeUpdates } from "./realtime-updates-enhanced"
import { Database, Brain, Users, FileText, TrendingUp, MapPin, AlertTriangle } from "lucide-react"
import { typographySystem } from "@/lib/typography-system"
import { cn } from "@/lib/utils"

interface DashboardStats {
  activeProjects: number
  totalDatasets: number
  aiAnalyses: number
  teamMembers: number
  criticalAlerts: number
  geologicalSites: number
}

interface RecentActivity {
  id: string
  type: "analysis" | "upload" | "alert" | "collaboration"
  title: string
  description: string
  timestamp: string
  priority: "low" | "medium" | "high" | "critical"
  mineralType?: string
  project?: string
}

export function DashboardEnhanced() {
  const [stats, setStats] = useState<DashboardStats>({
    activeProjects: 12,
    totalDatasets: 847,
    aiAnalyses: 156,
    teamMembers: 8,
    criticalAlerts: 3,
    geologicalSites: 24,
  })

  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([
    {
      id: "1",
      type: "analysis",
      title: "Copper Deposit Analysis Complete",
      description: "High-grade copper mineralization identified in sector 7",
      timestamp: new Date().toISOString(),
      priority: "high",
      mineralType: "copper",
      project: "Copper Ridge Exploration",
    },
    {
      id: "2",
      type: "alert",
      title: "Equipment Calibration Required",
      description: "Spectrometer readings showing drift beyond tolerance",
      timestamp: new Date(Date.now() - 300000).toISOString(),
      priority: "critical",
      project: "Gold Valley Assessment",
    },
    {
      id: "3",
      type: "upload",
      title: "New Drill Core Data",
      description: "15 new core samples uploaded with XRF analysis",
      timestamp: new Date(Date.now() - 600000).toISOString(),
      priority: "medium",
      mineralType: "iron",
      project: "Iron Mountain Survey",
    },
  ])

  const [selectedTab, setSelectedTab] = useState("overview")
  const [dashboardLayout, setDashboardLayout] = useState<"1-column" | "2-column" | "3-column">("3-column")

  // Responsive layout management
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth
      if (width < 768) {
        setDashboardLayout("1-column")
      } else if (width < 1024) {
        setDashboardLayout("2-column")
      } else {
        setDashboardLayout("3-column")
      }
    }

    handleResize()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  const getGridCols = () => {
    switch (dashboardLayout) {
      case "1-column":
        return "grid-cols-1"
      case "2-column":
        return "grid-cols-1 md:grid-cols-2"
      case "3-column":
        return "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
      default:
        return "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
    }
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Enhanced Header with Typography System */}
      <div className="flex flex-col space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
          <div className="space-y-2">
            <h1 className="font-bold tracking-tight" style={typographySystem.headings.h1}>
              Geological Exploration Dashboard
            </h1>
            <p className="text-muted-foreground" style={typographySystem.body.large}>
              AI-powered mining intelligence and geological analysis platform
            </p>
          </div>

          {stats.criticalAlerts > 0 && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <span className="text-sm font-medium text-red-800">
                {stats.criticalAlerts} Critical Alert{stats.criticalAlerts > 1 ? "s" : ""}
              </span>
              <Button variant="outline" size="sm" className="ml-2 bg-transparent">
                Review
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Enhanced Stats Cards with Geological Styling */}
      <div className={cn("grid gap-4", getGridCols())}>
        <GeologicalCard
          variant="geological"
          title="Active Projects"
          metadata={[
            { label: "Total", value: stats.activeProjects.toString(), icon: <Database className="h-4 w-4" /> },
            { label: "This Month", value: "+2", icon: <TrendingUp className="h-4 w-4" /> },
          ]}
          actions={[{ label: "View All", onClick: () => setSelectedTab("overview") }]}
        />

        <GeologicalCard
          variant="mineral"
          title="Total Datasets"
          metadata={[
            { label: "Count", value: stats.totalDatasets.toString(), icon: <FileText className="h-4 w-4" /> },
            { label: "This Week", value: "+47", icon: <TrendingUp className="h-4 w-4" /> },
          ]}
          actions={[{ label: "Manage", onClick: () => setSelectedTab("datasets") }]}
        />

        <GeologicalCard
          variant="analysis"
          title="AI Analyses"
          metadata={[
            { label: "Completed", value: stats.aiAnalyses.toString(), icon: <Brain className="h-4 w-4" /> },
            { label: "This Week", value: "+23", icon: <TrendingUp className="h-4 w-4" /> },
          ]}
          actions={[{ label: "New Analysis", onClick: () => setSelectedTab("analysis") }]}
        />

        {dashboardLayout === "3-column" && (
          <GeologicalCard
            variant="default"
            title="Team Members"
            metadata={[
              { label: "Active", value: stats.teamMembers.toString(), icon: <Users className="h-4 w-4" /> },
              { label: "Online", value: "6", icon: <Users className="h-4 w-4" /> },
            ]}
          />
        )}

        {dashboardLayout === "3-column" && (
          <GeologicalCard
            variant="geological"
            title="Geological Sites"
            metadata={[
              { label: "Mapped", value: stats.geologicalSites.toString(), icon: <MapPin className="h-4 w-4" /> },
              { label: "Active", value: "12", icon: <MapPin className="h-4 w-4" /> },
            ]}
            actions={[{ label: "View Map", onClick: () => setSelectedTab("maps") }]}
          />
        )}

        {dashboardLayout !== "1-column" && (
          <GeologicalCard
            variant="critical"
            title="System Status"
            status="active"
            metadata={[
              { label: "Uptime", value: "99.8%", icon: <TrendingUp className="h-4 w-4" /> },
              { label: "Alerts", value: stats.criticalAlerts.toString(), icon: <AlertTriangle className="h-4 w-4" /> },
            ]}
            priority={stats.criticalAlerts > 0 ? "critical" : "low"}
          />
        )}
      </div>

      {/* Recent Activity Summary - Mobile Optimized */}
      {dashboardLayout === "1-column" && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentActivity.slice(0, 3).map((activity) => (
                <div key={activity.id} className="flex items-start gap-3 p-3 border rounded-lg">
                  <div
                    className={cn(
                      "w-2 h-2 rounded-full mt-2",
                      activity.priority === "critical"
                        ? "bg-red-500"
                        : activity.priority === "high"
                          ? "bg-orange-500"
                          : activity.priority === "medium"
                            ? "bg-yellow-500"
                            : "bg-green-500",
                    )}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium truncate">{activity.title}</p>
                      <span className="text-xs text-muted-foreground ml-2">
                        {new Date(activity.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{activity.description}</p>
                    {activity.project && <p className="text-xs text-blue-600 mt-1">{activity.project}</p>}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Enhanced Main Content Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="analysis">AI Analysis</TabsTrigger>
          <TabsTrigger value="maps" className="hidden lg:flex">
            Maps
          </TabsTrigger>
          <TabsTrigger value="datasets" className="hidden lg:flex">
            Datasets
          </TabsTrigger>
          <TabsTrigger value="realtime" className="hidden lg:flex">
            Real-time
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <ProjectOverview />
        </TabsContent>

        <TabsContent value="analysis" className="space-y-4">
          <AIAnalysisPanel />
        </TabsContent>

        <TabsContent value="maps" className="space-y-4">
          <GeologicalMap />
        </TabsContent>

        <TabsContent value="datasets" className="space-y-4">
          <DatasetManager />
        </TabsContent>

        <TabsContent value="realtime" className="space-y-4">
          <RealtimeUpdates />
        </TabsContent>
      </Tabs>
    </div>
  )
}
