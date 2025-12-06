"use client"

import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { Sidebar } from "@/components/layout/sidebar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Plus, Calendar, Clock, Users } from "lucide-react"
import Link from "next/link"
import { useState, useEffect } from "react" // Import useEffect

interface Meeting {
  id: number;
  title: string;
  date: string;
  time: string;
  attendees: number;
  type: string;
  location: string;
}

export default function MeetingsPage() {
  const { user, isLoggedIn } = useAuth()
  const router = useRouter()
  const [currentPath] = useState("/dashboard/admin/meetings")
  const [showForm, setShowForm] = useState(false)

  const [meetings, setMeetings] = useState<Meeting[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!isLoggedIn || user?.role !== "admin") {
      router.push("/")
      return
    }

    const fetchMeetings = async () => {
      try {
        setLoading(true)
        const response = await fetch("/api/meetings")
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        const data = await response.json()
        setMeetings(data)
      } catch (err) {
        console.error("Failed to fetch meetings:", err)
        setError("Failed to load meetings.")
      } finally {
        setLoading(false)
      }
    }

    fetchMeetings()
  }, [isLoggedIn, user?.role, router])

  if (!isLoggedIn || user?.role !== "admin") {
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
              <h1 className="text-2xl font-bold text-foreground">Meetings & MoM</h1>
              <p className="text-sm text-muted-foreground">Schedule meetings and manage minutes of meeting</p>
            </div>
            <Button
              onClick={() => setShowForm(!showForm)}
              className="bg-primary hover:bg-primary/90 flex items-center gap-2"
            >
              <Plus size={20} />
              Schedule Meeting
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <div className="p-8">
          {/* Schedule Form */}
          {showForm && (
            <Card className="bg-card border border-border mb-8">
              <CardHeader>
                <CardTitle className="text-foreground">Schedule New Meeting</CardTitle>
              </CardHeader>
              <CardContent>
                <form className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input placeholder="Meeting Title" className="bg-secondary border-border" />
                  <Input type="date" className="bg-secondary border-border" />
                  <Input type="time" className="bg-secondary border-border" />
                  <select className="px-4 py-2 bg-secondary border border-border rounded-lg text-foreground">
                    <option>Meeting Type</option>
                    <option>Client Meeting</option>
                    <option>Internal</option>
                    <option>Project Review</option>
                  </select>
                  <Input placeholder="Location / Meeting Link" className="bg-secondary border-border md:col-span-2" />
                  <div className="md:col-span-2 flex gap-2">
                    <Button type="submit" className="bg-primary hover:bg-primary/90">
                      Schedule
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowForm(false)}
                      className="bg-secondary border-border"
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Upcoming Meetings */}
          <div className="space-y-4">
            {meetings.map((meeting) => (
              <Card key={meeting.id} className="bg-card border border-border hover:border-primary/50 transition-colors">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-bold text-foreground text-lg">{meeting.title}</h3>
                      <p className="text-sm text-muted-foreground mt-1">{meeting.type}</p>

                      <div className="flex flex-wrap gap-4 mt-4 text-sm">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Calendar size={16} />
                          {meeting.date}
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Clock size={16} />
                          {meeting.time}
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Users size={16} />
                          {meeting.attendees} attendees
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="bg-secondary border-border hover:bg-secondary/80">
                        Join
                      </Button>
                      <Button size="sm" variant="outline" className="bg-secondary border-border hover:bg-secondary/80">
                        MoM
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Navigation */}
          <div className="mt-8 flex gap-2">
            <Link href="/dashboard/admin">
              <Button variant="outline" className="bg-secondary border-border">
                ← Back
              </Button>
            </Link>
            <Link href="/dashboard/admin/reports">
              <Button variant="outline" className="bg-secondary border-border">
                View Reports →
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}