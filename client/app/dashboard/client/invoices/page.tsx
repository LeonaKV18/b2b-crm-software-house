"use client"

import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { Sidebar } from "@/components/layout/sidebar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Download, Eye } from "lucide-react"
import Link from "next/link"
import { useState } from "react"

export default function InvoicesPage() {
  const { user, isLoggedIn } = useAuth()
  const router = useRouter()
  const [currentPath] = useState("/dashboard/client/invoices")

  if (!isLoggedIn || user?.role !== "client") {
    router.push("/")
    return null
  }

  const invoices = [
    { id: "INV-001", project: "Portal Redesign", amount: "$42,500", date: "2025-01-15", status: "Paid" },
    { id: "INV-002", project: "Portal Redesign", amount: "$42,500", date: "2025-02-15", status: "Paid" },
    { id: "INV-003", project: "Mobile App", amount: "$60,000", date: "2025-02-01", status: "Pending" },
  ]

  return (
    <div className="flex h-screen bg-background">
      <Sidebar currentPath={currentPath} />

      <div className="flex-1 overflow-auto">
        {/* Top Bar */}
        <div className="bg-card border-b border-border sticky top-0 z-10">
          <div className="px-8 py-4">
            <h1 className="text-2xl font-bold text-foreground">Invoices</h1>
            <p className="text-sm text-muted-foreground">View and download invoices</p>
          </div>
        </div>

        {/* Main Content */}
        <div className="p-8">
          <Card className="bg-card border border-border">
            <CardContent className="pt-6">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b border-border">
                    <tr>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Invoice ID</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Project</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Amount</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Date</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Status</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoices.map((invoice) => (
                      <tr key={invoice.id} className="border-b border-border hover:bg-secondary/50 transition-colors">
                        <td className="py-3 px-4 font-mono text-sm text-foreground">{invoice.id}</td>
                        <td className="py-3 px-4 text-sm text-foreground">{invoice.project}</td>
                        <td className="py-3 px-4 text-sm font-bold text-foreground">{invoice.amount}</td>
                        <td className="py-3 px-4 text-sm text-foreground">{invoice.date}</td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${
                              invoice.status === "Paid" ? "bg-chart-3/20 text-chart-3" : "bg-primary/20 text-primary"
                            }`}
                          >
                            {invoice.status}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex gap-2">
                            <button className="p-1 hover:bg-secondary rounded transition-colors">
                              <Eye size={16} className="text-muted-foreground hover:text-foreground" />
                            </button>
                            <button className="p-1 hover:bg-secondary rounded transition-colors">
                              <Download size={16} className="text-muted-foreground hover:text-foreground" />
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
