"use client"

export interface User {
  id: string
  fullName: string
  email: string
  role: "user" | "admin"
  department: string
  profileImage?: string
  phone?: string
  address?: string
  dateOfBirth?: string
  studentId?: string
  registrationNumber?: string
  joinDate: string
  isActive: boolean
  lastLogin?: string
  acmMember?: boolean
  acmRole?:
    | "President"
    | "Vice President"
    | "Secretary"
    | "Treasurer"
    | "Technical Lead"
    | "Event Coordinator"
    | "Member"
  year?: string
  section?: string
}

export interface AttendanceRecord {
  id: string
  userId: string
  userName: string
  subject: string
  date: string
  time: string
  status: "present" | "absent" | "late"
  markedBy?: string
}

/**
 * A robust helper function to map a user object from the database (which may have
 * snake_case properties) to the camelCase format used by the frontend.
 * It checks for both property name styles to prevent errors.
 */
const mapDbUserToFrontend = (dbUser: any): User => {
  if (!dbUser) return {} as User // Return empty user if dbUser is null/undefined
  return {
    id: dbUser.id,
    fullName: dbUser.fullName || dbUser.full_name,
    email: dbUser.email,
    role: dbUser.role,
    department: dbUser.department,
    profileImage: dbUser.profileImage || dbUser.profile_image,
    phone: dbUser.phone,
    address: dbUser.address,
    dateOfBirth: dbUser.dateOfBirth || dbUser.date_of_birth,
    studentId: dbUser.studentId || dbUser.student_id,
    registrationNumber: dbUser.registrationNumber || dbUser.registration_number,
    joinDate: dbUser.joinDate || dbUser.join_date,
    isActive: dbUser.isActive ?? dbUser.is_active,
    lastLogin: dbUser.lastLogin || dbUser.last_login,
    acmMember: dbUser.acmMember ?? dbUser.acm_member,
    acmRole: dbUser.acmRole || dbUser.acm_role,
    year: dbUser.year,
    section: dbUser.section,
  }
}

// Helper function to handle 401 responses
const handleUnauthorized = () => {
  console.error("Authentication failed. Token may be expired.");
  authService.logout();
  if (typeof window !== "undefined") {
    window.location.href = "/";
  }
};

