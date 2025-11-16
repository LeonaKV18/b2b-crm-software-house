"use client"

import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { Sidebar } from "@/components/layout/sidebar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Plus, Search, Edit, CheckCircle } from "lucide-react"
import Link from "next/link"
import { useState } from "react"

export default function ProposalsPage() {
  const { user, isLoggedIn } = useAuth()
  const router = useRouter()
  const [currentPath] = useState("/dashboard/admin/proposals")
  const [searchTerm, setSearchTerm] = useState("")

  if (!isLoggedIn || user?.role !== "admin") {
    router.push("/")
    return null
  }

  const proposals = [
    {
      id: "P001",
      client: "Acme Corp",
      title: "Web Portal Development",
      status: "Approved",
      value: 85000,
      createdBy: "John",
      date: "2025-01-10",
    },
    {
      id: "P002",
      client: "Tech Startup",
      title: "Mobile App",
      status: "Sent",
      value: 120000,
      createdBy: "Sarah",
      date: "2025-01-12",
    },
    {
      id: "P003",
      client: "Digital Solutions",
      title: "Cloud Migration",
      status: "Draft",
      value: 150000,
      createdBy: "Mike",
      date: "2025-01-15",
    },
    {
      id: "P004",
      client: "Enterprise Systems",
      title: "AI Integration",
      status: "Client Review",
      value: 95000,
      createdBy: "Emma",
      date: "2025-01-18",
    },
  ]

  const filtered = proposals.filter((p) => p.title.toLowerCase().includes(searchTerm.toLowerCase()))

  const getStatusBadge = (status: string) => {
    const statusStyles: Record<string, string> = {
      Draft: "bg-muted text-muted-foreground",
      Sent: "bg-primary/20 text-primary",
      "Client Review": "bg-chart-1/20 text-chart-1",
      Approved: "bg-chart-3/20 text-chart-3",
      Rejected: "bg-destructive/20 text-destructive",
    }
    return statusStyles[status] || statusStyles["Draft"]
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
            {[
              { stage: "Draft", count: 3, color: "bg-muted/20" },
              { stage: "Sent", count: 5, color: "bg-primary/20" },
              { stage: "Client Review", count: 2, color: "bg-chart-1/20" },
              { stage: "Approved", count: 8, color: "bg-chart-3/20" },
            ].map((item) => (
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
              <option>Sent</option>
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
