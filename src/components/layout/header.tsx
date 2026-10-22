"use client"

import { useState } from "react"
import Link from "next/link"
import { Role } from "@prisma/client"
import { UserNav } from "@/components/layout/user-nav"
import { Sidebar } from "@/components/layout/sidebar"
import { Button, buttonVariants } from "@/components/ui/button"
import { Bell, Menu, X } from "lucide-react"

interface HeaderProps {
  user: {
    id: string
    name?: string | null
    email?: string | null
    role?: Role
  }
}

export function Header({ user }: HeaderProps) {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <>
      <header className="sticky top-0 z-40 h-14 w-full border-b border-border bg-card/80 backdrop-blur-xs px-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileOpen(true)}
            aria-label="Open navigation menu"
          >
            <Menu className="h-5 w-5" />
          </Button>

          <div className="hidden md:flex items-center text-xs text-muted-foreground font-medium">
            <span>Student Dashboard</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/reminders"
            aria-label="View upcoming reminders"
            className={buttonVariants({ variant: "ghost", size: "icon", className: "relative h-9 w-9" })}
          >
            <Bell className="h-4 w-4 text-muted-foreground hover:text-foreground" />
          </Link>

          <UserNav user={user} />
        </div>
      </header>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div
            className="fixed inset-0 bg-background/80 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileOpen(false)}
          />
          <div className="relative z-50 flex flex-col w-64 max-w-xs h-full bg-card shadow-xl animate-in slide-in-from-left duration-200">
            <div className="absolute top-3 right-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setMobileOpen(false)}
                aria-label="Close navigation menu"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <Sidebar userRole={user.role} onNavigate={() => setMobileOpen(false)} />
          </div>
        </div>
      )}
    </>
  )
}
