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
    // Check for stored user session only on client side
    if (typeof window !== 'undefined') {
      const storedUser = localStorage.getItem("clutch-admin-user");
      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          
          // Always ensure user has correct permissions based on their role
          const rolePermissions = (ROLE_PERMISSIONS[parsedUser.role as keyof typeof ROLE_PERMISSIONS] || []) as string[];
          const userWithPermissions = {
            ...parsedUser,
            permissions: rolePermissions
          };
          
          // Only log in development mode
          if (process.env.NODE_ENV === 'development') {
            console.log({
              // Loading user from localStorage
              originalUser: parsedUser,
              userWithPermissions,
              rolePermissions,
              originalPermissions: parsedUser.permissions,
              finalPermissions: userWithPermissions.permissions
            });
          }
          
          setUser(userWithPermissions);
          
          // Update localStorage with correct permissions
          if (typeof window !== 'undefined') {
            localStorage.setItem("clutch-admin-user", JSON.stringify(userWithPermissions));
          }
        } catch (error) {
          localStorage.removeItem("clutch-admin-user");
        }
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
        
        // Auth response received
        
        // Ensure user object exists and has required properties
        if (!user) {
          // User data missing from response
          throw new Error("User data not received from server");
        }
        
        
        // Map backend user to frontend user format
        const userWithPermissions: User = {
          id: String(user._id || user.id || `user_${Date.now()}`),
          email: String(user.email || email),
          name: String(user.name || `${user.firstName || ''} ${user.lastName || ''}`.trim() || "User"),
          role: String(user.role || "employee"), // Default to employee instead of platform_admin
          status: user.isActive !== undefined ? (user.isActive ? "active" : "inactive") : "active",
          createdAt: String(user.createdAt || new Date().toISOString()),
          lastLogin: new Date().toISOString(),
          permissions: Array.isArray(user.permissions) ? [...user.permissions] : [...(ROLE_PERMISSIONS[user.role as keyof typeof ROLE_PERMISSIONS] || [])],
        };
        
        // Debug logging for user data (only in development)
        if (process.env.NODE_ENV === 'development') {
          // User data received from backend
            originalUser: user,
            mappedUser: userWithPermissions,
            rolePermissions: ROLE_PERMISSIONS[user.role as keyof typeof ROLE_PERMISSIONS]
          });
        }
        
        setUser(userWithPermissions);
        if (typeof window !== 'undefined') {
          localStorage.setItem("clutch-admin-user", JSON.stringify(userWithPermissions));
          localStorage.setItem("clutch-admin-token", token);
        }
        
        setIsLoading(false);
        return true;
      } else {
        // Use the specific error message from the API response
        const errorMessage = response.error || "Invalid email or password. Please try again.";
        throw new Error(errorMessage);
      }
    } catch (error) {
      // Login error handled
      setIsLoading(false);
      return false;
    }
  };

  const logout = async () => {
    try {
      // Call API logout endpoint
      await apiService.logout();
    } catch (error) {
      // Logout API call failed
    } finally {
      // Clear local state regardless of API call result
      setUser(null);
      if (typeof window !== 'undefined') {
        localStorage.removeItem("clutch-admin-user");
        localStorage.removeItem("clutch-admin-token");
        localStorage.removeItem("clutch-admin-refresh-token");
        sessionStorage.removeItem("clutch-admin-token");
      }
    }
  };

  const hasPermission = (permission: string): boolean => {
    if (!user) {
      return false;
    }
    
    // Get permissions from user or fallback to role-based permissions
    let userPermissions = user.permissions;
    
    // If user doesn't have permissions or has empty permissions, get them from role
    if (!userPermissions || !Array.isArray(userPermissions) || userPermissions.length === 0) {
      userPermissions = (ROLE_PERMISSIONS[user.role as keyof typeof ROLE_PERMISSIONS] || []) as string[];
      
      // Update user with correct permissions (only once)
      if (userPermissions.length > 0 && (!user.permissions || user.permissions.length === 0)) {
        const updatedUser = { ...user, permissions: userPermissions };
        setUser(updatedUser);
        if (typeof window !== 'undefined') {
          localStorage.setItem("clutch-admin-user", JSON.stringify(updatedUser));
        }
      }
    }
    
    return userPermissions.includes(permission);
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
