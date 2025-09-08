"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { Loader2, Key, Mail, ShieldCheck, Eye, EyeOff } from "lucide-react"
import Link from "next/link"
import { authService } from "@/lib/auth"

export default function ResetPasswordPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [email, setEmail] = useState("")
  const [code, setCode] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [errors, setErrors] = useState({
    email: "",
    code: "",
    newPassword: "",
    confirmPassword: "",
  })

  useEffect(() => {
    const emailFromQuery = searchParams.get("email")
    if (emailFromQuery) {
      setEmail(emailFromQuery)
    }
  }, [searchParams])

  // Re-validate confirm password when new password changes for immediate feedback
  useEffect(() => {
    if (confirmPassword) {
      validate("confirmPassword")
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [newPassword])

  const validate = (fieldName?: keyof typeof errors): boolean => {
    const newErrors = { ...errors }
    let isFormValid = true

    const fieldsToValidate = fieldName ? [fieldName] : (Object.keys(errors) as Array<keyof typeof errors>)

    fieldsToValidate.forEach((name) => {
      let error = ""
      switch (name) {
        case "email":
          if (!email) error = "Email is required."
          else if (!/\S+@\S+\.\S+/.test(email)) error = "Email is invalid."
          break
        case "code":
          if (!code) error = "Verification code is required."
          else if (!/^\d{6}$/.test(code)) error = "Code must be 6 digits."
          break
        case "newPassword":
          if (!newPassword) error = "New password is required."
          else if (newPassword.length < 6) error = "Password must be at least 6 characters."
          break
        case "confirmPassword":
          if (!confirmPassword) error = "Please confirm your password."
          else if (newPassword !== confirmPassword) error = "Passwords do not match."
          break
      }
      newErrors[name] = error
      if (error) isFormValid = false
    })

    setErrors(newErrors)
    // If validating a single field, we don't care about the whole form's validity, just that we set the error.
    // If validating the whole form (no fieldName), we return the overall validity.
    return fieldName ? newErrors[fieldName] === "" : isFormValid
  }

  const handleInputChange =
    (setter: React.Dispatch<React.SetStateAction<string>>, field: keyof typeof errors) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setter(e.target.value)
      // Clear the error for the field being edited for a better user experience
      if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }))
    }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) {
      toast.error("Please correct the errors before submitting.")
      return
    }

    setIsLoading(true)
    const result = await authService.resetPassword(email, code, newPassword)
    setIsLoading(false)

    if (result.success) {
      toast.success("Password reset successfully! You can now log in with your new password.")
      router.push("/") // Redirect to login page
    } else {
      toast.error(result.error || "An unknown error occurred.")
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-white/80 backdrop-blur-xl shadow-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-gray-800">Reset Your Password</CardTitle>
          <CardDescription className="text-gray-500">
            Enter the code sent to your email and create a new password.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={handleInputChange(setEmail, "email")}
                  onBlur={() => validate("email")}
                  placeholder="your.email@example.com"
                  className={`pl-10 transition-colors ${errors.email ? "border-red-500 focus-visible:ring-red-500/20" : ""}`}
                  disabled={!!searchParams.get("email")}
                />
              </div>
              {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="code">Verification Code</Label>
              <div className="relative">
                <ShieldCheck className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  id="code"
                  type="text"
                  value={code}
                  onChange={handleInputChange(setCode, "code")}
                  onBlur={() => validate("code")}
                  placeholder="Enter 6-digit code"
                  className={`pl-10 transition-colors ${errors.code ? "border-red-500 focus-visible:ring-red-500/20" : ""}`}
                />
              </div>
              {errors.code && <p className="text-xs text-red-500 mt-1">{errors.code}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <div className="relative">
                <Key className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  id="newPassword"
                  type={showPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={handleInputChange(setNewPassword, "newPassword")}
                  onBlur={() => validate("newPassword")}
                  placeholder="Enter new password"
                  className={`pl-10 pr-10 transition-colors ${errors.newPassword ? "border-red-500 focus-visible:ring-red-500/20" : ""}`}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-1 top-1/2 -translate-y-1/2"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </Button>
              </div>
              {errors.newPassword && <p className="text-xs text-red-500 mt-1">{errors.newPassword}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <div className="relative">
                <Key className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={handleInputChange(setConfirmPassword, "confirmPassword")}
                  onBlur={() => validate("confirmPassword")}
                  placeholder="Confirm your new password"
                  className={`pl-10 pr-10 transition-colors ${errors.confirmPassword ? "border-red-500 focus-visible:ring-red-500/20" : ""}`}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-1 top-1/2 -translate-y-1/2"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </Button>
              </div>
              {errors.confirmPassword && <p className="text-xs text-red-500 mt-1">{errors.confirmPassword}</p>}
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Reset Password
            </Button>
          </form>
          <div className="mt-6 text-center text-sm">
            <Link href="/" className="font-medium text-blue-600 hover:text-blue-500">
              Back to Login
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}