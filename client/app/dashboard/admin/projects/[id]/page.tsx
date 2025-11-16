"use client"

import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { Sidebar } from "@/components/layout/sidebar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus } from "lucide-react"
import Link from "next/link"
import { useState } from "react"

export default function ProjectDetailsPage({ params }: { params: { id: string } }) {
  const { user, isLoggedIn } = useAuth()
  const router = useRouter()
  const [currentPath] = useState(`/dashboard/admin/projects/${params.id}`)

  if (!isLoggedIn || user?.role !== "admin") {
    router.push("/")
    return null
  }

  const project = {
    id: params.id,
    name: "Portal Redesign",
    client: "Acme Corp",
    description: "Complete redesign of the client portal with new UI/UX",
    status: "In Progress",
    progress: 75,
    deadline: "2025-03-15",
    budget: 85000,
    spent: 63750,
    team: [
      { name: "John Doe", role: "PM" },
      { name: "Sarah Smith", role: "Developer" },
      { name: "Mike Johnson", role: "Designer" },
    ],
  }

  const milestones = [
    { id: 1, name: "Design Mockups", status: "Completed", dueDate: "2025-01-15", owner: "Mike Johnson" },
    { id: 2, name: "Frontend Development", status: "In Progress", dueDate: "2025-02-15", owner: "Sarah Smith" },
    { id: 3, name: "Backend Integration", status: "Pending", dueDate: "2025-03-01", owner: "John Doe" },
    { id: 4, name: "Testing & QA", status: "Pending", dueDate: "2025-03-10", owner: "Team" },
  ]

  return (
    <div className="flex h-screen bg-background">
      <Sidebar currentPath={currentPath} />

      <div className="flex-1 overflow-auto">
        {/* Top Bar */}
        <div className="bg-card border-b border-border sticky top-0 z-10">
          <div className="px-8 py-4 flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-foreground">{project.name}</h1>
              <p className="text-sm text-muted-foreground">{project.client}</p>
            </div>
            <Link href="/dashboard/admin/projects">
              <Button variant="outline" className="bg-secondary border-border">
                ← Back to Projects
              </Button>
            </Link>
          </div>
        </div>

        {/* Main Content */}
        <div className="p-8">
          {/* Project Overview */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
            <div className="lg:col-span-2">
              <Card className="bg-card border border-border">
                <CardHeader>
                  <CardTitle className="text-foreground">Project Overview</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Description</p>
                    <p className="text-foreground">{project.description}</p>
                  </div>

                  {/* Progress */}
                  <div>
                    <div className="flex justify-between mb-2">
                      <p className="text-sm text-muted-foreground">Progress</p>
                      <p className="text-sm font-bold text-foreground">{project.progress}%</p>
                    </div>
                    <div className="w-full bg-secondary rounded-full h-3">
                      <div
                        className="bg-primary h-3 rounded-full transition-all"
                        style={{ width: `${project.progress}%` }}
                      />
                    </div>
                  </div>

                  {/* Meta */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Deadline</p>
                      <p className="font-medium text-foreground">{project.deadline}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Status</p>
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-primary/20 text-primary">
                        {project.status}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Budget Card */}
            <Card className="bg-card border border-border">
              <CardHeader>
                <CardTitle className="text-foreground">Budget</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Total Budget</p>
                  <p className="text-2xl font-bold text-foreground">${(project.budget / 1000).toFixed(0)}K</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Spent</p>
                  <p className="text-xl font-bold text-foreground">${(project.spent / 1000).toFixed(0)}K</p>
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <p className="text-xs text-muted-foreground">Utilization</p>
                    <p className="text-xs font-bold text-foreground">
                      {Math.round((project.spent / project.budget) * 100)}%
                    </p>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-2">
                    <div
                      className="bg-chart-3 h-2 rounded-full transition-all"
                      style={{ width: `${(project.spent / project.budget) * 100}%` }}
                    />
                  </div>
                </div>
                <p className="text-xs text-chart-3 mt-2">
                  Remaining: ${((project.budget - project.spent) / 1000).toFixed(0)}K
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Team & Milestones */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Team */}
            <Card className="bg-card border border-border">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="text-foreground">Assigned Team</CardTitle>
                  <Button size="sm" className="bg-primary hover:bg-primary/90 flex items-center gap-1">
                    <Plus size={16} />
                    Add
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {project.team.map((member, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-secondary rounded-lg border border-border flex justify-between items-center"
                    >
                      <div>
                        <p className="font-medium text-foreground">{member.name}</p>
                        <p className="text-xs text-muted-foreground">{member.role}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Milestones */}
            <Card className="bg-card border border-border">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="text-foreground">Milestones</CardTitle>
                  <Button size="sm" className="bg-primary hover:bg-primary/90 flex items-center gap-1">
                    <Plus size={16} />
                    Add
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {milestones.map((milestone) => (
                    <div key={milestone.id} className="p-3 bg-secondary rounded-lg border border-border">
                      <div className="flex justify-between items-start mb-2">
                        <p className="font-medium text-foreground">{milestone.name}</p>
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium ${
                            milestone.status === "Completed"
                              ? "bg-chart-3/20 text-chart-3"
                              : milestone.status === "In Progress"
                                ? "bg-primary/20 text-primary"
                                : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {milestone.status}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">{milestone.dueDate}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
