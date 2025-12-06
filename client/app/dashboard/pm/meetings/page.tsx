"use client"
import { useState, useEffect } from "react" // Import useEffect
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { Sidebar } from "@/components/layout/sidebar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Calendar, Clock, Users } from "lucide-react"
import Link from "next/link"

interface Meeting {
  id: number;
  title: string;
  date: string;
  time: string;
  attendees: number;
}

export default function PMMeetingsPage() {
  const { user, isLoggedIn } = useAuth()
  const router = useRouter()
  const [currentPath] = useState("/dashboard/pm/meetings")

  const [meetings, setMeetings] = useState<Meeting[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!isLoggedIn || user?.role !== "pm") {
      router.push("/")
      return
    }

    const fetchMeetings = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/pm-meetings?userId=${user?.id}`)
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        const data = await response.json()
        setMeetings(data)
      } catch (err) {
        console.error("Failed to fetch PM meetings:", err)
        setError("Failed to load meetings.")
      } finally {
        setLoading(false)
      }
    }

    if (user?.id) { // Only fetch if user ID is available
      fetchMeetings()
    }
  }, [isLoggedIn, user?.role, user?.id, router])

  if (!isLoggedIn || user?.role !== "pm") {
    router.push("/")
    return null
  }

  if (loading) {
    return (
      <div className="flex h-screen bg-background items-center justify-center">
        <p className="text-foreground">Loading meetings...</p>
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
            <h1 className="text-2xl font-bold text-foreground">Meetings</h1>
            <p className="text-sm text-muted-foreground">Upcoming project meetings</p>
          </div>
        </div>

        {/* Main Content */}
        <div className="p-8">
          <div className="space-y-4">
            {meetings.length === 0 ? (
              <p className="text-muted-foreground">No meetings found for this Project Manager.</p>
            ) : (
              meetings.map((meeting) => (
                <Card key={meeting.id} className="bg-card border border-border">
                  <CardContent className="pt-6">
                    <h3 className="font-bold text-foreground mb-3">{meeting.title}</h3>
                    <div className="flex gap-6">
                      <div className="flex items-center gap-2 text-muted-foreground text-sm">
                        <Calendar size={16} />
                        {meeting.date}
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground text-sm">
                        <Clock size={16} />
                        {meeting.time}
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground text-sm">
                        <Users size={16} /> {/* Assuming Users icon for attendees */}
                        {meeting.attendees} attendees
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
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
