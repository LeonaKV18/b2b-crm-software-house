
"use client"
import { useState, useEffect } from "react" // Import useEffect
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { Sidebar } from "@/components/layout/sidebar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import Link from "next/link"

interface PMStats {
  activeProjectsCount: number;
  delayedProjectsCount: number;
  onScheduleProjectsCount: number;
  teamUtilization: number;
}

export default function PMReportsPage() {
  const { user, isLoggedIn } = useAuth()
  const router = useRouter()
  const [currentPath] = useState("/dashboard/pm/reports")

  const [stats, setStats] = useState<PMStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!isLoggedIn || user?.role !== "pm") {
      router.push("/")
      return
    }

    const fetchStats = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/pm-dashboard-stats?userId=${user?.id}`)
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        const data = await response.json()
        setStats(data)
      } catch (err) {
        console.error("Failed to fetch PM dashboard stats:", err)
        setError("Failed to load dashboard statistics.")
      } finally {
        setLoading(false)
      }
    }

    if (user?.id) { // Only fetch if user ID is available
      fetchStats()
    }
  }, [isLoggedIn, user?.role, user?.id, router])

  if (!isLoggedIn || user?.role !== "pm") {
    router.push("/")
    return null
  }

  if (loading) {
    return (
      <div className="flex h-screen bg-background items-center justify-center">
        <p className="text-foreground">Loading reports...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex h-screen bg-background items-center justify-center">
        <p className="text-destructive">{error}</p>
      </div>
    )
  }

  const reportStats = [
    {
      label: "Projects On Time",
      value: stats?.onScheduleProjectsCount || 0,
      color: "bg-chart-3/20 text-chart-3",
    },
    {
      label: "Delayed Projects",
      value: stats?.delayedProjectsCount || 0,
      color: "bg-destructive/20 text-destructive",
    },
    {
      label: "Team Utilization",
      value: `${stats?.teamUtilization || 0}%`,
      color: "bg-primary/20 text-primary",
    },
  ]

  return (
    <div className="flex h-screen bg-background">
      <Sidebar currentPath={currentPath} />

      <div className="flex-1 overflow-auto">
        {/* Top Bar */}
        <div className="bg-card border-b border-border sticky top-0 z-10">
          <div className="px-8 py-4">
            <h1 className="text-2xl font-bold text-foreground">Reports</h1>
            <p className="text-sm text-muted-foreground">Project performance metrics</p>
          </div>
        </div>

        {/* Main Content */}
        <div className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {reportStats.map((stat, idx) => (
              <Card key={idx} className="bg-card border border-border">
                <CardContent className="pt-6">
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className={`text-3xl font-bold mt-2 ${stat.color}`}>{stat.value}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <Link href="/dashboard/pm">
            <Button variant="outline" className="bg-secondary border-border">
              ← Back
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
