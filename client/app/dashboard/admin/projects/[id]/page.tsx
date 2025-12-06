"use client"

import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { Sidebar } from "@/components/layout/sidebar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus } from "lucide-react"
import Link from "next/link"
import { useState, useEffect } from "react" // Import useEffect

interface ProjectDetails {
  id: string;
  name: string;
  client: string;
  description: string;
  status: string;
  progress: number;
  deadline: string;
  budget: number;
  spent: number;
}

interface TeamMember {
  id: number;
  name: string;
  role: string;
}

interface Milestone {
  id: number;
  name: string;
  status: string;
  dueDate: string;
  owner: string;
}

export default function ProjectDetailsPage({ params }: { params: { id: string } }) {
  const { user, isLoggedIn } = useAuth()
  const router = useRouter()
  const [currentPath] = useState(`/dashboard/admin/projects/${params.id}`)

  const [projectDetails, setProjectDetails] = useState<ProjectDetails | null>(null)
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])
  const [milestones, setMilestones] = useState<Milestone[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!isLoggedIn || user?.role !== "admin") {
      router.push("/")
      return
    }

    const fetchProjectData = async () => {
      try {
        setLoading(true)
        const [projectRes, teamRes, milestonesRes] = await Promise.all([
          fetch(`/api/project-details/${params.id}`),
          fetch(`/api/project-team/${params.id}`),
          fetch(`/api/project-milestones/${params.id}`),
        ])

        if (!projectRes.ok) throw new Error(`HTTP error! Project details: ${projectRes.status}`)
        if (!teamRes.ok) throw new Error(`HTTP error! Team members: ${teamRes.status}`)
        if (!milestonesRes.ok) throw new Error(`HTTP error! Milestones: ${milestonesRes.status}`)

        const projectData = await projectRes.json()
        const teamData = await teamRes.json()
        const milestonesData = await milestonesRes.json()

        setProjectDetails(projectData)
        setTeamMembers(teamData)
        setMilestones(milestonesData)
      } catch (err) {
        console.error("Failed to fetch project data:", err)
        setError("Failed to load project details.")
      } finally {
        setLoading(false)
      }
    }

    fetchProjectData()
  }, [isLoggedIn, user?.role, router, params.id])

  if (!isLoggedIn || user?.role !== "admin") {
    return null
  }

  const getProjectStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "active":
      case "in progress": // Map 'in_progress' to 'In Progress' for display
        return "bg-primary/20 text-primary";
      case "completed":
        return "bg-chart-3/20 text-chart-3";
      case "approved":
        return "bg-chart-3/20 text-chart-3";
      case "submitted":
        return "bg-accent/20 text-accent";
      case "draft":
        return "bg-muted text-muted-foreground";
      case "rejected":
        return "bg-destructive/20 text-destructive";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getMilestoneStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "done":
        return "bg-chart-3/20 text-chart-3";
      case "in_progress":
        return "bg-primary/20 text-primary";
      case "todo":
        return "bg-muted text-muted-foreground";
      default:
        return "bg-muted text-muted-foreground";
    }
  };


  if (loading) {
    return (
      <div className="flex h-screen bg-background items-center justify-center">
        <p className="text-foreground">Loading project details...</p>
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

  if (!projectDetails) {
    return (
      <div className="flex h-screen bg-background items-center justify-center">
        <p className="text-muted-foreground">Project not found.</p>
      </div>
    )
  }

  const project = projectDetails; // Use fetched data

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
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getProjectStatusBadge(project.status)}`}>
                        {project.status === "in_progress" ? "In Progress" : project.status}
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
                      {project.budget > 0 ? Math.round((project.spent / project.budget) * 100) : 0}%
                    </p>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-2">
                    <div
                      className="bg-chart-3 h-2 rounded-full transition-all"
                      style={{ width: `${project.budget > 0 ? (project.spent / project.budget) * 100 : 0}%` }}
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
                  {teamMembers.length === 0 ? (
                    <p className="text-muted-foreground">No team members assigned to this project.</p>
                  ) : (
                    teamMembers.map((member) => (
                      <div
                        key={member.id}
                        className="p-3 bg-secondary rounded-lg border border-border flex justify-between items-center"
                      >
                        <div>
                          <p className="font-medium text-foreground">{member.name}</p>
                          <p className="text-xs text-muted-foreground">{member.role}</p>
                        </div>
                      </div>
                    ))
                  )}
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
                  {milestones.length === 0 ? (
                    <p className="text-muted-foreground">No milestones found for this project.</p>
                  ) : (
                    milestones.map((milestone) => (
                      <div key={milestone.id} className="p-3 bg-secondary rounded-lg border border-border">
                        <div className="flex justify-between items-start mb-2">
                          <p className="font-medium text-foreground">{milestone.name}</p>
                          <span
                            className={`px-2 py-1 rounded text-xs font-medium ${getMilestoneStatusBadge(milestone.status)}`}
                          >
                            {milestone.status === "in_progress" ? "In Progress" : milestone.status}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground">Due: {milestone.dueDate}</p>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
