"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Search,
  Bell,
  Settings,
  LogOut,
  User,
  Moon,
  Sun,
  Menu,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { formatRelativeTime } from "@/lib/utils";
import { productionApi } from "@/lib/production-api";
import { type Notification } from "@/lib/mock-api";
import { useRouter } from "next/navigation";
import { LanguageSwitcher } from "@/components/language-switcher";
import { useTranslations } from "@/hooks/use-translations";

interface HeaderProps {
  onMenuToggle: () => void;
  isDarkMode: boolean;
  onThemeToggle: () => void;
}

export function Header({ onMenuToggle, isDarkMode, onThemeToggle }: HeaderProps) {
  const { user, logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [notificationsLoading, setNotificationsLoading] = useState(false);
  const router = useRouter();

  const handleLogout = () => {
    logout();
  };

  const handleProfileClick = () => {
    router.push("/settings?tab=profile");
  };

  const handleSettingsClick = () => {
    router.push("/settings");
  };

  // Fetch real notifications
  useEffect(() => {
    const fetchNotifications = async () => {
      if (!user) return;
      
      setNotificationsLoading(true);
      try {
        const response = await productionApi.getNotifications();
        // Handle the API response structure properly
        const notifications = response?.data?.notifications || response?.data || response || [];
        setNotifications(Array.isArray(notifications) ? notifications.slice(0, 5) : []);
      } catch (error) {
        console.error("Failed to fetch notifications:", error);
        setNotifications([]); // Set empty array on error
      } finally {
        setNotificationsLoading(false);
      }
    };

    fetchNotifications();
    
    // Refresh notifications every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [user]);

  return (
    <header className="h-16 border-b border-border bg-background flex items-center justify-between px-6 font-sans">
      {/* Left side */}
      <div className="flex items-center space-x-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={onMenuToggle}
          className="md:hidden hover:bg-muted"
        >
          <Menu className="h-5 w-5" />
        </Button>
        
        {/* Global Search */}
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 w-64 h-10"
          />
        </div>
      </div>

      {/* Right side */}
      <div className="flex items-center space-x-4">
        {/* Theme Toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onThemeToggle}
        >
          {isDarkMode ? (
            <Sun className="h-5 w-5" />
          ) : (
            <Moon className="h-5 w-5" />
          )}
        </Button>

        {/* Notifications */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              {notifications.length > 0 && (
                <Badge
                  variant="destructive"
                  className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
                >
                  {notifications.length}
                </Badge>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel>Notifications</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <div className="max-h-64 overflow-y-auto">
              {notificationsLoading ? (
                <div className="p-4 text-center text-muted-foreground">
                  Loading notifications...
                </div>
              ) : notifications.length === 0 ? (
                <div className="p-4 text-center text-muted-foreground">
                  No new notifications
                </div>
              ) : (
                notifications.map((notification) => (
                  <DropdownMenuItem key={notification.id} className="flex flex-col items-start p-3">
                    <div className="flex items-center justify-between w-full">
                      <span className="font-medium">{notification.title}</span>
                      <span className="text-xs text-muted-foreground">
                        {formatRelativeTime(notification.timestamp)}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {notification.message}
                    </p>
                  </DropdownMenuItem>
                ))
              )}
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                <User className="h-4 w-4 text-primary-foreground" />
              </div>
              <div className="hidden md:block text-left">
                <p className="text-sm font-medium">{user?.name}</p>
                <p className="text-xs text-muted-foreground">{user?.role}</p>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleProfileClick}>
              <User className="mr-2 h-4 w-4" />
              <span>Profile</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleSettingsClick}>
              <Settings className="mr-2 h-4 w-4" />
              <span>Settings</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
