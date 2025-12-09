"use client"
import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { Sidebar } from "@/components/layout/sidebar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, Clock, Users, Plus } from "lucide-react"
import Link from "next/link"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import jsPDF from "jspdf"
import html2canvas from "html2canvas"

interface Meeting {
  id: number;
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  attendees: number;
  type: string;
  location: string;
  mom?: string;
}

interface Project {
  id: number;
  title: string;
  client_name: string;
}

interface Developer {
  id: number;
  name: string;
  email: string;
}

export default function PMMeetingsPage() {
  const { user, isLoggedIn } = useAuth()
  const router = useRouter()
  const [currentPath] = useState("/dashboard/pm/meetings")

  const [meetings, setMeetings] = useState<Meeting[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // MoM State
  const [showMomDialog, setShowMomDialog] = useState(false)
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null)
  const [momText, setMomText] = useState("")

  // Schedule Meeting Dialog
  const [showScheduleDialog, setShowScheduleDialog] = useState(false)
  const [myProjects, setMyProjects] = useState<Project[]>([])
  const [projectDevelopers, setProjectDevelopers] = useState<Developer[]>([])
  
  // Form State
  const [selectedProjectId, setSelectedProjectId] = useState<string>("")
  const [meetingSubject, setMeetingSubject] = useState("")
  const [meetingDate, setMeetingDate] = useState("")
  const [meetingStartTime, setMeetingStartTime] = useState("")
  const [meetingEndTime, setMeetingEndTime] = useState("")
  const [selectedDeveloperIds, setSelectedDeveloperIds] = useState<string[]>([])
  const [includeClient, setIncludeClient] = useState(false)

  const fetchMeetings = async () => {
    if (!user?.id) return
    try {
      setLoading(true)
      const response = await fetch(`/api/pm-meetings?userId=${user.id}`)
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
      const data = await response.json()
      // Ensure data matches Meeting interface
      // API returns: id, title, date (formatted), startTime (formatted), endTime (formatted), attendees, status
      // We map API response to local state.
      // API: { id, title, date, startTime, endTime, attendees, status, ... }
      const mappedMeetings = data.map((m: any) => ({
          ...m,
          // If API returns different keys, map them here. Currently aligned.
      }))
      setMeetings(mappedMeetings)
    } catch (err) {
      console.error("Failed to fetch PM meetings:", err)
      setError("Failed to load meetings.")
    } finally {
      setLoading(false)
    }
  }

  const fetchProjects = async () => {
    if (!user?.id) return
    try {
      const res = await fetch(`/api/pm-meetings/projects?userId=${user.id}`)
      if (res.ok) {
        const data = await res.json()
        setMyProjects(data)
      }
    } catch (err) {
      console.error("Error fetching projects", err)
    }
  }

  useEffect(() => {
    if (!isLoggedIn || user?.role !== "pm") {
      router.push("/")
      return
    }
    fetchMeetings()
    fetchProjects()
  }, [isLoggedIn, user?.role, user?.id, router])

  // Fetch developers when a project is selected
  useEffect(() => {
    if (selectedProjectId) {
      const fetchDevs = async () => {
        try {
          const res = await fetch(`/api/pm-meetings/developers?projectId=${selectedProjectId}`)
          if (res.ok) {
            const data = await res.json()
            setProjectDevelopers(data)
            setSelectedDeveloperIds([]) // Reset selections
          }
        } catch (err) {
          console.error("Error fetching developers", err)
        }
      }
      fetchDevs()
    } else {
        setProjectDevelopers([])
    }
  }, [selectedProjectId])

  const handleDeveloperToggle = (devId: string) => {
    setSelectedDeveloperIds(prev => 
      prev.includes(devId) ? prev.filter(id => id !== devId) : [...prev, devId]
    )
  }

  const handleScheduleMeeting = async () => {
    if (!selectedProjectId || !meetingSubject || !meetingDate || !meetingStartTime || !meetingEndTime) {
        alert("Please fill in all required fields.")
        return
    }

    try {
        const res = await fetch("/api/pm-meetings/create", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                proposalId: selectedProjectId,
                creatorId: user?.id,
                subject: meetingSubject,
                scheduledDate: meetingDate,
                startTime: meetingStartTime,
                endTime: meetingEndTime,
                developerIds: selectedDeveloperIds,
                includeClient: includeClient
            })
        })

        if (res.ok) {
            setShowScheduleDialog(false)
            setMeetingSubject("")
            setMeetingDate("")
            setMeetingStartTime("")
            setMeetingEndTime("")
            setSelectedProjectId("")
            setSelectedDeveloperIds([])
            setIncludeClient(false)
            fetchMeetings()
        } else {
            alert("Failed to schedule meeting.")
        }
    } catch (err) {
        console.error("Error scheduling meeting:", err)
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
        fetchMeetings() // Refresh list
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
    const textLines = pdf.splitTextToSize(`Date: ${selectedMeeting.date}\nTime: ${selectedMeeting.startTime} - ${selectedMeeting.endTime}\nAttendees: ${selectedMeeting.attendees || 'N/A'}\nLocation: ${selectedMeeting.location || 'N/A'}\n\n${selectedMeeting.mom}`, pageWidth);
    pdf.text(textLines, margin, margin + 20);

    pdf.save(`MoM_${selectedMeeting.id}.pdf`);
  };

  const openMomDialog = (meeting: Meeting) => {
    setSelectedMeeting(meeting)
    setMomText(meeting.mom || "")
    setShowMomDialog(true)
  }

  if (!isLoggedIn || user?.role !== "pm") {
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
        <div className="bg-card border-b border-border sticky top-0 z-10">
          <div className="px-8 py-4 flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Meetings & MoM</h1>
              <p className="text-sm text-muted-foreground">Schedule meetings and manage minutes of meeting</p>
            </div>
            <Button onClick={() => setShowScheduleDialog(true)} className="bg-primary hover:bg-primary/90 flex items-center gap-2">
                <Plus size={20} /> Schedule Meeting
            </Button>
          </div>
        </div>

        <div className="p-8">
          <div className="space-y-4">
            {meetings.length === 0 ? (
              <p className="text-muted-foreground">No meetings found for this Project Manager.</p>
            ) : (
              meetings.map((meeting) => (
                <Card key={meeting.id} className="bg-card border border-border hover:border-primary/50 transition-colors">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                        <div className="flex-1">
                            <h3 className="font-bold text-foreground text-lg">{meeting.title}</h3>
                            
                            <div className="flex flex-wrap gap-4 mt-4 text-sm">
                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <Calendar size={16} />
                                    {meeting.date}
                                </div>
                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <Clock size={16} />
                                    {meeting.startTime} - {meeting.endTime}
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
              ))
            )}
          </div>

          <Link href="/dashboard/pm">
            <Button variant="outline" className="mt-8 bg-secondary border-border">
              ← Back
            </Button>
          </Link>
        </div>

        <Dialog open={showScheduleDialog} onOpenChange={setShowScheduleDialog}>
            <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Schedule Meeting</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label>Project</Label>
                        <Select value={selectedProjectId} onValueChange={setSelectedProjectId}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select Project" />
                            </SelectTrigger>
                            <SelectContent>
                                {myProjects.map(p => (
                                    <SelectItem key={p.id} value={p.id.toString()}>{p.title} ({p.client_name})</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label>Subject</Label>
                        <Input 
                            placeholder="Meeting Subject" 
                            value={meetingSubject}
                            onChange={(e) => setMeetingSubject(e.target.value)}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Date</Label>
                            <Input 
                                type="date"
                                value={meetingDate}
                                onChange={(e) => setMeetingDate(e.target.value)}
                            />
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Start Time</Label>
                            <Input 
                                type="time"
                                value={meetingStartTime}
                                onChange={(e) => setMeetingStartTime(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>End Time</Label>
                            <Input 
                                type="time"
                                value={meetingEndTime}
                                onChange={(e) => setMeetingEndTime(e.target.value)}
                            />
                        </div>
                    </div>

                    {selectedProjectId && (
                        <div className="space-y-2 border-t pt-2 mt-2">
                            <Label>Attendees</Label>
                            
                            <div className="flex items-center space-x-2 mb-2 p-2 bg-secondary/30 rounded">
                                <Checkbox 
                                    id="includeClient" 
                                    checked={includeClient}
                                    onCheckedChange={(c) => setIncludeClient(c as boolean)}
                                />
                                <Label htmlFor="includeClient" className="cursor-pointer">Invite Client</Label>
                            </div>

                            <Label className="text-xs text-muted-foreground">Select Developers:</Label>
                            <div className="max-h-32 overflow-y-auto space-y-2 border rounded p-2">
                                {projectDevelopers.length === 0 ? (
                                    <p className="text-xs text-muted-foreground">No developers found for this project.</p>
                                ) : (
                                    projectDevelopers.map(dev => (
                                        <div key={dev.id} className="flex items-center space-x-2">
                                            <Checkbox 
                                                id={`dev-${dev.id}`}
                                                checked={selectedDeveloperIds.includes(dev.id.toString())}
                                                onCheckedChange={() => handleDeveloperToggle(dev.id.toString())}
                                            />
                                            <Label htmlFor={`dev-${dev.id}`} className="text-sm cursor-pointer">{dev.name}</Label>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    )}
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setShowScheduleDialog(false)}>Cancel</Button>
                    <Button onClick={handleScheduleMeeting}>Schedule</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>

        {showMomDialog && selectedMeeting && (
             <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                <Card className="w-full max-w-lg bg-card border border-border">
                    <CardHeader>
                        <CardTitle className="text-foreground">Minutes of Meeting - {selectedMeeting.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Textarea
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
      </div>
    </div>
  )
}