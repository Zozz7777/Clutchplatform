"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { USER_ROLES, ROLE_PERMISSIONS } from "@/lib/constants";
import { type User } from "@/lib/mock-api";

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  hasPermission: (permission: string) => boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);


export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for stored user session
    const storedUser = localStorage.getItem("clutch-admin-user");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        localStorage.removeItem("clutch-admin-user");
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      // Try real backend API first using the API service
      const response = await fetch("https://clutch-main-nk7x.onrender.com/api/v1/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        const data = await response.json();
        
        if (data.success && data.user) {
          // Map backend user to frontend user format
          const userWithPermissions = {
            id: data.user._id || data.user.id,
            email: data.user.email,
            name: data.user.name || data.user.firstName + " " + data.user.lastName || "User",
            role: data.user.role || "platform_admin",
            status: data.user.isActive ? "active" : "inactive",
            createdAt: data.user.createdAt || new Date().toISOString(),
            lastLogin: new Date().toISOString(),
            permissions: data.user.permissions || ROLE_PERMISSIONS[data.user.role as keyof typeof ROLE_PERMISSIONS] || [],
          };
          
          setUser(userWithPermissions);
          localStorage.setItem("clutch-admin-user", JSON.stringify(userWithPermissions));
          localStorage.setItem("clutch-admin-token", data.token);
          
          // Also store token in sessionStorage for immediate access
          if (typeof window !== "undefined") {
            sessionStorage.setItem("clutch-admin-token", data.token);
          }
          
          setIsLoading(false);
          return true;
        }
      }
      
      setIsLoading(false);
      return false;
    } catch (error) {
      console.error("Login error:", error);
      setIsLoading(false);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("clutch-admin-user");
    localStorage.removeItem("clutch-admin-token");
    if (typeof window !== "undefined") {
      sessionStorage.removeItem("clutch-admin-token");
    }
  };

  const hasPermission = (permission: string): boolean => {
    if (!user) return false;
    return user.permissions.includes(permission);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, hasPermission, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
