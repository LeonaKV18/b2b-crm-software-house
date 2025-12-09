"use client"
import { useState, useEffect } from "react" // Import useEffect
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { Sidebar } from "@/components/layout/sidebar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Plus, CheckCircle, AlertCircle, Clock } from "lucide-react"
import Link from "next/link"

interface Milestone {
  id: number;
  name: string;
  project: string;
  status: string;
  dueDate: string;
  fee: number;
}

export default function MilestonesPage() {
  const { user, isLoggedIn } = useAuth()
  const router = useRouter()
  const [currentPath] = useState("/dashboard/pm/milestones")

  const [milestones, setMilestones] = useState<Milestone[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)
  
  // Form state
  const [newDescription, setNewDescription] = useState("")
  const [newFee, setNewFee] = useState("")
  const [newDueDate, setNewDueDate] = useState("")
  const [selectedProposal, setSelectedProposal] = useState("")
  const [selectedTask, setSelectedTask] = useState("")

  useEffect(() => {
    if (!isLoggedIn || user?.role !== "pm") {
      router.push("/")
      return
    }


    const fetchMilestones = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/pm-milestones?userId=${user?.id}`)
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        const data = await response.json()
        setMilestones(data)
      } catch (err) {
        console.error("Failed to fetch PM milestones:", err)
        setError("Failed to load milestones.")
      } finally {
        setLoading(false)
      }
    }

    if (user?.id) { // Only fetch if user ID is available
      fetchMilestones()
    }
  }, [isLoggedIn, user?.role, user?.id, router])

  const handleCreateMilestone = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/milestones/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          proposalId: selectedProposal,
          taskId: selectedTask,
          description: newDescription,
          fee: newFee,
          dueDate: newDueDate,
        }),
      });

      if (response.ok) {
        setShowAddForm(false);
        // Clear form
        setSelectedProposal("");
        setSelectedTask("");
        setNewDescription("");
        setNewFee("");
        setNewDueDate("");
        // Refresh list
        fetchMilestones();
      } else {
        const errorData = await response.json();
        alert(`Failed to create milestone: ${errorData.error}`);
      }
    } catch (err) {
      console.error("Error creating milestone:", err);
      alert("An error occurred while creating the milestone.");
    }
  };

  if (!isLoggedIn || user?.role !== "pm") {
    return null
  }

  const getStatusBadge = (status: string) => {
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

  const getDisplayStatus = (status: string) => {
    switch (status?.toLowerCase()) {
      case "done":
        return "Completed";
      case "in_progress":
        return "In Progress";
      case "todo":
        return "Pending";
      default:
        return status;
    }
  };

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
        {/* Top Bar */}
        <div className="bg-card border-b border-border sticky top-0 z-10">
          <div className="px-8 py-4 flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Milestones</h1>
              <p className="text-sm text-muted-foreground">Track project milestones</p>
            </div>
            <Button
              onClick={() => setShowAddForm(true)}
              className="bg-primary hover:bg-primary/90 flex items-center gap-2"
            >
              <Plus size={20} />
              Add Milestone
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <div className="p-8">
          {showAddForm && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <Card className="bg-card border border-border w-1/3">
                <CardHeader>
                  <CardTitle>Add New Milestone</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleCreateMilestone} className="space-y-4">
                    {/* In a real app, these would be dropdowns populated from the API */}
                    <input
                      placeholder="Proposal ID"
                      value={selectedProposal}
                      onChange={(e) => setSelectedProposal(e.target.value)}
                      className="w-full p-2 border rounded-md bg-input text-foreground"
                    />
                    <input
                      placeholder="Task ID (Optional)"
                      value={selectedTask}
                      onChange={(e) => setSelectedTask(e.target.value)}
                      className="w-full p-2 border rounded-md bg-input text-foreground"
                    />
                    <textarea
                      placeholder="Description"
                      value={newDescription}
                      onChange={(e) => setNewDescription(e.target.value)}
                      className="w-full p-2 border rounded-md bg-input text-foreground"
                    />
                    <input
                      type="number"
                      placeholder="Fee"
                      value={newFee}
                      onChange={(e) => setNewFee(e.target.value)}
                      className="w-full p-2 border rounded-md bg-input text-foreground"
                    />
                    <input
                      type="date"
                      value={newDueDate}
                      onChange={(e) => setNewDueDate(e.target.value)}
                      className="w-full p-2 border rounded-md bg-input text-foreground"
                    />
                    <div className="flex justify-end space-x-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setShowAddForm(false)}
                      >
                        Cancel
                      </Button>
                      <Button type="submit">Create</Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </div>
          )}
          <div className="space-y-3">
            {milestones.length === 0 ? (
              <p className="text-muted-foreground">No milestones found for this Project Manager.</p>
            ) : (
              milestones.map((milestone) => (
                <Card key={milestone.id} className="bg-card border border-border">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="flex gap-4 flex-1">
                        <div className="mt-1">
                          {milestone.status?.toLowerCase() === "done" ? (
                            <CheckCircle className="text-chart-3" size={24} />
                          ) : milestone.status?.toLowerCase() === "in_progress" ? (
                            <Clock className="text-primary" size={24} />
                          ) : (
                            <AlertCircle className="text-muted-foreground" size={24} />
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="font-bold text-foreground text-lg">{milestone.name}</p>
                          <p className="text-sm text-muted-foreground">{milestone.project}</p>
                          <p className="text-sm font-bold text-foreground mt-1">${milestone.fee.toLocaleString()}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium block mb-2 ${getStatusBadge(
                            milestone.status
                          )}`}
                        >
                          {getDisplayStatus(milestone.status)}
                        </span>
                        <p className="text-xs text-muted-foreground">Due: {milestone.dueDate}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          <Link href="/dashboard/pm">
            <Button variant="outline" className="mt-8 bg-secondary border-border">
              ← Back
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
