import { executeQuery } from "../database"

export interface AttendanceRecord {
  id: number
  user_id: string
  subject_id: number
  attendance_date: string
  attendance_time: string
  status: "present" | "absent" | "late"
  marked_by?: string
  qr_code_used?: string
  created_at: string
}

export interface Subject {
  id: number
  subject_name: string
  subject_code: string
  department: string
  credits: number
  created_at: string
}

export class AttendanceModel {
  static async markAttendance(
    userId: string,
    subjectName: string,
    markedBy: string,
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const trimmedSubjectName = subjectName.trim()
      if (!trimmedSubjectName) {
        return { success: false, error: "Subject name cannot be empty." }
      }

      // First, find or create the subject
      const subjectResult = await executeQuery("SELECT id FROM subjects WHERE subject_name = ?", [trimmedSubjectName])

      let subjectId: number

      if (subjectResult.success && Array.isArray(subjectResult.data) && subjectResult.data.length > 0) {
        subjectId = (subjectResult.data[0] as any).id
      } else {
        // Create new subject
        const createSubjectResult = await executeQuery(
          "INSERT INTO subjects (subject_name, subject_code, department, credits) VALUES (?, ?, ?, ?)",
          [trimmedSubjectName, trimmedSubjectName.replace(/\s+/g, "").toUpperCase(), "General", 3],
        )

        if (!createSubjectResult.success) {
          return { success: false, error: "Failed to create subject" }
        }

        subjectId = (createSubjectResult.data as any).insertId
      }

      // Check if attendance already marked today
      const today = new Date().toISOString().split("T")[0]
      const existingResult = await executeQuery(
        "SELECT id FROM attendance WHERE user_id = ? AND subject_id = ? AND attendance_date = ?",
        [userId, subjectId, today],
      )

      if (existingResult.success && Array.isArray(existingResult.data) && existingResult.data.length > 0) {
        return { success: false, error: "Attendance already marked for today" }
      }

      // Mark attendance
      const now = new Date()
      const time = now.toTimeString().split(" ")[0]

      const result = await executeQuery(
        `INSERT INTO attendance (user_id, subject_id, attendance_date, attendance_time, status, marked_by) 
         VALUES (?, ?, ?, ?, 'present', ?)`,
        [userId, subjectId, today, time, markedBy],
      )

      return { success: result.success, error: result.success ? undefined : "Failed to mark attendance" }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }

