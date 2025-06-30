import { ProtectedRoute } from "@/components/protected-route"
import { Dashboard } from "@/components/dashboard"
import { Navigation } from "@/components/navigation"

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="container mx-auto px-4 py-8">
          <Dashboard />
        </main>
      </div>
    </ProtectedRoute>
  )
}
