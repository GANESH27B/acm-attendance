import { executeQuery } from "../database"
import bcrypt from "bcryptjs"
import { v4 as uuidv4 } from "uuid"

export interface User {
  id: string
  full_name: string
  email: string
  password_hash: string
  role: "user" | "admin"
  department: string
  profile_image?: string
  phone?: string
  address?: string
  date_of_birth?: string
  student_id?: string
  registration_number?: string
  join_date: string
  is_active: boolean
  last_login?: string
  acm_member?: boolean
  acm_role?: string
  year?: string
  section?: string
  created_at: string
  updated_at: string
}

const cleanupObject = (obj: Record<string, any>): Record<string, any> => {
  const newObj: Record<string, any> = {}
  for (const key in obj) {
    if (obj[key] !== undefined) {
      newObj[key] = obj[key]
    }
  }
  return newObj
}

export class UserModel {
  static async create(userData: any): Promise<{ success: boolean; user?: any; error?: string }> {
    try {
      const {
        email,
        password,
        fullName,
        registrationNumber,
        department,
        role,
        acmMember,
        acmRole,
        year,
        section,
        studentId,
      } = userData

      // 1. Check for duplicate user (email, registration_number, student_id)
      const duplicateChecks = [
        { field: 'email', value: email, message: 'A user with this email already exists.' },
        { field: 'registration_number', value: registrationNumber, message: 'A user with this registration number already exists.' },
        { field: 'student_id', value: studentId, message: 'A user with this student ID already exists.' }
      ];

      for (const check of duplicateChecks) {
        if (check.value) { // Only check if value is provided
          const existingUsersResult = await executeQuery(
            `SELECT id FROM users WHERE ${check.field} = ?`,
            [check.value],
          );

          if (existingUsersResult.success && Array.isArray(existingUsersResult.data) && existingUsersResult.data.length > 0) {
            return { success: false, error: check.message };
          }
        }
      }

      // 2. Hash password
      const hashedPassword = await bcrypt.hash(password, 10)

      // 3. Prepare user data for DB, mapping to snake_case
      const newUserForDb = {
        id: uuidv4(),
        email,
        password_hash: hashedPassword,
        full_name: fullName,
        registration_number: registrationNumber,
        department,
        role: "user",
        is_active: 1, // Use 1 for true
        join_date: new Date().toISOString().slice(0, 19).replace('T', ' '),
        acm_member: acmMember === true || acmMember === "true" ? 1 : 0, // Convert boolean to 1/0
        acm_role: acmRole,
        year,
        section,
        student_id: studentId,
      }

      // 4. Insert into database
      const cleanedUserData = cleanupObject(newUserForDb)
      const columns = Object.keys(cleanedUserData).join(", ")
      const placeholders = Object.keys(cleanedUserData).map(() => "?").join(", ")
      const values = Object.values(cleanedUserData)

      await executeQuery(
        `INSERT INTO users (${columns}) VALUES (${placeholders})`,
        values,
      )

      // 5. Return created user (in snake_case, as it is in the DB)
      const { password_hash, ...userForClient } = newUserForDb
      return { success: true, user: userForClient }
    } catch (error: any) {
      console.error("UserModel.create failed:", error)
      // Provide a more specific error message if possible
      return { success: false, error: error.message || "Failed to create user" }
    }
  }

  static async findByEmail(email: string): Promise<{ success: boolean; data?: User; error?: string }> {
    try {
      const query = "SELECT * FROM users WHERE email = ? AND is_active = true"
      const result = await executeQuery(query, [email])

      if (result.success && Array.isArray(result.data) && result.data.length > 0) {
        return { success: true, data: result.data[0] as User }
      }

      return { success: false, error: "User not found" }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }

  static async findById(id: string): Promise<{ success: boolean; data?: User; error?: string }> {
    try {
      const query = "SELECT * FROM users WHERE id = ?"
      const result = await executeQuery(query, [id])

      if (result.success && Array.isArray(result.data) && result.data.length > 0) {
        return { success: true, data: result.data[0] as User }
      }

      return { success: false, error: "User not found" }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }

  static async updateById(
    id: string,
    updates: Partial<User>,
  ): Promise<{ success: boolean; user?: User; error?: string }> {
    try {
      const processedUpdates: any = { ...updates };
      processedUpdates.updated_at = "NOW()";
      let setParts: string[] = [];
      let values: any[] = [];
      for (const key in processedUpdates) {
        if (processedUpdates[key] !== undefined) {
          if (processedUpdates[key] === "NOW()") {
            setParts.push(`${key} = NOW()`);
          } else {
            setParts.push(`${key} = ?`);
            values.push(processedUpdates[key]);
          }
        }
      }
      if (setParts.length === 0) {
        return { success: false, error: "No valid fields to update. Please change some information before saving." };
      }
      const setClause = setParts.join(", ");
      const query = `UPDATE users SET ${setClause} WHERE id = ?`;
      console.log("[UserModel.updateById] SQL:", query, "PARAMS:", [...values, id]);
      const result = await executeQuery(query, [...values, id]);
      if (result.success) {
        // Check if any rows were actually updated
        if (result.data && typeof result.data.affectedRows === "number" && result.data.affectedRows === 0) {
          return { success: false, error: "User not found or no changes detected." };
        }
        const user = await this.findById(id);
        return { success: true, user: user?.data };
      }
      // If SQL error, return the real error
      return { success: false, error: result.error || "Failed to update user (DB error)" };
    } catch (error: any) {
      console.error("UserModel.updateById failed:", error);
      return { success: false, error: error.message || "Failed to update user (exception)" };
    }
  }

  static async findAll(role?: string): Promise<{ success: boolean; data?: User[]; error?: string }> {
    try {
      let query = "SELECT * FROM users WHERE is_active = true"
      const params: any[] = []

      if (role) {
        query += " AND role = ?"
        params.push(role)
      }

      query += " ORDER BY created_at DESC"

      const result = await executeQuery(query, params)

      if (result.success) {
        return { success: true, data: result.data as User[] }
      }

      return { success: false, error: "Failed to fetch users" }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }

  static async deleteById(id: string): Promise<{ success: boolean; error?: string }> {
    try {
      const query = "DELETE FROM users WHERE id = ?"
      const result = await executeQuery(query, [id])

      // Check if any rows were affected to confirm deletion
      if (result.success && result.data && result.data.affectedRows > 0) {
        return { success: true }
      } else if (result.success && result.data && result.data.affectedRows === 0) {
        return { success: false, error: "User not found or already deleted" };
      } else {
        return { success: false, error: "Failed to delete user" };
      }
    } catch (error: any) {
      console.error("UserModel.deleteById failed:", error);
      return { success: false, error: error.message || "Failed to delete user" };
    }
  }

  static async verifyPassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
    return await bcrypt.compare(plainPassword, hashedPassword)
  }
}
