"use client"

import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { Sidebar } from "@/components/layout/sidebar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, Clock, Users } from "lucide-react"
import Link from "next/link"
import { useState, useEffect } from "react"

interface Meeting {
  id: number;
  title: string;
  date: string;
  time: string;
  type: string; // Type is still returned by API even if we don't display it prominently
  location: string;
}

export default function ClientMeetingsPage() {
  const { user, isLoggedIn } = useAuth()
  const router = useRouter()
  const [currentPath] = useState("/dashboard/client/meetings")

  const [meetings, setMeetings] = useState<Meeting[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!isLoggedIn || user?.role !== "client") {
      router.push("/")
      return
    }

    const fetchMeetings = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/client-meetings?userId=${user?.id}`)
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        const data = await response.json()
        setMeetings(data)
      } catch (err) {
        console.error("Failed to fetch client meetings:", err)
        setError("Failed to load meetings.")
      } finally {
        setLoading(false)
      }
    }

    if (user?.id) {
      fetchMeetings()
    }
  }, [isLoggedIn, user?.role, user?.id, router])

  if (!isLoggedIn || user?.role !== "client") {
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
          <div className="px-8 py-4 flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-foreground">My Meetings</h1>
              <p className="text-sm text-muted-foreground">Upcoming meetings you are invited to</p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="p-8">
          <div className="space-y-4">
            {meetings.length === 0 ? (
              <p className="text-muted-foreground">No upcoming meetings found.</p>
            ) : (
              meetings.map((meeting) => (
                <Card key={meeting.id} className="bg-card border border-border">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-bold text-foreground text-lg">{meeting.title}</h3>
                        {/* Hidden type display as per previous refactor */}
                        
                        <div className="flex flex-wrap gap-4 mt-4 text-sm">
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Calendar size={16} />
                            {meeting.date}
                          </div>
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Clock size={16} />
                            {meeting.time}
                          </div>
                          {/* Location or Meeting Link if available */}
                          {meeting.location && (
                              <div className="flex items-center gap-2 text-muted-foreground">
                                  <span className="font-semibold">Location:</span> {meeting.location}
                              </div>
                          )}
                        </div>
                      </div>
                      <Button size="sm" variant="outline" className="bg-secondary border-border hover:bg-secondary/80">
                        Join
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          <Link href="/dashboard/client">
            <Button variant="outline" className="mt-8 bg-secondary border-border">
              ← Back
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
