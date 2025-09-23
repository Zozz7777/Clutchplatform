"use client";

import React, { useState } from "react";
import { Sidebar } from "./sidebar";
import { Header } from "./header";
import { useLanguage } from "@/contexts/language-context";

interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { language } = useLanguage();

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  return (
    <div className="flex h-screen bg-background font-sans">
      {/* Sidebar - positioned based on language direction */}
      {language === 'ar' ? (
        <>
          {/* Main Content */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Header */}
            <Header onMenuToggle={toggleSidebar} />
            
            {/* Page Content */}
            <main className="flex-1 overflow-y-auto p-6 bg-background">
              <div className="max-w-7xl mx-auto space-y-6">
                {children}
              </div>
            </main>
          </div>
          <Sidebar isCollapsed={sidebarCollapsed} onToggle={toggleSidebar} />
        </>
      ) : (
        <>
          <Sidebar isCollapsed={sidebarCollapsed} onToggle={toggleSidebar} />
          
          {/* Main Content */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Header */}
            <Header onMenuToggle={toggleSidebar} />
            
            {/* Page Content */}
            <main className="flex-1 overflow-y-auto p-6 bg-background">
              <div className="max-w-7xl mx-auto space-y-6">
                {children}
              </div>
            </main>
          </div>
        </>
      )}
    </div>
  );
}


