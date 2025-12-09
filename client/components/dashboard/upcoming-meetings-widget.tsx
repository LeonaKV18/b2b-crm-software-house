"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, Clock, MapPin } from "lucide-react"
import { useEffect, useState } from "react"

interface Meeting {
  id: number;
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  location: string;
}

export function UpcomingMeetingsWidget({ userId, role }: { userId: number; role: string }) {
  const [meetings, setMeetings] = useState<Meeting[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchMeetings = async () => {
      try {
        // Determine correct API endpoint based on role
        // reusing existing logic:
        // Admin: /api/meetings (need to filter by user?)
        // PM: /api/pm-meetings
        // Dev: /api/developer-meetings
        // Client: /api/client-meetings
        // Actually, generic /api/meetings could potentially serve all if modified, 
        // but for now let's use the specific ones we built.
        
        let endpoint = ""
        if (role === 'admin') endpoint = "/api/meetings" // Admin sees all? Or should see their own? Let's assume their own/all.
        else if (role === 'pm') endpoint = `/api/pm-meetings?userId=${userId}`
        else if (role === 'developer') endpoint = `/api/developer-meetings?userId=${userId}`
        else if (role === 'client') endpoint = `/api/client-meetings?userId=${userId}`

        const res = await fetch(endpoint)
        if (res.ok) {
          const data = await res.json()
          // Filter for upcoming (today onwards) and take top 3
          const today = new Date()
          today.setHours(0, 0, 0, 0)
          
          const upcoming = data
            .map((m: any) => ({
                ...m,
                startTime: m.startTime || m.starttime,
                endTime: m.endTime || m.endtime
            }))
            .filter((m: any) => {
             const mDate = new Date(m.date) // Assuming date string is parseable
             return mDate >= today
          }).slice(0, 3)
          
          setMeetings(upcoming)
        }
      } catch (err) {
        console.error("Error fetching upcoming meetings widget", err)
      } finally {
        setLoading(false)
      }
    }

    if (userId) fetchMeetings()
  }, [userId, role])

  if (loading) return <p className="text-xs text-muted-foreground">Loading...</p>

  return (
    <Card className="bg-card border border-border h-full">
      <CardHeader>
        <CardTitle className="text-lg text-foreground">Upcoming Meetings</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {meetings.length === 0 ? (
            <p className="text-sm text-muted-foreground">No upcoming meetings.</p>
          ) : (
            meetings.map((m) => (
              <div key={m.id} className="flex items-center justify-between p-2 bg-secondary/30 rounded">
                <div>
                  <p className="font-medium text-sm text-foreground">{m.title}</p>
                  <div className="flex gap-2 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><Calendar size={10}/> {m.date}</span>
                    <span className="flex items-center gap-1"><Clock size={10}/> {m.startTime} - {m.endTime}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}
