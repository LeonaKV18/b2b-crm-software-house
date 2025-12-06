"use client"

import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { Sidebar } from "@/components/layout/sidebar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, Users, FileText, BarChart3 } from "lucide-react"
import Link from "next/link"
import { useState, useEffect } from "react" // Import useEffect

interface SalesStats {
  totalLeads: number;
  totalClients: number;
  totalProposals: number;
  conversionRate: number;
}

export default function SalesDashboard() {
  const { user, isLoggedIn } = useAuth()
  const router = useRouter()
  const [currentPath] = useState("/dashboard/sales")

  const [stats, setStats] = useState<SalesStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!isLoggedIn || user?.role !== "sales") {
      router.push("/")
      return
    }

    const fetchStats = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/sales-dashboard-stats?userId=${user?.id}`)
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        const data = await response.json()
        setStats(data)
      } catch (err) {
        console.error("Failed to fetch sales dashboard stats:", err)
        setError("Failed to load dashboard statistics.")
      } finally {
        setLoading(false)
      }
    }

    if (user?.id) { // Only fetch if user ID is available
      fetchStats()
    }
  }, [isLoggedIn, user?.role, user?.id, router])

  if (!isLoggedIn || user?.role !== "sales") {
    router.push("/")
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
          <div className="px-8 py-4 flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Sales Dashboard</h1>
              <p className="text-sm text-muted-foreground">Pipeline & conversion tracking</p>
            </div>
            <Link href="/dashboard/sales/leads">
              <Button className="bg-primary hover:bg-primary/90">+ Add Lead</Button>
            </Link>
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
                    <p className="text-sm text-muted-foreground mb-2">Total Leads</p>
                    <p className="text-3xl font-bold text-foreground">{stats?.totalLeads}</p>
                  </div>
                  <div className="p-3 bg-chart-1/10 rounded-lg">
                    <TrendingUp className="text-chart-1" size={24} />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-4">+24 this week</p> {/* Placeholder */}
              </CardContent>
            </Card>

            <Card className="bg-card border border-border">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Clients</p>
                    <p className="text-3xl font-bold text-foreground">{stats?.totalClients}</p>
                  </div>
                  <div className="p-3 bg-primary/10 rounded-lg">
                    <Users className="text-primary" size={24} />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-4">Active relationships</p> {/* Placeholder */}
              </CardContent>
            </Card>

            <Card className="bg-card border border-border">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Proposals</p>
                    <p className="text-3xl font-bold text-foreground">{stats?.totalProposals}</p>
                  </div>
                  <div className="p-3 bg-accent/10 rounded-lg">
                    <FileText className="text-accent" size={24} />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-4">In pipeline</p> {/* Placeholder */}
              </CardContent>
            </Card>

            <Card className="bg-card border border-border">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Conversion Rate</p>
                    <p className="text-3xl font-bold text-foreground">{stats?.conversionRate}%</p>
                  </div>
                  <div className="p-3 bg-chart-3/10 rounded-lg">
                    <BarChart3 className="text-chart-3" size={24} />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-4">Above target</p> {/* Placeholder */}
              </CardContent>
            </Card>
          </div>

          {/* Content Grid (Quick Actions only now) */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <Card className="bg-card border border-border">
                <CardHeader>
                  <CardTitle className="text-foreground">Recent Leads</CardTitle>
                  <CardDescription>Leads added this week</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <p className="text-muted-foreground">Recent leads will be displayed on the Leads page.</p>
                  </div>
                  <Link href="/dashboard/sales/leads">
                    <Button variant="ghost" className="w-full mt-4 text-primary hover:bg-primary/10">
                      View all leads →
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <div className="space-y-4">
              <Card className="bg-card border border-border">
                <CardHeader>
                  <CardTitle className="text-foreground text-base">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Link href="/dashboard/sales/leads" className="w-full">
                    <Button
                      variant="outline"
                      className="w-full justify-start bg-secondary border-border hover:bg-secondary/80"
                    >
                      Create New Lead
                    </Button>
                  </Link>
                  <Link href="/dashboard/sales/clients" className="w-full">
                    <Button
                      variant="outline"
                      className="w-full justify-start bg-secondary border-border hover:bg-secondary/80"
                    >
                      Manage Clients
                    </Button>
                  </Link>
                  <Link href="/dashboard/sales/proposals" className="w-full">
                    <Button
                      variant="outline"
                      className="w-full justify-start bg-secondary border-border hover:bg-secondary/80"
                    >
                      Send Proposal
                    </Button>
                  </Link>
                  <Link href="/dashboard/sales/meetings" className="w-full">
                    <Button
                      variant="outline"
                      className="w-full justify-start bg-secondary border-border hover:bg-secondary/80"
                    >
                      Schedule Meeting
                    </Button>
                  </Link>
                  <Link href="/dashboard/admin" className="w-full">
                    <Button
                      variant="outline"
                      className="w-full justify-start bg-secondary border-border hover:bg-secondary/80"
                    >
                      Admin Dashboard
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
