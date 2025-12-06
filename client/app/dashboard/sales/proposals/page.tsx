"use client"
import { useState, useEffect } from "react" // Import useEffect
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { Sidebar } from "@/components/layout/sidebar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import Link from "next/link"

interface Proposal {
  id: string;
  title: string;
  client: string;
  value: number; // Value is now a number from the database
  status: string;
}

export default function SalesProposalsPage() {
  const { user, isLoggedIn } = useAuth()
  const router = useRouter()
  const [currentPath] = useState("/dashboard/sales/proposals")

  const [proposals, setProposals] = useState<Proposal[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!isLoggedIn || user?.role !== "sales") {
      router.push("/")
      return
    }

    const fetchProposals = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/sales-proposals?userId=${user?.id}`)
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        const data = await response.json()
        setProposals(data)
      } catch (err) {
        console.error("Failed to fetch sales proposals:", err)
        setError("Failed to load proposals.")
      } finally {
        setLoading(false)
      }
    }

    if (user?.id) { // Only fetch if user ID is available
      fetchProposals()
    }
  }, [isLoggedIn, user?.role, user?.id, router])

  if (!isLoggedIn || user?.role !== "sales") {
    router.push("/")
    return null
  }

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "approved":
        return "bg-chart-3/20 text-chart-3";
      case "submitted":
        return "bg-primary/20 text-primary"; // Maps to "Sent" in the old data
      case "draft":
        return "bg-muted text-muted-foreground";
      case "rejected":
        return "bg-destructive/20 text-destructive";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getDisplayStatus = (status: string) => {
    switch (status.toLowerCase()) {
      case "submitted": return "Sent"; // Map to old "Sent" status
      default: return status;
    }
  };


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
            <p className="text-sm text-muted-foreground">Manage your sales proposals</p>
          </div>
        </div>

        {/* Main Content */}
        <div className="p-8">
          <div className="space-y-3">
            {proposals.length === 0 ? (
              <p className="text-muted-foreground">No proposals found for this sales user.</p>
            ) : (
              proposals.map((proposal) => (
                <Card key={proposal.id} className="bg-card border border-border">
                  <CardContent className="pt-6 flex justify-between items-center">
                    <div>
                      <p className="font-bold text-foreground">{proposal.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {proposal.client} • ${proposal.value ? proposal.value.toLocaleString() : "0"}
                      </p>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(proposal.status)}`}
                    >
                      {getDisplayStatus(proposal.status)}
                    </span>
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          <Link href="/dashboard/sales">
            <Button variant="outline" className="mt-8 bg-secondary border-border">
              ← Back
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
