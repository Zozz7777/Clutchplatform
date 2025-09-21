"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/auth-context";
import { ChevronDown, ChevronRight } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { LanguageSwitcher } from "@/components/language-switcher";
import { useTranslations } from "@/hooks/use-translations";
import { getTranslatedNavigationItems } from "@/lib/navigation";
import { iconMap, type IconName } from "@/lib/icons";

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

export function Sidebar({ isCollapsed, onToggle }: SidebarProps) {
  const pathname = usePathname();
  const { hasPermission, user } = useAuth();
  const t = (key: string, params?: any) => key;
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  
  const navigationItems = getTranslatedNavigationItems(t);


  const toggleExpanded = (title: string) => {
    setExpandedItems(prev =>
      prev.includes(title)
        ? prev.filter(item => item !== title)
        : [...prev, title]
    );
  };

  const isItemActive = (href: string) => {
    if (href === "/dashboard") {
      return pathname === "/dashboard";
    }
    return pathname.startsWith(href);
  };

  const hasAnyPermission = (permissions: readonly string[]) => {
    const result = permissions.some(permission => hasPermission(permission));
    // Debug logging
    if (!result && user) {
      console.log('🚫 No permission for navigation item:', {
        permissions,
        userRole: user.role,
        userPermissions: user.permissions,
        hasPermission: permissions.map(p => ({ permission: p, has: hasPermission(p) }))
      });
    }
    return result;
  };

  return (
    <div
      className={cn(
        "flex flex-col h-full bg-sidebar border-r border-border transition-all duration-300 font-sans focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 focus-within:ring-offset-background",
        isCollapsed ? "w-16" : "w-64"
      )}
    >
      {/* Logo */}
      <div className="flex items-center justify-center h-16 px-4 border-b border-border">
        {isCollapsed ? (
          <div className="flex items-center justify-center w-8 h-8 bg-primary/10 rounded">
            <img
              src="/logo.png"
              alt="Clutch"
              width={32}
              height={32}
              className="object-contain max-w-full max-h-full"
              onError={(e) => {
                // Logo failed to load
                e.currentTarget.style.display = 'none';
                const parent = e.currentTarget.parentElement;
                if (parent) {
                  parent.innerHTML = '<div class="text-sm font-bold text-primary">C</div>';
                }
              }}
              onLoad={() => {}}
            />
          </div>
        ) : (
          <div className="flex items-center space-x-3">
            <div className="flex items-center justify-center w-8 h-8 bg-primary/10 rounded">
              <img
                src="/logo.png"
                alt="Clutch"
                width={32}
                height={32}
                className="object-contain max-w-full max-h-full"
                onError={(e) => {
                  // Logo failed to load
                  e.currentTarget.style.display = 'none';
                  const parent = e.currentTarget.parentElement;
                  if (parent) {
                    parent.innerHTML = '<div class="text-sm font-bold text-primary">C</div>';
                  }
                }}
                onLoad={() => {}}
              />
            </div>
            <span className="text-xl font-bold text-foreground font-sans">{t('sidebar.clutchAdmin')}</span>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4">
        <div className="px-2 space-y-1">
          {navigationItems.map((item) => {
            const hasPermission = hasAnyPermission(item.permissions);
            if (!hasPermission) return null;

            const isActive = isItemActive(item.href);
            const isExpanded = expandedItems.includes(item.title);
            const hasChildren = item.children && item.children.length > 0;

            const IconComponent = iconMap[item.icon as IconName] || iconMap.LayoutDashboard;

            return (
              <div key={item.title}>
                {hasChildren ? (
                  <div
                    className={cn(
                      "flex items-center px-3 py-2 text-sm font-medium rounded-[0.625rem] cursor-pointer transition-all duration-normal ease-in-out font-sans focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-sidebar",
                      isActive
                        ? "bg-sidebar-primary text-white shadow-2xs"
                        : "text-foreground hover:bg-sidebar-primary/10 hover:text-sidebar-primary active:bg-sidebar-primary/20",
                      isCollapsed && "justify-center"
                    )}
                    onClick={() => {
                      if (!isCollapsed) {
                        toggleExpanded(item.title);
                      }
                      // Handle navigation for items with href
                      if (item.href) {
                        window.location.href = item.href;
                      }
                    }}
                  >
                    <IconComponent className="w-4 h-4" />
                    {!isCollapsed && (
                      <>
                        <span className="flex-1 ml-3">{item.title}</span>
                        {isExpanded ? (
                          <ChevronDown className="w-4 h-4" />
                        ) : (
                          <ChevronRight className="w-4 h-4" />
                        )}
                      </>
                    )}
                  </div>
                ) : (
                  <Link
                    href={item.href}
                    className={cn(
                      "flex items-center px-3 py-2 text-sm font-medium rounded-[0.625rem] cursor-pointer transition-all duration-normal ease-in-out font-sans focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-sidebar",
                      isActive
                        ? "bg-sidebar-primary text-white shadow-2xs"
                        : "text-foreground hover:bg-sidebar-primary/10 hover:text-sidebar-primary active:bg-sidebar-primary/20",
                      isCollapsed && "justify-center"
                    )}
                  >
                    <IconComponent className="w-4 h-4" />
                    {!isCollapsed && (
                      <span className="flex-1 ml-3">{item.title}</span>
                    )}
                  </Link>
                )}

                {/* Children */}
                {hasChildren && !isCollapsed && isExpanded && (
                  <div className="ml-4 mt-1 space-y-1">
                    {item.children!.map((child: Record<string, unknown>) => {
                      const childHasPermission = hasAnyPermission(child.permissions);
                      if (!childHasPermission) return null;

                      const isChildActive = isItemActive(child.href);
                      return (
                        <Link
                          key={child.href}
                          href={child.href}
                          className={cn(
                            "block px-3 py-2 text-sm rounded-[0.625rem] transition-all duration-normal ease-in-out font-sans focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-sidebar",
                            isChildActive
                              ? "bg-sidebar-primary text-white shadow-2xs"
                              : "text-foreground hover:bg-sidebar-primary/10 hover:text-sidebar-primary active:bg-sidebar-primary/20"
                          )}
                        >
                          {child.title}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-border space-y-3">
        {/* Theme Toggle and Language Switcher */}
        <div className="flex items-center justify-center gap-2">
          <ThemeToggle />
          <LanguageSwitcher />
        </div>
        
        {/* Toggle Button */}
        <button
          onClick={onToggle}
          className="w-full flex items-center justify-center px-3 py-2 text-sm font-medium text-foreground hover:bg-sidebar-primary/10 rounded-[0.625rem] transition-all duration-normal ease-in-out font-sans focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-sidebar"
        >
          {isCollapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <>
              <span className="flex-1 text-left">{t('sidebar.collapse')}</span>
              <ChevronRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
    </div>
  );
}


