"use client"

import { useState, useEffect } from "react"
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { authService } from "@/lib/auth"
import { toast } from "sonner"
import { User, Mail, Key, Building, Hash, GraduationCap, BookUser, Briefcase, Loader2, RefreshCw, Eye, EyeOff } from "lucide-react"

interface AddStudentModalProps {
  isOpen: boolean
  onClose: () => void
  onStudentAdded: () => void
}

export function AddStudentModal({ isOpen, onClose, onStudentAdded }: AddStudentModalProps) {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    department: "",
    registrationNumber: "",
    acmMember: false,
    acmRole: "",
    year: "",
    section: "",
    studentId: "",
  })
  const [errors, setErrors] = useState<Partial<typeof formData>>({})
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const departments = [
    "Computer Science Engineering",
    "Electronics and Communication Engineering",
    "Mechanical Engineering",
    "Civil Engineering",
    "Electrical Engineering",
    "Information Technology",
  ]

  const acmRoles = [
    "President",
    "Vice President",
    "Secretary",
    "Treasurer",
    "Technical Lead",
    "Event Coordinator",
    "Web Development Team",
    "Media Team",
    "PR Team",
    "Documentation Team",
    "Research and Analysis Team",
    "Member",
  ]
  
  const years = ["1st Year", "2nd Year", "3rd Year", "4th Year"];
  
  // Reset form state when the modal is opened
  useEffect(() => {
    if (isOpen) {
      // Reset form to its initial state
      setFormData({
        fullName: "",
        email: "",
        password: "",
        department: "",
        registrationNumber: "",
        acmMember: false,
        acmRole: "",
        year: "",
        section: "",
        studentId: "",
      })
      setErrors({})
      setIsLoading(false)
      setShowPassword(false)
    }
  }, [isOpen])

  const validate = () => {
    const newErrors: Partial<typeof formData> = {}
    if (!formData.fullName) newErrors.fullName = "Full name is required"
    if (!formData.email) newErrors.email = "Email is required"
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "Email is invalid"
    if (!formData.password) newErrors.password = "Password is required"
    else if (formData.password.length < 6) newErrors.password = "Password must be at least 6 characters"
    if (!formData.registrationNumber) newErrors.registrationNumber = "Registration number is required"
    if (!formData.department) newErrors.department = "Department is required"
    if (!formData.year) newErrors.year = "Year is required"
    if (!formData.section) newErrors.section = "Section is required"
    if (!formData.studentId) newErrors.studentId = "Student ID is required"
    // Validate ACM role if ACM member is selected
    if (formData.acmMember && !formData.acmRole) {
      newErrors.acmRole = "ACM Role is required when ACM Member is selected"
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (errors[name as keyof typeof errors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }))
    }
  }

  const handleSelectChange = (name: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (errors[name as keyof typeof errors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }))
    }
  }

  const handleCheckboxChange = (checked: boolean) => {
    setFormData((prev) => ({ ...prev, acmMember: checked, acmRole: checked ? prev.acmRole : "" }))
  }

  

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) {
      toast.error("Please fill in all required fields correctly.")
      return
    }
    setIsLoading(true)
    
    const result = await authService.register(formData)

    if (result.success) {
      toast.success("Student added successfully!")
      onStudentAdded()
      onClose()
    } else {
      // Check for specific duplicate errors and set field-specific errors
      if (result.error) {
        const errorMsg = result.error.toLowerCase();
        if (errorMsg.includes("email already exists") || errorMsg.includes("email already registered")) {
          setErrors((prev) => ({ ...prev, email: "This email is already registered" }));
        } else if (errorMsg.includes("registration number already exists")) {
          setErrors((prev) => ({ ...prev, registrationNumber: "This registration number is already taken" }));
        } else if (errorMsg.includes("student id already exists")) {
          setErrors((prev) => ({ ...prev, studentId: "This student ID is already taken" }));
        } else {
          toast.error(result.error);
        }
      } else {
        toast.error("An unknown error occurred.");
      }
    }
    setIsLoading(false)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl bg-gray-50/90 backdrop-blur-sm grid-rows-[auto_minmax(0,1fr)_auto] max-h-[90vh]">
        <DialogHeader className="text-center">
          <DialogTitle className="text-2xl font-bold text-gray-800">Add New Student</DialogTitle>
          <DialogDescription className="text-gray-500">
            Fill out the form below to create a new student account.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col overflow-hidden">
          <div className="overflow-y-auto pr-6 scrollbar-thin scrollbar-thumb-primary scrollbar-track-secondary">
            {/* Summary of entered registration data */}
            <div className="bg-blue-50 border border-blue-200 rounded p-4 mb-4">
              <h3 className="font-semibold mb-2 text-blue-800">Review Entered Registration Data</h3>
              <ul className="text-sm text-blue-900 space-y-1">
                <li><strong>Full Name:</strong> {formData.fullName}</li>
                <li><strong>Email:</strong> {formData.email}</li>
                <li><strong>Password:</strong> {formData.password ? '••••••••' : ''}</li>
                <li><strong>Registration Number:</strong> {formData.registrationNumber}</li>
                <li><strong>Department:</strong> {formData.department}</li>
                <li><strong>Year:</strong> {formData.year}</li>
                <li><strong>Section:</strong> {formData.section}</li>
                <li><strong>Student ID:</strong> {formData.studentId}</li>
                <li><strong>ACM Member:</strong> {formData.acmMember ? 'Yes' : 'No'}</li>
                {formData.acmMember && (
                  <li><strong>ACM Role:</strong> {formData.acmRole}</li>
                )}
              </ul>
            </div>
            <div className="space-y-6 p-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                {/* Personal Information */}
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input id="fullName" name="fullName" value={formData.fullName} onChange={handleChange} placeholder="Enter ame" className="pl-10" />
                  </div>
                  {errors.fullName && <p className="text-xs text-red-500">{errors.fullName}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input id="email" name="email" type="email" value={formData.email} onChange={handleChange} placeholder="Enter Email @klu.ac.in" className="pl-10" />
                  </div>
                  {errors.email && <p className="text-xs text-red-500">{errors.email}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Key className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input id="password" name="password" type={showPassword ? "text" : "password"} value={formData.password} onChange={handleChange} placeholder="Create a strong password" className="pl-10 pr-24" />
                    <div className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center">
                      <Button type="button" variant="ghost" size="sm" onClick={() => setShowPassword(!showPassword)} className="mr-1">
                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </Button>
                    </div>
                  </div>
                  {errors.password && <p className="text-xs text-red-500">{errors.password}</p>}
                </div>

                {/* Academic Information */}
                <div className="space-y-2">
                  <Label htmlFor="registrationNumber">Registration Number</Label>
                  <div className="relative">
                    <Hash className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input id="registrationNumber" name="registrationNumber" value={formData.registrationNumber} onChange={handleChange} placeholder="Enter Registration Number" className="pl-10" />
                  </div>
                  {errors.registrationNumber && <p className="text-xs text-red-500">{errors.registrationNumber}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="department">Department</Label>
                  <Select onValueChange={(value) => handleSelectChange("department", value)} value={formData.department}>
                    <SelectTrigger className="pl-10">
                      <Building className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <SelectValue placeholder="Select a department" />
                    </SelectTrigger>
                    <SelectContent>{departments.map((dept) => (<SelectItem key={dept} value={dept}>{dept}</SelectItem>))}</SelectContent>
                  </Select>
                  {errors.department && <p className="text-xs text-red-500">{errors.department}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="year">Year</Label>
                  <Select onValueChange={(value) => handleSelectChange("year", value)} value={formData.year}>
                    <SelectTrigger className="pl-10">
                      <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <SelectValue placeholder="Select year" />
                    </SelectTrigger>
                    <SelectContent>{years.map((year) => (<SelectItem key={year} value={year}>{year}</SelectItem>))}</SelectContent>
                  </Select>
                  {errors.year && <p className="text-xs text-red-500">{errors.year}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="section">Section</Label>
                  <div className="relative">
                    <BookUser className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input id="section" name="section" value={formData.section} onChange={handleChange} placeholder="e.g. A, B, C" className="pl-10" />
                  </div>
                  {errors.section && <p className="text-xs text-red-500">{errors.section}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="studentId">Student ID</Label>
                  <div className="relative">
                    <Hash className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                      id="studentId"
                      name="studentId"
                      value={formData.studentId}
                      onChange={handleChange}
                      placeholder="Enter Student ID"
                      className="pl-10"
                    />
                  </div>
                  {errors.studentId && <p className="text-xs text-red-500">{errors.studentId}</p>}
                </div>
              </div>

              {/* ACM Membership */}
              <div className="md:col-span-2 pt-4">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-gray-50 px-2 text-gray-500">Optional</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-3 pt-2">
                <Checkbox id="acmMember" checked={formData.acmMember} onCheckedChange={handleCheckboxChange} />
                <Label htmlFor="acmMember" className="font-medium text-gray-700">Is this student an ACM Member?</Label>
              </div>
              {formData.acmMember && (
                <div className="space-y-2 pl-6">
                  <Label htmlFor="acmRole">ACM Role</Label>
                  <Select onValueChange={(value) => handleSelectChange("acmRole", value)} value={formData.acmRole}>
                    <SelectTrigger className="pl-10">
                      <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <SelectValue placeholder="Select ACM role" />
                    </SelectTrigger>
                    <SelectContent>{acmRoles.map((role) => (<SelectItem key={role} value={role}>{role}</SelectItem>))}</SelectContent>
                  </Select>
                </div>
              )}
            </div>
          </div>
          <DialogFooter className="pt-4 mt-auto">
            <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={isLoading} className="w-32 bg-blue-600 hover:bg-blue-700 text-white">
              {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Add Student"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
