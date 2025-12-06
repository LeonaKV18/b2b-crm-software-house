"use client"

import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { Sidebar } from "@/components/layout/sidebar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle2 } from "lucide-react"
import Link from "next/link"
import { useState, useEffect } from "react" // Import useEffect

interface Project {
  id: number;
  name: string;
  progress: number;
  status: string;
  deadline: string;
}

export default function ClientProjectsPage() {
  const { user, isLoggedIn } = useAuth()
  const router = useRouter()
  const [currentPath] = useState("/dashboard/client/projects")

  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!isLoggedIn || user?.role !== "client") {
      router.push("/")
      return
    }

    const fetchProjects = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/client-projects?userId=${user?.id}`)
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        const data = await response.json()
        setProjects(data)
      } catch (err) {
        console.error("Failed to fetch client projects:", err)
        setError("Failed to load client projects.")
      } finally {
        setLoading(false)
      }
    }

    if (user?.id) {
      fetchProjects()
    }
  }, [isLoggedIn, user?.role, user?.id, router])

  if (!isLoggedIn || user?.role !== "client") {
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
            <p className="text-sm text-muted-foreground">Track your active projects</p>
          </div>
        </div>

        {/* Main Content */}
        <div className="p-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {projects.map((project) => (
              <Card key={project.id} className="bg-card border border-border">
                <CardHeader>
                  <CardTitle className="text-foreground">{project.name}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
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

                  <div className="flex items-center justify-between pt-3 border-t border-border">
                    <div className="flex items-center gap-2 text-muted-foreground text-sm">
                      <CheckCircle2 size={16} />
                      {project.status}
                    </div>
                    <p className="text-sm text-muted-foreground">Due: {project.deadline}</p>
                  </div>

                  <Button className="w-full bg-primary hover:bg-primary/90">View Details</Button>
                </CardContent>
              </Card>
            ))}
          </div>

          <Link href="/dashboard/client">
            <Button variant="outline" className="mt-8 bg-secondary border-border">
              ← Back
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}