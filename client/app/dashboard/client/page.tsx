"use client"

import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { Sidebar } from "@/components/layout/sidebar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { FileText, Briefcase, CheckCircle, DollarSign } from "lucide-react"
import Link from "next/link"
import { useState, useEffect } from "react" // Import useEffect
import { UpcomingMeetingsWidget } from "@/components/dashboard/upcoming-meetings-widget"

interface ClientStats {
  proposalsCount: number;
  activeProjectsCount: number;
  completedProjectsCount: number;
  totalSpent: number;
}

export default function ClientDashboard() {
  const { user, isLoggedIn } = useAuth()
  const router = useRouter()
  const [currentPath] = useState("/dashboard/client")

  const [stats, setStats] = useState<ClientStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!isLoggedIn || user?.role !== "client") {
      router.push("/")
      return
    }

    const fetchStats = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/client-dashboard-stats?userId=${user?.id}`)
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        const data = await response.json()
        setStats(data)
      } catch (err) {
        console.error("Failed to fetch client dashboard stats:", err)
        setError("Failed to load dashboard statistics.")
      } finally {
        setLoading(false)
      }
    }

    if (user?.id) { // Only fetch if user ID is available
      fetchStats()
    }
  }, [isLoggedIn, user?.role, user?.id, router])

  if (!isLoggedIn || user?.role !== "client") {
    return null
  }

  if (loading) {
    return (
      <div className="flex h-screen bg-background items-center justify-center">
        <p className="text-foreground">Loading dashboard...</p>
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

  return (
    <div className="flex h-screen bg-background">
      <Sidebar currentPath={currentPath} />

      <div className="flex-1 overflow-auto">
        {/* Top Bar */}
        <div className="bg-card border-b border-border sticky top-0 z-10">
          <div className="px-8 py-4">
            <h1 className="text-2xl font-bold text-foreground">Client Portal</h1>
            <p className="text-sm text-muted-foreground">View proposals, projects, and payments</p>
          </div>
        </div>

        {/* Main Content */}
        <div className="p-8">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="bg-card border border-border">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Proposals</p>
                    <p className="text-3xl font-bold text-foreground">{stats?.proposalsCount}</p>
                  </div>
                  <div className="p-3 bg-primary/10 rounded-lg">
                    <FileText className="text-primary" size={24} />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border border-border">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Active Projects</p>
                    <p className="text-3xl font-bold text-foreground">{stats?.activeProjectsCount}</p>
                  </div>
                  <div className="p-3 bg-accent/10 rounded-lg">
                    <Briefcase className="text-accent" size={24} />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border border-border">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Completed</p>
                    <p className="text-3xl font-bold text-foreground">{stats?.completedProjectsCount}</p>
                  </div>
                  <div className="p-3 bg-chart-3/10 rounded-lg">
                    <CheckCircle className="text-chart-3" size={24} />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border border-border">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Total Spent</p>
                    <p className="text-3xl font-bold text-foreground">${stats?.totalSpent ? (stats.totalSpent / 1000).toFixed(0) : 0}K</p>
                  </div>
                  <div className="p-3 bg-chart-2/10 rounded-lg">
                    <DollarSign className="text-chart-2" size={24} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Widgets */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8 h-64">
            <UpcomingMeetingsWidget userId={user?.id || 0} role="client" />
          </div>

          {/* Quick Navigation */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <Link href="/dashboard/client/proposals">
              <Button variant="outline" className="w-full bg-secondary border-border hover:bg-secondary/80">
                View Proposals
              </Button>
            </Link>
            <Link href="/dashboard/client/projects">
              <Button variant="outline" className="w-full bg-secondary border-border hover:bg-secondary/80">
                My Projects
              </Button>
            </Link>
            <Link href="/dashboard/client/invoices">
              <Button variant="outline" className="w-full bg-secondary border-border hover:bg-secondary/80">
                Invoices
              </Button>
            </Link>
            <Link href="/">
              <Button variant="outline" className="w-full bg-secondary border-border hover:bg-secondary/80">
                Logout
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}