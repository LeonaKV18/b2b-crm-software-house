"use client"

import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { Sidebar } from "@/components/layout/sidebar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Briefcase, AlertCircle, Clock, CheckCircle2 } from "lucide-react"
import Link from "next/link"
import { useState } from "react"

export default function PMDashboard() {
  const { user, isLoggedIn } = useAuth()
  const router = useRouter()
  const [currentPath] = useState("/dashboard/pm")

  if (!isLoggedIn || user?.role !== "pm") {
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
              <h1 className="text-2xl font-bold text-foreground">Project Management Dashboard</h1>
              <p className="text-sm text-muted-foreground">Track all projects and milestones</p>
            </div>
            <Link href="/dashboard/pm/projects">
              <Button className="bg-primary hover:bg-primary/90">+ New Project</Button>
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
                    <p className="text-sm text-muted-foreground mb-2">Active Projects</p>
                    <p className="text-3xl font-bold text-foreground">8</p>
                  </div>
                  <div className="p-3 bg-primary/10 rounded-lg">
                    <Briefcase className="text-primary" size={24} />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border border-border">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Delayed Projects</p>
                    <p className="text-3xl font-bold text-foreground">2</p>
                  </div>
                  <div className="p-3 bg-destructive/10 rounded-lg">
                    <AlertCircle className="text-destructive" size={24} />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border border-border">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">On Schedule</p>
                    <p className="text-3xl font-bold text-foreground">6</p>
                  </div>
                  <div className="p-3 bg-chart-3/10 rounded-lg">
                    <CheckCircle2 className="text-chart-3" size={24} />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border border-border">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Team Utilization</p>
                    <p className="text-3xl font-bold text-foreground">82%</p>
                  </div>
                  <div className="p-3 bg-accent/10 rounded-lg">
                    <Clock className="text-accent" size={24} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Navigation */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <Link href="/dashboard/pm/projects">
              <Button variant="outline" className="w-full bg-secondary border-border hover:bg-secondary/80">
                View Projects
              </Button>
            </Link>
            <Link href="/dashboard/pm/milestones">
              <Button variant="outline" className="w-full bg-secondary border-border hover:bg-secondary/80">
                Milestones
              </Button>
            </Link>
            <Link href="/dashboard/pm/team">
              <Button variant="outline" className="w-full bg-secondary border-border hover:bg-secondary/80">
                Team
              </Button>
            </Link>
            <Link href="/dashboard/pm/meetings">
              <Button variant="outline" className="w-full bg-secondary border-border hover:bg-secondary/80">
                Meetings
              </Button>
            </Link>
            <Link href="/dashboard/admin">
              <Button variant="outline" className="w-full bg-secondary border-border hover:bg-secondary/80">
                Admin Dashboard
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
