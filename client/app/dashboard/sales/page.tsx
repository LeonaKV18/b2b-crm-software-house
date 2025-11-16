"use client"

import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { Sidebar } from "@/components/layout/sidebar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, Users, FileText, BarChart3 } from "lucide-react"
import Link from "next/link"
import { useState } from "react"

export default function SalesDashboard() {
  const { user, isLoggedIn } = useAuth()
  const router = useRouter()
  const [currentPath] = useState("/dashboard/sales")

  if (!isLoggedIn || user?.role !== "sales") {
    router.push("/")
    return null
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar currentPath={currentPath} />

      <div className="flex-1 overflow-auto">
        {/* Top Bar */}
        <div className="bg-card border-b border-border sticky top-0 z-10">
          <div className="px-8 py-4 flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Sales Dashboard</h1>
              <p className="text-sm text-muted-foreground">Pipeline & conversion tracking</p>
            </div>
            <Link href="/dashboard/sales/leads">
              <Button className="bg-primary hover:bg-primary/90">+ Add Lead</Button>
            </Link>
          </div>
        </div>

        {/* Main Content */}
        <div className="p-8">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="bg-card border border-border">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Total Leads</p>
                    <p className="text-3xl font-bold text-foreground">156</p>
                  </div>
                  <div className="p-3 bg-chart-1/10 rounded-lg">
                    <TrendingUp className="text-chart-1" size={24} />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-4">+24 this week</p>
              </CardContent>
            </Card>

            <Card className="bg-card border border-border">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Clients</p>
                    <p className="text-3xl font-bold text-foreground">48</p>
                  </div>
                  <div className="p-3 bg-primary/10 rounded-lg">
                    <Users className="text-primary" size={24} />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-4">Active relationships</p>
              </CardContent>
            </Card>

            <Card className="bg-card border border-border">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Proposals</p>
                    <p className="text-3xl font-bold text-foreground">12</p>
                  </div>
                  <div className="p-3 bg-accent/10 rounded-lg">
                    <FileText className="text-accent" size={24} />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-4">In pipeline</p>
              </CardContent>
            </Card>

            <Card className="bg-card border border-border">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Conversion Rate</p>
                    <p className="text-3xl font-bold text-foreground">32%</p>
                  </div>
                  <div className="p-3 bg-chart-3/10 rounded-lg">
                    <BarChart3 className="text-chart-3" size={24} />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-4">Above target</p>
              </CardContent>
            </Card>
          </div>

          {/* Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Lead List */}
            <div className="lg:col-span-2">
              <Card className="bg-card border border-border">
                <CardHeader>
                  <CardTitle className="text-foreground">Recent Leads</CardTitle>
                  <CardDescription>Leads added this week</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      { company: "StartUp AI", contact: "John Doe", status: "Contacted", value: "$50K" },
                      { company: "Digital Labs", contact: "Sarah Smith", status: "Qualified", value: "$75K" },
                      { company: "Tech Venture", contact: "Mike Johnson", status: "Proposal Sent", value: "$100K" },
                      { company: "Cloud Systems", contact: "Emma Wilson", status: "Negotiating", value: "$120K" },
                    ].map((lead, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-3 bg-secondary rounded-lg border border-border"
                      >
                        <div className="flex-1">
                          <p className="font-medium text-foreground">{lead.company}</p>
                          <p className="text-xs text-muted-foreground">{lead.contact}</p>
                        </div>
                        <div className="text-right">
                          <span
                            className={`px-2 py-1 rounded text-xs font-medium ${
                              lead.status === "Proposal Sent"
                                ? "bg-primary/20 text-primary"
                                : lead.status === "Negotiating"
                                  ? "bg-accent/20 text-accent"
                                  : "bg-muted text-muted-foreground"
                            }`}
                          >
                            {lead.status}
                          </span>
                          <p className="text-sm font-bold text-foreground mt-1">{lead.value}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <Link href="/dashboard/sales/leads">
                    <Button variant="ghost" className="w-full mt-4 text-primary hover:bg-primary/10">
                      View all leads →
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <div className="space-y-4">
              <Card className="bg-card border border-border">
                <CardHeader>
                  <CardTitle className="text-foreground text-base">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Link href="/dashboard/sales/leads" className="w-full">
                    <Button
                      variant="outline"
                      className="w-full justify-start bg-secondary border-border hover:bg-secondary/80"
                    >
                      Create New Lead
                    </Button>
                  </Link>
                  <Link href="/dashboard/sales/clients" className="w-full">
                    <Button
                      variant="outline"
                      className="w-full justify-start bg-secondary border-border hover:bg-secondary/80"
                    >
                      Manage Clients
                    </Button>
                  </Link>
                  <Link href="/dashboard/sales/proposals" className="w-full">
                    <Button
                      variant="outline"
                      className="w-full justify-start bg-secondary border-border hover:bg-secondary/80"
                    >
                      Send Proposal
                    </Button>
                  </Link>
                  <Link href="/dashboard/sales/meetings" className="w-full">
                    <Button
                      variant="outline"
                      className="w-full justify-start bg-secondary border-border hover:bg-secondary/80"
                    >
                      Schedule Meeting
                    </Button>
                  </Link>
                  <Link href="/dashboard/admin" className="w-full">
                    <Button
                      variant="outline"
                      className="w-full justify-start bg-secondary border-border hover:bg-secondary/80"
                    >
                      Admin Dashboard
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
