"use client"

import { useState, useEffect } from "react" // Import useEffect
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { Sidebar } from "@/components/layout/sidebar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Plus, Search, Edit, CheckCircle, XCircle, UserPlus, MessageSquare, Eye } from "lucide-react"
import Link from "next/link"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"

interface Proposal {
  id: number;
  client: string;
  title: string;
  description: string;
  status: string;
  value: number;
  createdby: string;
  date: string;
  admincomments?: string;
  pmid?: number;
  functionalreq?: string;
  nonfunctionalreq?: string;
  clientcomments?: string;
}

interface ProjectManager {
  id: number;
  name: string;
  activeprojects: number;
}

export default function ProposalsPage() {
  const { user, isLoggedIn } = useAuth()
  const router = useRouter()
  const [currentPath] = useState("/dashboard/admin/proposals")
  const [searchTerm, setSearchTerm] = useState("")

  const [proposals, setProposals] = useState<Proposal[]>([])
  const [pms, setPms] = useState<ProjectManager[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Modal States
  const [selectedProposal, setSelectedProposal] = useState<Proposal | null>(null)
  const [isApproveOpen, setIsApproveOpen] = useState(false)
  const [isRejectOpen, setIsRejectOpen] = useState(false)
  const [isAssignPmOpen, setIsAssignPmOpen] = useState(false)
  const [isCommentOpen, setIsCommentOpen] = useState(false)
  const [isViewOpen, setIsViewOpen] = useState(false)
  const [comment, setComment] = useState("")
  const [selectedPmId, setSelectedPmId] = useState<string>("")
  const [actionLoading, setActionLoading] = useState(false)

  const fetchProposals = async () => {
    try {
      const response = await fetch("/api/proposals")
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
      const data = await response.json()
      setProposals(data)
    } catch (err) {
      console.error("Failed to fetch proposals:", err)
      setError("Failed to load proposals.")
    }
  }

  const fetchPms = async () => {
    try {
      const response = await fetch("/api/admin/pms")
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
      const data = await response.json()
      setPms(data)
    } catch (err) {
      console.error("Failed to fetch PMs:", err)
    }
  }

  useEffect(() => {
    if (!isLoggedIn || user?.role !== "admin") {
      router.push("/")
      return
    }

    const loadData = async () => {
      setLoading(true)
      await Promise.all([fetchProposals(), fetchPms()])
      setLoading(false)
    }

    loadData()
  }, [isLoggedIn, user?.role, router])

  const handleApprove = async () => {
    if (!selectedProposal) return
    setActionLoading(true)
    try {
      const response = await fetch("/api/admin/proposals/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ proposalId: selectedProposal.id, comment }),
      })
      if (!response.ok) throw new Error("Failed to approve")
      
      setIsApproveOpen(false)
      setComment("")
      fetchProposals()
    } catch (err) {
      alert("Error approving proposal")
    } finally {
      setActionLoading(false)
    }
  }

  const handleReject = async () => {
    if (!selectedProposal) return
    setActionLoading(true)
    try {
      const response = await fetch("/api/admin/proposals/reject", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ proposalId: selectedProposal.id, comment }),
      })
      if (!response.ok) throw new Error("Failed to reject")
      
      setIsRejectOpen(false)
      setComment("")
      fetchProposals()
    } catch (err) {
      alert("Error rejecting proposal")
    } finally {
      setActionLoading(false)
    }
  }

  const handleAssignPm = async () => {
    if (!selectedProposal || !selectedPmId) return
    setActionLoading(true)
    try {
      const response = await fetch("/api/admin/proposals/assign-pm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ proposalId: selectedProposal.id, pmUserId: parseInt(selectedPmId) }),
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        alert(data.error || "Failed to assign PM")
      } else {
        setIsAssignPmOpen(false)
        setSelectedPmId("")
        fetchProposals()
        fetchPms() // Refresh PM list to update counts
      }
    } catch (err) {
      alert("Error assigning PM")
    } finally {
      setActionLoading(false)
    }
  }

  if (!isLoggedIn || user?.role !== "admin") {
    return null
  }

  const filtered = proposals
    .filter((p) => p.status !== 'active' && p.status !== 'completed' && p.status !== 'rejected')
    .filter((p) => p.title.toLowerCase().includes(searchTerm.toLowerCase()))

  const getStatusBadge = (status: string) => {
    const statusStyles: Record<string, string> = {
      "draft": "bg-muted text-muted-foreground",
      "submitted": "bg-primary/20 text-primary",
      "client review": "bg-chart-1/20 text-chart-1",
      "approved": "bg-chart-3/20 text-chart-3",
      "rejected": "bg-destructive/20 text-destructive",
      "active": "bg-primary/20 text-primary",
      "completed": "bg-chart-3/20 text-chart-3",
    }
    return statusStyles[status.toLowerCase()] || "bg-muted text-muted-foreground"
  }

  const pipelineStages = [
    { stage: "Draft", count: proposals.filter(p => p.status.toLowerCase() === 'draft').length, color: "bg-muted/20" },
    { stage: "Submitted", count: proposals.filter(p => p.status.toLowerCase() === 'submitted').length, color: "bg-primary/20" },
    { stage: "Client Review", count: proposals.filter(p => p.status.toLowerCase() === 'client review').length, color: "bg-chart-1/20" },
    { stage: "Approved", count: proposals.filter(p => p.status.toLowerCase() === 'active').length, color: "bg-chart-3/20" },
  ];

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
              <p className="text-sm text-muted-foreground">Manage proposal lifecycle: Draft → Sent → Approved</p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="p-8">
          {/* Proposal Pipeline Stages */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            {pipelineStages.map((item) => (
              <Card key={item.stage} className={`bg-card border border-border ${item.color}`}>
                <CardContent className="pt-6 text-center">
                  <p className="text-3xl font-bold text-foreground">{item.count}</p>
                  <p className="text-sm text-muted-foreground mt-1">{item.stage}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Search */}
          <div className="mb-6 flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
              <Input
                placeholder="Search proposals..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-secondary border-border"
              />
            </div>

          </div>

          {/* Proposals Table */}
          <Card className="bg-card border border-border">
            <CardContent className="pt-6">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b border-border">
                    <tr>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">ID</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Client</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Title</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Value</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Status</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">PM</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((proposal) => (
                      <tr key={proposal.id} className="border-b border-border hover:bg-secondary/50 transition-colors">
                        <td className="py-3 px-4 text-sm font-mono text-foreground">{proposal.id}</td>
                        <td className="py-3 px-4 text-sm text-foreground">{proposal.client}</td>
                        <td className="py-3 px-4 text-sm font-medium text-foreground">{proposal.title}</td>
                        <td className="py-3 px-4 text-sm font-bold text-foreground">
                          ${(proposal.value / 1000).toFixed(0)}K
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(proposal.status)}`}
                          >
                            {proposal.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-sm text-foreground">
                          {pms.find(pm => pm.id === proposal.pmid)?.name || <span className="text-muted-foreground italic">Unassigned</span>}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex gap-2">
                            {/* View Button */}
                            <button 
                              onClick={() => { setSelectedProposal(proposal); setIsViewOpen(true); }}
                              className="p-1 hover:bg-secondary rounded transition-colors text-foreground"
                              title="View Details"
                            >
                              <Eye size={18} />
                            </button>
                            {/* Approve Button */}
                            <button 
                              onClick={() => { setSelectedProposal(proposal); setIsApproveOpen(true); }}
                              disabled={!proposal.pmid}
                              className={`p-1 rounded transition-colors ${!proposal.pmid ? 'text-gray-400 cursor-not-allowed' : 'hover:bg-chart-3/20 text-chart-3'}`}
                              title={!proposal.pmid ? "Assign a PM first to approve" : "Approve"}
                            >
                              <CheckCircle size={18} />
                            </button>
                            {/* Reject Button */}
                            <button 
                              onClick={() => { setSelectedProposal(proposal); setIsRejectOpen(true); }}
                              className="p-1 hover:bg-destructive/20 rounded transition-colors text-destructive"
                              title="Reject"
                            >
                              <XCircle size={18} />
                            </button>
                            {/* Assign PM Button */}
                            <button 
                              onClick={() => { setSelectedProposal(proposal); setIsAssignPmOpen(true); }}
                              className="p-1 hover:bg-primary/20 rounded transition-colors text-primary"
                              title="Assign PM"
                            >
                              <UserPlus size={18} />
                            </button>
                            {/* View Comments Button */}
                            {proposal.admincomments && (
                              <button 
                                onClick={() => { setSelectedProposal(proposal); setIsCommentOpen(true); }}
                                className="p-1 hover:bg-accent/20 rounded transition-colors text-accent"
                                title="View Comments"
                              >
                                <MessageSquare size={18} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Navigation */}
          <div className="mt-8 flex gap-2">
            <Link href="/dashboard/admin">
              <Button variant="outline" className="bg-secondary border-border">
                ← Back
              </Button>
            </Link>
            <Link href="/dashboard/admin/projects">
              <Button variant="outline" className="bg-secondary border-border">
                View Projects →
              </Button>
            </Link>
          </div>

          {/* Dialogs */}
          <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
            <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Proposal Details</DialogTitle>
                <DialogDescription>
                  Full details for {selectedProposal?.title}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold text-sm text-muted-foreground">Client</h4>
                    <p className="text-foreground">{selectedProposal?.client}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm text-muted-foreground">Created By</h4>
                    <p className="text-foreground">{selectedProposal?.createdby || 'N/A'}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm text-muted-foreground">Value</h4>
                    <p className="text-foreground font-bold">${(selectedProposal?.value || 0).toLocaleString()}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm text-muted-foreground">Status</h4>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(selectedProposal?.status || '')}`}>
                      {selectedProposal?.status}
                    </span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm text-muted-foreground">Date</h4>
                    <p className="text-foreground">{selectedProposal?.date}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm text-muted-foreground">Project Manager</h4>
                    <p className="text-foreground">{pms.find(pm => pm.id === selectedProposal?.pmid)?.name || 'Unassigned'}</p>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-muted-foreground mb-2">Description</h4>
                  <div className="p-4 bg-secondary rounded-md text-sm whitespace-pre-wrap">
                    {selectedProposal?.description || "No description provided."}
                  </div>
                </div>
                {selectedProposal?.functionalreq && (
                  <div>
                    <h4 className="font-semibold text-sm text-muted-foreground mb-2">Functional Requirements</h4>
                    <div className="p-4 bg-secondary rounded-md text-sm whitespace-pre-wrap">
                      {selectedProposal.functionalreq}
                    </div>
                  </div>
                )}
                {selectedProposal?.nonfunctionalreq && (
                  <div>
                    <h4 className="font-semibold text-sm text-muted-foreground mb-2">Non-Functional Requirements</h4>
                    <div className="p-4 bg-secondary rounded-md text-sm whitespace-pre-wrap">
                      {selectedProposal.nonfunctionalreq}
                    </div>
                  </div>
                )}
                {selectedProposal?.clientcomments && (
                  <div>
                    <h4 className="font-semibold text-sm text-muted-foreground mb-2">Client Comments</h4>
                    <div className="p-4 bg-secondary rounded-md text-sm whitespace-pre-wrap">
                      {selectedProposal.clientcomments}
                    </div>
                  </div>
                )}
                {selectedProposal?.admincomments && (
                  <div>
                    <h4 className="font-semibold text-sm text-muted-foreground mb-2">Admin Comments</h4>
                    <div className="p-4 bg-accent/10 border border-accent/20 rounded-md text-sm">
                      {selectedProposal.admincomments}
                    </div>
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsViewOpen(false)}>Close</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={isApproveOpen} onOpenChange={setIsApproveOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Approve Proposal</DialogTitle>
                <DialogDescription>
                  Are you sure you want to approve "{selectedProposal?.title}"? You can add an optional comment.
                </DialogDescription>
              </DialogHeader>
              <Textarea 
                placeholder="Add a comment (optional)..." 
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              />
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsApproveOpen(false)}>Cancel</Button>
                <Button onClick={handleApprove} disabled={actionLoading}>
                  {actionLoading ? "Approving..." : "Approve"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={isRejectOpen} onOpenChange={setIsRejectOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Reject Proposal</DialogTitle>
                <DialogDescription>
                  Are you sure you want to reject "{selectedProposal?.title}"? Please provide a reason.
                </DialogDescription>
              </DialogHeader>
              <Textarea 
                placeholder="Reason for rejection..." 
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              />
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsRejectOpen(false)}>Cancel</Button>
                <Button variant="destructive" onClick={handleReject} disabled={actionLoading}>
                  {actionLoading ? "Rejecting..." : "Reject"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={isAssignPmOpen} onOpenChange={setIsAssignPmOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Assign Project Manager</DialogTitle>
                <DialogDescription>
                  Select a Project Manager for "{selectedProposal?.title}".
                </DialogDescription>
              </DialogHeader>
              <Select onValueChange={setSelectedPmId} value={selectedPmId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a PM" />
                </SelectTrigger>
                <SelectContent>
                  {pms.map((pm) => (
                    <SelectItem key={pm.id} value={pm.id.toString()} disabled={pm.activeprojects >= 5}>
                      {pm.name} ({pm.activeprojects}/5 projects)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAssignPmOpen(false)}>Cancel</Button>
                <Button onClick={handleAssignPm} disabled={!selectedPmId || actionLoading}>
                  {actionLoading ? "Assigning..." : "Assign"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={isCommentOpen} onOpenChange={setIsCommentOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Admin Comments</DialogTitle>
                <DialogDescription>
                  Comments for "{selectedProposal?.title}"
                </DialogDescription>
              </DialogHeader>
              <div className="p-4 bg-secondary rounded-md text-sm">
                {selectedProposal?.admincomments || "No comments."}
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCommentOpen(false)}>Close</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  )
}