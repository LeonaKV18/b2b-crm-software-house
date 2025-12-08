"use client"

import { useAuth, type UserRole } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useState } from "react"
import { 
  LayoutDashboard, 
  Users, 
  FileText, 
  Briefcase, 
  Calendar, 
  LineChart, 
  CheckSquare, 
  ClipboardList, 
  CreditCard, 
  LogOut 
} from "lucide-react"

const menuItems: Record<UserRole, { label: string; icon: React.ReactNode; href: string }[]> = {
  admin: [
    { label: "Dashboard", icon: <LayoutDashboard size={18} />, href: "/dashboard/admin" },
    { label: "Clients", icon: <Users size={18} />, href: "/dashboard/admin/clients" },
    { label: "Proposals", icon: <FileText size={18} />, href: "/dashboard/admin/proposals" },
    { label: "Projects", icon: <Briefcase size={18} />, href: "/dashboard/admin/projects" },
    { label: "Team", icon: <Users size={18} />, href: "/dashboard/admin/team" },
    { label: "Meetings", icon: <Calendar size={18} />, href: "/dashboard/admin/meetings" },
    { label: "Reports", icon: <LineChart size={18} />, href: "/dashboard/admin/reports" },
  ],
  pm: [
    { label: "Dashboard", icon: <LayoutDashboard size={18} />, href: "/dashboard/pm" },
    { label: "Projects", icon: <Briefcase size={18} />, href: "/dashboard/pm/projects" },
    { label: "Milestones", icon: <CheckSquare size={18} />, href: "/dashboard/pm/milestones" },
    { label: "Meetings", icon: <Calendar size={18} />, href: "/dashboard/pm/meetings" },
    { label: "Reports", icon: <LineChart size={18} />, href: "/dashboard/pm/reports" },
  ],
  developer: [
    { label: "Dashboard", icon: <LayoutDashboard size={18} />, href: "/dashboard/developer" },
    { label: "Tasks", icon: <ClipboardList size={18} />, href: "/dashboard/developer/tasks" },
    { label: "Milestones", icon: <CheckSquare size={18} />, href: "/dashboard/developer/milestones" },
    { label: "Meetings", icon: <Calendar size={18} />, href: "/dashboard/developer/meetings" },
  ],
  client: [
    { label: "Dashboard", icon: <LayoutDashboard size={18} />, href: "/dashboard/client" },
    { label: "Proposals", icon: <FileText size={18} />, href: "/dashboard/client/proposals" },
    { label: "Projects", icon: <Briefcase size={18} />, href: "/dashboard/client/projects" },
    { label: "Invoices", icon: <CreditCard size={18} />, href: "/dashboard/client/invoices" },
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
          <div className="w-9 h-9 rounded-lg bg-sidebar-primary flex items-center justify-center text-lg text-sidebar-primary-foreground font-bold">CRM</div>
          <div>
            <p className="font-bold text-sidebar-foreground text-sm">ProjectHub</p>
            <p className="text-xs text-muted-foreground capitalize">{user.role}</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-4 space-y-1">
        {items.map((item) => (
          <Link key={item.href} href={item.href}>
            <div className={`sidebar-nav-item ${currentPath === item.href ? "active" : ""}`}>
              {item.icon}
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
          <div className="relative flex-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowLogout(!showLogout)}
              className="w-full bg-sidebar-accent border-sidebar-border text-sidebar-foreground hover:bg-sidebar-accent/80"
            >
              <LogOut size={16} />
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