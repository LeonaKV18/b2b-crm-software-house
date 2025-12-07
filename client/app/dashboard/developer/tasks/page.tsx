"use client"

import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { Sidebar } from "@/components/layout/sidebar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, AlertCircle, Clock } from "lucide-react"
import Link from "next/link"
import { useState, useEffect } from "react"

interface Task {
  id: number;
  title: string;
  project: string;
  due: string;
  status: string;
  priority: string;
}

export default function TasksPage() {
  const { user, isLoggedIn } = useAuth()
  const router = useRouter()
  const [currentPath] = useState("/dashboard/developer/tasks")

  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!isLoggedIn || user?.role !== "developer") {
      router.push("/")
      return
    }

    const fetchTasks = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/developer-tasks?userId=${user?.id}`)
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        const data = await response.json()
        setTasks(data)
      } catch (err) {
        console.error("Failed to fetch developer tasks:", err)
        setError("Failed to load tasks.")
      } finally {
        setLoading(false)
      }
    }

    if (user?.id) {
      fetchTasks()
    }
  }, [isLoggedIn, user?.role, user?.id, router])

  if (!isLoggedIn || user?.role !== "developer") {
    return null
  }

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "todo": return "bg-muted text-muted-foreground";
      case "in_progress": return "bg-primary/20 text-primary";
      case "done": return "bg-chart-3/20 text-chart-3";
      default: return "bg-muted text-muted-foreground";
    }
  }

  const getPriorityBadge = (priority: string) => {
    switch (priority.toLowerCase()) {
      case "high": return "bg-destructive/20 text-destructive";
      case "medium": return "bg-accent/20 text-accent";
      case "low": return "bg-primary/20 text-primary";
      default: return "bg-muted text-muted-foreground";
    }
  }

  if (loading) return <div className="flex h-screen bg-background items-center justify-center"><p className="text-foreground">Loading tasks...</p></div>
  if (error) return <div className="flex h-screen bg-background items-center justify-center"><p className="text-destructive">{error}</p></div>

  return (
    <div className="flex h-screen bg-background">
      <Sidebar currentPath={currentPath} />
      <div className="flex-1 overflow-auto">
        <div className="bg-card border-b border-border sticky top-0 z-10">
          <div className="px-8 py-4">
            <h1 className="text-2xl font-bold text-foreground">My Tasks</h1>
            <p className="text-sm text-muted-foreground">All assigned tasks</p>
          </div>
        </div>
        <div className="p-8">
          <div className="space-y-3">
            {tasks.length === 0 ? <p className="text-muted-foreground">No tasks found.</p> : tasks.map((task) => (
              <Card key={task.id} className="bg-card border border-border">
                <CardContent className="pt-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-bold text-foreground">{task.title}</p>
                      <p className="text-sm text-muted-foreground">{task.project}</p>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getPriorityBadge(task.priority)}`}>{task.priority}</span>
                  </div>
                  <div className="flex justify-between items-center mt-4">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusBadge(task.status)}`}>{task.status.replace('_', ' ')}</span>
                    <p className="text-xs text-muted-foreground">Due: {task.due}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          <Link href="/dashboard/developer">
            <Button variant="outline" className="mt-8 bg-secondary border-border">← Back</Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
