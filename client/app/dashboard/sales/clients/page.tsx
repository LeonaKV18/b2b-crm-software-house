"use client"

import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { Sidebar } from "@/components/layout/sidebar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Mail } from "lucide-react"
import Link from "next/link"
import { useState } from "react"

export default function SalesClientsPage() {
  const { user, isLoggedIn } = useAuth()
  const router = useRouter()
  const [currentPath] = useState("/dashboard/sales/clients")

  if (!isLoggedIn || user?.role !== "sales") {
    router.push("/")
    return null
  }

  const clients = [
    { id: 1, name: "Acme Corp", projects: 3, status: "Active" },
    { id: 2, name: "Tech Startup", projects: 2, status: "Active" },
  ]

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
            {clients.map((client) => (
              <Card key={client.id} className="bg-card border border-border">
                <CardContent className="pt-6 flex justify-between items-center">
                  <div>
                    <p className="font-bold text-foreground">{client.name}</p>
                    <p className="text-sm text-muted-foreground">{client.projects} active projects</p>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="bg-secondary border-border">
                      <Mail size={16} />
                    </Button>
                    <Button size="sm" className="bg-primary hover:bg-primary/90">
                      View
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
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
