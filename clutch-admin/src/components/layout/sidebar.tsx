"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { NAVIGATION_ITEMS } from "@/lib/constants";
import { useAuth } from "@/contexts/auth-context";
import { ChevronDown, ChevronRight } from "lucide-react";

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

export function Sidebar({ isCollapsed, onToggle }: SidebarProps) {
  const pathname = usePathname();
  const { hasPermission } = useAuth();
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

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

  const hasAnyPermission = (permissions: string[]) => {
    return permissions.some(permission => hasPermission(permission));
  };

  return (
    <div
      className={cn(
        "flex flex-col h-full bg-sidebar border-r border-border transition-all duration-300 font-sans",
        isCollapsed ? "w-16" : "w-64"
      )}
    >
      {/* Logo */}
      <div className="flex items-center justify-center h-16 px-4 border-b border-border">
        {isCollapsed ? (
          <div className="flex items-center justify-center w-8 h-8">
            <img
              src="/logos/Logored.png"
              alt="Clutch"
              width={32}
              height={32}
              className="object-contain max-w-full max-h-full"
            />
          </div>
        ) : (
          <div className="flex items-center space-x-3">
            <div className="flex items-center justify-center w-8 h-8">
              <img
                src="/logos/Logored.png"
                alt="Clutch"
                width={32}
                height={32}
                className="object-contain max-w-full max-h-full"
              />
            </div>
            <span className="text-xl font-bold text-sidebar-primary font-sans">Clutch Admin</span>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4">
        <div className="px-2 space-y-1">
          {NAVIGATION_ITEMS.map((item) => {
            const hasPermission = hasAnyPermission(item.permissions);
            if (!hasPermission) return null;

            const isActive = isItemActive(item.href);
            const isExpanded = expandedItems.includes(item.title);
            const hasChildren = item.children && item.children.length > 0;

            return (
              <div key={item.title}>
                <div
                  className={cn(
                    "flex items-center px-3 py-2 text-sm font-medium rounded-lg cursor-pointer transition-colors font-sans",
                    isActive
                      ? "bg-sidebar-primary text-white shadow-sm"
                      : "text-sidebar-primary hover:bg-sidebar-primary/10",
                    isCollapsed && "justify-center"
                  )}
                  onClick={() => {
                    if (hasChildren) {
                      toggleExpanded(item.title);
                    }
                  }}
                >
                  {!isCollapsed && (
                    <>
                      <span className="flex-1">{item.title}</span>
                      {hasChildren && (
                        isExpanded ? (
                          <ChevronDown className="w-4 h-4" />
                        ) : (
                          <ChevronRight className="w-4 h-4" />
                        )
                      )}
                    </>
                  )}
                </div>

                {/* Children */}
                {hasChildren && !isCollapsed && isExpanded && (
                  <div className="ml-4 mt-1 space-y-1">
                    {item.children!.map((child) => {
                      const childHasPermission = hasAnyPermission(child.permissions);
                      if (!childHasPermission) return null;

                      const isChildActive = isItemActive(child.href);
                      return (
                        <Link
                          key={child.href}
                          href={child.href}
                          className={cn(
                            "block px-3 py-2 text-sm rounded-lg transition-colors font-sans",
                            isChildActive
                              ? "bg-sidebar-primary text-white shadow-sm"
                              : "text-sidebar-primary hover:bg-sidebar-primary/10"
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

      {/* Toggle Button */}
      <div className="p-4 border-t border-border">
        <button
          onClick={onToggle}
          className="w-full flex items-center justify-center px-3 py-2 text-sm font-medium text-sidebar-primary hover:bg-sidebar-primary/10 rounded-lg transition-colors font-sans"
        >
          {isCollapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <>
              <span className="flex-1 text-left">Collapse</span>
              <ChevronRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
    </div>
  );
}
