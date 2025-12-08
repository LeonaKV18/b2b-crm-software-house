"use client"

import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function SettingsPage() {
  const { user, isLoggedIn } = useAuth()
  const router = useRouter()

  if (!isLoggedIn) {
    router.push("/")
    return null
  }

  const adminLink = "/dashboard/admin/settings"
  const roleLinks = {
    admin: adminLink,
    pm: "/dashboard/pm",
    developer: "/dashboard/developer",
    client: "/dashboard/client",
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <p className="text-lg text-foreground mb-4">Redirecting to your dashboard...</p>
        <Link href={roleLinks[user?.role || "admin"] || "/dashboard/admin"}>
          <Button className="bg-primary hover:bg-primary/90">Go to Dashboard</Button>
        </Link>
      </div>
    </div>
  )
}
