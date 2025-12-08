"use client"

import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { Sidebar } from "@/components/layout/sidebar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useState, useEffect } from "react"
import Link from "next/link"
import { Calendar, Clock, CheckCircle2, AlertCircle } from "lucide-react"

interface ProjectDetails {
  id: string;
  name: string;
  client: string;
  description: string;
  status: string;
  progress: number;
  deadline: string;
}

interface Milestone {
  id: number;
  name: string;
  status: string;
  dueDate: string;
}

export default function ClientProjectDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { user, isLoggedIn } = useAuth()
  const router = useRouter()
  const [projectId, setProjectId] = useState<string>("")
  const [currentPath, setCurrentPath] = useState("")

  const [project, setProject] = useState<ProjectDetails | null>(null)
  const [milestones, setMilestones] = useState<Milestone[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    params.then((unwrappedParams) => {
        setProjectId(unwrappedParams.id);
        setCurrentPath(`/dashboard/client/projects/${unwrappedParams.id}`);
    });
  }, [params]);

  useEffect(() => {
    if (!isLoggedIn || user?.role !== "client") {
      router.push("/")
      return
    }

    const fetchData = async () => {
      if (!projectId) return;
      try {
        setLoading(true)
        const [projectRes, milestonesRes] = await Promise.all([
          fetch(`/api/project-details/${projectId}`),
          fetch(`/api/project-milestones/${projectId}`)
        ])

        if (!projectRes.ok) throw new Error("Failed to fetch project details")
        
        const projectData = await projectRes.json()
        setProject(projectData)

        if (milestonesRes.ok) {
            const milestonesData = await milestonesRes.json()
            setMilestones(milestonesData)
        }
      } catch (err) {
        console.error(err)
        setError("Failed to load project details.")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [isLoggedIn, user?.role, router, projectId])

  if (!isLoggedIn || user?.role !== "client") {
    return null
  }

  if (loading) {
    return (
      <div className="flex h-screen bg-background items-center justify-center">
        <p className="text-foreground">Loading details...</p>
      </div>
    )
  }

  if (error || !project) {
    return (
      <div className="flex h-screen bg-background items-center justify-center">
        <p className="text-destructive">{error || "Project not found"}</p>
      </div>
    )
  }

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'active': return 'text-primary'
      case 'completed': return 'text-chart-3'
      case 'delayed': return 'text-destructive'
      default: return 'text-muted-foreground'
    }
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar currentPath={currentPath} />

      <div className="flex-1 overflow-auto">
        {/* Top Bar */}
        <div className="bg-card border-b border-border sticky top-0 z-10">
          <div className="px-8 py-4 flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-foreground">{project.name}</h1>
              <p className="text-sm text-muted-foreground">Project Overview</p>
            </div>
            <Link href="/dashboard/client/projects">
              <Button variant="outline" className="bg-secondary border-border">
                ← Back to Projects
              </Button>
            </Link>
          </div>
        </div>

        {/* Main Content */}
        <div className="p-8 space-y-8">
          
          {/* Project Status Card */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-card border border-border md:col-span-2">
                <CardHeader>
                    <CardTitle>Description</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">{project.description || "No description available."}</p>
                </CardContent>
            </Card>

            <Card className="bg-card border border-border">
                <CardHeader>
                    <CardTitle>Status</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Current Status</span>
                        <span className={`font-bold capitalize ${getStatusColor(project.status)}`}>{project.status}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Deadline</span>
                        <span className="font-medium">{project.deadline}</span>
                    </div>
                    <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                            <span>Progress</span>
                            <span>{project.progress}%</span>
                        </div>
                        <div className="w-full bg-secondary rounded-full h-2">
                            <div className="bg-primary h-2 rounded-full transition-all" style={{ width: `${project.progress}%` }} />
                        </div>
                    </div>
                </CardContent>
            </Card>
          </div>

          {/* Milestones */}
          <div>
            <h2 className="text-xl font-bold mb-4">Milestones</h2>
            <div className="grid grid-cols-1 gap-4">
                {milestones.length === 0 ? (
                    <p className="text-muted-foreground">No milestones tracked.</p>
                ) : (
                    milestones.map((ms) => (
                        <Card key={ms.id} className="bg-card border border-border">
                            <CardContent className="p-4 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    {ms.status === 'done' ? (
                                        <CheckCircle2 className="text-chart-3" />
                                    ) : (
                                        <Clock className="text-muted-foreground" />
                                    )}
                                    <div>
                                        <p className="font-semibold">{ms.name}</p>
                                        <p className="text-xs text-muted-foreground">Due: {ms.dueDate}</p>
                                    </div>
                                </div>
                                <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize 
                                    ${ms.status === 'done' ? 'bg-chart-3/20 text-chart-3' : 
                                      ms.status === 'in_progress' ? 'bg-primary/20 text-primary' : 'bg-secondary text-muted-foreground'}`}>
                                    {ms.status.replace('_', ' ')}
                                </span>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
