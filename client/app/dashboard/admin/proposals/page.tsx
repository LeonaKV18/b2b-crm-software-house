"use client"

import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { Sidebar } from "@/components/layout/sidebar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Plus, Search, Edit, CheckCircle } from "lucide-react"
import Link from "next/link"
import { useState, useEffect } from "react" // Import useEffect

interface Proposal {
  id: string;
  client: string;
  title: string;
  status: string;
  value: number;
  createdBy: string;
  date: string;
}

export default function ProposalsPage() {
  const { user, isLoggedIn } = useAuth()
  const router = useRouter()
  const [currentPath] = useState("/dashboard/admin/proposals")
  const [searchTerm, setSearchTerm] = useState("")

  const [proposals, setProposals] = useState<Proposal[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!isLoggedIn || user?.role !== "admin") {
      router.push("/")
      return
    }

    const fetchProposals = async () => {
      try {
        setLoading(true)
        const response = await fetch("/api/proposals")
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        const data = await response.json()
        setProposals(data)
      } catch (err) {
        console.error("Failed to fetch proposals:", err)
        setError("Failed to load proposals.")
      } finally {
        setLoading(false)
      }
    }

    fetchProposals()
  }, [isLoggedIn, user?.role, router])

  if (!isLoggedIn || user?.role !== "admin") {
    return null
  }

  const filtered = proposals.filter((p) => p.title.toLowerCase().includes(searchTerm.toLowerCase()))

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
    return statusStyles[status.toLowerCase()] || "bg-muted text-muted-foreground" // Default to Draft style
  }

  // Calculate proposal pipeline stages dynamically
  const pipelineStages = [
    { stage: "Draft", count: proposals.filter(p => p.status.toLowerCase() === 'draft').length, color: "bg-muted/20" },
    { stage: "Submitted", count: proposals.filter(p => p.status.toLowerCase() === 'submitted').length, color: "bg-primary/20" },
    { stage: "Client Review", count: proposals.filter(p => p.status.toLowerCase() === 'client review').length, color: "bg-chart-1/20" },
    { stage: "Approved", count: proposals.filter(p => p.status.toLowerCase() === 'approved').length, color: "bg-chart-3/20" },
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
            <Button className="bg-primary hover:bg-primary/90 flex items-center gap-2">
              <Plus size={20} />
              Create Proposal
            </Button>
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
            <select className="px-4 py-2 bg-secondary border border-border rounded-lg text-foreground">
              <option>All Status</option>
              <option>Draft</option>
              <option>Submitted</option>
              <option>Client Review</option>
              <option>Approved</option>
            </select>
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
                      <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Created</th>
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
                        <td className="py-3 px-4 text-sm text-muted-foreground">{proposal.date}</td>
                        <td className="py-3 px-4">
                          <div className="flex gap-2">
                            <button className="p-1 hover:bg-secondary rounded transition-colors">
                              <Edit size={16} className="text-muted-foreground hover:text-foreground" />
                            </button>
                            <button className="p-1 hover:bg-secondary rounded transition-colors">
                              <CheckCircle size={16} className="text-muted-foreground hover:text-chart-3" />
                            </button>
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
        </div>
      </div>
    </div>
  )
}