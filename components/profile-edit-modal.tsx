"use client"

import React, { useEffect, useState } from "react"

import { SimpleModal } from "@/components/simple-modal"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { SimpleAvatar } from "@/components/simple-avatar"
import { Camera, Save, Trash2, X } from "lucide-react"
import { type User, authService } from "@/lib/auth"
import { DEPARTMENTS } from "@/lib/config"

interface ProfileEditModalProps {
  user: User
  isOpen: boolean
  onClose: () => void
  onUpdate: (user: User) => void
}

export function ProfileEditModal({ user, isOpen, onClose, onUpdate }: ProfileEditModalProps) {
  const getInitialFormData = (currentUser: User) => ({
    fullName: currentUser.fullName || "",
    phone: currentUser.phone || "",
    dateOfBirth: currentUser.dateOfBirth ? new Date(currentUser.dateOfBirth).toISOString().split("T")[0] : "",
    department: currentUser.department || "",
    address: currentUser.address || "",
    studentId: currentUser.studentId || "",
    registrationNumber: currentUser.registrationNumber || "",
    year: currentUser.year || "",
    section: currentUser.section || "",
    profileImage: currentUser.profileImage || "",
  });

  const [formData, setFormData] = useState(getInitialFormData(user));
  const [isLoading, setIsLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState("")

  useEffect(() => {
    if (isOpen && user) {
      setFormData(getInitialFormData(user));
    }
  }, [user, isOpen]);

  const departments = DEPARTMENTS

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setFormData((prev) => ({
          ...prev,
          profileImage: e.target?.result as string,
        }))
      }
      reader.readAsDataURL(file)
    }
  }

  const handleRemoveImage = () => {
    setFormData((prev) => ({
      ...prev,
      profileImage: "", // Set to empty string to signify removal
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setErrorMsg("")
    try {
      // The profileImage will be a base64 string if changed, or the original URL if not.
      const result = await authService.updateUser(user.id, formData)
      if (result.success && result.user) {
        onUpdate(result.user)
        onClose()
      } else {
        setErrorMsg(result.error || "Update failed. Please try again.")
      }
    } catch (error) {
      console.error("Update failed:", error)
      setErrorMsg("Update failed. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <SimpleModal isOpen={isOpen} onClose={onClose} title="Edit Profile">
      <div className="space-y-6">
        {errorMsg && (
          <div className="bg-red-100 text-red-700 px-4 py-2 rounded border border-red-300 mb-2">
            {errorMsg}
          </div>
        )}
        {/* Summary of entered details */}
        <div className="bg-blue-50 border border-blue-200 rounded p-4 mb-4">
          <h3 className="font-semibold mb-2 text-blue-800">Review Entered Details</h3>
          <ul className="text-sm text-blue-900 space-y-1">
            <li><strong>Full Name:</strong> {formData.fullName}</li>
            <li><strong>Phone:</strong> {formData.phone}</li>
            <li><strong>Date of Birth:</strong> {formData.dateOfBirth || '—'}</li>
            <li><strong>Department:</strong> {formData.department}</li>
            <li><strong>Address:</strong> {formData.address}</li>
            <li><strong>Student ID:</strong> {formData.studentId}</li>
            <li><strong>Registration Number:</strong> {formData.registrationNumber}</li>
            <li><strong>Year:</strong> {formData.year}</li>
            <li><strong>Section:</strong> {formData.section}</li>
          </ul>
        </div>
        <p className="text-gray-600 mb-6">Update your personal information and profile picture</p>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Profile Image */}
          <div className="flex flex-col items-center space-y-4">
            <div className="relative group">
              <SimpleAvatar
                src={formData.profileImage || "/placeholder.svg"}
                fallback={user.fullName
                  ? user.fullName
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                  : "U"}
                className="h-32 w-32 ring-4 ring-blue-200 profile-image"
                size="xl"
              />
              <label className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                <Camera className="h-8 w-8 text-white" />
                <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
              </label>
              {formData.profileImage && (
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute top-0 right-0 rounded-full w-8 h-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={handleRemoveImage}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
            <p className="text-sm text-gray-600">Click to change profile picture</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Full Name */}
            <div className="space-y-2">
              <Label htmlFor="fullName" className="text-sm font-medium text-gray-700">
                Full Name
              </Label>
              <Input
                id="fullName"
                value={formData.fullName}
                onChange={(e) => setFormData((prev) => ({ ...prev, fullName: e.target.value }))}
                className="h-12 bg-white/50 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
                required
              />
            </div>
            {/* Phone */}
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-sm font-medium text-gray-700">
                Phone Number
              </Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
                className="h-12 bg-white/50 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
                placeholder="+1234567890"
              />
            </div>
            {/* Date of Birth */}
            <div className="space-y-2">
              <Label htmlFor="dateOfBirth" className="text-sm font-medium text-gray-700">
                Date of Birth
              </Label>
              <Input
                id="dateOfBirth"
                type="date"
                value={formData.dateOfBirth}
                onChange={(e) => setFormData((prev) => ({ ...prev, dateOfBirth: e.target.value }))}
                className="h-12 bg-white/50 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
              />
            </div>
            {/* Department */}
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="department" className="text-sm font-medium text-gray-700">
                Department
              </Label>
              <Select
                value={formData.department}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, department: value }))}
              >
                <SelectTrigger className="h-12 bg-white/50 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20">
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent className="bg-white/95 backdrop-blur-md">
                  {departments.map((dept) => (
                    <SelectItem key={dept} value={dept}>
                      {dept}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {/* Address */}
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="address" className="text-sm font-medium text-gray-700">
                Address
              </Label>
              <Textarea
                id="address"
                value={formData.address}
                onChange={(e) => setFormData((prev) => ({ ...prev, address: e.target.value }))}
                className="bg-white/50 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
                placeholder="Enter your address"
                rows={3}
              />
            </div>
            {/* Student ID */}
            <div className="space-y-2">
              <Label htmlFor="studentId" className="text-sm font-medium text-gray-700">
                Student ID
              </Label>
              <Input
                id="studentId"
                value={formData.studentId}
                onChange={(e) => setFormData((prev) => ({ ...prev, studentId: e.target.value }))}
                className="h-12 bg-white/50 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
                placeholder="e.g. S12345"
              />
            </div>
            {/* Registration Number */}
            <div className="space-y-2">
              <Label htmlFor="registrationNumber" className="text-sm font-medium text-gray-700">
                Registration Number
              </Label>
              <Input
                id="registrationNumber"
                value={formData.registrationNumber}
                onChange={(e) => setFormData((prev) => ({ ...prev, registrationNumber: e.target.value }))}
                className="h-12 bg-white/50 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
                placeholder="e.g. 20210001"
              />
            </div>
            {/* Year */}
            <div className="space-y-2">
              <Label htmlFor="year" className="text-sm font-medium text-gray-700">
                Year
              </Label>
              <Input
                id="year"
                value={formData.year}
                onChange={(e) => setFormData((prev) => ({ ...prev, year: e.target.value }))}
                className="h-12 bg-white/50 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
                placeholder="e.g. 1st Year"
              />
            </div>
            {/* Section */}
            <div className="space-y-2">
              <Label htmlFor="section" className="text-sm font-medium text-gray-700">
                Section
              </Label>
              <Input
                id="section"
                value={formData.section}
                onChange={(e) => setFormData((prev) => ({ ...prev, section: e.target.value }))}
                className="h-12 bg-white/50 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
                placeholder="e.g. A, B, C"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
            <Button type="button" variant="outline" onClick={onClose} className="px-6 hover:bg-gray-50 bg-transparent">
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="px-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              {isLoading ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Saving...</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Save className="h-4 w-4" />
                  <span>Save Changes</span>
                </div>
              )}
            </Button>
          </div>
        </form>
      </div>
    </SimpleModal>
  )
}
