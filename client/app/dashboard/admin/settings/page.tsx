"use client"

import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { Sidebar } from "@/components/layout/sidebar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { useState } from "react"

export default function SettingsPage() {
  const { user, isLoggedIn } = useAuth()
  const router = useRouter()
  const [currentPath] = useState("/dashboard/admin/settings")

  if (!isLoggedIn || user?.role !== "admin") {
    router.push("/")
    return null
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar currentPath={currentPath} />

      <div className="flex-1 overflow-auto">
        {/* Top Bar */}
        <div className="bg-card border-b border-border sticky top-0 z-10">
          <div className="px-8 py-4">
            <h1 className="text-2xl font-bold text-foreground">Settings</h1>
            <p className="text-sm text-muted-foreground">Manage system configuration</p>
          </div>
        </div>

        {/* Main Content */}
        <div className="p-8 max-w-2xl">
          {/* Company Settings */}
          <Card className="bg-card border border-border mb-8">
            <CardHeader>
              <CardTitle className="text-foreground">Company Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Company Name</label>
                <Input defaultValue="TechHouse" className="bg-secondary border-border" />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Email</label>
                <Input defaultValue="contact@techhouse.com" className="bg-secondary border-border" />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Phone</label>
                <Input defaultValue="+1-555-0000" className="bg-secondary border-border" />
              </div>
              <Button className="bg-primary hover:bg-primary/90">Save Changes</Button>
            </CardContent>
          </Card>

          {/* User Management */}
          <Card className="bg-card border border-border mb-8">
            <CardHeader>
              <CardTitle className="text-foreground">User Management</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                variant="outline"
                className="w-full justify-start bg-secondary border-border hover:bg-secondary/80"
              >
                Manage Roles & Permissions
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start bg-secondary border-border hover:bg-secondary/80"
              >
                View Audit Log
              </Button>
            </CardContent>
          </Card>

          {/* Notifications */}
          <Card className="bg-card border border-border mb-8">
            <CardHeader>
              <CardTitle className="text-foreground">Notifications</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" defaultChecked className="w-4 h-4" />
                  <span className="text-sm text-foreground">Email on new proposals</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" defaultChecked className="w-4 h-4" />
                  <span className="text-sm text-foreground">Email on project deadline</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" className="w-4 h-4" />
                  <span className="text-sm text-foreground">Email on team updates</span>
                </label>
              </div>
            </CardContent>
          </Card>

          {/* Danger Zone */}
          <Card className="bg-destructive/10 border border-destructive">
            <CardHeader>
              <CardTitle className="text-foreground">Danger Zone</CardTitle>
            </CardHeader>
            <CardContent>
              <Button variant="destructive" className="bg-destructive hover:bg-destructive/90">
                Delete Account
              </Button>
            </CardContent>
          </Card>

          <Link href="/dashboard/admin">
            <Button variant="outline" className="mt-8 bg-secondary border-border">
              ← Back
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
