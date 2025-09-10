"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useUIStore } from "@/store"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function ThemeToggle() {
  const { theme, setTheme } = useUIStore()
  const isDark = theme.mode === 'dark'

  const toggleTheme = () => {
    const newTheme = {
      ...theme,
      mode: isDark ? 'light' : 'dark'
    }
    setTheme(newTheme)
    
    // Update document class for CSS variables
    if (isDark) {
      document.documentElement.classList.remove('dark')
    } else {
      document.documentElement.classList.add('dark')
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <SnowButton variant="outline" size="icon" onClick={toggleTheme}>
          <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </SnowButton>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => {
          const newTheme = { ...theme, mode: 'light' }
          setTheme(newTheme)
          document.documentElement.classList.remove('dark')
        }}>
          Light
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => {
          const newTheme = { ...theme, mode: 'dark' }
          setTheme(newTheme)
          document.documentElement.classList.add('dark')
        }}>
          Dark
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => {
          const newTheme = { ...theme, mode: 'system' }
          setTheme(newTheme)
          // Check system preference
          if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
            document.documentElement.classList.add('dark')
          } else {
            document.documentElement.classList.remove('dark')
          }
        }}>
          System
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

