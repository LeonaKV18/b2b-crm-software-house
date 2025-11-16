"use client"

import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { Sidebar } from "@/components/layout/sidebar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import Link from "next/link"
import { useState } from "react"

export default function PMTeamPage() {
  const { user, isLoggedIn } = useAuth()
  const router = useRouter()
  const [currentPath] = useState("/dashboard/pm/team")

  if (!isLoggedIn || user?.role !== "pm") {
    router.push("/")
    return null
  }

  const team = [
    { name: "Sarah Smith", role: "Developer", workload: 95 },
    { name: "Mike Johnson", role: "Designer", workload: 70 },
    { name: "Emma Wilson", role: "QA Engineer", workload: 88 },
  ]

  return (
    <div className="flex h-screen bg-background">
      <Sidebar currentPath={currentPath} />

      <div className="flex-1 overflow-auto">
        {/* Top Bar */}
        <div className="bg-card border-b border-border sticky top-0 z-10">
          <div className="px-8 py-4">
            <h1 className="text-2xl font-bold text-foreground">Team</h1>
            <p className="text-sm text-muted-foreground">Current team members and workload</p>
          </div>
        </div>

        {/* Main Content */}
        <div className="p-8">
          <div className="space-y-3">
            {team.map((member) => (
              <Card key={member.name} className="bg-card border border-border">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-bold text-foreground">{member.name}</p>
                      <p className="text-sm text-muted-foreground">{member.role}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-foreground mb-2">Workload: {member.workload}%</p>
                      <div className="w-40 bg-secondary rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all ${
                            member.workload > 85 ? "bg-destructive" : member.workload > 70 ? "bg-accent" : "bg-chart-3"
                          }`}
                          style={{ width: `${member.workload}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Link href="/dashboard/pm">
            <Button variant="outline" className="mt-8 bg-secondary border-border">
              ← Back
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
