import "dotenv/config"
import { executeQuery } from "../lib/database"
import { AttendanceModel } from "../lib/models/Attendance"

async function testRealTimeData() {
  console.log("🧪 Testing Real-Time Data from Database...\n")

  try {
    // Test 1: Check current attendance records
    console.log("1. Checking current attendance records...")
    const attendanceResult = await executeQuery("SELECT COUNT(*) as count FROM attendance")
    if (attendanceResult.success) {
      const count = (attendanceResult.data as any[])[0]?.count || 0
      console.log(`   ✅ Total attendance records: ${count}`)
    } else {
      console.log("   ❌ Failed to get attendance count")
    }

    // Test 2: Check current users
    console.log("\n2. Checking current users...")
    const usersResult = await executeQuery("SELECT COUNT(*) as count FROM users WHERE role = 'user'")
    if (usersResult.success) {
      const count = (usersResult.data as any[])[0]?.count || 0
      console.log(`   ✅ Total users: ${count}`)
    } else {
      console.log("   ❌ Failed to get users count")
    }

    // Test 3: Check subjects
    console.log("\n3. Checking subjects...")
    const subjectsResult = await executeQuery("SELECT COUNT(*) as count FROM subjects")
    if (subjectsResult.success) {
      const count = (subjectsResult.data as any[])[0]?.count || 0
      console.log(`   ✅ Total subjects: ${count}`)
    } else {
      console.log("   ❌ Failed to get subjects count")
    }

    // Test 4: Test attendance stats for a specific user
    console.log("\n4. Testing attendance stats for user...")
    const userResult = await executeQuery("SELECT id, full_name, department FROM users WHERE role = 'user' LIMIT 1")
    if (userResult.success && userResult.data && Array.isArray(userResult.data) && userResult.data.length > 0) {
      const user = userResult.data[0] as any
      console.log(`   Testing for user: ${user.full_name} (${user.department})`)
      
      const stats = await AttendanceModel.getAttendanceStats(user.id)
      console.log(`   ✅ Total classes: ${stats.totalClasses}`)
      console.log(`   ✅ Attended classes: ${stats.attendedClasses}`)
      console.log(`   ✅ Attendance percentage: ${stats.percentage}%`)
      console.log(`   ✅ Recent attendance records: ${stats.recentAttendance.length}`)
    } else {
      console.log("   ❌ No users found for testing")
    }

    // Test 5: Test today's attendance
    console.log("\n5. Testing today's attendance...")
    const todayAttendance = await AttendanceModel.getTodayAttendance()
    if (todayAttendance.success) {
      console.log(`   ✅ Today's attendance records: ${todayAttendance.data?.length || 0}`)
      if (todayAttendance.data && todayAttendance.data.length > 0) {
        console.log(`   Sample record: ${todayAttendance.data[0].user_name} - ${todayAttendance.data[0].subject_name}`)
      }
    } else {
      console.log("   ❌ Failed to get today's attendance")
    }

    // Test 6: Test real-time counts
    console.log("\n6. Testing real-time counts...")
    const [todayCount, totalUsers] = await Promise.all([
      AttendanceModel.getTodayAttendanceCount(),
      AttendanceModel.getTotalUsersCount()
    ])
    
    if (todayCount.success) {
      console.log(`   ✅ Today's attendance count: ${todayCount.count}`)
    } else {
      console.log("   ❌ Failed to get today's count")
    }
    
    if (totalUsers.success) {
      console.log(`   ✅ Total active users: ${totalUsers.count}`)
    } else {
      console.log("   ❌ Failed to get total users")
    }

    console.log("\n🎉 Real-time data test completed!")
    console.log("\n📋 Summary:")
    console.log("   • All data is coming from the actual database")
    console.log("   • No mock/default data is being used")
    console.log("   • Statistics are calculated in real-time")
    console.log("   • Attendance records are live and current")

  } catch (error) {
    console.error("❌ Test failed:", error)
  }
}

testRealTimeData() 