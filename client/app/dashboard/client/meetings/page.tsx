"use client"
import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { Sidebar } from "@/components/layout/sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar } from "lucide-react"

interface Meeting {
  id: number;
  title: string;
  date: string;
  time: string;
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
        <div className="bg-card border-b border-border sticky top-0 z-10">
          <div className="px-8 py-4">
            <h1 className="text-2xl font-bold text-foreground">My Meetings</h1>
            <p className="text-sm text-muted-foreground">Your scheduled meetings</p>
          </div>
        </div>

        <div className="p-8">
          <div className="space-y-4">
            {meetings.length === 0 ? (
              <p className="text-muted-foreground">No meetings scheduled.</p>
            ) : (
              meetings.map((meeting) => (
                <Card key={meeting.id} className="bg-card border border-border">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-4">
                      <Calendar className="text-primary" size={24} />
                      <div>
                        <p className="font-semibold text-foreground">{meeting.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {meeting.date} at {meeting.time}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Location: {meeting.location}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
