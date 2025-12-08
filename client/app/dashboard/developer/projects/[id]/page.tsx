"use client"

import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { Sidebar } from "@/components/layout/sidebar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useState, useEffect } from "react"
import Link from "next/link"
import { Lock, Unlock, CheckCircle, Circle } from "lucide-react"

interface Task {
  id: number;
  parentid: number | null;
  title: string;
  description: string;
  status: string;
  duedate: string;
  priority: string;
  lockedby: number | null;
  ownername: string | null;
}

interface ProjectDetails {
  id: string;
  name: string;
  client: string;
  description: string;
  status: string;
}

export default function DeveloperProjectDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { user, isLoggedIn } = useAuth()
  const router = useRouter()
  const [projectId, setProjectId] = useState<string>("")
  const [currentPath, setCurrentPath] = useState("")

  const [project, setProject] = useState<ProjectDetails | null>(null)
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    params.then((unwrappedParams) => {
        setProjectId(unwrappedParams.id);
        setCurrentPath(`/dashboard/developer/projects/${unwrappedParams.id}`);
    });
  }, [params]);

  const fetchData = async (id: string) => {
    try {
      setLoading(true)
      const [projectRes, tasksRes] = await Promise.all([
        fetch(`/api/project-details/${id}`),
        fetch(`/api/developer-project-tasks/${id}`)
      ])

      if (!projectRes.ok) throw new Error("Failed to fetch project details")
      if (!tasksRes.ok) throw new Error("Failed to fetch tasks")

      const projectData = await projectRes.json()
      const tasksData = await tasksRes.json()

      setProject(projectData)
      setTasks(tasksData)
    } catch (err) {
      console.error(err)
      setError("Failed to load project data.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!isLoggedIn || user?.role !== "developer") {
      router.push("/")
      return
    }
    if (projectId) {
        fetchData(projectId)
    }
  }, [isLoggedIn, user?.role, router, projectId])

  const handleLockTask = async (taskId: number) => {
    try {
        const res = await fetch(`/api/tasks/${taskId}/lock`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId: user?.id })
        })

        const data = await res.json()

        if (res.ok) {
            alert(data.message)
            fetchData(projectId) // Refresh
        } else {
            alert(data.error)
        }
    } catch (err) {
        console.error(err)
        alert("Error locking task")
    }
  }

  const handleMarkTaskDone = async (taskId: number) => {
    if (!confirm("Are you sure you want to mark this task as 'done'?")) return;
    try {
        const res = await fetch(`/api/tasks/${taskId}/status`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status: 'done' })
        })

        if (res.ok) {
            alert("Task marked as done successfully!");
            fetchData(projectId); // Refresh
        } else {
            alert("Failed to mark task as done.");
        }
    } catch (err) {
        console.error(err)
        alert("Error marking task as done.");
    }
  }

  if (!isLoggedIn || user?.role !== "developer") {
    return null
  }

  if (loading) {
    return <div className="flex h-screen bg-background items-center justify-center"><p className="text-foreground">Loading...</p></div>
  }

  if (error || !project) {
    return <div className="flex h-screen bg-background items-center justify-center"><p className="text-destructive">{error || "Project not found"}</p></div>
  }

  // Group tasks: Milestones (parentid null) -> Subtasks
  const milestones = tasks.filter(t => t.parentid === null)
  const getSubtasks = (parentId: number) => tasks.filter(t => t.parentid === parentId)

  return (
    <div className="flex h-screen bg-background">
      <Sidebar currentPath={currentPath} />

      <div className="flex-1 overflow-auto">
        <div className="bg-card border-b border-border sticky top-0 z-10">
          <div className="px-8 py-4 flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-foreground">{project.name}</h1>
              <p className="text-sm text-muted-foreground">{project.client}</p>
            </div>
            <Link href="/dashboard/developer/projects">
              <Button variant="outline" className="bg-secondary border-border">← Back</Button>
            </Link>
          </div>
        </div>

        <div className="p-8 space-y-6">
          <Card className="bg-card border border-border">
            <CardContent className="p-6">
                <p className="text-muted-foreground">{project.description}</p>
            </CardContent>
          </Card>

          <h2 className="text-xl font-bold text-foreground">Milestones & Tasks</h2>
          <div className="space-y-4">
            {milestones.map(milestone => (
                <Card key={milestone.id} className="bg-card border border-border">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-lg">{milestone.title}</CardTitle>
                        <p className="text-xs text-muted-foreground">Due: {milestone.duedate}</p>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2 pl-4 border-l-2 border-secondary">
                            {getSubtasks(milestone.id).length === 0 ? (
                                <p className="text-sm text-muted-foreground italic">No tasks in this milestone.</p>
                            ) : (
                                getSubtasks(milestone.id).map(task => (
                                    <div key={task.id} className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg">
                                        <div>
                                            <p className="font-medium text-sm text-foreground">{task.title}</p>
                                            <p className="text-xs text-muted-foreground flex items-center gap-2">
                                                Priority: {task.priority} | Status: {task.status}
                                                {task.lockedby ? (
                                                    <span className="text-primary flex items-center gap-1">
                                                        <Lock size={10} /> Locked by {task.ownername}
                                                    </span>
                                                ) : (
                                                    <span className="text-muted-foreground flex items-center gap-1">
                                                        <Unlock size={10} /> Available
                                                    </span>
                                                )}
                                            </p>
                                        </div>
                                        
                                        {!task.lockedby ? (
                                            <Button size="sm" onClick={() => handleLockTask(task.id)}>
                                                Lock Task
                                            </Button>
                                        ) : task.lockedby === user?.id ? (
                                            task.status !== 'done' ? (
                                                <Button size="sm" onClick={() => handleMarkTaskDone(task.id)}>
                                                    Mark Done
                                                </Button>
                                            ) : (
                                                <span className="text-xs bg-chart-3/20 text-chart-3 px-2 py-1 rounded font-medium">
                                                    Done
                                                </span>
                                            )
                                        ) : (
                                            <span className="text-xs bg-secondary text-muted-foreground px-2 py-1 rounded">
                                                Locked
                                            </span>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    </CardContent>
                </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
