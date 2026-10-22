import { z } from "zod"

export const updateAccountSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  image: z.string().url("Must be a valid image URL").optional().or(z.literal("")),
})

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(6, "Current password must be at least 6 characters"),
    newPassword: z.string().min(6, "New password must be at least 6 characters").max(100),
    confirmPassword: z.string().min(6),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "New passwords do not match",
    path: ["confirmPassword"],
  })

export const deleteAccountSchema = z.object({
  confirmPhrase: z.literal("DELETE MY ACCOUNT", {
    message: 'Please type "DELETE MY ACCOUNT" exactly to confirm',
  }),
})

export type UpdateAccountInput = z.infer<typeof updateAccountSchema>
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>
export type DeleteAccountInput = z.infer<typeof deleteAccountSchema>
