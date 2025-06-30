"use client"

import type React from "react"
import { useState, useCallback } from "react"
import { useForm, Controller, type FieldError } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button-enhanced"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Upload, X, FileText, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"

// Geological data validation schema
const geologicalSampleSchema = z.object({
  // Basic Information
  sampleId: z
    .string()
    .min(1, "Sample ID is required")
    .regex(/^[A-Z]{2}-\d{4}-\d{3}$/, "Format: XX-YYYY-NNN"),
  siteName: z.string().min(2, "Site name must be at least 2 characters"),
  coordinates: z.object({
    latitude: z.number().min(-90).max(90),
    longitude: z.number().min(-180).max(180),
    elevation: z.number().optional(),
  }),

  // Geological Information
  geologicalFormation: z.enum(["sedimentary", "igneous", "metamorphic"]),
  rockType: z.string().min(1, "Rock type is required"),
  mineralComposition: z
    .array(
      z.object({
        mineral: z.string(),
        percentage: z.number().min(0).max(100),
      }),
    )
    .min(1, "At least one mineral must be specified"),

  // Sample Details
  sampleDate: z.string().min(1, "Sample date is required"),
  depth: z.number().min(0, "Depth must be positive").optional(),
  sampleType: z.enum(["surface", "drill_core", "outcrop", "stream_sediment"]),
  weight: z.number().min(0, "Weight must be positive"),

  // Analysis Request
  analysisTypes: z.array(z.string()).min(1, "At least one analysis type must be selected"),
  priority: z.enum(["low", "medium", "high", "urgent"]),

  // Additional Information
  notes: z.string().optional(),
  photos: z
    .array(
      z.object({
        name: z.string(),
        url: z.string(),
        size: z.number(),
      }),
    )
    .optional(),

  // Quality Control
  qualityChecks: z.object({
    visualInspection: z.boolean(),
    contaminationCheck: z.boolean(),
    chainOfCustody: z.boolean(),
  }),
})

type GeologicalSampleFormData = z.infer<typeof geologicalSampleSchema>

interface GeologicalFormProps {
  initialData?: Partial<GeologicalSampleFormData>
  onSubmit: (data: GeologicalSampleFormData) => Promise<void>
  onSaveDraft?: (data: Partial<GeologicalSampleFormData>) => Promise<void>
  isLoading?: boolean
  mode?: "create" | "edit" | "view"
}

const MINERAL_OPTIONS = [
  "Quartz",
  "Feldspar",
  "Mica",
  "Calcite",
  "Dolomite",
  "Pyrite",
  "Chalcopyrite",
  "Galena",
  "Sphalerite",
  "Magnetite",
  "Hematite",
  "Malachite",
  "Azurite",
  "Gold",
  "Silver",
  "Copper",
]

const ANALYSIS_TYPES = [
  { id: "xrf", name: "X-Ray Fluorescence (XRF)", description: "Elemental composition analysis" },
  { id: "xrd", name: "X-Ray Diffraction (XRD)", description: "Mineral identification" },
  { id: "icp", name: "ICP-MS", description: "Trace element analysis" },
  { id: "fire_assay", name: "Fire Assay", description: "Precious metals analysis" },
  { id: "microscopy", name: "Optical Microscopy", description: "Petrographic analysis" },
  { id: "sem", name: "SEM-EDS", description: "Scanning electron microscopy" },
]

