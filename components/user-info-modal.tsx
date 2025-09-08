"use client"

import { SimpleModal } from "@/components/simple-modal"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { SimpleAvatar } from "@/components/simple-avatar"
import { Card, CardContent } from "@/components/ui/card"
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  GraduationCap,
  Award,
  Building,
  Clock,
  CheckCircle2,
  Star,
  Users,
} from "lucide-react"
import type { User as UserType } from "@/lib/auth"

interface UserInfoModalProps {
  user: UserType | null
  isOpen: boolean
  onClose: () => void
  onMarkAttendance?: () => void
  selectedSubject?: string
}

export function UserInfoModal({ user, isOpen, onClose, onMarkAttendance, selectedSubject }: UserInfoModalProps) {
  if (!user) return null

  const getACMRoleColor = (role: string) => {
    switch (role) {
      case "President":
        return "bg-gradient-to-r from-purple-500 to-pink-500 text-white"
      case "Vice President":
        return "bg-gradient-to-r from-blue-500 to-indigo-500 text-white"
      case "Secretary":
        return "bg-gradient-to-r from-green-500 to-emerald-500 text-white"
      case "Treasurer":
        return "bg-gradient-to-r from-yellow-500 to-orange-500 text-white"
      case "Technical Lead":
        return "bg-gradient-to-r from-red-500 to-pink-500 text-white"
      case "Event Coordinator":
        return "bg-gradient-to-r from-cyan-500 to-blue-500 text-white"
      default:
        return "bg-gradient-to-r from-gray-500 to-gray-600 text-white"
    }
  }

  return (
    <SimpleModal isOpen={isOpen} onClose={onClose} title="Student Information">
      <div className="space-y-8">
        <p className="text-gray-600 text-lg text-center">
          Complete profile and attendance details
        </p>

        <div className="space-y-8">
          {/* Profile Section */}
          <Card className="bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200/50 shadow-lg">
            <CardContent className="p-8">
              <div className="flex flex-col md:flex-row items-center space-y-6 md:space-y-0 md:space-x-8">
                <div className="relative">
                  <SimpleAvatar
                    src={user.profileImage || "/placeholder.svg"}
                    fallback={user.fullName
                      ? user.fullName
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                      : "U"}
                    className="h-32 w-32 ring-4 ring-blue-200 shadow-xl"
                    size="xl"
                  />
                  {user.isActive && (
                    <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center shadow-lg">
                      <CheckCircle2 className="h-5 w-5 text-white" />
                    </div>
                  )}
                </div>

                <div className="flex-1 text-center md:text-left space-y-4">
                  <div>
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">{user.fullName || "Unknown User"}</h2>
                    <div className="flex flex-wrap justify-center md:justify-start gap-3">
                      <Badge className="bg-blue-100 text-blue-700 border-blue-200 px-3 py-1 text-sm font-semibold">
                        {user.role === "user" ? "Student" : "Admin"}
                      </Badge>
                      {user.acmMember && user.acmRole && (
                        <Badge className={`${getACMRoleColor(user.acmRole)} px-3 py-1 text-sm font-semibold shadow-lg`}>
                          <Star className="h-4 w-4 mr-1" />
                          ACM {user.acmRole}
                        </Badge>
                      )}
                      <Badge className="bg-green-100 text-green-700 border-green-200 px-3 py-1 text-sm font-semibold">
                        {user.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                  </div>

                  {user.registrationNumber && (
                    <div className="bg-white/80 rounded-xl p-4 shadow-inner">
                      <p className="text-sm text-gray-600 mb-1">Registration Number</p>
                      <p className="text-xl font-mono font-bold text-gray-900">{user.registrationNumber}</p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card className="bg-white/80 backdrop-blur-sm border-gray-200/50 shadow-lg">
            <CardContent className="p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                <User className="h-6 w-6 mr-2 text-blue-600" />
                Contact Information
              </h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <Mail className="h-5 w-5 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-600">Email</p>
                      <p className="font-semibold text-gray-900">{user.email || "No email"}</p>
                    </div>
                  </div>
                  {user.phone && (
                    <div className="flex items-center space-x-3">
                      <Phone className="h-5 w-5 text-gray-500" />
                      <div>
                        <p className="text-sm text-gray-600">Phone</p>
                        <p className="font-semibold text-gray-900">{user.phone}</p>
                      </div>
                    </div>
                  )}
                  {user.dateOfBirth && (
                    <div className="flex items-center space-x-3">
                      <Calendar className="h-5 w-5 text-gray-500" />
                      <div>
                        <p className="text-sm text-gray-600">Date of Birth</p>
                        <p className="font-semibold text-gray-900">{new Date(user.dateOfBirth).toLocaleDateString()}</p>
                      </div>
                    </div>
                  )}
                </div>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <Building className="h-5 w-5 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-600">Department</p>
                      <p className="font-semibold text-gray-900">{user.department || "No department"}</p>
                    </div>
                  </div>
                  {user.year && (
                    <div className="flex items-center space-x-3">
                      <GraduationCap className="h-5 w-5 text-gray-500" />
                      <div>
                        <p className="text-sm text-gray-600">Year & Section</p>
                        <p className="font-semibold text-gray-900">
                          {user.year} - Section {user.section}
                        </p>
                      </div>
                    </div>
                  )}
                  {user.address && (
                    <div className="flex items-center space-x-3">
                      <MapPin className="h-5 w-5 text-gray-500" />
                      <div>
                        <p className="text-sm text-gray-600">Address</p>
                        <p className="font-semibold text-gray-900">{user.address}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* ACM Membership Details */}
          {user.acmMember && (
            <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200/50 shadow-lg">
              <CardContent className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                  <Award className="h-6 w-6 mr-2 text-purple-600" />
                  ACM Membership
                </h3>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-lg">
                      <Users className="h-8 w-8 text-white" />
                    </div>
                    <div>
                      <p className="text-lg font-bold text-gray-900">Active ACM Member</p>
                      <p className="text-purple-600 font-semibold">Role: {user.acmRole}</p>
                      <p className="text-sm text-gray-600">
                        Member since {new Date(user.joinDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <Badge
                    className={`${getACMRoleColor(user.acmRole || "Member")} px-4 py-2 text-lg font-bold shadow-lg`}
                  >
                    {user.acmRole}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Additional Information */}
          <Card className="bg-white/80 backdrop-blur-sm border-gray-200/50 shadow-lg">
            <CardContent className="p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                <Clock className="h-6 w-6 mr-2 text-green-600" />
                Account Information
              </h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Join Date</p>
                  <p className="font-semibold text-gray-900">{new Date(user.joinDate).toLocaleDateString()}</p>
                </div>
                {user.lastLogin && (
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Last Login</p>
                    <p className="font-semibold text-gray-900">{new Date(user.lastLogin).toLocaleString()}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
            <Button variant="outline" onClick={onClose} className="px-8 py-3 hover:bg-gray-50 bg-white/80">
              Close
            </Button>
            {onMarkAttendance && selectedSubject && (
              <Button
                onClick={onMarkAttendance}
                className="px-8 py-3 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white font-semibold shadow-lg"
              >
                <CheckCircle2 className="h-5 w-5 mr-2" />
                Mark Attendance for {selectedSubject}
              </Button>
            )}
          </div>
        </div>
      </div>
    </SimpleModal>
  )
}
