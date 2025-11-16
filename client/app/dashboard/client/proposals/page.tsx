"use client"

import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { Sidebar } from "@/components/layout/sidebar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { FileText, Download, CheckCircle, XCircle } from "lucide-react"
import Link from "next/link"
import { useState } from "react"

export default function ClientProposalsPage() {
  const { user, isLoggedIn } = useAuth()
  const router = useRouter()
  const [currentPath] = useState("/dashboard/client/proposals")

  if (!isLoggedIn || user?.role !== "client") {
    router.push("/")
    return null
  }

  const proposals = [
    { id: 1, title: "Portal Redesign", amount: "$85,000", status: "Approved", date: "2025-01-15" },
    { id: 2, title: "Mobile App Development", amount: "$120,000", status: "Under Review", date: "2025-01-20" },
    { id: 3, title: "API Integration", amount: "$35,000", status: "Rejected", date: "2025-01-10" },
  ]

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
            {proposals.map((proposal) => (
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
                        <p className="text-lg font-bold text-foreground mt-2">{proposal.amount}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium block mb-3 ${
                          proposal.status === "Approved"
                            ? "bg-chart-3/20 text-chart-3"
                            : proposal.status === "Under Review"
                              ? "bg-primary/20 text-primary"
                              : "bg-destructive/20 text-destructive"
                        }`}
                      >
                        {proposal.status}
                      </span>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" className="bg-secondary border-border">
                          <Download size={16} />
                        </Button>
                        {proposal.status === "Under Review" && (
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
            ))}
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
