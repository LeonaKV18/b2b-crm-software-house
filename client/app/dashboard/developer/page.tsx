"use client"

import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { Sidebar } from "@/components/layout/sidebar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, Clock, AlertCircle } from "lucide-react"
import Link from "next/link"
import { useState } from "react"

export default function DeveloperDashboard() {
  const { user, isLoggedIn } = useAuth()
  const router = useRouter()
  const [currentPath] = useState("/dashboard/developer")

  if (!isLoggedIn || user?.role !== "developer") {
    router.push("/")
    return null
  }

  const tasks = [
    {
      id: 1,
      title: "Setup Database Schema",
      project: "Portal Redesign",
      due: "2025-02-01",
      status: "In Progress",
      priority: "High",
    },
    {
      id: 2,
      title: "Create Login Component",
      project: "Mobile App",
      due: "2025-02-05",
      status: "Pending",
      priority: "High",
    },
    {
      id: 3,
      title: "API Integration",
      project: "Cloud Migration",
      due: "2025-02-10",
      status: "In Progress",
      priority: "Medium",
    },
  ]

  return (
    <div className="flex h-screen bg-background">
      <Sidebar currentPath={currentPath} />

      <div className="flex-1 overflow-auto">
        {/* Top Bar */}
        <div className="bg-card border-b border-border sticky top-0 z-10">
          <div className="px-8 py-4">
            <h1 className="text-2xl font-bold text-foreground">My Tasks</h1>
            <p className="text-sm text-muted-foreground">Assigned tasks and milestones</p>
          </div>
        </div>

        {/* Main Content */}
        <div className="p-8">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="bg-card border border-border">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Active Tasks</p>
                    <p className="text-3xl font-bold text-foreground">5</p>
                  </div>
                  <div className="p-3 bg-primary/10 rounded-lg">
                    <Clock className="text-primary" size={24} />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border border-border">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Completed</p>
                    <p className="text-3xl font-bold text-foreground">12</p>
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
                    <p className="text-sm text-muted-foreground mb-2">Overdue</p>
                    <p className="text-3xl font-bold text-foreground">1</p>
                  </div>
                  <div className="p-3 bg-destructive/10 rounded-lg">
                    <AlertCircle className="text-destructive" size={24} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tasks List */}
          <Card className="bg-card border border-border mb-8">
            <CardHeader>
              <CardTitle className="text-foreground">Assigned Tasks</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {tasks.map((task) => (
                  <div key={task.id} className="p-4 bg-secondary rounded-lg border border-border">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-medium text-foreground">{task.title}</p>
                        <p className="text-xs text-muted-foreground mt-1">{task.project}</p>
                      </div>
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          task.priority === "High" ? "bg-destructive/20 text-destructive" : "bg-primary/20 text-primary"
                        }`}
                      >
                        {task.priority}
                      </span>
                    </div>
                    <div className="flex items-center justify-between mt-3">
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          task.status === "In Progress"
                            ? "bg-primary/20 text-primary"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {task.status}
                      </span>
                      <p className="text-xs text-muted-foreground">Due: {task.due}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Navigation */}
          <div className="flex gap-2">
            <Link href="/dashboard/pm">
              <Button variant="outline" className="bg-secondary border-border">
                PM Dashboard
              </Button>
            </Link>
            <Link href="/">
              <Button variant="outline" className="bg-secondary border-border">
                Logout
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
