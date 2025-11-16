"use client"

import type React from "react"
import { createContext, useContext, useState } from "react"

export type UserRole = "admin" | "sales" | "pm" | "developer" | "client"

interface User {
  id: string
  email: string
  name: string
  role: UserRole
  company?: string
  avatar?: string
}

interface AuthContextType {
  user: User | null
  isLoggedIn: boolean
  login: (email: string, password: string, role: UserRole) => void
  logout: () => void
  setUser: (user: User | null) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  const login = (email: string, password: string, role: UserRole) => {
    // Simulated login - in real app, this would call an API
    const newUser: User = {
      id: Math.random().toString(),
      email,
      name: email.split("@")[0],
      role,
      company: role === "client" ? "Acme Corp" : "TechHouse",
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`,
    }
    setUser(newUser)
    setIsLoggedIn(true)
  }

  const logout = () => {
    setUser(null)
    setIsLoggedIn(false)
  }

  return <AuthContext.Provider value={{ user, isLoggedIn, login, logout, setUser }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within AuthProvider")
  }
  return context
}
