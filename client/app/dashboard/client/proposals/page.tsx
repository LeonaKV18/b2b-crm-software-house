"use client"

import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { Sidebar } from "@/components/layout/sidebar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { FileText, Download, CheckCircle, XCircle } from "lucide-react"
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

  useEffect(() => {
    if (!isLoggedIn || user?.role !== "client") {
      router.push("/")
      return
    }

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

    if (user?.id) { // Only fetch if user ID is available
      fetchProposals()
    }
  }, [isLoggedIn, user?.role, user?.id, router])

  if (!isLoggedIn || user?.role !== "client") {
    return null
  }

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
          <div className="px-8 py-4">
            <h1 className="text-2xl font-bold text-foreground">Proposals</h1>
            <p className="text-sm text-muted-foreground">View and manage proposals</p>
          </div>
        </div>

        {/* Main Content */}
        <div className="p-8">
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
                              <Button size="sm" className="bg-chart-3 hover:bg-chart-3/90 flex items-center gap-1">
                                <CheckCircle size={16} />
                                Approve
                              </Button>
                              <Button size="sm" variant="destructive">
                                <XCircle size={16} />
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
