"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { SimpleAvatar } from "@/components/simple-avatar"
import { Progress } from "@/components/ui/progress"
import {
  QrCode,
  Calendar,
  LogOut,
  Download,
  BookOpen,
  BarChart3,
  Edit,
  Share2,
  RefreshCw,
  CheckCircle2,
  Clock,
  TrendingUp,
  Target,
} from "lucide-react"
import { useRouter } from "next/navigation"
import { QRCodeGenerator } from "@/components/qr-code-generator"
import { UserInfoModal } from "@/components/user-info-modal"
import { ProfileEditModal } from "@/components/profile-edit-modal"
import { type User, authService, attendanceService } from "@/lib/auth"

export default function UserDashboard() {
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [qrCode, setQrCode] = useState("")
  const [currentTime, setCurrentTime] = useState(new Date())
  const [attendanceData, setAttendanceData] = useState({
    totalClasses: 0,
    attendedClasses: 0,
    percentage: 0,
    recentAttendance: [],
  })
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isUserInfoModalOpen, setIsUserInfoModalOpen] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date())
  const router = useRouter()

  useEffect(() => {
    // Effect to fetch and set the current user. Runs once on mount.
    const user = authService.getCurrentUser()
    if (!user) {
      router.push("/")
      return
    }
    if (user.role !== "user") {
      router.push("/admin/dashboard")
      return
    }
    setCurrentUser(user)
  }, [router])

  useEffect(() => {
    // Effect to run when currentUser is set or updated.
    if (!currentUser) {
      return
    }

    // Generate QR code with just the registration number for universal scanner compatibility.
    // The admin scanner is designed to handle this plain text format.
    // We fall back to the user ID if registration number is not available.
    const qrData = currentUser.registrationNumber || currentUser.id
    setQrCode(qrData)

    // Load attendance data
    const loadAttendanceData = async () => {
      try {
        const stats = await attendanceService.getAttendanceStats(currentUser.id)
        setAttendanceData(stats)
        setLastUpdated(new Date())
      } catch (error) {
        console.error("Failed to load attendance data:", error)
        // Set default data if API fails
        setAttendanceData({ totalClasses: 0, attendedClasses: 0, percentage: 0, recentAttendance: [] })
      }
    }

    loadAttendanceData()

    // Update time every second
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)

    // Auto-refresh data every 30 seconds to keep it real-time
    const dataRefreshTimer = setInterval(async () => {
      try {
        const stats = await attendanceService.getAttendanceStats(currentUser.id)
        setAttendanceData(stats)
        setLastUpdated(new Date())
      } catch (error) {
        console.error("Auto-refresh failed:", error)
      }
    }, 30000) // Refresh every 30 seconds

    return () => {
      clearInterval(timer)
      clearInterval(dataRefreshTimer)
    }
  }, [currentUser])

  const handleLogout = () => {
    authService.logout()
    router.push("/")
  }

  const handleRefresh = async () => {
    setIsRefreshing(true)
    
    if (currentUser) {
      try {
        // Get fresh attendance data
        const stats = await attendanceService.getAttendanceStats(currentUser.id)
        setAttendanceData(stats)
        setLastUpdated(new Date())
        
        // Get fresh user data
        const userData = await authService.getUserById(currentUser.id)
        if (userData) {
          setCurrentUser(userData)
        }
      } catch (error) {
        console.error("Failed to refresh data:", error)
      }

      // Regenerate QR code with just the registration number for universal scanner compatibility.
      // The admin scanner is designed to handle this plain text format.
      const qrData = currentUser.registrationNumber || currentUser.id
      setQrCode(qrData)
    }
    
    setIsRefreshing(false)
  }

  const handleDownloadQR = () => {
    const canvas = document.querySelector("canvas")
    if (canvas) {
      const link = document.createElement("a")
      link.download = `${currentUser?.fullName}_QR_Code.png`
      link.href = canvas.toDataURL()
      link.click()
    }
  }

  const handleShareQR = async () => {
    try {
      const canvas = document.querySelector("canvas")
      if (!canvas) {
        alert("QR code not found. Please try again.")
        return
      }

      // Check if Web Share API is supported and available
      if (navigator.share) {
        try {
          // For simple text sharing first (more widely supported)
          await navigator.share({
            title: "My Attendance QR Code",
            text: `${currentUser?.fullName}'s SmartAttend QR Code - Registration: ${currentUser?.registrationNumber}`,
            url: window.location.origin,
          })
          return
        } catch (shareError) {
          console.log("Text sharing failed, trying file sharing:", shareError)

          // Try file sharing as fallback
          try {
            await new Promise((resolve, reject) => {
              canvas.toBlob(async (blob) => {
                if (!blob) {
                  reject(new Error("Failed to create image blob"))
                  return
                }

                try {
                  const file = new File([blob], `${currentUser?.fullName}_QR_Code.png`, {
                    type: "image/png",
                  })

                  // Check if the file can be shared
                  if (navigator.canShare && navigator.canShare({ files: [file] })) {
                    await navigator.share({
                      title: "My Attendance QR Code",
                      text: `${currentUser?.fullName}'s SmartAttend QR Code`,
                      files: [file],
                    })
                    resolve(true)
                  } else {
                    reject(new Error("File sharing not supported"))
                  }
                } catch (error) {
                  reject(error)
                }
              }, "image/png")
            })
            return
          } catch (fileShareError) {
            console.log("File sharing failed:", fileShareError)
          }
        }
      }

      // Fallback to copying QR data or downloading
      fallbackShare()
    } catch (error) {
      console.log("Share operation failed:", error)
      fallbackShare()
    }
  }

  const fallbackShare = () => {
    // Create a more user-friendly fallback
    const shareData = {
      name: currentUser?.fullName,
      registration: currentUser?.registrationNumber,
      email: currentUser?.email,
      qrData: qrCode,
    }

    // Try clipboard API first
    if (navigator.clipboard && navigator.clipboard.writeText) {
      const shareText = `SmartAttend QR Code
Name: ${shareData.name}
Registration: ${shareData.registration}
Email: ${shareData.email}
Generated: ${new Date().toLocaleString()}`

      navigator.clipboard
        .writeText(shareText)
        .then(() => {
          alert("✅ QR code information copied to clipboard!")
        })
        .catch(() => {
          // Final fallback - show share dialog
          showShareDialog(shareData)
        })
    } else {
      // Show share dialog for older browsers
      showShareDialog(shareData)
    }
  }

  const showShareDialog = (shareData: any) => {
    const shareText = `SmartAttend QR Code
Name: ${shareData.name}
Registration: ${shareData.registration}
Email: ${shareData.email}
Generated: ${new Date().toLocaleString()}`

    // Create a temporary textarea for manual copying
    const textArea = document.createElement("textarea")
    textArea.value = shareText
    textArea.style.position = "fixed"
    textArea.style.left = "-999999px"
    textArea.style.top = "-999999px"
    document.body.appendChild(textArea)
    textArea.focus()
    textArea.select()

    try {
      const successful = document.execCommand("copy")
      if (successful) {
        alert("✅ QR code information copied to clipboard!")
      } else {
        // Show the text in a dialog for manual copying
        prompt("Copy this QR code information:", shareText)
      }
    } catch (err) {
      // Show the text in a dialog for manual copying
      prompt("Copy this QR code information:", shareText)
    } finally {
      document.body.removeChild(textArea)
    }
  }

  const getStatusColor = (status: string) => {
    return status === "present"
      ? "bg-green-100 text-green-800 border-green-200"
      : "bg-red-100 text-red-800 border-red-200"
  }

  const getPercentageColor = (percentage: number) => {
    if (percentage >= 85) return "text-green-600"
    if (percentage >= 75) return "text-yellow-600"
    return "text-red-600"
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Enhanced Header */}
      <header className="bg-white/90 backdrop-blur-xl shadow-lg border-b border-white/30 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl blur opacity-75 animate-pulse-glow"></div>
                <div className="relative bg-white p-3 rounded-xl shadow-lg">
                  <QrCode className="h-8 w-8 text-blue-600" />
                </div>
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  SmartAttend
                </h1>
                <p className="text-sm text-gray-600 font-medium">Student Dashboard</p>
              </div>
            </div>

            <div className="flex items-center space-x-6">
              {/* Enhanced Time and Date Display */}
              <div className="hidden md:flex items-center space-x-6 bg-white/80 backdrop-blur-sm rounded-2xl px-6 py-3 shadow-lg border border-white/30">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-gray-900 font-mono">{currentTime.toLocaleTimeString()}</div>
                    <div className="text-xs text-gray-600">Live Time</div>
                  </div>
                </div>
                <div className="w-px h-8 bg-gray-300"></div>
                <div className="text-center">
                  <div className="text-sm font-semibold text-gray-900">
                    {currentTime.toLocaleDateString("en-US", {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                    })}
                  </div>
                  <div className="text-xs text-gray-600">Today</div>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <div onClick={() => setIsUserInfoModalOpen(true)} className="cursor-pointer">
                  <SimpleAvatar
                    src={currentUser.profileImage || "/placeholder.svg"}
                    fallback={currentUser.fullName
                      ? currentUser.fullName
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                      : "U"}
                    className="h-10 w-10 ring-2 ring-blue-200 hover:ring-blue-400 transition-all duration-300"
                    size="md"
                  />
                </div>
                <div className="hidden md:block">
                  <div className="text-sm font-semibold text-gray-900">{currentUser.fullName || "User"}</div>
                  <div className="text-xs text-gray-500">{currentUser.department || "Department"}</div>
                </div>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="hover:bg-red-50 hover:text-red-600 hover:border-red-200 bg-white/80 backdrop-blur-sm"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-12 gap-8">
          {/* Left Column - QR Code & User Info */}
          <div className="lg:col-span-4 space-y-6">
            {/* User Profile Card */}
            <Card className="bg-white/90 backdrop-blur-xl border-white/30 shadow-2xl hover:shadow-3xl transition-all duration-500 card-hover">
              <CardHeader className="text-center pb-4">
                <div className="relative mx-auto mb-4">
                  <SimpleAvatar
                    src={currentUser.profileImage || "/placeholder.svg"}
                    fallback={currentUser.fullName
                      ? currentUser.fullName
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                      : "U"}
                    className="h-24 w-24 ring-4 ring-blue-200 profile-image mx-auto"
                    size="xl"
                  />
                  <Button
                    size="sm"
                    onClick={() => setIsEditModalOpen(true)}
                    className="absolute -bottom-2 -right-2 rounded-full w-8 h-8 p-0 bg-blue-600 hover:bg-blue-700 shadow-lg"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                </div>
                <CardTitle className="text-xl font-bold text-gray-900">{currentUser.fullName || "User"}</CardTitle>
                <CardDescription className="text-gray-600">
                  {currentUser.registrationNumber && (
                    <div className="font-mono text-sm mb-1">Reg: {currentUser.registrationNumber}</div>
                  )}
                  <div>{currentUser.department || "Department"}</div>
                  <div className="text-xs mt-1">{currentUser.email || "email@example.com"}</div>
                  {currentUser.acmMember && currentUser.acmRole && (
                    <Badge className="mt-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold">
                      ACM {currentUser.acmRole}
                    </Badge>
                  )}
                </CardDescription>
              </CardHeader>
            </Card>

            {/* QR Code Card */}
            <Card className="bg-white/90 backdrop-blur-xl border-white/30 shadow-2xl hover:shadow-3xl transition-all duration-500">
              <CardHeader className="text-center pb-4">
                <CardTitle className="flex items-center justify-center space-x-2">
                  <QrCode className="h-5 w-5 text-blue-600" />
                  <span>Your QR Code</span>
                </CardTitle>
                <CardDescription>Show this to mark attendance</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col items-center space-y-6">
                <div className="relative">
                  <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-6 rounded-3xl border-2 border-blue-200/50 shadow-inner">
                    <div className="bg-white p-4 rounded-2xl shadow-lg">
                      {qrCode && <QRCodeGenerator data={qrCode} size={200} />}
                    </div>
                  </div>
                  <div className="absolute -top-3 -right-3 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center shadow-lg">
                    <CheckCircle2 className="h-4 w-4 text-white" />
                  </div>
                </div>

                <div className="text-center space-y-2">
                  <div className="px-4 py-2 bg-green-100 text-green-700 rounded-full text-sm font-semibold">
                    ✓ Active & Verified
                  </div>
                  <p className="text-xs text-gray-500">Generated: {new Date().toLocaleString()}</p>
                </div>

                <div className="flex space-x-3 w-full">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 hover:bg-blue-50 bg-white/80"
                    onClick={handleDownloadQR}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 hover:bg-purple-50 bg-white/80"
                    onClick={handleShareQR}
                  >
                    <Share2 className="h-4 w-4 mr-2" />
                    Share
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="hover:bg-green-50 bg-white/80"
                    onClick={handleRefresh}
                    disabled={isRefreshing}
                  >
                    <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Attendance Percentage Card */}
            <Card className="bg-gradient-to-br from-green-500 to-emerald-600 text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
              <CardContent className="p-6 text-center">
                <TrendingUp className="h-10 w-10 mx-auto mb-3 opacity-90" />
                <div className="text-4xl font-bold mb-2">{attendanceData.percentage || 0}%</div>
                <div className="text-sm opacity-90 font-medium">Attendance Rate</div>
                <div className="text-xs opacity-75 mt-1">
                  {attendanceData.attendedClasses || 0} of {attendanceData.totalClasses || 0} classes
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Attendance Info */}
          <div className="lg:col-span-8 space-y-6">
            {/* Attendance Overview */}
            <Card className="bg-white/90 backdrop-blur-xl border-white/30 shadow-2xl">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center space-x-2">
                      <BarChart3 className="h-6 w-6 text-blue-600" />
                      <span>Attendance Overview</span>
                    </CardTitle>
                    <CardDescription>Your attendance performance this semester</CardDescription>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-200">Semester 1</Badge>
                    <div className="text-xs text-gray-500">
                      Last updated: {lastUpdated.toLocaleTimeString()}
                    </div>
                    <Button variant="ghost" size="sm" onClick={handleRefresh} disabled={isRefreshing}>
                      <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid sm:grid-cols-3 gap-8 mb-8">
                  <div className="text-center">
                    <div className="relative inline-flex items-center justify-center w-24 h-24 mb-4">
                      <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full opacity-10"></div>
                      <div className="text-4xl font-bold text-gray-900">{attendanceData.totalClasses || 0}</div>
                    </div>
                    <div className="text-sm text-gray-600 font-semibold">Total Classes</div>
                  </div>
                  <div className="text-center">
                    <div className="relative inline-flex items-center justify-center w-24 h-24 mb-4">
                      <div className="absolute inset-0 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full opacity-10"></div>
                      <div className="text-4xl font-bold text-green-600">{attendanceData.attendedClasses || 0}</div>
                    </div>
                    <div className="text-sm text-gray-600 font-semibold">Classes Attended</div>
                  </div>
                  <div className="text-center">
                    <div className="relative inline-flex items-center justify-center w-24 h-24 mb-4">
                      <div
                        className={`absolute inset-0 rounded-full opacity-10 ${
                          (attendanceData.percentage || 0) >= 85
                            ? "bg-gradient-to-br from-green-500 to-emerald-600"
                            : (attendanceData.percentage || 0) >= 75
                              ? "bg-gradient-to-br from-yellow-500 to-orange-600"
                              : "bg-gradient-to-br from-red-500 to-pink-600"
                        }`}
                      ></div>
                      <div className={`text-4xl font-bold ${getPercentageColor(attendanceData.percentage || 0)}`}>
                        {attendanceData.percentage || 0}%
                      </div>
                    </div>
                    <div className="text-sm text-gray-600 font-semibold">Attendance Rate</div>
                  </div>
                </div>

                {(attendanceData.totalClasses || 0) > 0 && (
                  <div className="space-y-6">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center space-x-2">
                        <Target className="h-5 w-5 text-gray-500" />
                        <span className="text-sm text-gray-600 font-semibold">Current Progress</span>
                      </div>
                      <span className="text-lg font-bold text-gray-900">{attendanceData.percentage || 0}%</span>
                    </div>

                    <Progress value={attendanceData.percentage || 0} className="h-4 bg-gray-200 rounded-full" />

                    {(attendanceData.percentage || 0) < 75 && (
                      <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                        <div className="flex items-center space-x-2">
                          <Target className="h-5 w-5 text-red-600" />
                          <p className="text-red-700 font-medium">
                            Attention: Your attendance is below the minimum requirement of 75%
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {(attendanceData.totalClasses || 0) === 0 && (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Calendar className="h-8 w-8 text-blue-600" />
                    </div>
                    <p className="text-gray-600 font-medium text-lg mb-2">No classes scheduled yet</p>
                    <p className="text-sm text-gray-500">Your attendance will be tracked once classes begin</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recent Attendance */}
            <Card className="bg-white/90 backdrop-blur-xl border-white/30 shadow-2xl">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center space-x-2">
                      <BookOpen className="h-6 w-6 text-purple-600" />
                      <span>Recent Attendance</span>
                    </CardTitle>
                    <CardDescription>Your latest attendance records</CardDescription>
                  </div>
                  <Button variant="outline" size="sm" className="hover:bg-blue-50 bg-white/80">
                    View All
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {attendanceData.recentAttendance && attendanceData.recentAttendance.length > 0 ? (
                    attendanceData.recentAttendance.map((record: any, index: number) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-5 bg-gradient-to-r from-gray-50 to-white rounded-2xl border border-gray-100 hover:shadow-lg transition-all duration-300 hover:scale-[1.02]"
                      >
                        <div className="flex items-center space-x-4">
                          <div
                            className={`w-4 h-4 rounded-full ${
                              record.status === "present" ? "bg-green-500" : "bg-red-500"
                            } animate-pulse`}
                          ></div>
                          <div>
                            <div className="font-semibold text-gray-900 text-lg">{record.subject}</div>
                            <div className="text-sm text-gray-600 flex items-center space-x-3">
                              <div className="flex items-center space-x-1">
                                <Calendar className="h-4 w-4" />
                                <span>{record.date}</span>
                              </div>
                              {record.time !== "—" && (
                                <>
                                  <span>•</span>
                                  <div className="flex items-center space-x-1">
                                    <Clock className="h-4 w-4" />
                                    <span>{record.time}</span>
                                  </div>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                        <Badge className={`${getStatusColor(record.status)} font-semibold px-3 py-1`}>
                          {record.status === "present" ? "Present" : "Absent"}
                        </Badge>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-12">
                      <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600 font-medium text-lg">No attendance records yet</p>
                      <p className="text-sm text-gray-500">Your attendance history will appear here</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Profile Edit Modal */}
      <ProfileEditModal
        user={currentUser}
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onUpdate={(updatedUser) => {
          setCurrentUser(updatedUser)
          setIsEditModalOpen(false)
        }}
      />

      {/* User Info Modal to view own details */}
      <UserInfoModal
        user={currentUser}
        isOpen={isUserInfoModalOpen}
        onClose={() => setIsUserInfoModalOpen(false)}
        // The attendance props are not relevant for this view.
        onMarkAttendance={() => {}}
        selectedSubject=""
      />
    </div>
  )
}
