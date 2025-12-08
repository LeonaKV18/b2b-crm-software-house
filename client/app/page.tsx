"use client"

import { useState, useEffect } from "react"
import { Eye, EyeOff } from "lucide-react"
import { useAuth, type UserRole } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"

export default function LoginPage() {
  const { login, isLoggedIn, user } = useAuth()
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  // Registration State
  const [isRegistering, setIsRegistering] = useState(false)
  const [registerName, setRegisterName] = useState("")
  const [registerCompany, setRegisterCompany] = useState("")
  const [registerEmail, setRegisterEmail] = useState("")
  const [registerPhone, setRegisterPhone] = useState("")
  const [registerPassword, setRegisterPassword] = useState("")

  useEffect(() => {
    if (isLoggedIn && user) {
      const dashboardRoutes: Record<UserRole, string> = {
        admin: "/dashboard/admin",
        pm: "/dashboard/pm",
        developer: "/dashboard/developer",
        client: "/dashboard/client",
      }
      router.push(dashboardRoutes[user.role])
    }
  }, [isLoggedIn, user, router])

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setTimeout(() => {
      // Role is determined by backend
      login(email, password)
      setLoading(false)
    }, 500)
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: registerName,
          company: registerCompany,
          email: registerEmail,
          phone: registerPhone,
          password: registerPassword,
        }),
      })

      if (response.ok) {
        alert("Account created successfully! Please sign in.")
        setIsRegistering(false)
        setEmail(registerEmail)
        setPassword("")
      } else {
        const errorData = await response.json()
        alert(`Registration failed: ${errorData.error}`)
      }
    } catch (err) {
      console.error("Registration error:", err)
      alert("An error occurred during registration.")
    } finally {
      setLoading(false)
    }
  }

  if (isLoggedIn) {
    return null
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary/20 to-accent/20 flex-col justify-between p-12 border-r border-border">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-bold">CRM</span>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">ProjectHub</h1>
            <p className="text-xs text-muted-foreground">CRM & PM Suite</p>
          </div>
        </div>

        <div className="space-y-8">
          <div>
            <p className="text-4xl font-bold text-foreground mb-4">Manage Projects,</p>
            <p className="text-4xl font-bold text-foreground mb-4">Build Better.</p>
            <p className="text-muted-foreground mt-4">
              Complete CRM and project lifecycle management for modern software houses.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-2xl font-bold text-primary">500+</div>
              <p className="text-sm text-muted-foreground">Active Projects</p>
            </div>
            <div>
              <div className="text-2xl font-bold text-accent">99.9%</div>
              <p className="text-sm text-muted-foreground">Uptime</p>
            </div>
          </div>
        </div>

        <p className="text-xs text-muted-foreground">© 2025 ProjectHub. All rights reserved.</p>
      </div>

      {/* Right Side - Login/Register Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12">
        {isRegistering ? (
          <Card className="w-full max-w-md border-border">
            <CardContent className="pt-8">
              <div className="mb-8">
                <h2 className="text-3xl font-bold text-foreground mb-2">Sign Up</h2>
                <p className="text-muted-foreground">Create your client account</p>
              </div>

              <form onSubmit={handleRegister} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Full Name</label>
                  <Input
                    placeholder="John Doe"
                    value={registerName}
                    onChange={(e) => setRegisterName(e.target.value)}
                    required
                    className="bg-secondary border border-border text-foreground"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Company Name</label>
                  <Input
                    placeholder="Acme Inc."
                    value={registerCompany}
                    onChange={(e) => setRegisterCompany(e.target.value)}
                    required
                    className="bg-secondary border border-border text-foreground"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Email</label>
                  <Input
                    type="email"
                    placeholder="you@example.com"
                    value={registerEmail}
                    onChange={(e) => setRegisterEmail(e.target.value)}
                    required
                    className="bg-secondary border border-border text-foreground"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Phone</label>
                  <Input
                    placeholder="+1 (555) 000-0000"
                    value={registerPhone}
                    onChange={(e) => setRegisterPhone(e.target.value)}
                    className="bg-secondary border border-border text-foreground"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Password</label>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={registerPassword}
                      onChange={(e) => setRegisterPassword(e.target.value)}
                      required
                      className="bg-secondary border border-border text-foreground pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium mt-4"
                >
                  {loading ? "Creating Account..." : "Create Account"}
                </Button>
              </form>

              <div className="mt-6 pt-6 border-t border-border text-center">
                <p className="text-sm text-muted-foreground">
                  Already have an account?{" "}
                  <button
                    onClick={() => setIsRegistering(false)}
                    className="text-primary hover:underline"
                  >
                    Sign In
                  </button>
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="w-full max-w-md border-border">
            <CardContent className="pt-8">
              <div className="mb-8">
                <h2 className="text-3xl font-bold text-foreground mb-2">Sign In</h2>
                <p className="text-muted-foreground">Access your CRM dashboard</p>
              </div>

              <form onSubmit={handleLogin} className="space-y-6">
                {/* Email Field */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Email</label>
                  <Input
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="bg-secondary border border-border text-foreground"
                  />
                </div>

                {/* Password Field */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Password</label>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="bg-secondary border border-border text-foreground pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                {/* Login Button */}
                <Button
                  type="submit"
                  disabled={loading || !email || !password}
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium"
                >
                  {loading ? "Signing in..." : "Sign In"}
                </Button>
              </form>

              <div className="mt-6 pt-6 border-t border-border text-center">
                <p className="text-sm text-muted-foreground">
                  Don't have an account?{" "}
                  <button
                    onClick={() => setIsRegistering(true)}
                    className="text-primary hover:underline"
                  >
                    Sign Up
                  </button>
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}