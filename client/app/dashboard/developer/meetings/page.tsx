"use client"

import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { Sidebar } from "@/components/layout/sidebar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Calendar, Clock, MapPin } from "lucide-react"
import Link from "next/link"
import { useState, useEffect } from "react"

interface Meeting {
  id: number;
  title: string;
  date: string;
  time: string;
  type: string;
  location: string;
}

export default function MeetingsPage() {
  const { user, isLoggedIn } = useAuth()
  const router = useRouter()
  const [currentPath] = useState("/dashboard/developer/meetings")

  const [meetings, setMeetings] = useState<Meeting[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!isLoggedIn || user?.role !== "developer") {
      router.push("/")
      return
    }

    const fetchMeetings = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/developer-meetings?userId=${user?.id}`)
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        const data = await response.json()
        setMeetings(data)
      } catch (err) {
        console.error("Failed to fetch developer meetings:", err)
        setError("Failed to load meetings.")
      } finally {
        setLoading(false)
      }
    }

    if (user?.id) {
      fetchMeetings()
    }
  }, [isLoggedIn, user?.role, user?.id, router])

  if (!isLoggedIn || user?.role !== "developer") {
    return null
  }

  if (loading) return <div className="flex h-screen bg-background items-center justify-center"><p className="text-foreground">Loading meetings...</p></div>
  if (error) return <div className="flex h-screen bg-background items-center justify-center"><p className="text-destructive">{error}</p></div>

  return (
    <div className="flex h-screen bg-background">
      <Sidebar currentPath={currentPath} />
      <div className="flex-1 overflow-auto">
        <div className="bg-card border-b border-border sticky top-0 z-10">
          <div className="px-8 py-4">
            <h1 className="text-2xl font-bold text-foreground">Meetings</h1>
            <p className="text-sm text-muted-foreground">Upcoming project meetings</p>
          </div>
        </div>
        <div className="p-8">
          <div className="space-y-3">
            {meetings.length === 0 ? <p className="text-muted-foreground">No meetings found.</p> : meetings.map((meeting) => (
              <Card key={meeting.id} className="bg-card border border-border">
                <CardContent className="pt-6">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-foreground">{meeting.title}</h3>
                    <span className="text-xs bg-secondary px-2 py-1 rounded text-muted-foreground">{meeting.type}</span>
                  </div>
                  <div className="flex gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1"><Calendar size={14} /> {meeting.date}</div>
                    <div className="flex items-center gap-1"><Clock size={14} /> {meeting.time}</div>
                    <div className="flex items-center gap-1"><MapPin size={14} /> {meeting.location}</div>
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
