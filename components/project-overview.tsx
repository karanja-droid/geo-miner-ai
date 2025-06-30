"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { FolderOpen, Users, Calendar, TrendingUp, MapPin, FileText, Plus } from "lucide-react"

interface Project {
  id: string
  name: string
  description: string
  status: "active" | "completed" | "on-hold"
  progress: number
  team: string[]
  location: string
  lastUpdated: string
  datasets: number
  analyses: number
}

export function ProjectOverview() {
  const projects: Project[] = [
    {
      id: "1",
      name: "Copper Ridge Exploration",
      description: "Large-scale copper exploration project in the Rocky Mountains region",
      status: "active",
      progress: 75,
      team: ["Dr. Sarah Johnson", "Mike Chen", "Lisa Rodriguez"],
      location: "Colorado, USA",
      lastUpdated: "2024-01-15",
      datasets: 23,
      analyses: 8,
    },
    {
      id: "2",
      name: "Gold Valley Assessment",
      description: "Geological assessment and mineral potential evaluation",
      status: "active",
      progress: 45,
      team: ["Dr. James Wilson", "Anna Kim"],
      location: "Nevada, USA",
      lastUpdated: "2024-01-14",
      datasets: 15,
      analyses: 5,
    },
    {
      id: "3",
      name: "Iron Mountain Survey",
      description: "Comprehensive geological survey and resource estimation",
      status: "completed",
      progress: 100,
      team: ["Dr. Robert Taylor", "Emma Davis", "Carlos Martinez"],
      location: "Utah, USA",
      lastUpdated: "2024-01-10",
      datasets: 31,
      analyses: 12,
    },
  ]

  const getStatusColor = (status: Project["status"]) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800"
      case "completed":
        return "bg-blue-100 text-blue-800"
      case "on-hold":
        return "bg-yellow-100 text-yellow-800"
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Project Overview</h2>
          <p className="text-muted-foreground">Active geological exploration projects and their progress</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          New Project
        </Button>
      </div>

      {/* Projects Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {projects.map((project) => (
          <Card key={project.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-lg">{project.name}</CardTitle>
                  <CardDescription className="line-clamp-2">{project.description}</CardDescription>
                </div>
                <Badge className={getStatusColor(project.status)}>{project.status}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Progress */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Progress</span>
                  <span>{project.progress}%</span>
                </div>
                <Progress value={project.progress} />
              </div>

              {/* Project Details */}
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>{project.location}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span>{project.team.length} team members</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>Updated {project.lastUpdated}</span>
                </div>
              </div>

              {/* Stats */}
              <div className="flex justify-between pt-2 border-t">
                <div className="text-center">
                  <div className="text-lg font-semibold">{project.datasets}</div>
                  <div className="text-xs text-muted-foreground">Datasets</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-semibold">{project.analyses}</div>
                  <div className="text-xs text-muted-foreground">Analyses</div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-2">
                <Button variant="outline" size="sm" className="flex-1 bg-transparent">
                  <FolderOpen className="mr-2 h-4 w-4" />
                  Open
                </Button>
                <Button variant="outline" size="sm" className="flex-1 bg-transparent">
                  <FileText className="mr-2 h-4 w-4" />
                  Report
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              {
                action: "AI Analysis completed",
                project: "Copper Ridge Exploration",
                time: "2 hours ago",
                type: "analysis",
              },
              {
                action: "New dataset uploaded",
                project: "Gold Valley Assessment",
                time: "4 hours ago",
                type: "upload",
              },
              {
                action: "Report generated",
                project: "Iron Mountain Survey",
                time: "1 day ago",
                type: "report",
              },
            ].map((activity, index) => (
              <div key={index} className="flex items-center justify-between py-2">
                <div className="space-y-1">
                  <div className="font-medium">{activity.action}</div>
                  <div className="text-sm text-muted-foreground">{activity.project}</div>
                </div>
                <div className="text-sm text-muted-foreground">{activity.time}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
