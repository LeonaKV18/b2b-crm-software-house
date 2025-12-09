"use client"

import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { Sidebar } from "@/components/layout/sidebar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { FileText, Download, CheckCircle, XCircle, Plus } from "lucide-react"
import Link from "next/link"
import { useState, useEffect } from "react" // Import useEffect

interface Proposal {
  id: number;
  title: string;
  amount: number; // Amount is now a number from the database
  status: string;
  date: string;
}

export default function ClientProposalsPage() {
  const { user, isLoggedIn } = useAuth()
  const router = useRouter()
  const [currentPath] = useState("/dashboard/client/proposals")

  const [proposals, setProposals] = useState<Proposal[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Form State
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [newTitle, setNewTitle] = useState("")
  const [newDescription, setNewDescription] = useState("")
  const [newValue, setNewValue] = useState("")
  const [newRequirements, setNewRequirements] = useState("")
  const [newComments, setNewComments] = useState("")
  const [newExpectedCloseDate, setNewExpectedCloseDate] = useState("")

  const fetchProposals = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/client-proposals?userId=${user?.id}`)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data = await response.json()
      setProposals(data)
    } catch (err) {
      console.error("Failed to fetch client proposals:", err)
      setError("Failed to load proposals.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!isLoggedIn || user?.role !== "client") {
      router.push("/")
      return
    }
    if (user?.id) {
      fetchProposals()
    }
  }, [isLoggedIn, user?.role, user?.id, router])

  if (!isLoggedIn || user?.role !== "client") {
    return null
  }

  const handleCreateProposal = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch("/api/client-proposals/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user?.id,
          title: newTitle,
          description: newDescription,
          value: newValue,
          requirements: newRequirements,
          comments: newComments,
          expectedCloseDate: newExpectedCloseDate,
        }),
      })

      if (response.ok) {
        setShowCreateForm(false)
        setNewTitle("")
        setNewDescription("")
        setNewValue("")
        setNewRequirements("")
        setNewComments("")
        setNewExpectedCloseDate("")
        fetchProposals() // Refresh list
      } else {
        const errorData = await response.json()
        alert(`Failed to create proposal: ${errorData.error}`)
      }
    } catch (err) {
      console.error("Error creating proposal:", err)
      alert("An error occurred while creating the proposal.")
    }
  }

  const handleCancelProposal = async (proposalId: number) => {
    if (window.confirm("Are you sure you want to cancel this proposal?")) {
      try {
        const response = await fetch(`/api/proposals/${proposalId}/cancel`, {
          method: 'PUT',
        });
        if (response.ok) {
          fetchProposals();
        } else {
          const errorData = await response.json();
          alert(`Failed to cancel proposal: ${errorData.error}`);
        }
      } catch (err) {
        console.error('Error cancelling proposal:', err);
        alert('An error occurred while cancelling the proposal.');
      }
    }
  };

  const getStatusBadge = (status: string) => {
    const statusStyles: Record<string, string> = {
      "approved": "bg-chart-3/20 text-chart-3",
      "submitted": "bg-primary/20 text-primary", // Mapping 'submitted' to 'Under Review' style
      "rejected": "bg-destructive/20 text-destructive",
      "draft": "bg-muted text-muted-foreground",
      "active": "bg-primary/20 text-primary",
      "completed": "bg-chart-3/20 text-chart-3",
    }
    return statusStyles[status.toLowerCase()] || "bg-muted text-muted-foreground" // Default style
  }

  const getDisplayStatus = (status: string) => {
    if (status.toLowerCase() === "submitted") return "Under Review";
    return status;
  }

  if (loading) {
    return (
      <div className="flex h-screen bg-background items-center justify-center">
        <p className="text-foreground">Loading proposals...</p>
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
              <h1 className="text-2xl font-bold text-foreground">Proposals</h1>
              <p className="text-sm text-muted-foreground">View and manage proposals</p>
            </div>
            <Button
              onClick={() => setShowCreateForm(!showCreateForm)}
              className="bg-primary hover:bg-primary/90 flex items-center gap-2"
            >
              <Plus size={20} />
              Create Proposal
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <div className="p-8">
          {/* Create Proposal Form */}
          {showCreateForm && (
            <Card className="bg-card border border-border mb-8">
              <CardHeader>
                <CardTitle className="text-foreground">New Proposal</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCreateProposal} className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1 block">Title</label>
                    <Input
                      placeholder="e.g. Mobile App Development"
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      required
                      className="bg-secondary border-border"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1 block">Budget ($)</label>
                    <Input
                      type="number"
                      placeholder="e.g. 15000"
                      value={newValue}
                      onChange={(e) => setNewValue(e.target.value)}
                      required
                      className="bg-secondary border-border"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1 block">Description</label>
                    <textarea
                      value={newDescription}
                      onChange={(e) => setNewDescription(e.target.value)}
                      placeholder="Describe your project needs..."
                      className="w-full h-24 px-3 py-2 bg-secondary border border-border rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1 block">Requirements</label>
                    <textarea
                      value={newRequirements}
                      onChange={(e) => setNewRequirements(e.target.value)}
                      placeholder="Enter project requirements..."
                      className="w-full h-24 px-3 py-2 bg-secondary border border-border rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1 block">Comments</label>
                    <textarea
                      value={newComments}
                      onChange={(e) => setNewComments(e.target.value)}
                      placeholder="Any additional comments..."
                      className="w-full h-24 px-3 py-2 bg-secondary border border-border rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1 block">Expected Close Date</label>
                    <Input
                      type="date"
                      value={newExpectedCloseDate}
                      onChange={(e) => setNewExpectedCloseDate(e.target.value)}
                      required
                      className="bg-secondary border-border"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button type="submit" className="bg-primary hover:bg-primary/90">
                      Submit Proposal
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowCreateForm(false)}
                      className="bg-secondary border-border"
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          <div className="space-y-4">
            {proposals.length === 0 ? (
              <p className="text-muted-foreground">No proposals found.</p>
            ) : (
              proposals.map((proposal) => (
                <Card key={proposal.id} className="bg-card border border-border">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="flex gap-4 flex-1">
                        <div className="p-3 bg-primary/10 rounded-lg h-fit">
                          <FileText className="text-primary" size={24} />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-bold text-foreground text-lg">{proposal.title}</h3>
                          <p className="text-sm text-muted-foreground mt-1">Submitted on {proposal.date}</p>
                          <p className="text-lg font-bold text-foreground mt-2">
                            ${proposal.amount.toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium block mb-3 ${getStatusBadge(
                            proposal.status
                          )}`}
                        >
                          {getDisplayStatus(proposal.status)}
                        </span>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" className="bg-secondary border-border">
                            <Download size={16} />
                          </Button>
                          {/* Conditional buttons for 'Under Review' status from the database equivalent */}
                          {proposal.status.toLowerCase() === "submitted" && (
                            <>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleCancelProposal(proposal.id)}
                              >
                                <XCircle size={16} />
                                Cancel
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          <Link href="/dashboard/client">
            <Button variant="outline" className="mt-8 bg-secondary border-border">
              ← Back
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
