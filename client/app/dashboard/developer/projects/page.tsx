"use client"

import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { Sidebar } from "@/components/layout/sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useState, useEffect } from "react"
import { Briefcase, MapPin } from "lucide-react"

interface Project {
  id: number;
  name: string;
  client: string;
  status: string;
  currentMilestone: string;
}

export default function DeveloperProjectsPage() {
  const { user, isLoggedIn } = useAuth()
  const router = useRouter()
  const [currentPath] = useState("/dashboard/developer/projects")

  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!isLoggedIn || user?.role !== "developer") {
      router.push("/")
      return
    }

    const fetchProjects = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/developer-projects?userId=${user?.id}`)
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        const data = await response.json()
        setProjects(data)
      } catch (err) {
        console.error("Failed to fetch developer projects:", err)
        setError("Failed to load projects.")
      } finally {
        setLoading(false)
      }
    }

    if (user?.id) {
      fetchProjects()
    }
  }, [isLoggedIn, user?.role, user?.id, router])

  if (!isLoggedIn || user?.role !== "developer") {
    return null
  }

  if (loading) {
    return (
      <div className="flex h-screen bg-background items-center justify-center">
        <p className="text-foreground">Loading projects...</p>
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
            <h1 className="text-2xl font-bold text-foreground">My Projects</h1>
            <p className="text-sm text-muted-foreground">Active projects and current milestones</p>
          </div>
        </div>

        {/* Main Content */}
        <div className="p-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {projects.length === 0 ? (
              <p className="text-muted-foreground">No projects found.</p>
            ) : (
              projects.map((project) => (
                <Link href={`/dashboard/developer/projects/${project.id}`} key={project.id} className="block">
                <Card className="bg-card border border-border hover:border-primary/50 transition-colors cursor-pointer">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          <Briefcase className="text-primary" size={20} />
                        </div>
                        <div>
                          <CardTitle className="text-foreground text-lg">{project.name}</CardTitle>
                          <p className="text-sm text-muted-foreground">{project.client}</p>
                        </div>
                      </div>
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-primary/20 text-primary capitalize">
                        {project.status}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="mt-4 p-4 bg-secondary/50 rounded-lg border border-border">
                        <div className="flex items-center gap-2 mb-2">
                            <MapPin size={16} className="text-chart-3" />
                            <span className="text-sm font-semibold text-foreground">Current Milestone</span>
                        </div>
                        <p className="text-sm text-muted-foreground pl-6">
                            {project.currentMilestone || "No active milestones"}
                        </p>
                    </div>
                  </CardContent>
                </Card>
                </Link>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
