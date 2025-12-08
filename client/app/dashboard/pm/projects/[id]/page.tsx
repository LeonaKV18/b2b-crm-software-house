"use client"

import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { Sidebar } from "@/components/layout/sidebar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
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

export default function PMProjectDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { user, isLoggedIn } = useAuth()
  const router = useRouter()
  const [projectId, setProjectId] = useState<string>("")
  const [currentPath, setCurrentPath] = useState("")

  const [projectDetails, setProjectDetails] = useState<ProjectDetails | null>(null)
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])
  const [milestones, setMilestones] = useState<Milestone[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [showAssignDeveloperDialog, setShowAssignDeveloperDialog] = useState(false)
  const [availableDevelopers, setAvailableDevelopers] = useState<Developer[]>([])
  const [selectedDeveloper, setSelectedDeveloper] = useState<string>("")

  const [showAddMilestoneDialog, setShowAddMilestoneDialog] = useState(false)
  const [newMilestoneTitle, setNewMilestoneTitle] = useState("")
  const [newMilestoneDescription, setNewMilestoneDescription] = useState("")
  const [newMilestoneDueDate, setNewMilestoneDueDate] = useState("")
  const [newMilestonePriority, setNewMilestonePriority] = useState("Medium")

  useEffect(() => {
    params.then((unwrappedParams) => {
        setProjectId(unwrappedParams.id);
        setCurrentPath(`/dashboard/pm/projects/${unwrappedParams.id}`);
    });
  }, [params]);

  const fetchProjectData = async (id: string) => {
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

  useEffect(() => {
    if (!isLoggedIn || user?.role !== "pm") {
      router.push("/")
      return
    }

    if (projectId) {
        fetchProjectData(projectId)
    }
  }, [isLoggedIn, user?.role, router, projectId])

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
        }
      }
      fetchDevelopers()
    }
  }, [showAssignDeveloperDialog])

  const handleAssignDeveloper = async () => {
    if (!selectedDeveloper || !projectId) return

    try {
      const res = await fetch(`/api/projects/${projectId}/assign-developer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ developerId: selectedDeveloper })
      })

      if (res.ok) {
        alert("Developer assigned successfully.")
        setShowAssignDeveloperDialog(false)
        setSelectedDeveloper("")
        // Refresh team members
        const teamRes = await fetch(`/api/project-team/${projectId}`)
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
    if (!newMilestoneTitle || !newMilestoneDueDate || !projectId) {
        alert("Please fill in all required fields.");
        return;
    }

    try {
        const res = await fetch("/api/milestones/create", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                projectId: projectId,
                title: newMilestoneTitle,
                description: newMilestoneDescription,
                dueDate: newMilestoneDueDate,
                priority: newMilestonePriority
            })
        });

        if (res.ok) {
            setShowAddMilestoneDialog(false);
            setNewMilestoneTitle("");
            setNewMilestoneDescription("");
            setNewMilestoneDueDate("");
            setNewMilestonePriority("Medium");
            // Refresh milestones
            const milestonesRes = await fetch(`/api/project-milestones/${projectId}`);
            if (milestonesRes.ok) {
                const milestonesData = await milestonesRes.json();
                setMilestones(milestonesData);
            }
        } else {
            alert("Failed to create milestone.");
        }
    } catch (err) {
        console.error("Error creating milestone:", err);
        alert("Error creating milestone.");
    }
  }

  const handleCompleteProject = async () => {
    if (!confirm("Are you sure you want to complete this project? This will generate an invoice for the client.")) return;

    try {
        const res = await fetch(`/api/projects/${projectId}/complete`, {
            method: "POST",
        });

        if (res.ok) {
            alert("Project completed successfully!");
            fetchProjectData(projectId); // Refresh to show updated status
        } else {
            alert("Failed to complete project.");
        }
    } catch (err) {
        console.error("Error completing project:", err);
        alert("Error completing project.");
    }
  }

  if (!isLoggedIn || user?.role !== "pm") {
    return null
  }

  const getProjectStatusBadge = (status: string) => {
    switch (status?.toLowerCase()) {
      case "active":
      case "in progress":
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
    switch (status?.toLowerCase()) {
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

  if (error || !projectDetails) {
    return (
      <div className="flex h-screen bg-background items-center justify-center">
        <p className="text-destructive">{error || "Project not found"}</p>
      </div>
    )
  }

  const project = projectDetails;

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
            <div className="flex gap-2">
                <Button 
                    variant="default" 
                    className="bg-chart-3 hover:bg-chart-3/90"
                    onClick={handleCompleteProject}
                >
                    Complete Project
                </Button>
                <Link href="/dashboard/pm/projects">
                    <Button variant="outline" className="bg-secondary border-border">
                        ← Back to Projects
                    </Button>
                </Link>
            </div>
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
                  <Button size="sm" onClick={() => setShowAssignDeveloperDialog(true)}>
                    <Plus size={16} className="mr-2" />
                    Assign Developer
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
                  <Button size="sm" onClick={() => setShowAddMilestoneDialog(true)}>
                    <Plus size={16} className="mr-2" />
                    Add Milestone
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

        {/* Dialogs */}
        <Dialog open={showAssignDeveloperDialog} onOpenChange={setShowAssignDeveloperDialog}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Assign Developer</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <p className="text-sm text-muted-foreground">Select a developer to assign to this project's unassigned tasks.</p>
                    <Select value={selectedDeveloper} onValueChange={setSelectedDeveloper}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select Developer" />
                        </SelectTrigger>
                        <SelectContent>
                            {availableDevelopers.map((dev) => (
                                <SelectItem key={dev.id} value={dev.id.toString()}>
                                    {dev.name} ({dev.email})
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setShowAssignDeveloperDialog(false)}>Cancel</Button>
                    <Button onClick={handleAssignDeveloper} disabled={!selectedDeveloper}>Assign</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>

        <Dialog open={showAddMilestoneDialog} onOpenChange={setShowAddMilestoneDialog}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Add Milestone</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Title</label>
                        <Input 
                            placeholder="Milestone Title" 
                            value={newMilestoneTitle}
                            onChange={(e) => setNewMilestoneTitle(e.target.value)}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Description</label>
                        <Textarea 
                            placeholder="Description" 
                            value={newMilestoneDescription}
                            onChange={(e) => setNewMilestoneDescription(e.target.value)}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Due Date</label>
                        <Input 
                            type="date"
                            value={newMilestoneDueDate}
                            onChange={(e) => setNewMilestoneDueDate(e.target.value)}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Priority</label>
                        <Select value={newMilestonePriority} onValueChange={setNewMilestonePriority}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select Priority" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Low">Low</SelectItem>
                                <SelectItem value="Medium">Medium</SelectItem>
                                <SelectItem value="High">High</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setShowAddMilestoneDialog(false)}>Cancel</Button>
                    <Button onClick={handleAddMilestone}>Create Milestone</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}