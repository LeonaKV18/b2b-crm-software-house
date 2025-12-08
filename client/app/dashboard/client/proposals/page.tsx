"use client"

import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { Sidebar } from "@/components/layout/sidebar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { FileText, Download, CheckCircle, XCircle, Plus, Edit } from "lucide-react"
import Link from "next/link"
import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"

interface Proposal {
  id: number;
  title: string;
  amount: number;
  status: string;
  date: string;
  description: string;
  expected_close: string;
  functional_requirements: string;
  non_functional_requirements: string;
  client_comments: string;
}

export default function ClientProposalsPage() {
  const { user, isLoggedIn } = useAuth()
  const router = useRouter()
  const [currentPath] = useState("/dashboard/client/proposals")

  const [proposals, setProposals] = useState<Proposal[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Create Form State
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [newTitle, setNewTitle] = useState("")
  const [newDescription, setNewDescription] = useState("")
  const [newValue, setNewValue] = useState("")
  const [newExpectedClose, setNewExpectedClose] = useState("")
  const [newFunctionalReq, setNewFunctionalReq] = useState("")
  const [newNonFunctionalReq, setNewNonFunctionalReq] = useState("")
  const [newComments, setNewComments] = useState("")

  // Edit Form State
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [editingProposal, setEditingProposal] = useState<Proposal | null>(null)
  const [editTitle, setEditTitle] = useState("")
  const [editDescription, setEditDescription] = useState("")
  const [editValue, setEditValue] = useState("")
  const [editExpectedClose, setEditExpectedClose] = useState("")

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
          expectedClose: newExpectedClose,
          functionalReq: newFunctionalReq,
          nonFunctionalReq: newNonFunctionalReq,
          comments: newComments
        }),
      })

      if (response.ok) {
        setShowCreateForm(false)
        setNewTitle("")
        setNewDescription("")
        setNewValue("")
        setNewExpectedClose("")
        setNewFunctionalReq("")
        setNewNonFunctionalReq("")
        setNewComments("")
        fetchProposals()
      } else {
        const errorData = await response.json()
        alert(`Failed to create proposal: ${errorData.error}`)
      }
    } catch (err) {
      console.error("Error creating proposal:", err)
      alert("An error occurred while creating the proposal.")
    }
  }

  const openEditDialog = (proposal: Proposal) => {
    setEditingProposal(proposal)
    setEditTitle(proposal.title)
    setEditDescription(proposal.description || "")
    setEditValue(proposal.amount.toString())
    // Format date for input type="date" if needed, assuming YYYY-MM-DD from API
    setEditExpectedClose(proposal.expected_close || "") 
    setShowEditDialog(true)
  }

  const handleReworkProposal = async () => {
    if (!editingProposal) return

    try {
        const res = await fetch(`/api/client-proposals/${editingProposal.id}/rework`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                title: editTitle,
                description: editDescription,
                value: editValue,
                expectedClose: editExpectedClose
            })
        })

        if (res.ok) {
            setShowEditDialog(false)
            fetchProposals()
        } else {
            alert("Failed to update proposal")
        }
    } catch (err) {
        console.error("Error updating proposal:", err)
    }
  }

  const getStatusBadge = (status: string) => {
    const statusStyles: Record<string, string> = {
      "approved": "bg-chart-3/20 text-chart-3",
      "submitted": "bg-primary/20 text-primary",
      "rejected": "bg-destructive/20 text-destructive",
      "draft": "bg-muted text-muted-foreground",
      "active": "bg-primary/20 text-primary",
      "completed": "bg-chart-3/20 text-chart-3",
    }
    return statusStyles[status.toLowerCase()] || "bg-muted text-muted-foreground"
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
                    <label className="text-sm font-medium text-foreground mb-1 block">Project Title</label>
                    <Input
                      placeholder="e.g. E-commerce Platform Revamp"
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      required
                      className="bg-secondary border-border"
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-foreground mb-1 block">Lumpsum Fee ($)</label>
                      <Input
                        type="number"
                        placeholder="e.g. 50000"
                        value={newValue}
                        onChange={(e) => setNewValue(e.target.value)}
                        required
                        className="bg-secondary border-border"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-foreground mb-1 block">Expected Close Date</label>
                      <Input
                        type="date"
                        value={newExpectedClose}
                        onChange={(e) => setNewExpectedClose(e.target.value)}
                        required
                        className="bg-secondary border-border"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-foreground mb-1 block">Project Description</label>
                    <Textarea
                      value={newDescription}
                      onChange={(e) => setNewDescription(e.target.value)}
                      placeholder="Brief overview of the project..."
                      className="h-24 bg-secondary border-border"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-foreground mb-1 block">Functional Requirements</label>
                    <p className="text-xs text-muted-foreground mb-2">As a user, I want to...</p>
                    <Textarea
                      value={newFunctionalReq}
                      onChange={(e) => setNewFunctionalReq(e.target.value)}
                      placeholder="- As a user, I want to login via Google&#10;- As an admin, I want to view sales reports"
                      className="h-32 bg-secondary border-border"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-foreground mb-1 block">Non-Functional Requirements</label>
                    <Textarea
                      value={newNonFunctionalReq}
                      onChange={(e) => setNewNonFunctionalReq(e.target.value)}
                      placeholder="e.g. The system must handle 10,000 concurrent users. Response time under 200ms."
                      className="h-24 bg-secondary border-border"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-foreground mb-1 block">Additional Comments</label>
                    <Textarea
                      value={newComments}
                      onChange={(e) => setNewComments(e.target.value)}
                      placeholder="Any other details..."
                      className="h-20 bg-secondary border-border"
                    />
                  </div>

                  <div className="flex gap-2 mt-4">
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
                        <div className="flex gap-2 justify-end">
                          {/* Show Edit button only if rejected */}
                          {proposal.status.toLowerCase() === 'rejected' && (
                              <Button 
                                size="sm" 
                                variant="outline" 
                                className="bg-secondary border-border"
                                onClick={() => openEditDialog(proposal)}
                              >
                                <Edit size={16} className="mr-1"/> Edit & Resubmit
                              </Button>
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

        {/* Edit Dialog */}
        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
            <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Edit Proposal</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div>
                        <label className="text-sm font-medium block mb-1">Title</label>
                        <Input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm font-medium block mb-1">Value ($)</label>
                            <Input type="number" value={editValue} onChange={(e) => setEditValue(e.target.value)} />
                        </div>
                        <div>
                            <label className="text-sm font-medium block mb-1">Expected Close</label>
                            <Input type="date" value={editExpectedClose} onChange={(e) => setEditExpectedClose(e.target.value)} />
                        </div>
                    </div>
                    <div>
                        <label className="text-sm font-medium block mb-1">Description</label>
                        <Textarea value={editDescription} onChange={(e) => setEditDescription(e.target.value)} className="h-32" />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setShowEditDialog(false)}>Cancel</Button>
                    <Button onClick={handleReworkProposal}>Resubmit</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
