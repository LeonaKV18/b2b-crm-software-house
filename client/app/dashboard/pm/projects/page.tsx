"use client"
import { useState, useEffect } from "react" // Import useEffect
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { Sidebar } from "@/components/layout/sidebar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, Users } from "lucide-react"
import Link from "next/link"

interface Project {
  id: string;
  name: string;
  client: string;
  progress: number;
  deadline: string;
  team: number;
  status: string; // Added status field from API
}

export default function PMProjectsPage() {
  const { user, isLoggedIn } = useAuth()
  const router = useRouter()
  const [currentPath] = useState("/dashboard/pm/projects")

  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!isLoggedIn || user?.role !== "pm") {
      router.push("/")
      return
    }

    const fetchProjects = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/pm-projects?userId=${user?.id}`)
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        const data = await response.json()
        setProjects(data)
      } catch (err) {
        console.error("Failed to fetch PM projects:", err)
        setError("Failed to load projects.")
      } finally {
        setLoading(false)
      }
    }

    if (user?.id) { // Only fetch if user ID is available
      fetchProjects()
    }
  }, [isLoggedIn, user?.role, user?.id, router])

  if (!isLoggedIn || user?.role !== "pm") {
    router.push("/")
    return null
  }

  const getStatusBadge = (status: string) => {
    switch (status?.toLowerCase()) {
      case "active":
        return "bg-primary/20 text-primary";
      case "completed":
        return "bg-chart-3/20 text-chart-3";
      case "submitted":
        return "bg-accent/20 text-accent"; // Using accent for submitted, similar to "Final Review"
      case "approved":
        return "bg-chart-3/20 text-chart-3";
      case "rejected":
        return "bg-destructive/20 text-destructive";
      default:
        return "bg-muted text-muted-foreground"; // For 'draft' or any other unmapped status
    }
  };

  const getDisplayStatus = (status: string) => {
    switch (status?.toLowerCase()) {
      case "active":
        return "In Progress";
      case "completed":
        return "Completed";
      case "submitted":
        return "Submitted";
      case "approved":
        return "Approved";
      case "rejected":
        return "Rejected";
      default:
        return status; // 'draft' or other statuses
    }
  };


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
            {projects.length === 0 ? (
              <p className="text-muted-foreground">No projects found for this Project Manager.</p>
            ) : (
              projects.map((project) => (
                <Card
                  key={project.id}
                  className="bg-card border border-border hover:border-primary/50 transition-colors cursor-pointer"
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-foreground">{project.name}</CardTitle>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${getStatusBadge(
                          project.status
                        )}`}
                      >
                        {getDisplayStatus(project.status)}
                      </span>
                    </div>
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

                    {/* Link to actual project details page, assuming /dashboard/admin/projects/[id] works for all */}
                    <Link href={`/dashboard/admin/projects/${project.id}`} className="w-full">
                      <Button variant="outline" className="w-full bg-secondary border-border hover:bg-secondary/80">
                        View Details
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))
            )}
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
