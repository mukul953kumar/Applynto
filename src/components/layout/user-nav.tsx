"use client"

import { signOut } from "next-auth/react"
import Link from "next/link"
import { Role } from "@prisma/client"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { LogOut, Settings, User as UserIcon, Shield } from "lucide-react"

interface UserNavProps {
  user: {
    id: string
    name?: string | null
    email?: string | null
    role?: Role
  }
}

export function UserNav({ user }: UserNavProps) {
  const initials = user.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : user.email?.slice(0, 2).toUpperCase() || "U"

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="relative h-9 w-9 rounded-full bg-muted flex items-center justify-center p-0 outline-none hover:bg-muted/80 cursor-pointer">
        <span className="text-xs font-semibold">{initials}</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end">
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium leading-none truncate">{user.name || "Student"}</p>
              {user.role === Role.ADMIN && (
                <Badge variant="secondary" className="text-[10px] h-4 px-1">
                  Admin
                </Badge>
              )}
            </div>
            <p className="text-xs leading-none text-muted-foreground truncate">{user.email}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <Link href="/profile" className="flex items-center gap-2 cursor-pointer w-full">
            <UserIcon className="h-4 w-4" />
            <span>Profile</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Link href="/settings" className="flex items-center gap-2 cursor-pointer w-full">
            <Settings className="h-4 w-4" />
            <span>Settings</span>
          </Link>
        </DropdownMenuItem>
        {user.role === Role.ADMIN && (
          <DropdownMenuItem>
            <Link href="/admin" className="flex items-center gap-2 cursor-pointer text-primary font-medium w-full">
              <Shield className="h-4 w-4" />
              <span>Admin Portal</span>
            </Link>
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          variant="destructive"
          className="cursor-pointer flex items-center gap-2"
          onClick={() => signOut({ callbackUrl: "/login" })}
        >
          <LogOut className="h-4 w-4" />
          <span>Sign out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
