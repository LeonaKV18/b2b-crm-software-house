"use client"
import { useState, useEffect } from "react" // Import useState and useEffect
import { Briefcase, FileText, Users, Clock } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { Sidebar } from "@/components/layout/sidebar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"

interface AdminStats {
  totalClients: number;
  activeProjects: number;
  pendingProposals: number;
  activeUsers: number;
}

export default function AdminDashboard() {
  const { user, isLoggedIn } = useAuth()
  const router = useRouter()

  const [stats, setStats] = useState<AdminStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (typeof window !== "undefined" && (!isLoggedIn || user?.role !== "admin")) {
      router.push("/")
      return
    }

    const fetchStats = async () => {
      try {
        setLoading(true)
        const response = await fetch("/api/admin-dashboard-stats")
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        const data = await response.json()
        setStats(data)
      } catch (err) {
        console.error("Failed to fetch admin dashboard stats:", err)
        setError("Failed to load dashboard statistics.")
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [isLoggedIn, user?.role, router])

  if (!isLoggedIn || user?.role !== "admin") {
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
      <Sidebar currentPath="/dashboard/admin" />

      <div className="flex-1 overflow-auto">
        {/* Top Bar */}
        <div className="bg-card border-b border-border sticky top-0 z-10">
          <div className="px-8 py-4 flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Admin Dashboard</h1>
              <p className="text-sm text-muted-foreground">Welcome back, {user?.name}</p>
            </div>

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
                    <p className="text-sm text-muted-foreground mb-2">Total Clients</p>
                    <p className="text-3xl font-bold text-foreground">{stats?.totalClients}</p>
                  </div>
                  <div className="p-3 bg-primary/10 rounded-lg">
                    <Users className="text-primary" size={24} />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-4">+2 this month</p>
              </CardContent>
            </Card>

            <Card className="bg-card border border-border">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Active Projects</p>
                    <p className="text-3xl font-bold text-foreground">{stats?.activeProjects}</p>
                  </div>
                  <div className="p-3 bg-accent/10 rounded-lg">
                    <Briefcase className="text-accent" size={24} />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-4">8 on track</p>
              </CardContent>
            </Card>

            <Card className="bg-card border border-border">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Pending Proposals</p>
                    <p className="text-3xl font-bold text-foreground">{stats?.pendingProposals}</p>
                  </div>
                  <div className="p-3 bg-chart-2/10 rounded-lg">
                    <FileText className="text-chart-2" size={24} />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-4">$245K pipeline</p>
              </CardContent>
            </Card>

            <Card className="bg-card border border-border">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Active Users</p>
                    <p className="text-3xl font-bold text-foreground">{stats?.activeUsers}</p>
                  </div>
                  <div className="p-3 bg-chart-3/10 rounded-lg">
                    <Users className="text-chart-3" size={24} />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-4">All online</p>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Recent Clients Placeholder */}
            <div className="lg:col-span-2">
              <Card className="bg-card border border-border">
                <CardHeader>
                  <CardTitle className="text-foreground">Recent Clients</CardTitle>
                  <CardDescription>Latest added clients</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <p className="text-muted-foreground">Client data is fetched on the Clients page.</p>
                  </div>
                  <Link href="/dashboard/admin/clients">
                    <Button variant="ghost" className="w-full mt-4 text-primary hover:bg-primary/10">
                      View all clients →
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>

            {/* Upcoming Meetings Placeholder */}
            <div>
              <Card className="bg-card border border-border">
                <CardHeader>
                  <CardTitle className="text-foreground flex items-center gap-2">
                    <Clock className="text-muted-foreground" size={24} />
                    Upcoming
                  </CardTitle>
                  <CardDescription>Next 7 days</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <p className="text-muted-foreground">Meeting data is fetched on the Meetings page.</p>
                  </div>
                  <Link href="/dashboard/admin/meetings">
                    <Button variant="ghost" className="w-full mt-4 text-primary hover:bg-primary/10">
                      Schedule meeting →
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Dashboard Navigation Buttons */}
          <div className="mt-8 p-6 bg-card border border-border rounded-lg">
            <h3 className="text-lg font-bold text-foreground mb-4">Quick Navigation</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Link href="/dashboard/admin/clients">
                <Button variant="outline" className="w-full bg-secondary border-border hover:bg-secondary/80">
                  Manage Clients
                </Button>
              </Link>
              <Link href="/dashboard/admin/proposals">
                <Button variant="outline" className="w-full bg-secondary border-border hover:bg-secondary/80">
                  View Proposals
                </Button>
              </Link>
              <Link href="/dashboard/admin/projects">
                <Button variant="outline" className="w-full bg-secondary border-border hover:bg-secondary/80">
                  Projects
                </Button>
              </Link>
              <Link href="/dashboard/admin/team">
                <Button variant="outline" className="w-full bg-secondary border-border hover:bg-secondary/80">
                  Team Management
                </Button>
              </Link>
              <Link href="/dashboard/admin/meetings">
                <Button variant="outline" className="w-full bg-secondary border-border hover:bg-secondary/80">
                  Schedule Meeting
                </Button>
              </Link>
              <Link href="/dashboard/admin/reports">
                <Button variant="outline" className="w-full bg-secondary border-border hover:bg-secondary/80">
                  View Reports
                </Button>
              </Link>
              <Link href="/dashboard/sales">
                <Button variant="outline" className="w-full bg-secondary border-border hover:bg-secondary/80">
                  Sales Dashboard
                </Button>
              </Link>
              <Link href="/">
                <Button variant="outline" className="w-full bg-secondary border-border hover:bg-secondary/80">
                  Back to Login
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
