"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Role } from "@prisma/client"
import { cn } from "@/lib/utils"
import {
  Briefcase,
  Calendar,
  CheckSquare,
  FileText,
  FolderBookmark,
  Home,
  Layers,
  Settings,
  ShieldAlert,
  User,
  UploadCloud,
  FileCheck2,
} from "lucide-react"

interface SidebarProps {
  userRole?: Role
  className?: string
  onNavigate?: () => void
}

export function Sidebar({ userRole, className, onNavigate }: SidebarProps) {
  const pathname = usePathname()

  const navItems = [
    { label: "Dashboard", href: "/dashboard", icon: Home },
    { label: "Find Internships", href: "/internships", icon: Briefcase },
    { label: "Saved", href: "/saved", icon: FolderBookmark },
    { label: "Applications", href: "/applications", icon: Layers },
    { label: "Interviews", href: "/interviews", icon: Calendar },
    { label: "Reminders", href: "/reminders", icon: CheckSquare },
    { label: "Notes", href: "/notes", icon: FileText },
    { label: "Profile", href: "/profile", icon: User },
    { label: "Settings", href: "/settings", icon: Settings },
  ]

  const adminItems = [
    { label: "Manage Listings", href: "/admin/internships", icon: Briefcase },
    { label: "CSV Imports", href: "/admin/imports", icon: UploadCloud },
    { label: "Reports Queue", href: "/admin/reports", icon: ShieldAlert },
    { label: "Audit Logs", href: "/admin/audit-logs", icon: FileCheck2 },
  ]

  return (
    <aside className={cn("flex flex-col h-full bg-card border-r border-border select-none", className)}>
      <div className="h-14 flex items-center px-4 border-b border-border gap-2.5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-semibold text-sm">
          A
        </div>
        <div className="flex flex-col">
          <span className="font-semibold text-sm tracking-tight">Applynto</span>
          <span className="text-[10px] text-muted-foreground leading-none">Internship Tracker</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-6">
        <div className="space-y-1">
          <p className="px-2 pb-1.5 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
            Workspace
          </p>
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href))
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onNavigate}
                className={cn(
                  "flex items-center gap-2.5 px-2.5 py-2 rounded-md text-xs font-medium transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground font-semibold shadow-2xs"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span>{item.label}</span>
              </Link>
            )
          })}
        </div>

        {userRole === Role.ADMIN && (
          <div className="space-y-1 pt-2 border-t border-border/60">
            <p className="px-2 pb-1.5 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
              Administration
            </p>
            {adminItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href || pathname.startsWith(item.href)
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onNavigate}
                  className={cn(
                    "flex items-center gap-2.5 px-2.5 py-2 rounded-md text-xs font-medium transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground font-semibold shadow-2xs"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span>{item.label}</span>
                </Link>
              )
            })}
          </div>
        )}
      </div>

      <div className="p-3 border-t border-border text-[11px] text-muted-foreground text-center">
        Applynto v0.1.0
      </div>
    </aside>
  )
}
