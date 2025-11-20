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
  login: (email: string, password: string, role: UserRole) => Promise<boolean>
  logout: () => void
  setUser: (user: User | null) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  const login = async (email: string, password: string, role: UserRole): Promise<boolean> => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, role }),
      });

      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
        setIsLoggedIn(true);
        return true;
      } else {
        let errorData = "Unknown error";
        try {
          const contentType = response.headers.get("content-type");
          if (contentType && contentType.includes("application/json")) {
            errorData = await response.json();
          } else {
            errorData = await response.text();
          }
        } catch (parseError) {
          errorData = `Failed to parse error response as JSON or text: ${parseError}`;
        }
        console.error("Login failed:", errorData);
        setUser(null);
        setIsLoggedIn(false);
        return false;
      }
    } catch (error) {
      console.error("Error during login:", error);
      setUser(null);
      setIsLoggedIn(false);
      return false;
    }
  };

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
