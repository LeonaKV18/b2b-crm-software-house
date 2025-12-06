"use client"
import { useState, useEffect } from "react" // Import useEffect
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { Sidebar } from "@/components/layout/sidebar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Plus, Search, Mail, Phone, MapPin } from "lucide-react"
import Link from "next/link"

interface Lead {
  id: number;
  company: string;
  contact: string;
  email: string;
  phone: string;
  status: string;
  value: number; // Value is now a number from the database
  source: string;
}

export default function LeadsPage() {
  const { user, isLoggedIn } = useAuth()
  const router = useRouter()
  const [currentPath] = useState("/dashboard/sales/leads")
  const [searchTerm, setSearchTerm] = useState("")

  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!isLoggedIn || user?.role !== "sales") {
      router.push("/")
      return
    }

    const fetchLeads = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/sales-leads?userId=${user?.id}`)
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        const data = await response.json()
        setLeads(data)
      } catch (err) {
        console.error("Failed to fetch sales leads:", err)
        setError("Failed to load leads.")
      } finally {
        setLoading(false)
      }
    }

    if (user?.id) { // Only fetch if user ID is available
      fetchLeads()
    }
  }, [isLoggedIn, user?.role, user?.id, router])

  if (!isLoggedIn || user?.role !== "sales") {
    router.push("/")
    return null
  }

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "new":
        return "bg-muted text-muted-foreground";
      case "contacted":
        return "bg-chart-3/20 text-chart-3";
      case "qualified":
        return "bg-accent/20 text-accent";
      case "proposal_sent":
        return "bg-primary/20 text-primary";
      case "negotiating":
        return "bg-yellow-500/20 text-yellow-500"; // Assuming yellow for negotiating
      case "closed_won":
        return "bg-green-600/20 text-green-600";
      case "closed_lost":
        return "bg-destructive/20 text-destructive";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getDisplayStatus = (status: string) => {
    switch (status.toLowerCase()) {
      case "new": return "New";
      case "contacted": return "Contacted";
      case "qualified": return "Qualified";
      case "proposal_sent": return "Proposal Sent";
      case "negotiating": return "Negotiating";
      case "closed_won": return "Closed Won";
      case "closed_lost": return "Closed Lost";
      default: return status;
    }
  };


  const filtered = leads.filter((l) => l.company.toLowerCase().includes(searchTerm.toLowerCase()))

  if (loading) {
    return (
      <div className="flex h-screen bg-background items-center justify-center">
        <p className="text-foreground">Loading leads...</p>
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
              <h1 className="text-2xl font-bold text-foreground">Leads</h1>
              <p className="text-sm text-muted-foreground">Manage and track all leads</p>
            </div>
            <Button className="bg-primary hover:bg-primary/90 flex items-center gap-2">
              <Plus size={20} />
              Add Lead
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <div className="p-8">
          {/* Search */}
          <div className="mb-6 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
            <Input
              placeholder="Search leads..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-secondary border-border"
            />
          </div>

          {/* Leads Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.length === 0 ? (
              <p className="text-muted-foreground">No leads found for this sales user.</p>
            ) : (
              filtered.map((lead) => (
                <Card key={lead.id} className="bg-card border border-border hover:border-primary/50 transition-colors">
                  <CardContent className="pt-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <p className="font-bold text-foreground text-lg">{lead.company}</p>
                        <p className="text-sm text-muted-foreground mt-1">{lead.contact}</p>
                      </div>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${getStatusBadge(
                          lead.status
                        )}`}
                      >
                        {getDisplayStatus(lead.status)}
                      </span>
                    </div>

                    <div className="space-y-2 mb-4 text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Mail size={16} />
                        {lead.email}
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Phone size={16} />
                        {lead.phone}
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <MapPin size={16} />
                        {lead.source}
                      </div>
                    </div>

                    <div className="py-3 border-t border-border mb-4">
                      <p className="text-sm font-bold text-foreground">
                        ${lead.value ? lead.value.toLocaleString() : "0"}
                      </p>
                      <p className="text-xs text-muted-foreground">Estimated value</p>
                    </div>

                    <Button className="w-full bg-primary hover:bg-primary/90">View Details</Button>
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          {/* Navigation */}
          <div className="mt-8 flex gap-2">
            <Link href="/dashboard/sales">
              <Button variant="outline" className="bg-secondary border-border">
                ← Back
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
