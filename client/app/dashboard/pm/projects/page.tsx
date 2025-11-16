"use client"

import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { Sidebar } from "@/components/layout/sidebar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, Users } from "lucide-react"
import Link from "next/link"
import { useState } from "react"

export default function PMProjectsPage() {
  const { user, isLoggedIn } = useAuth()
  const router = useRouter()
  const [currentPath] = useState("/dashboard/pm/projects")

  if (!isLoggedIn || user?.role !== "pm") {
    router.push("/")
    return null
  }

  const projects = [
    { id: "PRJ001", name: "Portal Redesign", client: "Acme Corp", progress: 75, deadline: "2025-03-15", team: 4 },
    { id: "PRJ002", name: "Mobile App", client: "Tech Startup", progress: 45, deadline: "2025-04-30", team: 6 },
    {
      id: "PRJ003",
      name: "Cloud Migration",
      client: "Digital Solutions",
      progress: 20,
      deadline: "2025-06-01",
      team: 5,
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
              <h1 className="text-2xl font-bold text-foreground">My Projects</h1>
              <p className="text-sm text-muted-foreground">All assigned projects</p>
            </div>
            <Button className="bg-primary hover:bg-primary/90">+ New Project</Button>
          </div>
        </div>

        {/* Main Content */}
        <div className="p-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {projects.map((project) => (
              <Card
                key={project.id}
                className="bg-card border border-border hover:border-primary/50 transition-colors cursor-pointer"
              >
                <CardHeader>
                  <CardTitle className="text-foreground">{project.name}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">{project.client}</p>

                  <div>
                    <div className="flex justify-between mb-2">
                      <p className="text-sm text-muted-foreground">Progress</p>
                      <p className="text-sm font-bold text-foreground">{project.progress}%</p>
                    </div>
                    <div className="w-full bg-secondary rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full transition-all"
                        style={{ width: `${project.progress}%` }}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-2 border-t border-border">
                    <div className="flex items-center gap-2 text-muted-foreground text-sm">
                      <Calendar size={16} />
                      {project.deadline}
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground text-sm">
                      <Users size={16} />
                      {project.team} members
                    </div>
                  </div>

                  <Link href={`/dashboard/admin/projects/${project.id}`} className="w-full">
                    <Button variant="outline" className="w-full bg-secondary border-border hover:bg-secondary/80">
                      View Details
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>

          <Link href="/dashboard/pm" className="mt-8">
            <Button variant="outline" className="bg-secondary border-border">
              ← Back
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
