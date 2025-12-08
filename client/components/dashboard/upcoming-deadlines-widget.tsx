"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, Calendar } from "lucide-react"
import { useEffect, useState } from "react"

interface Deadline {
  id: number;
  title: string;
  date: string;
  project: string;
  type: 'task' | 'milestone' | 'project';
}

export function UpcomingDeadlinesWidget({ userId, role }: { userId: number; role: string }) {
  const [deadlines, setDeadlines] = useState<Deadline[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchDeadlines = async () => {
      try {
        // Logic:
        // PM: Projects ending soon, Milestones ending soon.
        // Developer: Tasks ending soon.
        
        let items: Deadline[] = []

        if (role === 'pm') {
            const [projRes, mileRes] = await Promise.all([
                fetch(`/api/pm-projects?userId=${userId}`),
                fetch(`/api/pm-milestones?userId=${userId}`)
            ])
            
            if (projRes.ok) {
                const projs = await projRes.json()
                // Filter active and map
                items.push(...projs.filter((p: any) => p.status === 'active' || p.status === 'in_progress').map((p: any) => ({
                    id: p.id, title: p.name, date: p.deadline, project: p.name, type: 'project'
                })))
            }
            if (mileRes.ok) {
                const miles = await mileRes.json()
                // Filter active
                items.push(...miles.filter((m: any) => m.status !== 'done').map((m: any) => ({
                    id: m.id, title: m.name, date: m.dueDate, project: m.project, type: 'milestone'
                })))
            }
        } else if (role === 'developer') {
            const taskRes = await fetch(`/api/developer-tasks?userId=${userId}`)
            if (taskRes.ok) {
                const tasks = await taskRes.json()
                // Filter active
                items.push(...tasks.filter((t: any) => t.status !== 'done').map((t: any) => ({
                    id: t.id, title: t.title, date: t.due, project: t.project, type: 'task'
                })))
            }
        }

        // Sort by date and take top 5
        items.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        const upcoming = items.filter(i => new Date(i.date) >= new Date()).slice(0, 5)
        
        setDeadlines(upcoming)

      } catch (err) {
        console.error("Error fetching deadlines widget", err)
      } finally {
        setLoading(false)
      }
    }

    if (userId) fetchDeadlines()
  }, [userId, role])

  if (loading) return <p className="text-xs text-muted-foreground">Loading...</p>

  return (
    <Card className="bg-card border border-border h-full">
      <CardHeader>
        <CardTitle className="text-lg text-foreground">Upcoming Deadlines</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {deadlines.length === 0 ? (
            <p className="text-sm text-muted-foreground">No upcoming deadlines.</p>
          ) : (
            deadlines.map((d, i) => (
              <div key={`${d.type}-${d.id}-${i}`} className="flex items-center justify-between p-2 bg-secondary/30 rounded border-l-2 border-destructive">
                <div>
                  <p className="font-medium text-sm text-foreground">{d.title}</p>
                  <p className="text-xs text-muted-foreground">{d.project} ({d.type})</p>
                </div>
                <span className="text-xs font-semibold text-destructive">{d.date}</span>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}
