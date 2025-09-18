"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { USER_ROLES, ROLE_PERMISSIONS } from "@/lib/constants";
import { apiService } from "@/lib/api";
import { type User } from "@/lib/types";

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
      // Use the enhanced API service for login
      const response = await apiService.login(email, password);
      
      if (response.success && response.data) {
        const { token, user } = response.data;
        
        console.log('🔐 Auth response received:', {
          success: response.success,
          hasToken: !!token,
          hasUser: !!user,
          userData: user,
          message: response.message
        });
        
        // Ensure user object exists and has required properties
        if (!user) {
          console.error('❌ User data missing from response:', response);
          throw new Error("User data not received from server");
        }
        
        // Map backend user to frontend user format
        const userWithPermissions = {
          id: user._id || user.id || `user_${Date.now()}`,
          email: user.email || email,
          name: user.name || `${user.firstName || ''} ${user.lastName || ''}`.trim() || "User",
          role: user.role || "platform_admin",
          status: user.isActive !== undefined ? (user.isActive ? "active" : "inactive") : "active",
          createdAt: user.createdAt || new Date().toISOString(),
          lastLogin: new Date().toISOString(),
          permissions: user.permissions || ROLE_PERMISSIONS[user.role as keyof typeof ROLE_PERMISSIONS] || [],
        };
        
        setUser(userWithPermissions);
        localStorage.setItem("clutch-admin-user", JSON.stringify(userWithPermissions));
        
        setIsLoading(false);
        return true;
      } else {
        // Use the specific error message from the API response
        const errorMessage = response.error || "Invalid email or password. Please try again.";
        throw new Error(errorMessage);
      }
    } catch (error) {
      console.error("Login error:", error);
      setIsLoading(false);
      return false;
    }
  };

  const logout = async () => {
    try {
      // Call API logout endpoint
      await apiService.logout();
    } catch (error) {
      console.error("Logout API call failed:", error);
    } finally {
      // Clear local state regardless of API call result
      setUser(null);
      localStorage.removeItem("clutch-admin-user");
      localStorage.removeItem("clutch-admin-token");
      localStorage.removeItem("clutch-admin-refresh-token");
      if (typeof window !== "undefined") {
        sessionStorage.removeItem("clutch-admin-token");
      }
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