export function GeologicalForm({
  initialData,
  onSubmit,
  onSaveDraft,
  isLoading = false,
  mode = "create",
}: GeologicalFormProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
  const [mineralComponents, setMineralComponents] = useState<Array<{ mineral: string; percentage: number }>>([
    { mineral: "", percentage: 0 },
  ])

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isValid, isDirty },
    trigger,
  } = useForm<GeologicalSampleFormData>({
    resolver: zodResolver(geologicalSampleSchema),
    defaultValues: {
      sampleId: "",
      siteName: "",
      coordinates: { latitude: 0, longitude: 0 },
      geologicalFormation: "sedimentary",
      rockType: "",
      mineralComposition: [{ mineral: "", percentage: 0 }],
      sampleDate: new Date().toISOString().split("T")[0],
      sampleType: "surface",
      weight: 0,
      analysisTypes: [],
      priority: "medium",
      notes: "",
      qualityChecks: {
        visualInspection: false,
        contaminationCheck: false,
        chainOfCustody: false,
      },
      ...initialData,
    },
    mode: "onChange",
  })

  const watchedData = watch()

  const steps = [
    { id: "basic", title: "Basic Information", description: "Sample identification and location" },
    { id: "geological", title: "Geological Data", description: "Formation and mineral composition" },
    { id: "analysis", title: "Analysis Request", description: "Testing requirements and priority" },
    { id: "quality", title: "Quality Control", description: "Verification and documentation" },
  ]

  const getStepProgress = () => {
    return ((currentStep + 1) / steps.length) * 100
  }

  const validateCurrentStep = async () => {
    const stepFields: Record<number, (keyof GeologicalSampleFormData)[]> = {
      0: ["sampleId", "siteName", "coordinates"],
      1: ["geologicalFormation", "rockType", "mineralComposition"],
      2: ["analysisTypes", "priority"],
      3: ["qualityChecks"],
    }

    const fieldsToValidate = stepFields[currentStep] || []
    const result = await trigger(fieldsToValidate)
    return result
  }

  const handleNextStep = async () => {
    const isValid = await validateCurrentStep()
    if (isValid && currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleAddMineral = () => {
    const newMinerals = [...mineralComponents, { mineral: "", percentage: 0 }]
    setMineralComponents(newMinerals)
    setValue("mineralComposition", newMinerals)
  }

  const handleRemoveMineral = (index: number) => {
    const newMinerals = mineralComponents.filter((_, i) => i !== index)
    setMineralComponents(newMinerals)
    setValue("mineralComposition", newMinerals)
  }

  const handleMineralChange = (index: number, field: "mineral" | "percentage", value: string | number) => {
    const newMinerals = [...mineralComponents]
    newMinerals[index] = { ...newMinerals[index], [field]: value }
    setMineralComponents(newMinerals)
    setValue("mineralComposition", newMinerals)
  }

  const handleFileUpload = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(event.target.files || [])
      setUploadedFiles((prev) => [...prev, ...files])

      const photoData = files.map((file) => ({
        name: file.name,
        url: URL.createObjectURL(file),
        size: file.size,
      }))

      setValue("photos", [...(watchedData.photos || []), ...photoData])
    },
    [setValue, watchedData.photos],
  )

  const handleRemoveFile = (index: number) => {
    const newFiles = uploadedFiles.filter((_, i) => i !== index)
    const newPhotos = (watchedData.photos || []).filter((_, i) => i !== index)
    setUploadedFiles(newFiles)
    setValue("photos", newPhotos)
  }

  const handleFormSubmit = async (data: GeologicalSampleFormData) => {
    try {
      await onSubmit(data)
    } catch (error) {
      console.error("Form submission error:", error)
    }
  }

  const handleSaveDraftClick = async () => {
    if (onSaveDraft) {
      await onSaveDraft(watchedData)
    }
  }

  const getFieldError = (fieldName: string): FieldError | undefined => {
    return errors[fieldName as keyof typeof errors] as FieldError | undefined
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="sampleId">Sample ID</Label>
                <Controller
                  name="sampleId"
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      id="sampleId"
                      placeholder="e.g., CR-2024-001"
                      className={errors.sampleId ? "border-red-500" : ""}
                    />
                  )}
                />
                {errors.sampleId && <p className="text-sm text-red-600">{errors.sampleId.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="siteName">Site Name</Label>
                <Controller
                  name="siteName"
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      id="siteName"
                      placeholder="e.g., Copper Ridge North"
                      className={errors.siteName ? "border-red-500" : ""}
                    />
                  )}
                />
                {errors.siteName && <p className="text-sm text-red-600">{errors.siteName.message}</p>}
              </div>
            </div>

            <div className="space-y-4">
              <Label>Coordinates</Label>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="latitude">Latitude</Label>
                  <Controller
                    name="coordinates.latitude"
                    control={control}
                    render={({ field }) => (
                      <Input
                        {...field}
                        id="latitude"
                        type="number"
                        step="0.000001"
                        placeholder="e.g., 40.7128"
                        onChange={(e) => field.onChange(Number.parseFloat(e.target.value))}
                      />
                    )}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="longitude">Longitude</Label>
                  <Controller
                    name="coordinates.longitude"
                    control={control}
                    render={({ field }) => (
                      <Input
                        {...field}
                        id="longitude"
                        type="number"
                        step="0.000001"
                        placeholder="e.g., -74.0060"
                        onChange={(e) => field.onChange(Number.parseFloat(e.target.value))}
                      />
                    )}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="elevation">Elevation (m)</Label>
                  <Controller
                    name="coordinates.elevation"
                    control={control}
                    render={({ field }) => (
                      <Input
                        {...field}
                        id="elevation"
                        type="number"
                        placeholder="Optional"
                        onChange={(e) => field.onChange(e.target.value ? Number.parseFloat(e.target.value) : undefined)}
                      />
                    )}
                  />
                </div>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="sampleDate">Sample Date</Label>
                <Controller
                  name="sampleDate"
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      id="sampleDate"
                      type="date"
                      className={errors.sampleDate ? "border-red-500" : ""}
                    />
                  )}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="weight">Sample Weight (g)</Label>
                <Controller
                  name="weight"
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      id="weight"
                      type="number"
                      step="0.1"
                      placeholder="e.g., 250.5"
                      onChange={(e) => field.onChange(Number.parseFloat(e.target.value))}
                    />
                  )}
                />
              </div>
            </div>
          </div>
        )

      case 1:
        return (
          <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Geological Formation</Label>
                <Controller
                  name="geologicalFormation"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sedimentary">Sedimentary</SelectItem>
                        <SelectItem value="igneous">Igneous</SelectItem>
                        <SelectItem value="metamorphic">Metamorphic</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>

              <div className="space-y-2">
                <Label>Sample Type</Label>
                <Controller
                  name="sampleType"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="surface">Surface Sample</SelectItem>
                        <SelectItem value="drill_core">Drill Core</SelectItem>
                        <SelectItem value="outcrop">Outcrop</SelectItem>
                        <SelectItem value="stream_sediment">Stream Sediment</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="rockType">Rock Type</Label>
              <Controller
                name="rockType"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    id="rockType"
                    placeholder="e.g., Granite, Limestone, Shale"
                    className={errors.rockType ? "border-red-500" : ""}
                  />
                )}
              />
              {errors.rockType && <p className="text-sm text-red-600">{errors.rockType.message}</p>}
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Mineral Composition</Label>
                <Button type="button" variant="outline" size="sm" onClick={handleAddMineral}>
                  Add Mineral
                </Button>
              </div>

              <div className="space-y-3">
                {mineralComponents.map((component, index) => (
                  <div key={index} className="grid gap-3 md:grid-cols-3 items-end p-3 border rounded-lg">
                    <div className="space-y-2">
                      <Label>Mineral</Label>
                      <Select
                        value={component.mineral}
                        onValueChange={(value) => handleMineralChange(index, "mineral", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select mineral" />
                        </SelectTrigger>
                        <SelectContent>
                          {MINERAL_OPTIONS.map((mineral) => (
                            <SelectItem key={mineral} value={mineral}>
                              {mineral}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Percentage (%)</Label>
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        step="0.1"
                        value={component.percentage}
                        onChange={(e) =>
                          handleMineralChange(index, "percentage", Number.parseFloat(e.target.value) || 0)
                        }
                        placeholder="0.0"
                      />
                    </div>

                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleRemoveMineral(index)}
                      disabled={mineralComponents.length === 1}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>

              <div className="text-sm text-muted-foreground">
                Total: {mineralComponents.reduce((sum, comp) => sum + comp.percentage, 0).toFixed(1)}%
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="depth">Depth (m)</Label>
              <Controller
                name="depth"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    id="depth"
                    type="number"
                    step="0.1"
                    placeholder="Optional - depth below surface"
                    onChange={(e) => field.onChange(e.target.value ? Number.parseFloat(e.target.value) : undefined)}
                  />
                )}
              />
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-6">
            <div className="space-y-4">
              <Label>Analysis Types</Label>
              <div className="grid gap-3 md:grid-cols-2">
                {ANALYSIS_TYPES.map((analysis) => (
                  <Controller
                    key={analysis.id}
                    name="analysisTypes"
                    control={control}
                    render={({ field }) => (
                      <div className="flex items-start space-x-3 p-3 border rounded-lg">
                        <Checkbox
                          id={analysis.id}
                          checked={field.value.includes(analysis.id)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              field.onChange([...field.value, analysis.id])
                            } else {
                              field.onChange(field.value.filter((id) => id !== analysis.id))
                            }
                          }}
                        />
                        <div className="grid gap-1.5 leading-none">
                          <Label htmlFor={analysis.id} className="text-sm font-medium">
                            {analysis.name}
                          </Label>
                          <p className="text-xs text-muted-foreground">{analysis.description}</p>
                        </div>
                      </div>
                    )}
                  />
                ))}
              </div>
              {errors.analysisTypes && <p className="text-sm text-red-600">{errors.analysisTypes.message}</p>}
            </div>

            <div className="space-y-2">
              <Label>Priority Level</Label>
              <Controller
                name="priority"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-green-500" />
                          Low Priority (5-7 business days)
                        </div>
                      </SelectItem>
                      <SelectItem value="medium">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-yellow-500" />
                          Medium Priority (3-5 business days)
                        </div>
                      </SelectItem>
                      <SelectItem value="high">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-orange-500" />
                          High Priority (1-3 business days)
                        </div>
                      </SelectItem>
                      <SelectItem value="urgent">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-red-500" />
                          Urgent (Same day)
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Additional Notes</Label>
              <Controller
                name="notes"
                control={control}
                render={({ field }) => (
                  <Textarea
                    {...field}
                    id="notes"
                    placeholder="Any additional information about the sample, collection method, or specific analysis requirements..."
                    rows={4}
                  />
                )}
              />
            </div>

            <div className="space-y-4">
              <Label>Sample Photos</Label>
              <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6">
                <div className="text-center">
                  <Upload className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Drop photos here or click to browse</p>
                    <p className="text-xs text-muted-foreground">JPG, PNG files up to 10MB each</p>
                  </div>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                </div>
              </div>

              {uploadedFiles.length > 0 && (
                <div className="grid gap-3 md:grid-cols-2">
                  {uploadedFiles.map((file, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 border rounded-lg">
                      <FileText className="h-5 w-5 text-muted-foreground" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{file.name}</p>
                        <p className="text-xs text-muted-foreground">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                      </div>
                      <Button type="button" variant="ghost" size="sm" onClick={() => handleRemoveFile(index)}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )

      case 3:
        return (
          <div className="space-y-6">
            <div className="space-y-4">
              <Label>Quality Control Checks</Label>
              <div className="space-y-3">
                <Controller
                  name="qualityChecks.visualInspection"
                  control={control}
                  render={({ field }) => (
                    <div className="flex items-center space-x-3">
                      <Checkbox id="visualInspection" checked={field.value} onCheckedChange={field.onChange} />
                      <Label htmlFor="visualInspection" className="text-sm">
                        Visual inspection completed - sample integrity verified
                      </Label>
                    </div>
                  )}
                />

                <Controller
                  name="qualityChecks.contaminationCheck"
                  control={control}
                  render={({ field }) => (
                    <div className="flex items-center space-x-3">
                      <Checkbox id="contaminationCheck" checked={field.value} onCheckedChange={field.onChange} />
                      <Label htmlFor="contaminationCheck" className="text-sm">
                        Contamination check performed - no visible contamination
                      </Label>
                    </div>
                  )}
                />

                <Controller
                  name="qualityChecks.chainOfCustody"
                  control={control}
                  render={({ field }) => (
                    <div className="flex items-center space-x-3">
                      <Checkbox id="chainOfCustody" checked={field.value} onCheckedChange={field.onChange} />
                      <Label htmlFor="chainOfCustody" className="text-sm">
                        Chain of custody documentation complete
                      </Label>
                    </div>
                  )}
                />
              </div>
            </div>

            <Separator />

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Sample Summary</h3>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Sample ID:</span>
                    <span className="text-sm font-medium">{watchedData.sampleId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Site:</span>
                    <span className="text-sm font-medium">{watchedData.siteName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Formation:</span>
                    <span className="text-sm font-medium capitalize">{watchedData.geologicalFormation}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Rock Type:</span>
                    <span className="text-sm font-medium">{watchedData.rockType}</span>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Weight:</span>
                    <span className="text-sm font-medium">{watchedData.weight}g</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Priority:</span>
                    <Badge variant={watchedData.priority === "urgent" ? "destructive" : "outline"}>
                      {watchedData.priority}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Analysis Types:</span>
                    <span className="text-sm font-medium">{watchedData.analysisTypes?.length || 0} selected</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Photos:</span>
                    <span className="text-sm font-medium">{uploadedFiles.length} uploaded</span>
                  </div>
                </div>
              </div>
            </div>

            {!Object.values(watchedData.qualityChecks || {}).every(Boolean) && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Please complete all quality control checks before submitting the sample.
                </AlertDescription>
              </Alert>
            )}
          </div>
        )

      default:
        return null
    }
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-6 w-6" />
              {mode === "create" ? "New Geological Sample" : mode === "edit" ? "Edit Sample" : "View Sample"}
            </CardTitle>
            <CardDescription>
              {mode === "create"
                ? "Register a new geological sample for analysis"
                : mode === "edit"
                  ? "Update sample information and analysis requirements"
                  : "Sample details and analysis information"}
            </CardDescription>
          </div>
          {mode !== "view" && onSaveDraft && (
            <Button type="button" variant="outline" onClick={handleSaveDraftClick} disabled={!isDirty}>
              Save Draft
            </Button>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>
              Step {currentStep + 1} of {steps.length}: {steps[currentStep].title}
            </span>
            <span>{Math.round(getStepProgress())}% Complete</span>
          </div>
          <Progress value={getStepProgress()} className="h-2" />
          <p className="text-sm text-muted-foreground">{steps[currentStep].description}</p>
        </div>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
          {renderStepContent()}

          <Separator />

          <div className="flex items-center justify-between">
            <Button type="button" variant="outline" onClick={handlePrevStep} disabled={currentStep === 0}>
              Previous
            </Button>

            <div className="flex items-center gap-2">
              {steps.map((_, index) => (
                <div
                  key={index}
                  className={cn("w-2 h-2 rounded-full", index <= currentStep ? "bg-primary" : "bg-muted")}
                />
              ))}
            </div>

            {currentStep < steps.length - 1 ? (
              <Button type="button" onClick={handleNextStep}>
                Next
              </Button>
            ) : (
              <Button
                type="submit"
                variant="geological"
                disabled={
                  !isValid ||
                  isLoading ||
                  (mode !== "view" && !Object.values(watchedData.qualityChecks || {}).every(Boolean))
                }
                loading={isLoading}
                loadingText="Submitting..."
              >
                {mode === "create" ? "Submit Sample" : "Update Sample"}
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
