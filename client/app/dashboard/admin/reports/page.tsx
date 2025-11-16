"use client"

import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { Sidebar } from "@/components/layout/sidebar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import { Download } from "lucide-react"
import Link from "next/link"
import { useState } from "react"

export default function ReportsPage() {
  const { user, isLoggedIn } = useAuth()
  const router = useRouter()
  const [currentPath] = useState("/dashboard/admin/reports")

  if (!isLoggedIn || user?.role !== "admin") {
    router.push("/")
    return null
  }

  const revenueData = [
    { month: "Jan", revenue: 45000 },
    { month: "Feb", revenue: 62000 },
    { month: "Mar", revenue: 58000 },
    { month: "Apr", revenue: 75000 },
    { month: "May", revenue: 88000 },
    { month: "Jun", revenue: 95000 },
  ]

  const conversionData = [
    { stage: "Leads", count: 250 },
    { stage: "Proposals", count: 35 },
    { stage: "Approved", count: 18 },
  ]

  const projectStatus = [
    { name: "On Time", value: 65, color: "#22c55e" },
    { name: "At Risk", value: 20, color: "#f59e0b" },
    { name: "Delayed", value: 15, color: "#ef4444" },
  ]

  return (
    <div className="flex h-screen bg-background">
      <Sidebar currentPath={currentPath} />

      <div className="flex-1 overflow-auto">
        {/* Top Bar */}
        <div className="bg-card border-b border-border sticky top-0 z-10">
          <div className="px-8 py-4 flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Analytics & Reports</h1>
              <p className="text-sm text-muted-foreground">Business insights and performance metrics</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="bg-secondary border-border flex items-center gap-2">
                <Download size={20} />
                Export PDF
              </Button>
              <Button variant="outline" className="bg-secondary border-border flex items-center gap-2">
                <Download size={20} />
                Export CSV
              </Button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="p-8 space-y-8">
          {/* Revenue Chart */}
          <Card className="bg-card border border-border">
            <CardHeader>
              <CardTitle className="text-foreground">Revenue by Month</CardTitle>
              <CardDescription>Last 6 months revenue trend</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis dataKey="month" stroke="#999" />
                  <YAxis stroke="#999" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgba(20, 20, 30, 0.9)",
                      border: "1px solid rgba(255,255,255,0.1)",
                    }}
                    labelStyle={{ color: "#fff" }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="#8b5cf6"
                    strokeWidth={2}
                    dot={{ fill: "#8b5cf6", r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Proposal Conversion */}
            <Card className="bg-card border border-border">
              <CardHeader>
                <CardTitle className="text-foreground">Proposal Conversion</CardTitle>
                <CardDescription>Lead to approval pipeline</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={conversionData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                    <XAxis dataKey="stage" stroke="#999" />
                    <YAxis stroke="#999" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "rgba(20, 20, 30, 0.9)",
                        border: "1px solid rgba(255,255,255,0.1)",
                      }}
                      labelStyle={{ color: "#fff" }}
                    />
                    <Bar dataKey="count" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Project Status */}
            <Card className="bg-card border border-border">
              <CardHeader>
                <CardTitle className="text-foreground">Project Status</CardTitle>
                <CardDescription>Current project health</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={projectStatus}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {projectStatus.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "rgba(20, 20, 30, 0.9)",
                        border: "1px solid rgba(255,255,255,0.1)",
                      }}
                      labelStyle={{ color: "#fff" }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Summary Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="bg-card border border-border">
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground">Total Revenue</p>
                <p className="text-2xl font-bold text-foreground mt-2">$423K</p>
                <p className="text-xs text-chart-3 mt-2">+12% from last month</p>
              </CardContent>
            </Card>
            <Card className="bg-card border border-border">
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground">Active Clients</p>
                <p className="text-2xl font-bold text-foreground mt-2">48</p>
                <p className="text-xs text-chart-3 mt-2">+2 this month</p>
              </CardContent>
            </Card>
            <Card className="bg-card border border-border">
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground">Conversion Rate</p>
                <p className="text-2xl font-bold text-foreground mt-2">32%</p>
                <p className="text-xs text-chart-3 mt-2">+5% from last month</p>
              </CardContent>
            </Card>
            <Card className="bg-card border border-border">
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground">Team Utilization</p>
                <p className="text-2xl font-bold text-foreground mt-2">82%</p>
                <p className="text-xs text-primary mt-2">Optimal</p>
              </CardContent>
            </Card>
          </div>

          {/* Navigation */}
          <div className="flex gap-2">
            <Link href="/dashboard/admin">
              <Button variant="outline" className="bg-secondary border-border">
                ← Back
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
