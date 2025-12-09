"use client"

import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { Sidebar } from "@/components/layout/sidebar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Plus, Calendar, Clock, Users } from "lucide-react"
import Link from "next/link"
import jsPDF from "jspdf"
import html2canvas from "html2canvas"
import { useState, useEffect } from "react" // Import useEffect
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"

interface Meeting {
  id: number;
  title: string;
  date: string;
  time: string;
  attendees: number;
  type: string;
  status: string;
  project: string;
  mom?: string;
}

export default function MeetingsPage() {
  const { user, isLoggedIn } = useAuth()
  const router = useRouter()
  const [currentPath] = useState("/dashboard/admin/meetings")
  const [showForm, setShowForm] = useState(false)
  const [showMomDialog, setShowMomDialog] = useState(false)
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null)
  const [momText, setMomText] = useState("")

  const [meetings, setMeetings] = useState<Meeting[]>([])
  const [projects, setProjects] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Form State
  const [formData, setFormData] = useState({
    title: "",
    date: "",
    time: "",
    proposalId: "",
    includeClient: false,
    location: ""
  })

  useEffect(() => {
    if (!isLoggedIn || user?.role !== "admin") {
      router.push("/")
      return
    }

    const fetchData = async () => {
      try {
        setLoading(true)
        const [meetingsRes, projectsRes] = await Promise.all([
          fetch("/api/meetings"),
          fetch("/api/admin/meetings/projects")
        ])

        if (!meetingsRes.ok || !projectsRes.ok) {
          throw new Error("Failed to fetch data")
        }

        const meetingsData = await meetingsRes.json()
        const projectsData = await projectsRes.json()

        setMeetings(meetingsData)
        setProjects(projectsData)
      } catch (err) {
        console.error("Failed to fetch meetings:", err)
        setError("Failed to load data.")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [isLoggedIn, user?.role, router])

  const handleSchedule = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await fetch("/api/meetings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          type: "scrum", // Defaulting to scrum as types are removed
          userId: user?.id,
          subject: formData.title + (formData.location ? ` - ${formData.location}` : "")
        })
      })

      if (res.ok) {
        setShowForm(false)
        setFormData({
            title: "",
            date: "",
            time: "",
            proposalId: "",
            includeClient: false,
            location: ""
        })
        // Refresh meetings
        const meetingsRes = await fetch("/api/meetings")
        const meetingsData = await meetingsRes.json()
        setMeetings(meetingsData)
      } else {
        alert("Failed to schedule meeting")
      }
    } catch (err) {
      console.error(err)
      alert("Error scheduling meeting")
    }
  }

  const handleSaveMom = async () => {
    if (!selectedMeeting) return
    try {
      const res = await fetch("/api/meetings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          meetingId: selectedMeeting.id,
          mom: momText
        })
      })

      if (res.ok) {
        setShowMomDialog(false)
        setSelectedMeeting(null)
        setMomText("")
        // Refresh meetings
        const meetingsRes = await fetch("/api/meetings")
        const meetingsData = await meetingsRes.json()
        setMeetings(meetingsData)
      } else {
        alert("Failed to save MoM")
      }
    } catch (err) {
      console.error(err)
      alert("Error saving MoM")
    }
  }

  const handleDownloadMomPdf = async () => {
    if (!selectedMeeting || !selectedMeeting.mom) {
      alert("No Minutes of Meeting to download.");
      return;
    }

    const pdf = new jsPDF();
    const margin = 10;
    const pageWidth = pdf.internal.pageSize.width - 2 * margin;

    pdf.setFontSize(18);
    pdf.text(`Minutes of Meeting: ${selectedMeeting.title}`, margin, margin + 5);

    pdf.setFontSize(12);
    const textLines = pdf.splitTextToSize(`Date: ${selectedMeeting.date}\nTime: ${selectedMeeting.time}\nProject: ${selectedMeeting.project || 'N/A'}\n\n${selectedMeeting.mom}`, pageWidth);
    pdf.text(textLines, margin, margin + 20);

    pdf.save(`MoM_${selectedMeeting.id}.pdf`);
  };

  const openMomDialog = (meeting: Meeting) => {
    setSelectedMeeting(meeting)
    setMomText(meeting.mom || "")
    setShowMomDialog(true)
  }

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
          {/* Schedule Dialog */}
          <Dialog open={showForm} onOpenChange={setShowForm}>
            <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Schedule New Meeting</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Meeting Title</Label>
                    <Input 
                      placeholder="Meeting Title" 
                      value={formData.title}
                      onChange={(e) => setFormData({...formData, title: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Project</Label>
                    <Select 
                      value={formData.proposalId}
                      onValueChange={(val) => setFormData({...formData, proposalId: val})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select Project" />
                      </SelectTrigger>
                      <SelectContent>
                        {projects.map((p) => (
                            <SelectItem key={p.id} value={p.id.toString()}>{p.title} ({p.client_name})</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Date</Label>
                      <Input 
                        type="date" 
                        value={formData.date}
                        onChange={(e) => setFormData({...formData, date: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Time</Label>
                      <Input 
                        type="time" 
                        value={formData.time}
                        onChange={(e) => setFormData({...formData, time: e.target.value})}
                      />
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 p-2 bg-secondary/30 rounded">
                    <Checkbox 
                        id="includeClient" 
                        checked={formData.includeClient}
                        onCheckedChange={(c) => setFormData({...formData, includeClient: c as boolean})}
                    />
                    <Label htmlFor="includeClient" className="cursor-pointer">Include Client?</Label>
                  </div>
                  <div className="space-y-2">
                    <Label>Location / Link</Label>
                    <Input 
                      placeholder="Location / Meeting Link" 
                      value={formData.location}
                      onChange={(e) => setFormData({...formData, location: e.target.value})}
                    />
                  </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
                <Button onClick={handleSchedule as any}>Schedule</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* MoM Dialog */}
          {showMomDialog && selectedMeeting && (
             <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                <Card className="w-full max-w-lg bg-card border border-border">
                    <CardHeader>
                        <CardTitle className="text-foreground">Minutes of Meeting - {selectedMeeting.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <textarea
                            className="w-full h-40 p-2 bg-secondary border border-border rounded-md text-foreground"
                            placeholder="Enter minutes of meeting..."
                            value={momText}
                            onChange={(e) => setMomText(e.target.value)}
                        />
                        <div className="flex justify-end gap-2 mt-4">
                            <Button variant="outline" onClick={() => setShowMomDialog(false)}>Cancel</Button>
                            <Button variant="outline" onClick={handleDownloadMomPdf}>Download PDF</Button>
                            <Button onClick={handleSaveMom}>Save</Button>
                        </div>
                    </CardContent>
                </Card>
             </div>
          )}

          {/* Upcoming Meetings */}
          <div className="space-y-4">
            {meetings.map((meeting) => (
              <Card key={meeting.id} className="bg-card border border-border hover:border-primary/50 transition-colors">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                            meeting.status === 'scheduled' ? 'bg-primary/20 text-primary' : 
                            meeting.status === 'completed' ? 'bg-chart-3/20 text-chart-3' : 'bg-muted text-muted-foreground'
                        }`}>
                            {meeting.status}
                        </span>
                        <span className="text-xs text-muted-foreground border border-border px-2 py-1 rounded">
                            {meeting.type}
                        </span>
                      </div>
                      <h3 className="font-bold text-foreground text-lg">{meeting.title}</h3>
                      {meeting.project && (
                          <p className="text-sm text-muted-foreground mt-1">Project: {meeting.project}</p>
                      )}

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
                      {meeting.mom && (
                          <div className="mt-4 p-2 bg-secondary/50 rounded text-sm text-muted-foreground">
                              <strong>MoM:</strong> {meeting.mom.substring(0, 100)}...
                          </div>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="bg-secondary border-border hover:bg-secondary/80"
                        onClick={() => openMomDialog(meeting)}
                      >
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