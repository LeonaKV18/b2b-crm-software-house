"use client"

import { useAuth, type UserRole } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useState } from "react"

const menuItems: Record<UserRole, { label: string; icon: string; href: string }[]> = {
  admin: [
    { label: "Dashboard", icon: "📊", href: "/dashboard/admin" },
    { label: "Clients", icon: "👥", href: "/dashboard/admin/clients" },
    { label: "Proposals", icon: "📄", href: "/dashboard/admin/proposals" },
    { label: "Projects", icon: "💼", href: "/dashboard/admin/projects" },
    { label: "Team", icon: "👫", href: "/dashboard/admin/team" },
    { label: "Meetings", icon: "📅", href: "/dashboard/admin/meetings" },
    { label: "Reports", icon: "📈", href: "/dashboard/admin/reports" },
    { label: "Settings", icon: "⚙️", href: "/dashboard/admin/settings" },
  ],
  sales: [
    { label: "Dashboard", icon: "📊", href: "/dashboard/sales" },
    { label: "Leads", icon: "⚡", href: "/dashboard/sales/leads" },
    { label: "Clients", icon: "👥", href: "/dashboard/sales/clients" },
    { label: "Proposals", icon: "📄", href: "/dashboard/sales/proposals" },
    { label: "Meetings", icon: "📅", href: "/dashboard/sales/meetings" },
  ],
  pm: [
    { label: "Dashboard", icon: "📊", href: "/dashboard/pm" },
    { label: "Projects", icon: "💼", href: "/dashboard/pm/projects" },
    { label: "Milestones", icon: "✓", href: "/dashboard/pm/milestones" },
    { label: "Team", icon: "👥", href: "/dashboard/pm/team" },
    { label: "Meetings", icon: "📅", href: "/dashboard/pm/meetings" },
    { label: "Reports", icon: "📈", href: "/dashboard/pm/reports" },
  ],
  developer: [
    { label: "Dashboard", icon: "📊", href: "/dashboard/developer" },
    { label: "Tasks", icon: "📋", href: "/dashboard/developer/tasks" },
    { label: "Milestones", icon: "✓", href: "/dashboard/developer/milestones" },
    { label: "Meetings", icon: "📅", href: "/dashboard/developer/meetings" },
  ],
  client: [
    { label: "Dashboard", icon: "📊", href: "/dashboard/client" },
    { label: "Proposals", icon: "📄", href: "/dashboard/client/proposals" },
    { label: "Projects", icon: "💼", href: "/dashboard/client/projects" },
    { label: "Invoices", icon: "💳", href: "/dashboard/client/invoices" },
  ],
}

export function Sidebar({ currentPath }: { currentPath: string }) {
  const { user, logout } = useAuth()
  const [showLogout, setShowLogout] = useState(false)

  if (!user) return null

  const items = menuItems[user.role] || []

  return (
    <div className="w-64 bg-sidebar border-r border-sidebar-border flex flex-col h-screen">
      {/* Logo */}
      <div className="p-6 border-b border-sidebar-border">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-lg bg-sidebar-primary flex items-center justify-center text-lg">CRM</div>
          <div>
            <p className="font-bold text-sidebar-foreground text-sm">ProjectHub</p>
            <p className="text-xs text-muted-foreground">{user.role}</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-4 space-y-1">
        {items.map((item) => (
          <Link key={item.href} href={item.href}>
            <div className={`sidebar-nav-item ${currentPath === item.href ? "active" : ""}`}>
              <span className="text-lg">{item.icon}</span>
              <span>{item.label}</span>
            </div>
          </Link>
        ))}
      </nav>

      {/* User Profile */}
      <div className="border-t border-sidebar-border p-4 space-y-3">
        <div className="flex items-center gap-3">
          <img src={user.avatar || "/placeholder.svg"} alt={user.name} className="w-10 h-10 rounded-full" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-sidebar-foreground truncate">{user.name}</p>
            <p className="text-xs text-muted-foreground truncate">{user.email}</p>
          </div>
        </div>

        <div className="flex gap-2">
          <Link href="/dashboard/settings" className="flex-1">
            <Button
              variant="outline"
              size="sm"
              className="w-full bg-sidebar-accent border-sidebar-border text-sidebar-foreground hover:bg-sidebar-accent/80"
            >
              ⚙️
            </Button>
          </Link>
          <div className="relative flex-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowLogout(!showLogout)}
              className="w-full bg-sidebar-accent border-sidebar-border text-sidebar-foreground hover:bg-sidebar-accent/80"
            >
              🚪
            </Button>
            {showLogout && (
              <div className="absolute bottom-full right-0 mb-2 bg-card border border-border rounded-lg p-2 w-32 shadow-lg">
                <p className="text-xs text-foreground mb-2">Sign out?</p>
                <Link href="/">
                  <Button
                    size="sm"
                    className="w-full bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                    onClick={logout}
                  >
                    Sign Out
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
