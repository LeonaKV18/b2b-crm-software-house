"use client"

import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { Sidebar } from "@/components/layout/sidebar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { FileText, DollarSign, CheckCircle, Clock } from "lucide-react"
import Link from "next/link"
import { useState, useEffect } from "react"

interface Invoice {
  id: number;
  project: string;
  amount: number;
  date: string;
  status: string;
}

export default function ClientInvoicesPage() {
  const { user, isLoggedIn } = useAuth()
  const router = useRouter()
  const [currentPath] = useState("/dashboard/client/invoices")

  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchInvoices = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/client-invoices?userId=${user?.id}`)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data = await response.json()
      setInvoices(data)
    } catch (err) {
      console.error("Failed to fetch client invoices:", err)
      setError("Failed to load invoices.")
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
      fetchInvoices()
    }
  }, [isLoggedIn, user?.role, user?.id, router])

  const handleMarkPaid = async (invoiceId: number) => {
    if (!confirm("Are you sure you want to mark this invoice as paid?")) return;

    try {
      const res = await fetch(`/api/invoices/${invoiceId}/pay`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      if (res.ok) {
        alert("Invoice marked as paid.");
        fetchInvoices(); // Refresh list
      } else {
        alert("Failed to mark invoice as paid.");
      }
    } catch (err) {
      console.error("Error marking invoice paid:", err);
      alert("Error marking invoice paid.");
    }
  }

  if (!isLoggedIn || user?.role !== "client") {
    return null
  }

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "paid": return "bg-chart-3/20 text-chart-3";
      case "pending": return "bg-primary/20 text-primary";
      case "overdue": return "bg-destructive/20 text-destructive";
      default: return "bg-muted text-muted-foreground";
    }
  }

  if (loading) {
    return (
      <div className="flex h-screen bg-background items-center justify-center">
        <p className="text-foreground">Loading invoices...</p>
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
            <h1 className="text-2xl font-bold text-foreground">Invoices</h1>
            <p className="text-sm text-muted-foreground">Manage your project invoices</p>
          </div>
        </div>

        {/* Main Content */}
        <div className="p-8">
          <div className="space-y-4">
            {invoices.length === 0 ? (
              <p className="text-muted-foreground">No invoices found.</p>
            ) : (
              invoices.map((invoice) => (
                <Card key={invoice.id} className="bg-card border border-border">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="flex gap-4 flex-1">
                        <div className="p-3 bg-primary/10 rounded-lg h-fit">
                          <FileText className="text-primary" size={24} />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-bold text-foreground text-lg">{invoice.project || "N/A"}</h3>
                          <p className="text-sm text-muted-foreground mt-1">Due: {invoice.date}</p>
                          <p className="text-lg font-bold text-foreground mt-2">
                            ${invoice.amount.toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium block mb-3 ${getStatusBadge(
                            invoice.status
                          )}`}
                        >
                          {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                        </span>
                        {invoice.status.toLowerCase() === 'pending' && (
                            <Button 
                                size="sm" 
                                className="bg-chart-3 hover:bg-chart-3/90"
                                onClick={() => handleMarkPaid(invoice.id)}
                            >
                                <CheckCircle size={16} className="mr-1" /> Mark Paid
                            </Button>
                        )}
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