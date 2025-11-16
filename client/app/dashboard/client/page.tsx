"use client"

import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { Sidebar } from "@/components/layout/sidebar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { FileText, Briefcase, CheckCircle, DollarSign } from "lucide-react"
import Link from "next/link"
import { useState } from "react"

export default function ClientDashboard() {
  const { user, isLoggedIn } = useAuth()
  const router = useRouter()
  const [currentPath] = useState("/dashboard/client")

  if (!isLoggedIn || user?.role !== "client") {
    router.push("/")
    return null
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar currentPath={currentPath} />

      <div className="flex-1 overflow-auto">
        {/* Top Bar */}
        <div className="bg-card border-b border-border sticky top-0 z-10">
          <div className="px-8 py-4">
            <h1 className="text-2xl font-bold text-foreground">Client Portal</h1>
            <p className="text-sm text-muted-foreground">View proposals, projects, and payments</p>
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
                    <p className="text-sm text-muted-foreground mb-2">Proposals</p>
                    <p className="text-3xl font-bold text-foreground">3</p>
                  </div>
                  <div className="p-3 bg-primary/10 rounded-lg">
                    <FileText className="text-primary" size={24} />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border border-border">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Active Projects</p>
                    <p className="text-3xl font-bold text-foreground">2</p>
                  </div>
                  <div className="p-3 bg-accent/10 rounded-lg">
                    <Briefcase className="text-accent" size={24} />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border border-border">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Completed</p>
                    <p className="text-3xl font-bold text-foreground">5</p>
                  </div>
                  <div className="p-3 bg-chart-3/10 rounded-lg">
                    <CheckCircle className="text-chart-3" size={24} />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border border-border">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Total Spent</p>
                    <p className="text-3xl font-bold text-foreground">$85K</p>
                  </div>
                  <div className="p-3 bg-chart-2/10 rounded-lg">
                    <DollarSign className="text-chart-2" size={24} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Navigation */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <Link href="/dashboard/client/proposals">
              <Button variant="outline" className="w-full bg-secondary border-border hover:bg-secondary/80">
                View Proposals
              </Button>
            </Link>
            <Link href="/dashboard/client/projects">
              <Button variant="outline" className="w-full bg-secondary border-border hover:bg-secondary/80">
                My Projects
              </Button>
            </Link>
            <Link href="/dashboard/client/invoices">
              <Button variant="outline" className="w-full bg-secondary border-border hover:bg-secondary/80">
                Invoices
              </Button>
            </Link>
            <Link href="/">
              <Button variant="outline" className="w-full bg-secondary border-border hover:bg-secondary/80">
                Logout
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
