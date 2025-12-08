"use client"
import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { Sidebar } from "@/components/layout/sidebar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Plus, CheckCircle, AlertCircle, Clock, ChevronDown, ChevronUp } from "lucide-react"
import Link from "next/link"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface Subtask {
  id: number;
  title: string;
  status: string;
  duedate: string;
  priority: string;
}

interface Milestone {
  id: number;
  name: string;
  project: string;
  status: string;
  duedate: string;
  owner: string;
  subtask_count: number;
  subtask_completed: number;
}

export default function MilestonesPage() {
  const { user, isLoggedIn } = useAuth()
  const router = useRouter()
  const [currentPath] = useState("/dashboard/pm/milestones")

  const [milestones, setMilestones] = useState<Milestone[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Subtasks State
  const [expandedMilestoneId, setExpandedMilestoneId] = useState<number | null>(null)
  const [subtasks, setSubtasks] = useState<Subtask[]>([])
  const [subtasksLoading, setSubtasksLoading] = useState(false)

  // Add Subtask Dialog State
  const [showAddSubtaskDialog, setShowAddSubtaskDialog] = useState(false)
  const [activeMilestoneId, setActiveMilestoneId] = useState<number | null>(null)
  const [newSubtaskTitle, setNewSubtaskTitle] = useState("")
  const [newSubtaskDescription, setNewSubtaskDescription] = useState("")
  const [newSubtaskDueDate, setNewSubtaskDueDate] = useState("")
  const [newSubtaskPriority, setNewSubtaskPriority] = useState("Medium")

  const fetchMilestones = async () => {
    if (!user?.id) return
    try {
      setLoading(true)
      const response = await fetch(`/api/pm-milestones?userId=${user.id}`)
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
      const data = await response.json()
      setMilestones(data)
    } catch (err) {
      console.error("Failed to fetch PM milestones:", err)
      setError("Failed to load milestones.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!isLoggedIn || user?.role !== "pm") {
      router.push("/")
      return
    }
    fetchMilestones()
  }, [isLoggedIn, user?.role, user?.id, router])

  const toggleMilestone = async (id: number) => {
    if (expandedMilestoneId === id) {
      setExpandedMilestoneId(null)
      setSubtasks([])
    } else {
      setExpandedMilestoneId(id)
      setSubtasksLoading(true)
      try {
        const res = await fetch(`/api/subtasks?parentTaskId=${id}`)
        if (res.ok) {
          const data = await res.json()
          setSubtasks(data)
        }
      } catch (err) {
        console.error("Failed to fetch subtasks", err)
      } finally {
        setSubtasksLoading(false)
      }
    }
  }

  const openAddSubtaskDialog = (milestoneId: number) => {
    setActiveMilestoneId(milestoneId)
    setShowAddSubtaskDialog(true)
  }

  const handleAddSubtask = async () => {
    if (!newSubtaskTitle || !newSubtaskDueDate || !activeMilestoneId) {
        alert("Please fill in required fields")
        return
    }

    try {
        const res = await fetch("/api/subtasks/create", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                parentTaskId: activeMilestoneId,
                title: newSubtaskTitle,
                description: newSubtaskDescription,
                dueDate: newSubtaskDueDate,
                priority: newSubtaskPriority
            })
        })

        if (res.ok) {
            setShowAddSubtaskDialog(false)
            setNewSubtaskTitle("")
            setNewSubtaskDescription("")
            setNewSubtaskDueDate("")
            setNewSubtaskPriority("Medium")
            
            // Refresh subtasks if this milestone is expanded, otherwise just refresh milestones to update count
            if (expandedMilestoneId === activeMilestoneId) {
                const subRes = await fetch(`/api/subtasks?parentTaskId=${activeMilestoneId}`)
                if (subRes.ok) {
                    const data = await subRes.json()
                    setSubtasks(data)
                }
            }
            fetchMilestones() // Refresh main list to update counts
        } else {
            alert("Failed to create subtask")
        }
    } catch (err) {
        console.error("Error creating subtask", err)
    }
  }

  if (!isLoggedIn || user?.role !== "pm") {
    return null
  }

  const getStatusBadge = (status: string) => {
    switch (status?.toLowerCase()) {
      case "done": return "bg-chart-3/20 text-chart-3"
      case "in_progress": return "bg-primary/20 text-primary"
      case "todo": return "bg-muted text-muted-foreground"
      default: return "bg-muted text-muted-foreground"
    }
  }

  const getDisplayStatus = (status: string) => {
    switch (status?.toLowerCase()) {
      case "done": return "Completed"
      case "in_progress": return "In Progress"
      case "todo": return "Pending"
      default: return status
    }
  }

  if (loading) {
    return (
      <div className="flex h-screen bg-background items-center justify-center">
        <p className="text-foreground">Loading milestones...</p>
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
        <div className="bg-card border-b border-border sticky top-0 z-10">
          <div className="px-8 py-4 flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Milestones</h1>
              <p className="text-sm text-muted-foreground">Track project milestones and tasks</p>
            </div>
          </div>
        </div>

        <div className="p-8">
          <div className="space-y-4">
            {milestones.length === 0 ? (
              <p className="text-muted-foreground">No milestones found.</p>
            ) : (
              milestones.map((milestone) => {
                const progress = milestone.subtask_count > 0 
                    ? Math.round((milestone.subtask_completed / milestone.subtask_count) * 100) 
                    : (milestone.status === 'done' ? 100 : 0);

                return (
                  <Card key={milestone.id} className="bg-card border border-border">
                    <CardContent className="pt-6">
                      <div className="flex flex-col gap-4">
                        <div className="flex items-start justify-between">
                          <div className="flex gap-4 flex-1 cursor-pointer" onClick={() => toggleMilestone(milestone.id)}>
                            <div className="mt-1">
                                {expandedMilestoneId === milestone.id ? <ChevronUp size={24} className="text-muted-foreground"/> : <ChevronDown size={24} className="text-muted-foreground"/>}
                            </div>
                            <div className="flex-1">
                              <p className="font-bold text-foreground text-lg">{milestone.name}</p>
                              <p className="text-sm text-muted-foreground">{milestone.project}</p>
                              <div className="mt-2 flex items-center gap-2">
                                <div className="w-48 h-2 bg-secondary rounded-full overflow-hidden">
                                    <div className="h-full bg-primary transition-all" style={{ width: `${progress}%` }} />
                                </div>
                                <span className="text-xs text-muted-foreground">{progress}% ({milestone.subtask_completed}/{milestone.subtask_count} tasks)</span>
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium block mb-2 ${getStatusBadge(milestone.status)}`}>
                              {getDisplayStatus(milestone.status)}
                            </span>
                            <p className="text-xs text-muted-foreground">Due: {milestone.duedate}</p>
                            <Button size="sm" variant="outline" className="mt-2 h-7 text-xs" onClick={() => openAddSubtaskDialog(milestone.id)}>
                                <Plus size={12} className="mr-1"/> Add Task
                            </Button>
                          </div>
                        </div>

                        {expandedMilestoneId === milestone.id && (
                            <div className="pl-12 pr-4 pb-2 border-t border-border pt-4">
                                <h4 className="text-sm font-semibold mb-3">Subtasks</h4>
                                {subtasksLoading ? (
                                    <p className="text-xs text-muted-foreground">Loading tasks...</p>
                                ) : subtasks.length === 0 ? (
                                    <p className="text-xs text-muted-foreground italic">No subtasks created yet.</p>
                                ) : (
                                    <div className="space-y-2">
                                        {subtasks.map(task => (
                                            <div key={task.id} className="flex justify-between items-center p-2 bg-secondary/50 rounded text-sm">
                                                <span className="font-medium">{task.title}</span>
                                                <div className="flex items-center gap-4">
                                                    <span className={`px-2 py-0.5 rounded text-[10px] ${getStatusBadge(task.status)}`}>{getDisplayStatus(task.status)}</span>
                                                    <span className="text-xs text-muted-foreground">{task.duedate}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>

          <Link href="/dashboard/pm">
            <Button variant="outline" className="mt-8 bg-secondary border-border">
              ← Back
            </Button>
          </Link>
        </div>

        <Dialog open={showAddSubtaskDialog} onOpenChange={setShowAddSubtaskDialog}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Add Subtask</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Title</label>
                        <Input 
                            placeholder="Task Title" 
                            value={newSubtaskTitle}
                            onChange={(e) => setNewSubtaskTitle(e.target.value)}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Description</label>
                        <Textarea 
                            placeholder="Description" 
                            value={newSubtaskDescription}
                            onChange={(e) => setNewSubtaskDescription(e.target.value)}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Due Date</label>
                        <Input 
                            type="date"
                            value={newSubtaskDueDate}
                            onChange={(e) => setNewSubtaskDueDate(e.target.value)}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Priority</label>
                        <Select value={newSubtaskPriority} onValueChange={setNewSubtaskPriority}>
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
                    <Button variant="outline" onClick={() => setShowAddSubtaskDialog(false)}>Cancel</Button>
                    <Button onClick={handleAddSubtask}>Create Task</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}