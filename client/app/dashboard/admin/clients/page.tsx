"use client"

import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { Sidebar } from "@/components/layout/sidebar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Search, Plus, Eye, Mail, X } from "lucide-react"
import Link from "next/link"
import { useState, useEffect } from "react" // Ensure useEffect is imported

interface Client {
  id: number;
  name: string;
  company: string;
  contact: string;
  status: string;
  email: string;
  phone: string;
  projects: number;
  lastInteraction?: string | null; // allow null/undefined
}

export default function ClientsPage() {
  const { user, isLoggedIn } = useAuth()
  const router = useRouter()
  const [currentPath] = useState("/dashboard/admin/clients")
  const [searchTerm, setSearchTerm] = useState("")
  const [showAddForm, setShowAddForm] = useState(false)
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [showMessageModal, setShowMessageModal] = useState(false)
  const [messageText, setMessageText] = useState("")

  const [clients, setClients] = useState<Client[]>([]) // State for clients data
  const [loading, setLoading] = useState(true) // Loading state
  const [error, setError] = useState<string | null>(null) // Error state
  const [statusFilter, setStatusFilter] = useState("All Status") // Status filter state

  // Form State
  const [newClientName, setNewClientName] = useState("")
  const [newClientCompany, setNewClientCompany] = useState("")
  const [newClientContact, setNewClientContact] = useState("")
  const [newClientEmail, setNewClientEmail] = useState("")
  const [newClientPhone, setNewClientPhone] = useState("")
  const [newClientPassword, setNewClientPassword] = useState("")
  const [newClientStatus, setNewClientStatus] = useState("Active")

  const fetchClients = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/clients")
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data = await response.json()
      // map back-end field(s) safely to lastInteraction (support either snake_case or camelCase or lowercase)
      const normalized = Array.isArray(data)
        ? data.map((c: any) => ({
            ...c,
            lastInteraction: c.lastInteraction ?? c.last_interaction ?? c.lastinteraction ?? null,
          }))
        : []
      setClients(normalized)
    } catch (err) {
      console.error("Failed to fetch clients:", err)
      setError("Failed to load clients.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!isLoggedIn || user?.role !== "admin") {
      router.push("/")
      return
    }
    fetchClients()
  }, [isLoggedIn, user?.role, router])

  if (!isLoggedIn || user?.role !== "admin") {
    return null
  }

  const filtered = clients.filter((c) => {
    const matchesSearch = (c.name || "").toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (c.company || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (c.email || "").toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "All Status" || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  })

  const handleViewDetails = (client: Client) => {
    setSelectedClient(client)
    setShowDetailsModal(true)
  }

  const handleMessage = (client: Client) => {
    setSelectedClient(client)
    setShowMessageModal(true)
  }

  const handleSendMessage = () => {
    if (messageText.trim()) {
      console.log(`Message sent to ${selectedClient?.name}: ${messageText}`)
      setMessageText("")
      setShowMessageModal(false)
    }
  }

  const handleCreateClient = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch("/api/clients/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newClientName,
          company: newClientCompany,
          contact: newClientContact, // Note: The API currently expects 'name' to be the contact person too or splits it. Adjusting to match procedure logic where name is used for user/contact.
          email: newClientEmail,
          phone: newClientPhone,
          password: newClientPassword,
          status: newClientStatus,
        }),
      })

      if (response.ok) {
        setShowAddForm(false)
        setNewClientName("")
        setNewClientCompany("")
        setNewClientContact("")
        setNewClientEmail("")
        setNewClientPhone("")
        setNewClientPassword("")
        setNewClientStatus("Active")
        fetchClients() // Refresh list
      } else {
        const errorData = await response.json()
        alert(`Failed to create client: ${errorData.error}`)
      }
    } catch (err) {
      console.error("Error creating client:", err)
      alert("An error occurred while creating the client.")
    }
  }

  if (loading) {
    return (
      <div className="flex h-screen bg-background items-center justify-center">
        <p className="text-foreground">Loading clients...</p>
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
              <h1 className="text-2xl font-bold text-foreground">Clients</h1>
              <p className="text-sm text-muted-foreground">Manage all clients and relationships</p>
            </div>

          </div>
        </div>

        {/* Main Content */}
        <div className="p-8">
          {/* Add Client Form */}
          {showAddForm && (
            <Card className="bg-card border border-border mb-8">
              <CardHeader>
                <CardTitle className="text-foreground">Add New Client</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCreateClient} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    placeholder="Client Name (User Name)"
                    value={newClientName}
                    onChange={(e) => setNewClientName(e.target.value)}
                    required
                    className="bg-secondary border-border"
                  />
                  <Input
                    placeholder="Company"
                    value={newClientCompany}
                    onChange={(e) => setNewClientCompany(e.target.value)}
                    required
                    className="bg-secondary border-border"
                  />
                  <Input
                    placeholder="Primary Contact (if different)"
                    value={newClientContact}
                    onChange={(e) => setNewClientContact(e.target.value)}
                    className="bg-secondary border-border"
                  />
                  <Input
                    placeholder="Email"
                    type="email"
                    value={newClientEmail}
                    onChange={(e) => setNewClientEmail(e.target.value)}
                    required
                    className="bg-secondary border-border"
                  />
                  <Input
                    placeholder="Phone"
                    value={newClientPhone}
                    onChange={(e) => setNewClientPhone(e.target.value)}
                    className="bg-secondary border-border"
                  />
                  <Input
                    placeholder="Password"
                    type="password"
                    value={newClientPassword}
                    onChange={(e) => setNewClientPassword(e.target.value)}
                    required
                    className="bg-secondary border-border"
                  />
                  <select
                    value={newClientStatus}
                    onChange={(e) => setNewClientStatus(e.target.value)}
                    className="px-4 py-2 bg-secondary border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                  <div className="md:col-span-2 flex gap-2">
                    <Button type="submit" className="bg-primary hover:bg-primary/90">
                      Add Client
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowAddForm(false)}
                      className="bg-secondary border-border"
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Search & Filters */}
          <div className="mb-6 flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
              <Input
                placeholder="Search clients..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-secondary border-border"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 bg-secondary border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="All Status">All Status</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>

          {/* Clients Table */}
          <Card className="bg-card border border-border">
            <CardContent className="pt-6">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b border-border">
                    <tr>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Client Name</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Contact</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Email</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Projects</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Status</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Last Interaction</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((client) => (
                      <tr key={client.id} className="border-b border-border hover:bg-secondary/50 transition-colors">
                        <td className="py-3 px-4">
                          <p className="font-medium text-foreground">{client.name}</p>
                          <p className="text-xs text-muted-foreground">{client.company}</p>
                        </td>
                        <td className="py-3 px-4 text-sm text-foreground">{client.contact}</td>
                        <td className="py-3 px-4 text-sm text-foreground">{client.email}</td>
                        <td className="py-3 px-4 text-sm font-medium text-foreground">{client.projects}</td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${
                              client.status === "Active" ? "bg-green-600 text-white" : "bg-red-600 text-white"
                            }`}
                          >
                            {client.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-sm text-muted-foreground">
                          {client.lastInteraction ? new Date(client.lastInteraction).toLocaleDateString() : "—"}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleMessage(client)}
                              className="p-1 hover:bg-secondary rounded transition-colors"
                            >
                              <Mail size={16} className="text-muted-foreground hover:text-foreground" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Navigation */}
          <div className="mt-8 flex gap-2">
            <Link href="/dashboard/admin">
              <Button variant="outline" className="bg-secondary border-border">
                ← Back
              </Button>
            </Link>
            <Link href="/dashboard/admin/proposals">
              <Button variant="outline" className="bg-secondary border-border">
                View Proposals →
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {showDetailsModal && selectedClient && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="bg-card border border-border max-w-md w-full">
            <CardHeader className="flex flex-row items-center justify-between border-b border-border">
              <CardTitle className="text-foreground">Client Details</CardTitle>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <X size={20} />
              </button>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Name</p>
                <p className="text-foreground font-medium">{selectedClient.name}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Company</p>
                <p className="text-foreground font-medium">{selectedClient.company}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Contact Person</p>
                <p className="text-foreground font-medium">{selectedClient.contact}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Email</p>
                <p className="text-foreground font-medium">{selectedClient.email}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Phone</p>
                <p className="text-foreground font-medium">{selectedClient.phone}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Active Projects</p>
                <p className="text-foreground font-medium">{selectedClient.projects}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Status</p>
                <span
                  className={`inline-block mt-1 px-3 py-1 rounded-full text-xs font-medium ${
                    selectedClient.status === "Active" ? "bg-green-600 text-white" : "bg-red-600 text-white"
                  }`}
                >
                  {selectedClient.status}
                </span>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Last Interaction</p>
                <p className="text-foreground font-medium">
                  {selectedClient.lastInteraction ? new Date(selectedClient.lastInteraction).toLocaleDateString() : "—"}
                </p>
              </div>
              <div className="pt-4">
                <Button onClick={() => setShowDetailsModal(false)} className="w-full bg-primary hover:bg-primary/90">
                  Close
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {showMessageModal && selectedClient && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="bg-card border border-border max-w-md w-full">
            <CardHeader className="flex flex-row items-center justify-between border-b border-border">
              <CardTitle className="text-foreground">Send Message</CardTitle>
              <button
                onClick={() => {
                  setShowMessageModal(false)
                  setMessageText("")
                }}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <X size={20} />
              </button>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div>
                <p className="text-sm text-muted-foreground mb-2">To: {selectedClient.name}</p>
                <p className="text-xs text-muted-foreground">{selectedClient.email}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Message</label>
                <textarea
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  placeholder="Type your message here..."
                  className="w-full h-32 px-3 py-2 bg-secondary border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                />
              </div>
              <div className="flex gap-2 pt-2">
                <Button onClick={handleSendMessage} className="flex-1 bg-primary hover:bg-primary/90">
                  Send Message
                </Button>
                <Button
                  onClick={() => {
                    setShowMessageModal(false)
                    setMessageText("")
                  }}
                  variant="outline"
                  className="flex-1 bg-secondary border-border"
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}