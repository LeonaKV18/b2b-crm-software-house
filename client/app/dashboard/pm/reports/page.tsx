"use client"
import { useState, useEffect } from "react" // Import useEffect
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { Sidebar } from "@/components/layout/sidebar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import Link from "next/link"
import { CheckCircle, AlertCircle, Clock, Users, Briefcase } from "lucide-react"

interface PMStats {
  activeProjectsCount: number;
  delayedProjectsCount: number;
  onScheduleProjectsCount: number;
  teamUtilization: number;
  completedProjectsCount: number;
  milestonesOnTime: number;
  milestonesDelayed: number;
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

  const projectStats = [
    {
      label: "Active Projects",
      value: stats?.activeProjectsCount || 0,
      icon: <Briefcase className="h-4 w-4 text-primary" />,
      color: "text-primary",
    },
    {
      label: "Completed Projects",
      value: stats?.completedProjectsCount || 0,
      icon: <CheckCircle className="h-4 w-4 text-chart-3" />,
      color: "text-chart-3",
    },
    {
      label: "Projects On Time",
      value: stats?.onScheduleProjectsCount || 0,
      icon: <Clock className="h-4 w-4 text-chart-3" />,
      color: "text-chart-3",
    },
    {
      label: "Delayed Projects",
      value: stats?.delayedProjectsCount || 0,
      icon: <AlertCircle className="h-4 w-4 text-destructive" />,
      color: "text-destructive",
    },
  ]

  const performanceStats = [
    {
        label: "Team Utilization",
        value: `${stats?.teamUtilization || 0}%`,
        icon: <Users className="h-4 w-4 text-primary" />,
        description: "Tasks In Progress / Total Tasks"
    },
    {
        label: "Milestones On Time",
        value: stats?.milestonesOnTime || 0,
        icon: <CheckCircle className="h-4 w-4 text-chart-3" />,
        description: "Milestones completed on or before deadline"
    },
    {
        label: "Milestones Delayed",
        value: stats?.milestonesDelayed || 0,
        icon: <AlertCircle className="h-4 w-4 text-destructive" />,
        description: "Milestones past deadline and incomplete"
    }
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
        <div className="p-8 space-y-8">
          
          {/* Project Overview Section */}
          <div>
            <h2 className="text-lg font-semibold mb-4">Project Overview</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {projectStats.map((stat, idx) => (
                <Card key={idx} className="bg-card border border-border">
                    <CardContent className="pt-6">
                    <div className="flex justify-between items-start mb-2">
                        <p className="text-sm text-muted-foreground">{stat.label}</p>
                        {stat.icon}
                    </div>
                    <p className={`text-3xl font-bold ${stat.color}`}>{stat.value}</p>
                    </CardContent>
                </Card>
                ))}
            </div>
          </div>

          {/* Performance Metrics Section */}
          <div>
            <h2 className="text-lg font-semibold mb-4">Team & Milestone Performance</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {performanceStats.map((stat, idx) => (
                    <Card key={idx} className="bg-card border border-border">
                        <CardContent className="pt-6">
                            <div className="flex justify-between items-start mb-2">
                                <p className="text-sm text-muted-foreground">{stat.label}</p>
                                {stat.icon}
                            </div>
                            <p className="text-3xl font-bold text-foreground mb-1">{stat.value}</p>
                            <p className="text-xs text-muted-foreground">{stat.description}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>
          </div>

          <Link href="/dashboard/pm">
            <Button variant="outline" className="bg-secondary border-border mt-4">
              ← Back to Dashboard
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}