  static async getUserAttendance(userId: string): Promise<{ success: boolean; data?: any[]; error?: string }> {
    try {
      const query = `
        SELECT a.*, s.subject_name, u.full_name as user_name
        FROM attendance a
        JOIN subjects s ON a.subject_id = s.id
        JOIN users u ON a.user_id = u.id
        WHERE a.user_id = ?
        ORDER BY a.attendance_date DESC, a.attendance_time DESC
      `

      const result = await executeQuery(query, [userId])

      if (result.success) {
        return { success: true, data: result.data as any[] }
      }

      return { success: false, error: "Failed to fetch attendance" }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }

  static async getTodayAttendance(): Promise<{ success: boolean; data?: any[]; error?: string }> {
    try {
      const today = new Date().toISOString().split("T")[0]
      const query = `
        SELECT a.*, s.subject_name, u.full_name as user_name, u.registration_number, u.profile_image
        FROM attendance a
        JOIN subjects s ON a.subject_id = s.id
        JOIN users u ON a.user_id = u.id
        WHERE a.attendance_date = ?
        ORDER BY a.attendance_time DESC
      `

      const result = await executeQuery(query, [today])

      if (result.success) {
        return { success: true, data: result.data as any[] }
      }

      return { success: false, error: "Failed to fetch today's attendance" }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }

  static async getAttendanceStats(userId: string): Promise<{
    totalClasses: number
    attendedClasses: number
    percentage: number
    recentAttendance: any[]
  }> {
    try {
      // Get user's attendance records
      const attendanceResult = await this.getUserAttendance(userId)
      const records = attendanceResult.data || []

      // Get total classes, which is the total number of events/subjects created.
      const totalClassesQuery = "SELECT COUNT(*) as total FROM subjects"
      const subjectsResult = await executeQuery(totalClassesQuery, [])
      const totalClasses = subjectsResult.success ? (subjectsResult.data as any[])[0]?.total || 0 : 0

      // Calculate real stats based on actual attendance
      const attendedClasses = records.filter((r) => r.status === "present").length
      const percentage = totalClasses > 0 ? Math.round((attendedClasses / totalClasses) * 100) : 0

      return {
        totalClasses,
        attendedClasses,
        percentage,
        recentAttendance: records.slice(0, 5).map((record) => ({
          subject: record.subject_name,
          date: record.attendance_date,
          time: record.attendance_time,
          status: record.status,
        })),
      }
    } catch (error) {
      return {
        totalClasses: 0,
        attendedClasses: 0,
        percentage: 0,
        recentAttendance: [],
      }
    }
  }

  static async getAllAttendanceStats(): Promise<{ success: boolean; data?: any[]; error?: string }> {
    try {
      // 1. Get attended classes count for each user
      const attendedPromise = executeQuery(
        "SELECT user_id, COUNT(*) as attendedClasses FROM attendance WHERE status = 'present' GROUP BY user_id",
        [],
      )

      // 2. Get total classes for each department
      const totalPromise = executeQuery(
        "SELECT department, COUNT(*) as totalClasses FROM subjects GROUP BY department",
        [],
      )

      // 3. Get all students with their departments
      const usersPromise = executeQuery("SELECT id, department FROM users WHERE role = 'user'", [])

      const [attendedResult, totalResult, usersResult] = await Promise.all([
        attendedPromise,
        totalResult,
        usersPromise,
      ])

      if (!attendedResult.success || !totalResult.success || !usersResult.success) {
        return { success: false, error: "Failed to fetch necessary stats data." }
      }

      const attendedMap = (attendedResult.data as any[]).reduce((acc, item) => {
        acc[item.user_id] = item.attendedClasses
        return acc
      }, {} as { [key: string]: number })

      const totalMap = (totalResult.data as any[]).reduce((acc, item) => {
        acc[item.department] = item.totalClasses
        return acc
      }, {} as { [key:string]: number })

      const allUsers = usersResult.data as { id: string; department: string }[]

      const stats = allUsers.map((user) => {
        const attendedClasses = attendedMap[user.id] || 0
        const totalClasses = totalMap[user.department] || 0
        const percentage = totalClasses > 0 ? Math.round((attendedClasses / totalClasses) * 100) : 0

        return { userId: user.id, attendedClasses, totalClasses, percentage }
      })

      return { success: true, data: stats }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }

  static async getDailyAttendance(date: string): Promise<{ success: boolean; data?: any[]; error?: string }> {
    try {
      const query = `
        SELECT a.*, s.subject_name, u.full_name as user_name, u.registration_number, u.email
        FROM attendance a
        JOIN subjects s ON a.subject_id = s.id
        JOIN users u ON a.user_id = u.id
        WHERE a.attendance_date = ?
        ORDER BY a.attendance_time DESC
      `

      const result = await executeQuery(query, [date])

      if (result.success) {
        return { success: true, data: result.data as any[] }
      }

      return { success: false, error: "Failed to fetch daily attendance" }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }

  static async getTodayAttendanceCount(): Promise<{ success: boolean; count?: number; error?: string }> {
    try {
      const today = new Date().toISOString().split("T")[0]
      const query = "SELECT COUNT(*) as count FROM attendance WHERE attendance_date = ?"
      
      const result = await executeQuery(query, [today])

      if (result.success) {
        const count = (result.data as any[])[0]?.count || 0
        return { success: true, count }
      }

      return { success: false, error: "Failed to fetch today's attendance count" }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }

  static async getTotalUsersCount(): Promise<{ success: boolean; count?: number; error?: string }> {
    try {
      const query = "SELECT COUNT(*) as count FROM users WHERE role = 'user' AND is_active = true"
      
      const result = await executeQuery(query, [])

      if (result.success) {
        const count = (result.data as any[])[0]?.count || 0
        return { success: true, count }
      }

      return { success: false, error: "Failed to fetch total users count" }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }

  static async getEventConductingDaysCount(): Promise<{ success: boolean; count?: number; error?: string }> {
    try {
      const query = "SELECT COUNT(DISTINCT attendance_date) as count FROM attendance"

      const result = await executeQuery(query, [])

      if (result.success) {
        const count = (result.data as any[])[0]?.count || 0
        return { success: true, count }
      }

      return { success: false, error: "Failed to fetch event conducting days count" }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }

  static async getTotalEventsCount(): Promise<{ success: boolean; count?: number; error?: string }> {
    try {
      const query = "SELECT COUNT(*) as count FROM subjects"
      const result = await executeQuery(query, [])
      if (result.success) {
        const count = (result.data as any[])[0]?.count || 0
        return { success: true, count }
      }
      return { success: false, error: "Failed to fetch total events count" }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }

  static async deleteAttendance(attendanceId: number): Promise<{ success: boolean; error?: string }> {
    try {
      const result = await executeQuery("DELETE FROM attendance WHERE id = ?", [attendanceId])
      if (result.success && (result.data as any).affectedRows > 0) {
        return { success: true }
      } else if (result.success) {
        // This case handles when the ID doesn't exist, so no rows are affected.
        return { success: false, error: "Attendance record not found or already deleted." }
      }
      return { success: false, error: "Failed to delete attendance record." }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }
}
