"use client"

import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { Sidebar } from "@/components/layout/sidebar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Plus, CheckCircle, AlertCircle, Clock } from "lucide-react"
import Link from "next/link"
import { useState } from "react"

export default function MilestonesPage() {
  const { user, isLoggedIn } = useAuth()
  const router = useRouter()
  const [currentPath] = useState("/dashboard/pm/milestones")

  if (!isLoggedIn || user?.role !== "pm") {
    router.push("/")
    return null
  }

  const milestones = [
    {
      id: 1,
      name: "Design Mockups",
      project: "Portal Redesign",
      status: "Completed",
      dueDate: "2025-01-15",
      owner: "Mike Johnson",
    },
    {
      id: 2,
      name: "Frontend Development",
      project: "Mobile App",
      status: "In Progress",
      dueDate: "2025-02-15",
      owner: "Sarah Smith",
    },
    {
      id: 3,
      name: "Backend Integration",
      project: "Cloud Migration",
      status: "Pending",
      dueDate: "2025-03-01",
      owner: "John Doe",
    },
    {
      id: 4,
      name: "Testing & QA",
      project: "Portal Redesign",
      status: "Pending",
      dueDate: "2025-03-10",
      owner: "Team",
    },
  ]

  return (
    <div className="flex h-screen bg-background">
      <Sidebar currentPath={currentPath} />

      <div className="flex-1 overflow-auto">
        {/* Top Bar */}
        <div className="bg-card border-b border-border sticky top-0 z-10">
          <div className="px-8 py-4 flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Milestones</h1>
              <p className="text-sm text-muted-foreground">Track project milestones</p>
            </div>
            <Button className="bg-primary hover:bg-primary/90 flex items-center gap-2">
              <Plus size={20} />
              Add Milestone
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <div className="p-8">
          <div className="space-y-3">
            {milestones.map((milestone) => (
              <Card key={milestone.id} className="bg-card border border-border">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="flex gap-4 flex-1">
                      <div className="mt-1">
                        {milestone.status === "Completed" ? (
                          <CheckCircle className="text-chart-3" size={24} />
                        ) : milestone.status === "In Progress" ? (
                          <Clock className="text-primary" size={24} />
                        ) : (
                          <AlertCircle className="text-muted-foreground" size={24} />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="font-bold text-foreground text-lg">{milestone.name}</p>
                        <p className="text-sm text-muted-foreground">{milestone.project}</p>
                        <p className="text-xs text-muted-foreground mt-1">Owner: {milestone.owner}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium block mb-2 ${
                          milestone.status === "Completed"
                            ? "bg-chart-3/20 text-chart-3"
                            : milestone.status === "In Progress"
                              ? "bg-primary/20 text-primary"
                              : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {milestone.status}
                      </span>
                      <p className="text-xs text-muted-foreground">Due: {milestone.dueDate}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Link href="/dashboard/pm">
            <Button variant="outline" className="mt-8 bg-secondary border-border">
              ← Back
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
