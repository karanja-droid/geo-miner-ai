"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Upload, FileText, Database, Search, Download, Trash2, Eye, MoreHorizontal } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useToast } from "@/hooks/use-toast"

interface Dataset {
  id: string
  name: string
  type: "csv" | "excel" | "shapefile" | "geojson" | "pdf" | "image"
  size: string
  uploadDate: string
  status: "processing" | "ready" | "error"
  records?: number
}

export function DatasetManager() {
  const { toast } = useToast()
  const [searchTerm, setSearchTerm] = useState("")
  const [datasets, setDatasets] = useState<Dataset[]>([
    {
      id: "1",
      name: "Copper_Geochemistry_2024.csv",
      type: "csv",
      size: "2.4 MB",
      uploadDate: "2024-01-15",
      status: "ready",
      records: 15420,
    },
    {
      id: "2",
      name: "Geological_Survey_Data.xlsx",
      type: "excel",
      size: "8.7 MB",
      uploadDate: "2024-01-14",
      status: "ready",
      records: 3280,
    },
    {
      id: "3",
      name: "Mining_Boundaries.shp",
      type: "shapefile",
      size: "1.2 MB",
      uploadDate: "2024-01-13",
      status: "processing",
    },
    {
      id: "4",
      name: "Drill_Core_Analysis.pdf",
      type: "pdf",
      size: "15.3 MB",
      uploadDate: "2024-01-12",
      status: "ready",
    },
  ])

  const [uploadProgress, setUploadProgress] = useState(0)
  const [isUploading, setIsUploading] = useState(false)

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files || files.length === 0) return

    setIsUploading(true)
    setUploadProgress(0)

    // Simulate upload progress
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          setIsUploading(false)

          // Add new dataset
          const newDataset: Dataset = {
            id: Date.now().toString(),
            name: files[0].name,
            type: (files[0].name.split(".").pop() as Dataset["type"]) || "csv",
            size: `${(files[0].size / 1024 / 1024).toFixed(1)} MB`,
            uploadDate: new Date().toISOString().split("T")[0],
            status: "processing",
          }

          setDatasets((prev) => [newDataset, ...prev])

          toast({
            title: "Upload Complete",
            description: `${files[0].name} has been uploaded successfully`,
          })

          return 0
        }
        return prev + 10
      })
    }, 200)
  }

  const getTypeIcon = (type: Dataset["type"]) => {
    switch (type) {
      case "csv":
      case "excel":
        return <FileText className="h-4 w-4" />
      case "shapefile":
      case "geojson":
        return <Database className="h-4 w-4" />
      default:
        return <FileText className="h-4 w-4" />
    }
  }

  const getStatusColor = (status: Dataset["status"]) => {
    switch (status) {
      case "ready":
        return "bg-green-100 text-green-800"
      case "processing":
        return "bg-yellow-100 text-yellow-800"
      case "error":
        return "bg-red-100 text-red-800"
    }
  }

  const filteredDatasets = datasets.filter((dataset) => dataset.name.toLowerCase().includes(searchTerm.toLowerCase()))

  return (
    <div className="space-y-6">
      {/* Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Upload Dataset
          </CardTitle>
          <CardDescription>Upload geological data files for analysis and visualization</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
              <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <div className="space-y-2">
                <p className="text-sm font-medium">Drop files here or click to browse</p>
                <p className="text-xs text-muted-foreground">
                  Supports CSV, Excel, Shapefile, GeoJSON, PDF, and image files
                </p>
              </div>
              <input
                type="file"
                multiple
                onChange={handleFileUpload}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                accept=".csv,.xlsx,.xls,.shp,.geojson,.pdf,.jpg,.jpeg,.png"
              />
            </div>

            {isUploading && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Uploading...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <Progress value={uploadProgress} />
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Dataset List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Dataset Library
              </CardTitle>
              <CardDescription>Manage and analyze your geological datasets</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search datasets..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 w-64"
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredDatasets.map((dataset) => (
              <div key={dataset.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center justify-center w-10 h-10 bg-muted rounded-lg">
                    {getTypeIcon(dataset.type)}
                  </div>
                  <div className="space-y-1">
                    <div className="font-medium">{dataset.name}</div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>{dataset.size}</span>
                      <span>•</span>
                      <span>{dataset.uploadDate}</span>
                      {dataset.records && (
                        <>
                          <span>•</span>
                          <span>{dataset.records.toLocaleString()} records</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Badge className={getStatusColor(dataset.status)}>{dataset.status}</Badge>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <Eye className="mr-2 h-4 w-4" />
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Download className="mr-2 h-4 w-4" />
                        Download
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-red-600">
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
