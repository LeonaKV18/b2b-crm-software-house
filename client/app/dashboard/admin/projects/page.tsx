"use client"

import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { Sidebar } from "@/components/layout/sidebar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Calendar, Users } from "lucide-react"
import Link from "next/link"
import { useState, useEffect } from "react" // Import useEffect

interface Project {
  id: string;
  name: string;
  client: string;
  progress: number;
  deadline: string;
  team: number;
  status: string;
}

export default function ProjectsPage() {
  const { user, isLoggedIn } = useAuth()
  const router = useRouter()
  const [currentPath] = useState("/dashboard/admin/projects")

  const [projects, setProjects] = useState<Project[]>([])
  const [clients, setClients] = useState<{ id: number; name: string }[]>([]) // State for clients dropdown
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Form State
  const [showAddForm, setShowAddForm] = useState(false)
  const [newProjectTitle, setNewProjectTitle] = useState("")
  const [newProjectClientId, setNewProjectClientId] = useState("")
  const [newProjectDescription, setNewProjectDescription] = useState("")
  const [newProjectValue, setNewProjectValue] = useState("")
  const [newProjectDeadline, setNewProjectDeadline] = useState("")
  const [newProjectStatus, setNewProjectStatus] = useState("active")

  const fetchData = async () => {
    try {
      setLoading(true)
      const [projectsRes, clientsRes] = await Promise.all([
        fetch("/api/projects"),
        fetch("/api/clients")
      ])

      if (!projectsRes.ok) throw new Error(`HTTP error! Projects: ${projectsRes.status}`)
      // Clients fetch might fail if no clients, but we should handle it gracefully
      
      const projectsData = await projectsRes.json()
      setProjects(projectsData)

      if (clientsRes.ok) {
        const clientsData = await clientsRes.json()
        setClients(clientsData)
      }
    } catch (err) {
      console.error("Failed to fetch data:", err)
      setError("Failed to load data.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!isLoggedIn || user?.role !== "admin") {
      router.push("/")
      return
    }
    fetchData()
  }, [isLoggedIn, user?.role, router])

  if (!isLoggedIn || user?.role !== "admin") {
    return null
  }

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch("/api/projects/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientId: newProjectClientId,
          title: newProjectTitle,
          description: newProjectDescription,
          value: newProjectValue,
          deadline: newProjectDeadline,
          status: newProjectStatus,
        }),
      })

      if (response.ok) {
        setShowAddForm(false)
        setNewProjectTitle("")
        setNewProjectClientId("")
        setNewProjectDescription("")
        setNewProjectValue("")
        setNewProjectDeadline("")
        setNewProjectStatus("active")
        fetchData() // Refresh list
      } else {
        const errorData = await response.json()
        alert(`Failed to create project: ${errorData.error}`)
      }
    } catch (err) {
      console.error("Error creating project:", err)
      alert("An error occurred while creating the project.")
    }
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
          <div className="px-8 py-4 flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Projects</h1>
              <p className="text-sm text-muted-foreground">All active and archived projects</p>
            </div>
            <Button
              onClick={() => setShowAddForm(!showAddForm)}
              className="bg-primary hover:bg-primary/90 flex items-center gap-2"
            >
              <Plus size={20} />
              New Project
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <div className="p-8">
          {/* Add Project Form */}
          {showAddForm && (
            <Card className="bg-card border border-border mb-8">
              <CardHeader>
                <CardTitle className="text-foreground">Create New Project</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCreateProject} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="text-sm font-medium text-foreground mb-1 block">Project Title</label>
                    <Input
                      placeholder="e.g. Website Redesign"
                      value={newProjectTitle}
                      onChange={(e) => setNewProjectTitle(e.target.value)}
                      required
                      className="bg-secondary border-border"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1 block">Client</label>
                    <select
                      value={newProjectClientId}
                      onChange={(e) => setNewProjectClientId(e.target.value)}
                      required
                      className="w-full px-3 py-2 bg-secondary border border-border rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-primary text-sm h-9"
                    >
                      <option value="">Select Client</option>
                      {clients.map((client) => (
                        <option key={client.id} value={client.id}>
                          {client.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1 block">Budget Value ($)</label>
                    <Input
                      type="number"
                      placeholder="e.g. 5000"
                      value={newProjectValue}
                      onChange={(e) => setNewProjectValue(e.target.value)}
                      required
                      className="bg-secondary border-border"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1 block">Deadline</label>
                    <Input
                      type="date"
                      value={newProjectDeadline}
                      onChange={(e) => setNewProjectDeadline(e.target.value)}
                      required
                      className="bg-secondary border-border"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1 block">Status</label>
                    <select
                      value={newProjectStatus}
                      onChange={(e) => setNewProjectStatus(e.target.value)}
                      className="w-full px-3 py-2 bg-secondary border border-border rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-primary text-sm h-9"
                    >
                      <option value="active">Active</option>
                      <option value="draft">Draft</option>
                      <option value="submitted">Submitted</option>
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-sm font-medium text-foreground mb-1 block">Description</label>
                    <textarea
                      value={newProjectDescription}
                      onChange={(e) => setNewProjectDescription(e.target.value)}
                      placeholder="Project details..."
                      className="w-full h-24 px-3 py-2 bg-secondary border border-border rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none text-sm"
                    />
                  </div>
                  <div className="md:col-span-2 flex gap-2">
                    <Button type="submit" className="bg-primary hover:bg-primary/90">
                      Create Project
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowAddForm(false)}
                      className="bg-secondary border-border"
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Project Cards Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {projects.map((project) => (
              <Card
                key={project.id}
                className="bg-card border border-border hover:border-primary/50 transition-colors cursor-pointer"
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-foreground">{project.name}</CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">{project.client}</p>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
                        project.status === "In Progress"
                          ? "bg-primary/20 text-primary"
                          : project.status === "Final Review"
                            ? "bg-chart-3/20 text-chart-3"
                            : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {project.status}
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Progress Bar */}
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

                  {/* Meta Info */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
                        <Calendar size={16} />
                        Deadline
                      </div>
                      <p className="text-sm font-medium text-foreground">{project.deadline}</p>
                    </div>
                    <div>
                      <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
                        <Users size={16} />
                        Team Size
                      </div>
                      <p className="text-sm font-medium text-foreground">{project.team} members</p>
                    </div>
                  </div>

                  {/* Actions */}
                  <Link href={`/dashboard/admin/projects/${project.id}`} className="w-full">
                    <Button variant="outline" className="w-full bg-secondary border-border hover:bg-secondary/80">
                      View Details
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Navigation */}
          <div className="mt-8 flex gap-2">
            <Link href="/dashboard/admin">
              <Button variant="outline" className="bg-secondary border-border">
                ← Back
              </Button>
            </Link>
            <Link href="/dashboard/admin/team">
              <Button variant="outline" className="bg-secondary border-border">
                Team Management →
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}