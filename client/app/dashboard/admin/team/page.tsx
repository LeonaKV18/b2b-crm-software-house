"use client"

import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { Sidebar } from "@/components/layout/sidebar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Plus, Search } from "lucide-react"
import Link from "next/link"
import { useState } from "react"

export default function TeamPage() {
  const { user, isLoggedIn } = useAuth()
  const router = useRouter()
  const [currentPath] = useState("/dashboard/admin/team")
  const [searchTerm, setSearchTerm] = useState("")

  if (!isLoggedIn || user?.role !== "admin") {
    router.push("/")
    return null
  }

  const team = [
    {
      id: 1,
      name: "John Doe",
      role: "Project Manager",
      email: "john@techhouse.com",
      projects: 2,
      workload: 85,
      status: "Active",
    },
    {
      id: 2,
      name: "Sarah Smith",
      role: "Developer",
      email: "sarah@techhouse.com",
      projects: 3,
      workload: 95,
      status: "Active",
    },
    {
      id: 3,
      name: "Mike Johnson",
      role: "Designer",
      email: "mike@techhouse.com",
      projects: 2,
      workload: 70,
      status: "Active",
    },
    {
      id: 4,
      name: "Emma Wilson",
      role: "QA Engineer",
      email: "emma@techhouse.com",
      projects: 4,
      workload: 88,
      status: "Active",
    },
    {
      id: 5,
      name: "Alex Chen",
      role: "Developer",
      email: "alex@techhouse.com",
      projects: 2,
      workload: 60,
      status: "On Leave",
    },
  ]

  const filtered = team.filter((m) => m.name.toLowerCase().includes(searchTerm.toLowerCase()))

  return (
    <div className="flex h-screen bg-background">
      <Sidebar currentPath={currentPath} />

      <div className="flex-1 overflow-auto">
        {/* Top Bar */}
        <div className="bg-card border-b border-border sticky top-0 z-10">
          <div className="px-8 py-4 flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Team Management</h1>
              <p className="text-sm text-muted-foreground">Manage team members and workload</p>
            </div>
            <Button className="bg-primary hover:bg-primary/90 flex items-center gap-2">
              <Plus size={20} />
              Add Team Member
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <div className="p-8">
          {/* Search */}
          <div className="mb-6 flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
              <Input
                placeholder="Search team members..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-secondary border-border"
              />
            </div>
          </div>

          {/* Team Table */}
          <Card className="bg-card border border-border">
            <CardContent className="pt-6">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b border-border">
                    <tr>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Name</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Role</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Email</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Projects</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Workload</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Status</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((member) => (
                      <tr key={member.id} className="border-b border-border hover:bg-secondary/50 transition-colors">
                        <td className="py-3 px-4">
                          <p className="font-medium text-foreground">{member.name}</p>
                        </td>
                        <td className="py-3 px-4 text-sm text-foreground">{member.role}</td>
                        <td className="py-3 px-4 text-sm text-foreground">{member.email}</td>
                        <td className="py-3 px-4 text-sm font-medium text-foreground">{member.projects}</td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 w-16 bg-secondary rounded-full h-2">
                              <div
                                className={`h-2 rounded-full transition-all ${
                                  member.workload > 85
                                    ? "bg-destructive"
                                    : member.workload > 70
                                      ? "bg-accent"
                                      : "bg-chart-3"
                                }`}
                                style={{ width: `${member.workload}%` }}
                              />
                            </div>
                            <span className="text-xs font-medium text-foreground w-8 text-right">
                              {member.workload}%
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${
                              member.status === "Active"
                                ? "bg-chart-3/20 text-chart-3"
                                : "bg-muted text-muted-foreground"
                            }`}
                          >
                            {member.status}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <Button variant="ghost" size="sm" className="text-primary hover:bg-primary/10">
                            Edit
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Navigation */}
          <div className="mt-8 flex gap-2">
            <Link href="/dashboard/admin">
              <Button variant="outline" className="bg-secondary border-border">
                ← Back
              </Button>
            </Link>
            <Link href="/dashboard/admin/meetings">
              <Button variant="outline" className="bg-secondary border-border">
                Meetings →
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
