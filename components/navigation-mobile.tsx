"use client"

import React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button-enhanced"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Mountain,
  Menu,
  Bell,
  Settings,
  User,
  LogOut,
  Database,
  BarChart3,
  Map,
  Shield,
  FileText,
  Brain,
  Activity,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface NavigationItem {
  label: string
  href: string
  icon: React.ReactNode
  badge?: number
  requiredRole?: string[]
}

export function MobileNavigation() {
  const { user, logout, isAuthenticated } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const [notifications] = useState(3)
  const [activeSection, setActiveSection] = useState("dashboard")

  const navigationItems: NavigationItem[] = [
    {
      label: "Dashboard",
      href: "/dashboard",
      icon: <BarChart3 className="h-5 w-5" />,
    },
    {
      label: "Projects",
      href: "/projects",
      icon: <Database className="h-5 w-5" />,
    },
    {
      label: "AI Analysis",
      href: "/analysis",
      icon: <Brain className="h-5 w-5" />,
    },
    {
      label: "Geological Maps",
      href: "/maps",
      icon: <Map className="h-5 w-5" />,
    },
    {
      label: "Datasets",
      href: "/datasets",
      icon: <FileText className="h-5 w-5" />,
    },
    {
      label: "Real-time",
      href: "/realtime",
      icon: <Activity className="h-5 w-5" />,
      badge: notifications,
    },
    {
      label: "Admin",
      href: "/admin",
      icon: <Shield className="h-5 w-5" />,
      requiredRole: ["admin", "geologist"],
    },
  ]

  useEffect(() => {
    const currentPath = window.location.pathname
    const section = currentPath.split("/")[1] || "dashboard"
    setActiveSection(section)
  }, [])

  const getRoleColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-red-100 text-red-800"
      case "geologist":
        return "bg-blue-100 text-blue-800"
      case "analyst":
        return "bg-green-100 text-green-800"
      case "viewer":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  const hasRequiredRole = (requiredRoles?: string[]) => {
    if (!requiredRoles || !user) return true
    return requiredRoles.includes(user.role)
  }

  if (!isAuthenticated || !user) {
    return null
  }

  return (
    <>
      {/* Mobile Navigation Bar */}
      <nav className="md:hidden fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="flex h-16 items-center justify-between px-4">
          <Link href="/dashboard" className="flex items-center space-x-2">
            <Mountain className="h-6 w-6 text-primary" />
            <span className="font-bold text-lg">GeoMiner</span>
          </Link>

          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="icon" className="relative" aria-label={`Notifications (${notifications})`}>
              <Bell className="h-5 w-5" />
              {notifications > 0 && (
                <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs">{notifications}</Badge>
              )}
            </Button>

            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" aria-label="Open menu">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>

              <SheetContent side="right" className="w-80 p-0">
                <div className="flex flex-col h-full">
                  {/* Header */}
                  <div className="p-6 border-b">
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
                        <AvatarFallback className="text-lg">{getInitials(user.name)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{user.name}</p>
                        <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge className={getRoleColor(user.role)} variant="outline">
                            {user.role}
                          </Badge>
                          {user.organization && (
                            <span className="text-xs text-muted-foreground truncate">{user.organization}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Navigation Items */}
                  <div className="flex-1 overflow-y-auto py-4">
                    <div className="space-y-1 px-3">
                      {navigationItems.map((item) => {
                        if (!hasRequiredRole(item.requiredRole)) return null

                        const isActive = activeSection === item.href.split("/")[1]

                        return (
                          <Link
                            key={item.href}
                            href={item.href}
                            onClick={() => {
                              setActiveSection(item.href.split("/")[1])
                              setIsOpen(false)
                            }}
                            className={cn(
                              "flex items-center justify-between px-3 py-3 rounded-lg text-sm font-medium transition-colors",
                              isActive
                                ? "bg-primary text-primary-foreground"
                                : "text-muted-foreground hover:text-foreground hover:bg-accent",
                            )}
                          >
                            <div className="flex items-center space-x-3">
                              {item.icon}
                              <span>{item.label}</span>
                            </div>
                            {item.badge && item.badge > 0 && (
                              <Badge variant={isActive ? "secondary" : "outline"} className="h-5 text-xs">
                                {item.badge}
                              </Badge>
                            )}
                          </Link>
                        )
                      })}
                    </div>

                    <Separator className="my-4" />

                    {/* Quick Actions */}
                    <div className="px-3 space-y-1">
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3 py-2">
                        Quick Actions
                      </p>

                      <Link
                        href="/samples/new"
                        onClick={() => setIsOpen(false)}
                        className="flex items-center space-x-3 px-3 py-3 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                      >
                        <FileText className="h-5 w-5" />
                        <span>New Sample</span>
                      </Link>

                      <Link
                        href="/analysis/new"
                        onClick={() => setIsOpen(false)}
                        className="flex items-center space-x-3 px-3 py-3 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                      >
                        <Brain className="h-5 w-5" />
                        <span>AI Analysis</span>
                      </Link>

                      <Link
                        href="/projects/new"
                        onClick={() => setIsOpen(false)}
                        className="flex items-center space-x-3 px-3 py-3 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                      >
                        <Database className="h-5 w-5" />
                        <span>New Project</span>
                      </Link>
                    </div>
                  </div>

                  {/* Footer Actions */}
                  <div className="border-t p-3 space-y-1">
                    <Link
                      href="/profile"
                      onClick={() => setIsOpen(false)}
                      className="flex items-center space-x-3 px-3 py-3 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                    >
                      <User className="h-5 w-5" />
                      <span>Profile</span>
                    </Link>

                    <Link
                      href="/settings"
                      onClick={() => setIsOpen(false)}
                      className="flex items-center space-x-3 px-3 py-3 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                    >
                      <Settings className="h-5 w-5" />
                      <span>Settings</span>
                    </Link>

                    <button
                      onClick={() => {
                        logout()
                        setIsOpen(false)
                      }}
                      className="flex items-center space-x-3 px-3 py-3 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors w-full text-left"
                    >
                      <LogOut className="h-5 w-5" />
                      <span>Log out</span>
                    </button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </nav>
      {/* Bottom Navigation for Mobile */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-background border-t">
        <div className="grid grid-cols-5 h-16">
          {navigationItems.slice(0, 5).map((item) => {
            if (!hasRequiredRole(item.requiredRole)) return null

            const isActive = activeSection === item.href.split("/")[1]

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setActiveSection(item.href.split("/")[1])}
                className={cn(
                  "flex flex-col items-center justify-center space-y-1 text-xs font-medium transition-colors relative",
                  isActive ? "text-primary" : "text-muted-foreground hover:text-foreground",
                )}
              >
                <div className="relative">
                  {React.cloneElement(item.icon as React.ReactElement, {
                    className: "h-5 w-5",
                  })}
                  {item.badge && item.badge > 0 && (
                    <Badge className="absolute -top-2 -right-2 h-4 w-4 rounded-full p-0 text-xs">
                      {item.badge > 9 ? "9+" : item.badge}
                    </Badge>
                  )}
                </div>
                <span className="truncate max-w-full">{item.label}</span>
                {isActive && (
                  <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-6 h-0.5 bg-primary rounded-full" />
                )}
              </Link>
            )
          })}
        </div>
      </nav>
      {/* Spacer for fixed navigation */}
      <div className="md:hidden h-16" /> {/* Top spacer */}
      <div className="md:hidden h-16" /> {/* Bottom spacer */}
    </>
  )
}
