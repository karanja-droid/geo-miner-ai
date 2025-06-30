"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/hooks/use-toast"
import { Brain, Play, Clock, CheckCircle, AlertCircle, FileText, Zap } from "lucide-react"

interface Analysis {
  id: string
  type: string
  provider: string
  status: "pending" | "running" | "completed" | "failed"
  progress: number
  result?: string
  createdAt: string
}

export function AIAnalysisPanel() {
  const { toast } = useToast()
  const [prompt, setPrompt] = useState("")
  const [selectedProvider, setSelectedProvider] = useState("openai")
  const [selectedType, setSelectedType] = useState("geological")
  const [analyses, setAnalyses] = useState<Analysis[]>([
    {
      id: "1",
      type: "geological",
      provider: "openai",
      status: "completed",
      progress: 100,
      result:
        "Analysis indicates high potential for copper mineralization in the northeastern quadrant. Geological formations suggest porphyry-style deposits with favorable alteration patterns.",
      createdAt: "2024-01-15T10:30:00Z",
    },
    {
      id: "2",
      type: "geochemical",
      provider: "anthropic",
      status: "running",
      progress: 65,
      createdAt: "2024-01-15T11:15:00Z",
    },
  ])

  const handleStartAnalysis = async () => {
    if (!prompt.trim()) {
      toast({
        title: "Error",
        description: "Please enter an analysis prompt",
        variant: "destructive",
      })
      return
    }

    const newAnalysis: Analysis = {
      id: Date.now().toString(),
      type: selectedType,
      provider: selectedProvider,
      status: "pending",
      progress: 0,
      createdAt: new Date().toISOString(),
    }

    setAnalyses((prev) => [newAnalysis, ...prev])
    setPrompt("")

    // Simulate analysis progress
    setTimeout(() => {
      setAnalyses((prev) => prev.map((a) => (a.id === newAnalysis.id ? { ...a, status: "running", progress: 25 } : a)))
    }, 1000)

    setTimeout(() => {
      setAnalyses((prev) => prev.map((a) => (a.id === newAnalysis.id ? { ...a, progress: 75 } : a)))
    }, 3000)

    setTimeout(() => {
      setAnalyses((prev) =>
        prev.map((a) =>
          a.id === newAnalysis.id
            ? {
                ...a,
                status: "completed",
                progress: 100,
                result:
                  "AI analysis completed successfully. The geological data shows promising indicators for mineral exploration in the specified region.",
              }
            : a,
        ),
      )
    }, 5000)

    toast({
      title: "Analysis Started",
      description: "Your AI analysis has been queued for processing",
    })
  }

  const getStatusIcon = (status: Analysis["status"]) => {
    switch (status) {
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-500" />
      case "running":
        return <Zap className="h-4 w-4 text-blue-500 animate-pulse" />
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "failed":
        return <AlertCircle className="h-4 w-4 text-red-500" />
    }
  }

  const getStatusColor = (status: Analysis["status"]) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "running":
        return "bg-blue-100 text-blue-800"
      case "completed":
        return "bg-green-100 text-green-800"
      case "failed":
        return "bg-red-100 text-red-800"
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Analysis Creation Panel */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            Create AI Analysis
          </CardTitle>
          <CardDescription>Generate AI-powered geological insights using advanced language models</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Analysis Type</label>
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="geological">Geological Formation Analysis</SelectItem>
                <SelectItem value="geochemical">Geochemical Assessment</SelectItem>
                <SelectItem value="structural">Structural Analysis</SelectItem>
                <SelectItem value="mineral">Mineral Potential Evaluation</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">AI Provider</label>
            <Select value={selectedProvider} onValueChange={setSelectedProvider}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="openai">OpenAI GPT-4</SelectItem>
                <SelectItem value="anthropic">Anthropic Claude</SelectItem>
                <SelectItem value="qwen">Alibaba Qwen</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Analysis Prompt</label>
            <Textarea
              placeholder="Describe what you want to analyze... e.g., 'Analyze the geological formations in the uploaded dataset and identify potential copper mineralization zones'"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={4}
            />
          </div>

          <Button onClick={handleStartAnalysis} className="w-full">
            <Play className="mr-2 h-4 w-4" />
            Start Analysis
          </Button>
        </CardContent>
      </Card>

      {/* Analysis Results Panel */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Analysis Results
          </CardTitle>
          <CardDescription>Recent AI analysis results and status updates</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {analyses.map((analysis, index) => (
              <div key={analysis.id}>
                <div className="flex items-start justify-between space-x-4">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(analysis.status)}
                      <span className="font-medium capitalize">{analysis.type} Analysis</span>
                      <Badge variant="outline" className={getStatusColor(analysis.status)}>
                        {analysis.status}
                      </Badge>
                    </div>

                    <div className="text-sm text-muted-foreground">
                      Provider: {analysis.provider} • {new Date(analysis.createdAt).toLocaleString()}
                    </div>

                    {analysis.status === "running" && (
                      <div className="space-y-1">
                        <Progress value={analysis.progress} className="h-2" />
                        <div className="text-xs text-muted-foreground">Processing... {analysis.progress}%</div>
                      </div>
                    )}

                    {analysis.result && <div className="p-3 bg-muted rounded-lg text-sm">{analysis.result}</div>}
                  </div>
                </div>
                {index < analyses.length - 1 && <Separator className="mt-4" />}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
