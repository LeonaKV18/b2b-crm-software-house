"use client"

import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { Sidebar } from "@/components/layout/sidebar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Plus, Search } from "lucide-react"
import Link from "next/link"
import { useState, useEffect } from "react" // Import useEffect
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface TeamMember {
  id: number;
  name: string;
  role: string;
  email: string;
  projects: number;
  workload: number; // Utilization percentage
  status: string; // 'Active' or 'Inactive'
}

export default function TeamPage() {
  const { user, isLoggedIn } = useAuth()
  const router = useRouter()
  const [currentPath] = useState("/dashboard/admin/team")
  const [searchTerm, setSearchTerm] = useState("")

  const [team, setTeam] = useState<TeamMember[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Add Member State
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [newName, setNewName] = useState("")
  const [newEmail, setNewEmail] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [newRole, setNewRole] = useState("developer")
  const [addLoading, setAddLoading] = useState(false)

  const fetchTeam = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/team")
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data = await response.json()
      setTeam(data)
    } catch (err) {
      console.error("Failed to fetch team members:", err)
      setError("Failed to load team members.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!isLoggedIn || user?.role !== "admin") {
      router.push("/")
      return
    }
    fetchTeam()
  }, [isLoggedIn, user?.role, router])

  const handleAddMember = async () => {
    setAddLoading(true)
    try {
      const response = await fetch("/api/team/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newName,
          email: newEmail,
          password: newPassword,
          role: newRole,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setIsAddOpen(false)
        setNewName("")
        setNewEmail("")
        setNewPassword("")
        setNewRole("developer")
        fetchTeam() // Refresh list
      } else {
        alert(data.error || "Failed to create team member")
      }
    } catch (err) {
      console.error("Error adding member:", err)
      alert("An error occurred")
    } finally {
      setAddLoading(false)
    }
  }

  const handleStatusToggle = async (memberId: number, currentStatus: string) => {
    const newStatus = currentStatus === 'Active' ? 'Inactive' : 'Active';
    if (!confirm(`Are you sure you want to set ${memberId} to ${newStatus}?`)) return;

    try {
        const res = await fetch(`/api/admin/users/${memberId}/status`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ isActive: newStatus === 'Active' ? 1 : 0 })
        });

        if (res.ok) {
            alert(`User status updated to ${newStatus}.`);
            fetchTeam(); // Refresh list
        } else {
            alert("Failed to update user status.");
        }
    } catch (err) {
        console.error("Error updating user status:", err);
        alert("Error updating user status.");
    }
  }

  if (!isLoggedIn || user?.role !== "admin") {
    return null
  }

  const filtered = team.filter((m) => m.name.toLowerCase().includes(searchTerm.toLowerCase()))

  if (loading) {
    return (
      <div className="flex h-screen bg-background items-center justify-center">
        <p className="text-foreground">Loading team members...</p>
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
              <h1 className="text-2xl font-bold text-foreground">Team Management</h1>
              <p className="text-sm text-muted-foreground">Manage team members and workload</p>
            </div>
            <Button onClick={() => setIsAddOpen(true)} className="bg-primary hover:bg-primary/90 flex items-center gap-2">
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
                        <td className="py-3 px-4 text-sm text-foreground capitalize">{member.role}</td>
                        <td className="py-3 px-4 text-sm text-foreground">{member.email}</td>
                        <td className="py-3 px-4 text-sm font-medium text-foreground">{member.projects || 0}</td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 w-16 bg-secondary rounded-full h-2">
                              <div
                                className={`h-2 rounded-full transition-all ${
                                  (member.workload || 0) > 85
                                    ? "bg-destructive"
                                    : (member.workload || 0) > 70
                                      ? "bg-accent"
                                      : "bg-chart-3"
                                }`}
                                style={{ width: `${member.workload || 0}%` }}
                              />
                            </div>
                            <span className="text-xs font-medium text-foreground w-8 text-right">
                              {member.workload || 0}%
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className={`h-7 text-xs ${member.status === 'Active' ? 'bg-chart-3/20 text-chart-3' : 'bg-muted/20 text-muted-foreground'}`}
                            onClick={() => handleStatusToggle(member.id, member.status)}
                          >
                            {member.status}
                          </Button>
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

          {/* Add Member Dialog */}
          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Team Member</DialogTitle>
                <DialogDescription>
                  Create a new account for a Project Manager or Developer.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Full Name</label>
                  <Input
                    placeholder="Jane Doe"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Email</label>
                  <Input
                    type="email"
                    placeholder="jane@example.com"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Password</label>
                  <Input
                    type="password"
                    placeholder="••••••••"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Role</label>
                  <Select onValueChange={setNewRole} value={newRole}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="developer">Developer</SelectItem>
                      <SelectItem value="pm">Project Manager</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddOpen(false)}>Cancel</Button>
                <Button onClick={handleAddMember} disabled={addLoading || !newName || !newEmail || !newPassword}>
                  {addLoading ? "Creating..." : "Create Account"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  )
}