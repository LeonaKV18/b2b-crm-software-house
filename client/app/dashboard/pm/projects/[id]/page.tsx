"use client"

import { useAuth } from "@/lib/auth-context"
import { useRouter, useParams } from "next/navigation"
import { Sidebar } from "@/components/layout/sidebar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useState, useEffect } from "react" // Import useEffect
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus } from "lucide-react"
import Link from "next/link"

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

interface Developer {
  id: number;
  name: string;
  email: string;
}

export default function PMProjectDetailsPage() {
  const params = useParams()
  const id = params?.id as string
  const { user, isLoggedIn } = useAuth()
  const router = useRouter()
  const [currentPath] = useState(`/dashboard/pm/projects`) // Generalize path for sidebar

  const [projectDetails, setProjectDetails] = useState<ProjectDetails | null>(null)
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])
  const [milestones, setMilestones] = useState<Milestone[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [showAssignDeveloperDialog, setShowAssignDeveloperDialog] = useState(false)
  const [availableDevelopers, setAvailableDevelopers] = useState<Developer[]>([])
  const [selectedDeveloper, setSelectedDeveloper] = useState<string>("")

  // Milestone Dialog State
  const [showAddMilestoneDialog, setShowAddMilestoneDialog] = useState(false)
  const [newMilestone, setNewMilestone] = useState({
    title: "",
    description: "",
    dueDate: "",
    priority: "Medium"
  })

  useEffect(() => {
    if (!isLoggedIn || user?.role !== "pm") {
      router.push("/")
      return
    }

    if (!id) return;

    const fetchProjectData = async () => {
      try {
        setLoading(true)
        const [projectRes, teamRes, milestonesRes] = await Promise.all([
          fetch(`/api/project-details/${id}`),
          fetch(`/api/project-team/${id}`),
          fetch(`/api/project-milestones/${id}`),
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
  }, [isLoggedIn, user?.role, router, id])

  useEffect(() => {
    if (showAssignDeveloperDialog) {
      const fetchDevelopers = async () => {
        try {
          const response = await fetch("/api/developers")
          if (!response.ok) {
            throw new Error("Failed to fetch developers")
          }
          const data = await response.json()
          setAvailableDevelopers(data)
        } catch (err) {
          console.error("Error fetching developers:", err)
          // Handle error, maybe set an error state for the dialog
        }
      }
      fetchDevelopers()
    }
  }, [showAssignDeveloperDialog])

  const handleAssignDeveloper = async () => {
    if (!selectedDeveloper || !projectDetails?.id) return

    try {
      const res = await fetch(`/api/projects/${projectDetails.id}/assign-developer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ developerId: selectedDeveloper })
      })

      if (res.ok) {
        alert("Developer assigned successfully to unassigned tasks.")
        setShowAssignDeveloperDialog(false)
        setSelectedDeveloper("")
        // Re-fetch project team members to update the list
        const teamRes = await fetch(`/api/project-team/${params.id}`)
        if (teamRes.ok) {
          const teamData = await teamRes.json()
          setTeamMembers(teamData)
        }
      } else {
        alert("Failed to assign developer.")
      }
    } catch (err) {
      console.error("Error assigning developer:", err)
      alert("Error assigning developer.")
    }
  }

  const handleAddMilestone = async () => {
      if (!projectDetails?.id) return
      try {
          const res = await fetch("/api/tasks/create", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                  proposalId: projectDetails.id,
                  title: newMilestone.title,
                  description: newMilestone.description,
                  dueDate: newMilestone.dueDate,
                  priority: newMilestone.priority
              })
          })

          if (res.ok) {
              alert("Milestone added successfully")
              setShowAddMilestoneDialog(false)
              setNewMilestone({ title: "", description: "", dueDate: "", priority: "Medium" })
              // Refresh milestones
              const milestonesRes = await fetch(`/api/project-milestones/${id}`)
              if (milestonesRes.ok) {
                  const milestonesData = await milestonesRes.json()
                  setMilestones(milestonesData)
              }
          } else {
              alert("Failed to add milestone")
          }
      } catch (err) {
          console.error("Error adding milestone:", err)
          alert("Error adding milestone")
      }
  }


  if (!isLoggedIn || user?.role !== "pm") {
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
            <Link href="/dashboard/pm/projects">
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
                  <Dialog open={showAssignDeveloperDialog} onOpenChange={setShowAssignDeveloperDialog}>
                    <DialogTrigger asChild>
                      <Button size="sm" className="bg-primary hover:bg-primary/90 flex items-center gap-1">
                        <Plus size={16} />
                        Assign Developer
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Assign Developer to Project Tasks</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <p className="text-sm text-muted-foreground">This will assign the selected developer to all currently unassigned tasks within this project.</p>
                        <Select onValueChange={setSelectedDeveloper} value={selectedDeveloper}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a developer" />
                          </SelectTrigger>
                          <SelectContent>
                            {availableDevelopers.map((dev) => (
                              <SelectItem key={dev.id} value={String(dev.id)}>
                                {dev.name} ({dev.email})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Button 
                          onClick={handleAssignDeveloper} 
                          disabled={!selectedDeveloper}
                          className="w-full"
                        >
                          Assign Developer
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
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
                  <Dialog open={showAddMilestoneDialog} onOpenChange={setShowAddMilestoneDialog}>
                      <DialogTrigger asChild>
                          <Button size="sm" className="bg-primary hover:bg-primary/90 flex items-center gap-1">
                              <Plus size={16} />
                              Add
                          </Button>
                      </DialogTrigger>
                      <DialogContent>
                          <DialogHeader>
                              <DialogTitle>Add New Milestone</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                              <input 
                                  placeholder="Milestone Title" 
                                  className="w-full px-3 py-2 bg-secondary border border-border rounded-md text-foreground"
                                  value={newMilestone.title}
                                  onChange={(e) => setNewMilestone({...newMilestone, title: e.target.value})}
                              />
                              <textarea 
                                  placeholder="Description" 
                                  className="w-full px-3 py-2 bg-secondary border border-border rounded-md text-foreground"
                                  value={newMilestone.description}
                                  onChange={(e) => setNewMilestone({...newMilestone, description: e.target.value})}
                              />
                              <input 
                                  type="date"
                                  className="w-full px-3 py-2 bg-secondary border border-border rounded-md text-foreground"
                                  value={newMilestone.dueDate}
                                  onChange={(e) => setNewMilestone({...newMilestone, dueDate: e.target.value})}
                              />
                              <Select 
                                  onValueChange={(val) => setNewMilestone({...newMilestone, priority: val})} 
                                  value={newMilestone.priority}
                              >
                                  <SelectTrigger>
                                      <SelectValue placeholder="Priority" />
                                  </SelectTrigger>
                                  <SelectContent>
                                      <SelectItem value="Low">Low</SelectItem>
                                      <SelectItem value="Medium">Medium</SelectItem>
                                      <SelectItem value="High">High</SelectItem>
                                  </SelectContent>
                              </Select>
                              <Button onClick={handleAddMilestone} className="w-full">
                                  Add Milestone
                              </Button>
                          </div>
                      </DialogContent>
                  </Dialog>
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