export const authService = {
  login: async (email: string, password: string): Promise<{ success: boolean; user?: User; error?: string }> => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        const frontendUser = mapDbUserToFrontend(data.user)
        // Store user data in localStorage
        localStorage.setItem("currentUser", JSON.stringify(frontendUser))
        localStorage.setItem("authToken", data.token)
        return { success: true, user: frontendUser }
      } else {
        return { success: false, error: data.error || "Login failed" }
      }
    } catch (error) {
      console.error('Login error:', error)
      return { success: false, error: "Network error. Please try again." }
    }
  },

  register: async (userData: {
    fullName: string
    email: string
    password: string
    department: string
    registrationNumber: string
    acmMember: boolean
    acmRole?: string
    year?: string
    section?: string
    studentId?: string
  }): Promise<{ success: boolean; user?: User; error?: string }> => {
    try {
      const token = authService.getAuthToken() // Get the admin's authentication token
      const response = await fetch('/api/auth/register', { // Ensure this calls the protected admin registration endpoint
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`, // Include the token for authorization
        },
        body: JSON.stringify(userData),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        return { success: true, user: mapDbUserToFrontend(data.user) }
      } else {
        if (response.status === 401) {
          handleUnauthorized();
          return { success: false, error: "Authentication failed" };
        }
        return { success: false, error: data.error || "Registration failed" }
      }
    } catch (error) {
      console.error('Registration error:', error)
      return { success: false, error: "Network error. Please try again." }
    }
  },

  forgotPassword: async (email: string): Promise<{ success: boolean; message?: string; error?: string }> => {
    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        return { success: true, message: data.message }
      } else {
        return { success: false, error: data.error || "Failed to send reset email" }
      }
    } catch (error) {
      console.error('Forgot password error:', error)
      return { success: false, error: "Network error. Please try again." }
    }
  },

  resetPassword: async (
    email: string,
    code: string,
    newPassword: string,
  ): Promise<{ success: boolean; message?: string; error?: string }> => {
    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code, newPassword }),
      })
      return await response.json()
    } catch (error) {
      console.error("Reset password service error:", error)
      return { success: false, error: "An unexpected error occurred." }
    }
  },
  getCurrentUser: (): User | null => {
    if (typeof window === "undefined") return null
    const userStr = localStorage.getItem("currentUser")
    return userStr ? JSON.parse(userStr) : null
  },

  getAuthToken: (): string | null => {
    if (typeof window === "undefined") return null
    return localStorage.getItem("authToken")
  },

  updateUser: async (
    userId: string,
    updates: Partial<User> | FormData,
  ): Promise<{ success: boolean; user?: User; error?: string }> => {
    try {
      const token = authService.getAuthToken()
      const headers: HeadersInit = {}
      let body: BodyInit | null = null

      if (updates instanceof FormData) {
        // If FormData, let the browser set the Content-Type header (multipart/form-data)
        body = updates
      } else {
        headers["Content-Type"] = "application/json"
        body = JSON.stringify(updates)
      }

      const response = await fetch(`/api/users/${userId}`, {
        method: 'PATCH',
        headers,
        body,
      })

      const data = await response.json()

      if (response.ok && data.success) {
        const frontendUser = mapDbUserToFrontend(data.user)
        // Update localStorage if it's the current user
        const currentUser = authService.getCurrentUser()
        if (currentUser?.id === userId) {
          localStorage.setItem("currentUser", JSON.stringify(frontendUser))
        }
        return { success: true, user: frontendUser }
      } else {
        if (response.status === 401) {
          handleUnauthorized();
          return { success: false, error: "Authentication failed" };
        }
        return { success: false, error: data.error || "Update failed" }
      }
    } catch (error) {
      console.error('Update user error:', error)
      return { success: false, error: "Network error. Please try again." }
    }
  },

  getAllUsers: async (): Promise<User[]> => {
    try {
      const token = authService.getAuthToken();

      if (!token) {
        console.error("Get all users error: No auth token found.");
        return [];
      }

      const response = await fetch('/api/users', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          handleUnauthorized();
          return [];
        }
        console.error(`Failed to fetch users: Server responded with status ${response.status}`);
        return [];
      }

      const data = await response.json();

      // Find the array of users in the response data, making the function robust
      // to different API response shapes.
      let userList: any[] = [];
        if (Array.isArray(data)) {
        userList = data;
      } else if (data && Array.isArray(data.users)) {
        userList = data.users;
        } else if (data && Array.isArray(data.data)) {
        userList = data.data;
        } else {
        console.error("Failed to fetch users: The API response was not in the expected format (an array or an object with a 'users'/'data' array).", data);
        return [];
      }

      return userList.map(mapDbUserToFrontend);
    } catch (error) {
      console.error('Get all users error:', error)
      return []
    }
  },

  getUserById: async (userId: string): Promise<User | null> => {
    try {
      const token = authService.getAuthToken()
      const response = await fetch(`/api/users/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      const data = await response.json()

      if (response.ok) {
        return mapDbUserToFrontend(data)
      } else {
        return null
      }
    } catch (error) {
      console.error('Get user by ID error:', error)
      return null
    }
  },

  deleteUser: async (userId: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const token = authService.getAuthToken()
      const response = await fetch(`/api/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      const data = await response.json()

      if (response.ok && data.success) {
        return { success: true }
      } else {
        return { success: false, error: data.error || "Delete failed" }
      }
    } catch (error) {
      console.error('Delete user error:', error)
      return { success: false, error: "Network error. Please try again." }
    }
  },

  logout: () => {
    localStorage.removeItem("currentUser")
    localStorage.removeItem("authToken")
  },

  isAuthenticated: (): boolean => {
    return authService.getCurrentUser() !== null && authService.getAuthToken() !== null
  },
}

export const attendanceService = {
  markAttendance: async (
    userId: string,
    subject: string,
    markedBy: string,
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const token = authService.getAuthToken()
      const response = await fetch('/api/attendance/mark', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ userId, subject, markedBy }),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        return { success: true }
      } else {
        return { success: false, error: data.error || "Failed to mark attendance" }
      }
    } catch (error) {
      console.error('Mark attendance error:', error)
      return { success: false, error: "Network error. Please try again." }
    }
  },

  getUserAttendance: async (userId: string): Promise<AttendanceRecord[]> => {
    try {
      const token = authService.getAuthToken()
      const response = await fetch(`/api/attendance/user/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      const data = await response.json()

      if (response.ok && data.success) {
        return data.attendance || []
      } else {
        return []
      }
    } catch (error) {
      console.error('Get user attendance error:', error)
      return []
    }
  },

  getAllAttendance: async (): Promise<AttendanceRecord[]> => {
    try {
      const token = authService.getAuthToken()
      const response = await fetch('/api/attendance', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      const data = await response.json()

      if (response.ok && data.success) {
        return data.attendance || []
      } else {
        return []
      }
    } catch (error) {
      console.error('Get all attendance error:', error)
      return []
    }
  },

  getTodayAttendance: async (): Promise<AttendanceRecord[]> => {
    try {
      const token = authService.getAuthToken()
      const response = await fetch('/api/attendance/today', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      const data = await response.json()

      if (response.ok && data.success) {
        return data.attendance || []
      } else {
        return []
      }
    } catch (error) {
      console.error('Get today attendance error:', error)
      return []
    }
  },

  getDailyAttendance: async (date: string): Promise<AttendanceRecord[]> => {
    try {
      const token = authService.getAuthToken()
      const response = await fetch(`/api/attendance/daily/${date}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      const data = await response.json()

      if (response.ok && data.success) {
        return data.attendance || []
      } else {
        return []
      }
    } catch (error) {
      console.error('Get daily attendance error:', error)
      return []
    }
  },

  getAllAttendanceStats: async (): Promise<{ userId: string; percentage: number }[]> => {
    try {
      const token = authService.getAuthToken()
      const response = await fetch(`/api/attendance/stats/all`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        if (response.status === 401) {
          handleUnauthorized()
        }
        return []
      }

      const data = await response.json()

      if (data.success) {
        return data.stats || []
      } else {
        return []
      }
    } catch (error) {
      console.error("Get all attendance stats error:", error)
      return []
    }
  },

  getAttendanceStats: async (userId: string) => {
    try {
      const token = authService.getAuthToken()
      const response = await fetch(`/api/attendance/stats/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      const data = await response.json()

      if (response.ok && data.success) {
        // Ensure recentAttendance is always an array
        const stats = data.stats || {};
        stats.recentAttendance = Array.isArray(stats.recentAttendance) ? stats.recentAttendance : [];
        return stats;
      } else {
        return {
          totalClasses: 0,
          attendedClasses: 0,
          percentage: 0,
          recentAttendance: [],
        }
      }
    } catch (error) {
      console.error('Get attendance stats error:', error)
      return {
        totalClasses: 0,
        attendedClasses: 0,
        percentage: 0,
        recentAttendance: [],
      }
    }
  },

  getTotalEventsCount: async (): Promise<{ count: number }> => {
    try {
      const token = authService.getAuthToken()
      const response = await fetch(`/api/attendance/events-count`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        if (response.status === 401) {
          handleUnauthorized()
        }
        return { count: 0 }
      }

      const data = await response.json()

      if (data.success) {
        return { count: data.count || 0 }
      } else {
        return { count: 0 }
      }
    } catch (error) {
      console.error("Get total events count error:", error)
      return { count: 0 }
    }
  },

  deleteAttendance: async (attendanceId: number): Promise<{ success: boolean; error?: string }> => {
    try {
      const token = authService.getAuthToken()
      const response = await fetch(`/api/attendance/${attendanceId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      const data = await response.json()

      if (response.ok && data.success) {
        return { success: true }
      } else {
        return { success: false, error: data.error || "Delete failed" }
      }
    } catch (error) {
      console.error("Delete attendance error:", error)
      return { success: false, error: "Network error. Please try again." }
    }
  },

  exportUserAttendance: (userId: string) => {
    // This would need to be implemented with a proper API endpoint
    console.log('Export user attendance for user:', userId)
  },
}
