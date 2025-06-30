import type { Meta, StoryObj } from "@storybook/react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./card"
import { Badge } from "./badge"
import { Button } from "./button"
import { Progress } from "./progress"
import { Database, TrendingUp, Users, MapPin } from "lucide-react"

const meta: Meta<typeof Card> = {
  title: "UI/Card",
  component: Card,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: "Flexible card component for displaying geological project information",
      },
    },
    chromatic: {
      viewports: [375, 768, 1024],
    },
  },
  tags: ["autodocs"],
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <Card className="w-96">
      <CardHeader>
        <CardTitle>Copper Ridge Exploration</CardTitle>
        <CardDescription>Large-scale copper exploration project in the Rocky Mountains region</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          This project involves comprehensive geological surveys and mineral assessment in the Colorado region.
        </p>
      </CardContent>
    </Card>
  ),
}

export const ProjectCard: Story = {
  name: "Project Card",
  render: () => (
    <Card className="w-96 hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg">Gold Valley Assessment</CardTitle>
            <CardDescription className="line-clamp-2">
              Geological assessment and mineral potential evaluation in Nevada
            </CardDescription>
          </div>
          <Badge className="bg-green-100 text-green-800">Active</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Progress</span>
            <span>75%</span>
          </div>
          <Progress value={75} />
        </div>

        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <span>Nevada, USA</span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span>3 team members</span>
          </div>
        </div>

        <div className="flex justify-between pt-2 border-t">
          <div className="text-center">
            <div className="text-lg font-semibold">15</div>
            <div className="text-xs text-muted-foreground">Datasets</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold">5</div>
            <div className="text-xs text-muted-foreground">Analyses</div>
          </div>
        </div>

        <div className="flex gap-2 pt-2">
          <Button variant="outline" size="sm" className="flex-1 bg-transparent">
            Open
          </Button>
          <Button variant="outline" size="sm" className="flex-1 bg-transparent">
            Report
          </Button>
        </div>
      </CardContent>
    </Card>
  ),
  parameters: {
    docs: {
      description: {
        story: "Complete project card with progress, stats, and actions",
      },
    },
  },
}

export const StatsCard: Story = {
  name: "Stats Card",
  render: () => (
    <Card className="w-64">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
        <Database className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">12</div>
        <p className="text-xs text-muted-foreground">+2 from last month</p>
      </CardContent>
    </Card>
  ),
  parameters: {
    docs: {
      description: {
        story: "Statistics card for dashboard metrics",
      },
    },
  },
}

export const AnalysisCard: Story = {
  name: "Analysis Card",
  render: () => (
    <Card className="w-96">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Geological Analysis Results
        </CardTitle>
        <CardDescription>AI-powered analysis of copper mineralization potential</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-3 bg-muted rounded-lg text-sm">
          Analysis indicates high potential for copper mineralization in the northeastern quadrant. Geological
          formations suggest porphyry-style deposits with favorable alteration patterns.
        </div>
        <div className="flex items-center justify-between text-sm">
          <span>Confidence Score</span>
          <Badge variant="outline" className="bg-green-100 text-green-800">
            85%
          </Badge>
        </div>
        <div className="text-xs text-muted-foreground">
          Analysis completed on January 15, 2024 • Processing time: 30 minutes
        </div>
      </CardContent>
    </Card>
  ),
  parameters: {
    docs: {
      description: {
        story: "Analysis results card with AI insights",
      },
    },
  },
}

export const DarkTheme: Story = {
  name: "Dark Theme Cards",
  render: () => (
    <div className="dark bg-slate-900 p-6 space-y-4">
      <Card className="w-96">
        <CardHeader>
          <CardTitle>Iron Mountain Survey</CardTitle>
          <CardDescription>Comprehensive geological survey and resource estimation</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <Badge className="bg-blue-100 text-blue-800">Completed</Badge>
            <span className="text-sm text-muted-foreground">100% Complete</span>
          </div>
        </CardContent>
      </Card>
    </div>
  ),
  parameters: {
    backgrounds: { default: "dark" },
    docs: {
      description: {
        story: "Cards in dark theme mode",
      },
    },
  },
}
