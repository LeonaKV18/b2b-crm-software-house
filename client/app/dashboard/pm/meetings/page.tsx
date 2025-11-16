"use client"

import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { Sidebar } from "@/components/layout/sidebar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Calendar, Clock } from "lucide-react"
import Link from "next/link"
import { useState } from "react"

export default function PMMeetingsPage() {
  const { user, isLoggedIn } = useAuth()
  const router = useRouter()
  const [currentPath] = useState("/dashboard/pm/meetings")

  if (!isLoggedIn || user?.role !== "pm") {
    router.push("/")
    return null
  }

  const meetings = [
    { title: "Team Standup", date: "2025-02-02", time: "10:00 AM", attendees: 8 },
    { title: "Project Review", date: "2025-02-03", time: "3:30 PM", attendees: 5 },
  ]

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
            {meetings.map((meeting, idx) => (
              <Card key={idx} className="bg-card border border-border">
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
