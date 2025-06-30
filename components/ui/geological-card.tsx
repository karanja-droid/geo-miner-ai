"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button-enhanced"
import { Progress } from "@/components/ui/progress"

const geologicalCardVariants = cva("transition-all duration-200", {
  variants: {
    variant: {
      default: "border hover:shadow-md",
      elevated: "shadow-lg border-0",
      geological: "border-l-4 border-l-amber-500 bg-gradient-to-r from-amber-50 to-orange-50",
      mineral: "border-l-4 border-l-stone-500 bg-gradient-to-r from-stone-50 to-slate-50",
      analysis: "border-l-4 border-l-blue-500 bg-gradient-to-r from-blue-50 to-indigo-50",
      critical: "border-l-4 border-l-red-500 bg-gradient-to-r from-red-50 to-rose-50",
    },
    size: {
      default: "p-6",
      compact: "p-4",
      large: "p-8",
    },
  },
  defaultVariants: {
    variant: "default",
    size: "default",
  },
})

export interface GeologicalCardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof geologicalCardVariants> {
  title: string
  description?: string
  status?: "active" | "inactive" | "pending" | "completed"
  progress?: number
  metadata?: Array<{ label: string; value: string; icon?: React.ReactNode }>
  actions?: Array<{ label: string; onClick: () => void; variant?: string }>
  mineralType?: "copper" | "gold" | "iron" | "silver" | "other"
  priority?: "low" | "medium" | "high" | "critical"
}

const getStatusColor = (status: string) => {
  switch (status) {
    case "active":
      return "bg-green-100 text-green-800"
    case "inactive":
      return "bg-gray-100 text-gray-800"
    case "pending":
      return "bg-yellow-100 text-yellow-800"
    case "completed":
      return "bg-blue-100 text-blue-800"
    default:
      return "bg-gray-100 text-gray-800"
  }
}

const getMineralColor = (mineral: string) => {
  switch (mineral) {
    case "copper":
      return "text-amber-700"
    case "gold":
      return "text-yellow-600"
    case "iron":
      return "text-orange-700"
    case "silver":
      return "text-gray-600"
    default:
      return "text-stone-600"
  }
}

const GeologicalCard = React.forwardRef<HTMLDivElement, GeologicalCardProps>(
  (
    {
      className,
      variant,
      size,
      title,
      description,
      status,
      progress,
      metadata = [],
      actions = [],
      mineralType,
      priority,
      children,
      ...props
    },
    ref,
  ) => {
    return (
      <Card ref={ref} className={cn(geologicalCardVariants({ variant, size }), className)} {...props}>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="space-y-1 flex-1">
              <CardTitle className="text-lg flex items-center gap-2">
                {title}
                {mineralType && (
                  <span className={cn("text-sm font-normal", getMineralColor(mineralType))}>({mineralType})</span>
                )}
              </CardTitle>
              {description && <CardDescription className="text-sm">{description}</CardDescription>}
            </div>
            <div className="flex items-center gap-2">
              {status && (
                <Badge className={getStatusColor(status)} variant="outline">
                  {status}
                </Badge>
              )}
              {priority && priority !== "low" && (
                <Badge
                  variant={priority === "critical" ? "destructive" : "secondary"}
                  className={priority === "high" ? "bg-orange-100 text-orange-800" : ""}
                >
                  {priority}
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {typeof progress === "number" && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progress</span>
                <span>{progress}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          )}

          {metadata.length > 0 && (
            <div className="grid grid-cols-2 gap-4 text-sm">
              {metadata.map((item, index) => (
                <div key={index} className="flex items-center gap-2">
                  {item.icon && <span className="text-muted-foreground">{item.icon}</span>}
                  <div>
                    <div className="text-muted-foreground">{item.label}</div>
                    <div className="font-medium">{item.value}</div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {children && <div className="pt-2">{children}</div>}

          {actions.length > 0 && (
            <div className="flex gap-2 pt-2 border-t">
              {actions.map((action, index) => (
                <Button
                  key={index}
                  variant={(action.variant as any) || "outline"}
                  size="sm"
                  onClick={action.onClick}
                  className="flex-1"
                >
                  {action.label}
                </Button>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    )
  },
)
GeologicalCard.displayName = "GeologicalCard"

export { GeologicalCard, geologicalCardVariants }
