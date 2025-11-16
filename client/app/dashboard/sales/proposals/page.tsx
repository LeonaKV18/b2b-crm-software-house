"use client"

import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { Sidebar } from "@/components/layout/sidebar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import Link from "next/link"
import { useState } from "react"

export default function SalesProposalsPage() {
  const { user, isLoggedIn } = useAuth()
  const router = useRouter()
  const [currentPath] = useState("/dashboard/sales/proposals")

  if (!isLoggedIn || user?.role !== "sales") {
    router.push("/")
    return null
  }

  const proposals = [
    { id: "P001", title: "Portal Development", client: "Acme", value: "$85K", status: "Approved" },
    { id: "P002", title: "Mobile App", client: "StartUp AI", value: "$120K", status: "Sent" },
  ]

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
            {proposals.map((proposal) => (
              <Card key={proposal.id} className="bg-card border border-border">
                <CardContent className="pt-6 flex justify-between items-center">
                  <div>
                    <p className="font-bold text-foreground">{proposal.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {proposal.client} • {proposal.value}
                    </p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      proposal.status === "Approved" ? "bg-chart-3/20 text-chart-3" : "bg-primary/20 text-primary"
                    }`}
                  >
                    {proposal.status}
                  </span>
                </CardContent>
              </Card>
            ))}
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
