"use client"
import { useState, useEffect } from "react" // Import useEffect
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { Sidebar } from "@/components/layout/sidebar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, Clock, AlertCircle } from "lucide-react"
import Link from "next/link"
import { format } from "date-fns" // For date comparison

interface Task {
  id: number;
  title: string;
  project: string;
  due: string; // Date string (YYYY-MM-DD)
  status: string;
  priority: string;
}

interface Meeting {
  id: number;
  title: string;
  date: string;
  time: string;
  type: string;
  location: string;
}


export default function DeveloperDashboard() {
  const { user, isLoggedIn } = useAuth()
  const router = useRouter()
  const [currentPath] = useState("/dashboard/developer")

  const [tasks, setTasks] = useState<Task[]>([])
  const [meetings, setMeetings] = useState<Meeting[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTasksCount, setActiveTasksCount] = useState(0)
  const [completedTasksCount, setCompletedTasksCount] = useState(0)
  const [overdueTasksCount, setOverdueTasksCount] = useState(0)

  useEffect(() => {
    if (!isLoggedIn || user?.role !== "developer") {
      router.push("/")
      return
    }

    const fetchTasks = async () => {
      try {
        const response = await fetch(`/api/developer-tasks?userId=${user?.id}`)
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        const data = await response.json()
        setTasks(data)

        // Calculate stats
        const now = new Date()
        let active = 0
        let completed = 0
        let overdue = 0

        data.forEach((task: Task) => {
          if (task.status.toLowerCase() === "done") {
            completed++
          } else {
            active++
            const dueDate = new Date(task.due)
            if (dueDate < now) {
              overdue++
            }
          }
        })

        setActiveTasksCount(active)
        setCompletedTasksCount(completed)
        setOverdueTasksCount(overdue)

      } catch (err) {
        console.error("Failed to fetch developer tasks:", err)
        setError("Failed to load tasks.")
      }
    }

    const fetchMeetings = async () => {
      try {
        const response = await fetch(`/api/developer-meetings?userId=${user?.id}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setMeetings(data);
      } catch (err) {
        console.error("Failed to fetch developer meetings:", err);
        // Not setting a general error for meetings, to allow tasks to be displayed
      }
    };


    const fetchData = async () => {
      setLoading(true);
      await Promise.all([fetchTasks(), fetchMeetings()]);
      setLoading(false);
    }

    if (user?.id) { // Only fetch if user ID is available
      fetchData()
    }
  }, [isLoggedIn, user?.role, user?.id, router])

  const handleUpdateStatus = async (taskId: number, status: string) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });
      if (response.ok) {
        fetchTasks();
      } else {
        const errorData = await response.json();
        alert(`Failed to update task status: ${errorData.error}`);
      }
    } catch (err) {
      console.error('Error updating task status:', err);
      alert('An error occurred while updating the task status.');
    }
  };

  if (!isLoggedIn || user?.role !== "developer") {
    return null
  }

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "todo":
        return "bg-muted text-muted-foreground"
      case "in_progress":
        return "bg-primary/20 text-primary"
      case "done":
        return "bg-chart-3/20 text-chart-3"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  const getPriorityBadge = (priority: string) => {
    switch (priority.toLowerCase()) {
      case "high":
        return "bg-destructive/20 text-destructive"
      case "medium":
        return "bg-accent/20 text-accent"
      case "low":
        return "bg-primary/20 text-primary"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  const getDisplayStatus = (status: string) => {
    switch (status.toLowerCase()) {
      case "todo":
        return "Pending"
      case "in_progress":
        return "In Progress"
      case "done":
        return "Completed"
      default:
        return status
    }
  }

  const isTaskOverdue = (task: Task) => {
    if (task.status.toLowerCase() === "done") return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Normalize today's date
    const dueDate = new Date(task.due);
    dueDate.setHours(0, 0, 0, 0); // Normalize due date
    return dueDate < today;
  };


  if (loading) {
    return (
      <div className="flex h-screen bg-background items-center justify-center">
        <p className="text-foreground">Loading dashboard...</p>
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
            <h1 className="text-2xl font-bold text-foreground">My Tasks</h1>
            <p className="text-sm text-muted-foreground">Assigned tasks and milestones</p>
          </div>
        </div>

        {/* Main Content */}
        <div className="p-8">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="bg-card border border-border">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Active Tasks</p>
                    <p className="text-3xl font-bold text-foreground">{activeTasksCount}</p>
                  </div>
                  <div className="p-3 bg-primary/10 rounded-lg">
                    <Clock className="text-primary" size={24} />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border border-border">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Completed</p>
                    <p className="text-3xl font-bold text-foreground">{completedTasksCount}</p>
                  </div>
                  <div className="p-3 bg-chart-3/10 rounded-lg">
                    <CheckCircle className="text-chart-3" size={24} />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border border-border">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Overdue</p>
                    <p className="text-3xl font-bold text-foreground">{overdueTasksCount}</p>
                  </div>
                  <div className="p-3 bg-destructive/10 rounded-lg">
                    <AlertCircle className="text-destructive" size={24} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tasks List */}
          <Card className="bg-card border border-border mb-8">
            <CardHeader>
              <CardTitle className="text-foreground">Assigned Tasks</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {tasks.length === 0 ? (
                  <p className="text-muted-foreground">No tasks assigned.</p>
                ) : (
                  tasks.map((task) => (
                    <div key={task.id} className="p-4 bg-secondary rounded-lg border border-border">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="font-medium text-foreground">{task.title}</p>
                          <p className="text-xs text-muted-foreground mt-1">{task.project}</p>
                        </div>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getPriorityBadge(task.priority)}`}>
                          {task.priority}
                        </span>
                      </div>
                      <div className="flex items-center justify-between mt-3">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusBadge(task.status)}`}>
                          {getDisplayStatus(task.status)}
                        </span>
                        <p className={`text-xs ${isTaskOverdue(task) ? "text-destructive" : "text-muted-foreground"}`}>
                          Due: {task.due}
                        </p>
                      </div>
                      {task.status.toLowerCase() !== 'done' && (
                        <Button
                          size="sm"
                          className="mt-4"
                          onClick={() => handleUpdateStatus(task.id, 'done')}
                        >
                          Mark as Done
                        </Button>
                      )}
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Meetings List */}
          <Card className="bg-card border border-border">
            <CardHeader>
              <CardTitle className="text-foreground">Upcoming Meetings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {meetings.length === 0 ? (
                  <p className="text-muted-foreground">No upcoming meetings.</p>
                ) : (
                  meetings.map((meeting) => (
                    <div key={meeting.id} className="p-4 bg-secondary rounded-lg border border-border">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="font-medium text-foreground">{meeting.title}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {meeting.date} at {meeting.time}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Type: {meeting.type} | Location: {meeting.location}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>


          {/* Quick Navigation */}
          <div className="flex gap-2">
            <Link href="/">
              <Button variant="outline" className="bg-secondary border-border">
                Logout
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
