// Environment variables are handled by Next.js automatically
import mysql from "mysql2/promise"

const dbConfig = {
  host: process.env.DB_HOST || "localhost",
  port: Number.parseInt(process.env.DB_PORT || "3306"),
  user: process.env.DB_USER || "smartattend_user",
  password: process.env.DB_PASSWORD || "smartattend_pass",
  database: process.env.DB_NAME || "smartattend_db",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
}

// Create connection pool
const pool = mysql.createPool(dbConfig)

// Test database connection
export async function testConnection() {
  try {
    const connection = await pool.getConnection()
    console.log("✅ Database connected successfully")
    connection.release()
    return true
  } catch (error) {
    console.error("❌ Database connection failed:", error)
    return false
  }
}

export async function executeQuery(query: string, params: any[] = []) {
  try {
    const [results] = await pool.execute(query, params)
    return { success: true, data: results }
  } catch (error: any) { // Explicitly type error as any to access message
    console.error("Database query error:", error)
    return { success: false, error: error.message || "Unknown database error" } // Return error message
  }
}

export async function getConnection() {
  return await pool.getConnection()
}

export default pool
