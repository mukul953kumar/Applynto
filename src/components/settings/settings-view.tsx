"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { signOut } from "next-auth/react"
import { updateAccountDetails, changePassword, deleteAccount } from "@/actions/settings"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import {
  User,
  KeyRound,
  ShieldAlert,
  Loader2,
  Check,
  AlertTriangle,
  X,
} from "lucide-react"

interface SettingsViewProps {
  user: {
    id: string
    name?: string | null
    email: string
    image?: string | null
    createdAt: Date
  }
}

export function SettingsView({ user }: SettingsViewProps) {
  const router = useRouter()

  const [name, setName] = useState(user.name || "")
  const [image, setImage] = useState(user.image || "")
  const [accountLoading, setAccountLoading] = useState(false)
  const [accountSuccess, setAccountSuccess] = useState(false)
  const [accountError, setAccountError] = useState<string | null>(null)

  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [pwLoading, setPwLoading] = useState(false)
  const [pwSuccess, setPwSuccess] = useState(false)
  const [pwError, setPwError] = useState<string | null>(null)

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [deletePhrase, setDeletePhrase] = useState("")
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  async function handleUpdateAccount(e: React.FormEvent) {
    e.preventDefault()
    setAccountLoading(true)
    setAccountError(null)
    setAccountSuccess(false)

    const res = await updateAccountDetails({
      name,
      image: image || undefined,
    })

    setAccountLoading(false)

    if (!res.success) {
      setAccountError(res.error || "Failed to update profile")
      return
    }

    setAccountSuccess(true)
    setTimeout(() => setAccountSuccess(false), 3000)
    router.refresh()
  }

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault()
    setPwLoading(true)
    setPwError(null)
    setPwSuccess(false)

    const res = await changePassword({
      currentPassword,
      newPassword,
      confirmPassword,
    })

    setPwLoading(false)

    if (!res.success) {
      setPwError(res.error || "Failed to change password")
      return
    }

    setPwSuccess(true)
    setCurrentPassword("")
    setNewPassword("")
    setConfirmPassword("")
    setTimeout(() => setPwSuccess(false), 3000)
  }

  async function handleDeleteAccount(e: React.FormEvent) {
    e.preventDefault()
    setDeleteLoading(true)
    setDeleteError(null)

    const res = await deleteAccount({ confirmPhrase: deletePhrase as "DELETE MY ACCOUNT" })

    if (!res.success) {
      setDeleteError(res.error || "Failed to delete account")
      setDeleteLoading(false)
      return
    }

    await signOut({ callbackUrl: "/" })
  }

  return (
    <div className="space-y-6">
      <Card className="border-border/80 shadow-2xs">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <User className="h-4 w-4 text-primary" />
            Account Information
          </CardTitle>
          <p className="text-xs text-muted-foreground">
            Update your public display name and profile picture URL.
          </p>
        </CardHeader>
        <form onSubmit={handleUpdateAccount}>
          <CardContent className="space-y-4 pt-1">
            {accountError && (
              <div className="rounded-md bg-destructive/10 border border-destructive/20 p-2.5 text-xs text-destructive">
                {accountError}
              </div>
            )}
            {accountSuccess && (
              <div className="rounded-md bg-emerald-500/10 border border-emerald-500/20 p-2.5 text-xs text-emerald-700 dark:text-emerald-400 flex items-center gap-2">
                <Check className="h-4 w-4" />
                Account details updated successfully!
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground">Full Name</label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your full name"
                  required
                  className="text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground">Email Address</label>
                <Input
                  value={user.email}
                  disabled
                  className="text-xs bg-muted/40 cursor-not-allowed"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground">
                Profile Image URL <span className="text-muted-foreground font-normal">(Optional)</span>
              </label>
              <Input
                type="url"
                value={image}
                onChange={(e) => setImage(e.target.value)}
                placeholder="https://example.com/photo.jpg"
                className="text-xs"
              />
            </div>
          </CardContent>
          <CardFooter className="flex justify-end border-t pt-3 pb-3">
            <Button type="submit" size="sm" disabled={accountLoading} className="gap-1.5">
              {accountLoading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              Save Changes
            </Button>
          </CardFooter>
        </form>
      </Card>

      <Card className="border-border/80 shadow-2xs">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <KeyRound className="h-4 w-4 text-primary" />
            Change Password
          </CardTitle>
          <p className="text-xs text-muted-foreground">
            Ensure your account is protected with a secure password.
          </p>
        </CardHeader>
        <form onSubmit={handleChangePassword}>
          <CardContent className="space-y-4 pt-1">
            {pwError && (
              <div className="rounded-md bg-destructive/10 border border-destructive/20 p-2.5 text-xs text-destructive">
                {pwError}
              </div>
            )}
            {pwSuccess && (
              <div className="rounded-md bg-emerald-500/10 border border-emerald-500/20 p-2.5 text-xs text-emerald-700 dark:text-emerald-400 flex items-center gap-2">
                <Check className="h-4 w-4" />
                Password changed successfully!
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground">Current Password</label>
              <Input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
                className="text-xs max-w-md"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground">New Password</label>
                <Input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  required
                  className="text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground">Confirm New Password</label>
                <Input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="text-xs"
                />
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end border-t pt-3 pb-3">
            <Button type="submit" size="sm" disabled={pwLoading} className="gap-1.5">
              {pwLoading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              Update Password
            </Button>
          </CardFooter>
        </form>
      </Card>

      <Card className="border-destructive/30 bg-destructive/5 shadow-2xs">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold flex items-center gap-2 text-destructive">
            <ShieldAlert className="h-4 w-4" />
            Danger Zone
          </CardTitle>
          <p className="text-xs text-muted-foreground">
            Permanently delete your account and all associated pipeline data.
          </p>
        </CardHeader>
        <CardContent className="space-y-2 text-xs text-muted-foreground">
          <p>
            Once you delete your account, there is no going back. All tracked applications, interview records, preparation notes, reminders, and saved listings will be immediately and permanently removed.
          </p>
        </CardContent>
        <CardFooter className="flex justify-start border-t border-destructive/20 pt-3 pb-3">
          <Button
            type="button"
            variant="destructive"
            size="sm"
            onClick={() => setIsDeleteModalOpen(true)}
          >
            Delete Account
          </Button>
        </CardFooter>
      </Card>

      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in-0 duration-150">
          <Card className="w-full max-w-md border-destructive/40 shadow-2xl relative">
            <button
              onClick={() => setIsDeleteModalOpen(false)}
              disabled={deleteLoading}
              className="absolute right-4 top-4 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="h-4 w-4" />
            </button>

            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold flex items-center gap-2 text-destructive">
                <AlertTriangle className="h-4 w-4" />
                Confirm Account Deletion
              </CardTitle>
              <p className="text-xs text-muted-foreground">
                This action cannot be undone. All your data will be permanently wiped.
              </p>
            </CardHeader>

            <form onSubmit={handleDeleteAccount}>
              <CardContent className="space-y-4 pt-1">
                {deleteError && (
                  <div className="rounded-md bg-destructive/10 border border-destructive/20 p-2.5 text-xs text-destructive">
                    {deleteError}
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-foreground">
                    Type <span className="font-bold text-destructive">DELETE MY ACCOUNT</span> to confirm:
                  </label>
                  <Input
                    value={deletePhrase}
                    onChange={(e) => setDeletePhrase(e.target.value)}
                    placeholder="DELETE MY ACCOUNT"
                    required
                    className="text-xs font-mono"
                  />
                </div>
              </CardContent>

              <CardFooter className="flex justify-end gap-2 border-t pt-3">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsDeleteModalOpen(false)}
                  disabled={deleteLoading}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="destructive"
                  size="sm"
                  disabled={deleteLoading || deletePhrase !== "DELETE MY ACCOUNT"}
                  className="gap-1.5"
                >
                  {deleteLoading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  Permanently Delete Everything
                </Button>
              </CardFooter>
            </form>
          </Card>
        </div>
      )}
    </div>
  )
}
