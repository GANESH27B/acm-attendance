"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { authService } from "@/lib/auth"
import { Loader2, Mail } from "lucide-react"

interface ForgotPasswordModalProps {
  isOpen: boolean
  onClose: () => void
}

export function ForgotPasswordModal({ isOpen, onClose }: ForgotPasswordModalProps) {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) {
      toast.error("Please enter your email address.")
      return
    }
    setIsLoading(true)

    const result = await authService.forgotPassword(email)

    if (result.success) {
      toast.success(result.message || "A verification code has been sent.")
      router.push(`/reset-password?email=${encodeURIComponent(email)}`)
      onClose()
    } else {
      toast.error(result.error || "An unknown error occurred.")
    }
    setIsLoading(false)
  }

  // Reset state when modal is closed
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setEmail("")
      setIsLoading(false)
      onClose()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Forgot Password</DialogTitle>
          <DialogDescription>
            Enter your email address and we'll send you a verification code to reset your password.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="email-forgot">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input id="email-forgot" type="email" placeholder="your.email@example.com" value={email} onChange={(e) => setEmail(e.target.value)} className="pl-10" required />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Send Code
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}