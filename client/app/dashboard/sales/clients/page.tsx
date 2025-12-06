"use client"
import { useState, useEffect } from "react" // Import useEffect
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { Sidebar } from "@/components/layout/sidebar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Mail } from "lucide-react"
import Link from "next/link"

interface Client {
  id: number;
  name: string;
  projects: number;
  status: string;
}

export default function SalesClientsPage() {
  const { user, isLoggedIn } = useAuth()
  const router = useRouter()
  const [currentPath] = useState("/dashboard/sales/clients")

  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!isLoggedIn || user?.role !== "sales") {
      router.push("/")
      return
    }

    const fetchClients = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/sales-clients?userId=${user?.id}`)
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        const data = await response.json()
        setClients(data)
      } catch (err) {
        console.error("Failed to fetch sales clients:", err)
        setError("Failed to load clients.")
      } finally {
        setLoading(false)
      }
    }

    if (user?.id) { // Only fetch if user ID is available
      fetchClients()
    }
  }, [isLoggedIn, user?.role, user?.id, router])

  if (!isLoggedIn || user?.role !== "sales") {
    router.push("/")
    return null
  }

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "active":
        return "bg-chart-3/20 text-chart-3"; // Green
      case "inactive":
        return "bg-muted text-muted-foreground"; // Grey
      default:
        return "bg-muted text-muted-foreground";
    }
  };


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
          <div className="px-8 py-4">
            <h1 className="text-2xl font-bold text-foreground">Clients</h1>
            <p className="text-sm text-muted-foreground">Manage your client relationships</p>
          </div>
        </div>

        {/* Main Content */}
        <div className="p-8">
          <div className="space-y-3">
            {clients.length === 0 ? (
              <p className="text-muted-foreground">No clients found for this sales user.</p>
            ) : (
              clients.map((client) => (
                <Card key={client.id} className="bg-card border border-border">
                  <CardContent className="pt-6 flex justify-between items-center">
                    <div>
                      <p className="font-bold text-foreground">{client.name}</p>
                      <p className="text-sm text-muted-foreground">{client.projects} active projects</p>
                    </div>
                    <div className="flex gap-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(client.status)}`}>
                        {client.status}
                      </span>
                      <Button size="sm" variant="outline" className="bg-secondary border-border">
                        <Mail size={16} />
                      </Button>
                      <Button size="sm" className="bg-primary hover:bg-primary/90">
                        View
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          <Link href="/dashboard/sales">
            <Button variant="outline" className="mt-8 bg-secondary border-border">
              ← Back
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
