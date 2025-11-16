"use client"

import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { Sidebar } from "@/components/layout/sidebar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Plus, Calendar, Clock, Users } from "lucide-react"
import Link from "next/link"
import { useState } from "react"

export default function MeetingsPage() {
  const { user, isLoggedIn } = useAuth()
  const router = useRouter()
  const [currentPath] = useState("/dashboard/admin/meetings")
  const [showForm, setShowForm] = useState(false)

  if (!isLoggedIn || user?.role !== "admin") {
    router.push("/")
    return null
  }

  const meetings = [
    {
      id: 1,
      title: "Client Review - Acme Corp",
      date: "2025-02-01",
      time: "2:00 PM",
      attendees: 4,
      type: "Client Meeting",
      location: "Conference Room A",
    },
    {
      id: 2,
      title: "Team Standup",
      date: "2025-02-02",
      time: "10:00 AM",
      attendees: 8,
      type: "Internal",
      location: "Online",
    },
    {
      id: 3,
      title: "Project Review - Portal",
      date: "2025-02-03",
      time: "3:30 PM",
      attendees: 5,
      type: "Project Review",
      location: "Conference Room B",
    },
  ]

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
