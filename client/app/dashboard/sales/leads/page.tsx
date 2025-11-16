"use client"

import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { Sidebar } from "@/components/layout/sidebar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Plus, Search, Mail, Phone, MapPin } from "lucide-react"
import Link from "next/link"
import { useState } from "react"

export default function LeadsPage() {
  const { user, isLoggedIn } = useAuth()
  const router = useRouter()
  const [currentPath] = useState("/dashboard/sales/leads")
  const [searchTerm, setSearchTerm] = useState("")

  if (!isLoggedIn || user?.role !== "sales") {
    router.push("/")
    return null
  }

  const leads = [
    {
      id: 1,
      company: "StartUp AI",
      contact: "Jane Smith",
      email: "jane@startup-ai.com",
      phone: "+1-555-1001",
      status: "New",
      value: "$50K",
      source: "LinkedIn",
    },
    {
      id: 2,
      company: "Digital Labs",
      contact: "Tom Brown",
      email: "tom@digitallabs.com",
      phone: "+1-555-1002",
      status: "Qualified",
      value: "$75K",
      source: "Referral",
    },
    {
      id: 3,
      company: "Tech Venture",
      contact: "Lisa Wong",
      email: "lisa@techventure.com",
      phone: "+1-555-1003",
      status: "Contacted",
      value: "$100K",
      source: "Website",
    },
    {
      id: 4,
      company: "Cloud Systems",
      contact: "Mark Davis",
      email: "mark@cloudsys.com",
      phone: "+1-555-1004",
      status: "Proposal Sent",
      value: "$120K",
      source: "Event",
    },
  ]

  const filtered = leads.filter((l) => l.company.toLowerCase().includes(searchTerm.toLowerCase()))

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
            {filtered.map((lead) => (
              <Card key={lead.id} className="bg-card border border-border hover:border-primary/50 transition-colors">
                <CardContent className="pt-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <p className="font-bold text-foreground text-lg">{lead.company}</p>
                      <p className="text-sm text-muted-foreground mt-1">{lead.contact}</p>
                    </div>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
                        lead.status === "Proposal Sent"
                          ? "bg-primary/20 text-primary"
                          : lead.status === "Qualified"
                            ? "bg-accent/20 text-accent"
                            : lead.status === "Contacted"
                              ? "bg-chart-3/20 text-chart-3"
                              : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {lead.status}
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
                    <p className="text-sm font-bold text-foreground">{lead.value}</p>
                    <p className="text-xs text-muted-foreground">Estimated value</p>
                  </div>

                  <Button className="w-full bg-primary hover:bg-primary/90">View Details</Button>
                </CardContent>
              </Card>
            ))}
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
