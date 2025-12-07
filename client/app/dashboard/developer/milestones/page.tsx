"use client"

import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { Sidebar } from "@/components/layout/sidebar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { CheckCircle, Flag } from "lucide-react"
import Link from "next/link"
import { useState, useEffect } from "react"

interface Milestone {
  id: number;
  name: string;
  project: string;
  status: string;
  dueDate: string;
  priority: string;
}

export default function MilestonesPage() {
  const { user, isLoggedIn } = useAuth()
  const router = useRouter()
  const [currentPath] = useState("/dashboard/developer/milestones")

  const [milestones, setMilestones] = useState<Milestone[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!isLoggedIn || user?.role !== "developer") {
      router.push("/")
      return
    }

    const fetchMilestones = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/developer-milestones?userId=${user?.id}`)
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        const data = await response.json()
        setMilestones(data)
      } catch (err) {
        console.error("Failed to fetch developer milestones:", err)
        setError("Failed to load milestones.")
      } finally {
        setLoading(false)
      }
    }

    if (user?.id) {
      fetchMilestones()
    }
  }, [isLoggedIn, user?.role, user?.id, router])

  if (!isLoggedIn || user?.role !== "developer") {
    return null
  }

  const getStatusColor = (status: string) => {
    return status.toLowerCase() === "done" ? "text-chart-3" : "text-muted-foreground";
  }

  if (loading) return <div className="flex h-screen bg-background items-center justify-center"><p className="text-foreground">Loading milestones...</p></div>
  if (error) return <div className="flex h-screen bg-background items-center justify-center"><p className="text-destructive">{error}</p></div>

  return (
    <div className="flex h-screen bg-background">
      <Sidebar currentPath={currentPath} />
      <div className="flex-1 overflow-auto">
        <div className="bg-card border-b border-border sticky top-0 z-10">
          <div className="px-8 py-4">
            <h1 className="text-2xl font-bold text-foreground">Milestones</h1>
            <p className="text-sm text-muted-foreground">Key project deliverables</p>
          </div>
        </div>
        <div className="p-8">
          <div className="space-y-3">
            {milestones.length === 0 ? <p className="text-muted-foreground">No milestones found.</p> : milestones.map((milestone) => (
              <Card key={milestone.id} className="bg-card border border-border">
                <CardContent className="pt-6 flex justify-between items-center">
                  <div className="flex gap-4">
                    <Flag className={getStatusColor(milestone.status)} size={24} />
                    <div>
                      <p className="font-bold text-foreground">{milestone.name}</p>
                      <p className="text-sm text-muted-foreground">{milestone.project}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`px-2 py-1 rounded text-xs font-medium bg-secondary text-foreground`}>{milestone.status}</span>
                    <p className="text-xs text-muted-foreground mt-1">Due: {milestone.dueDate}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          <Link href="/dashboard/developer">
            <Button variant="outline" className="mt-8 bg-secondary border-border">← Back</Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
