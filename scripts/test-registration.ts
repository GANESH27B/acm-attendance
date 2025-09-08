import "dotenv/config"

async function testRegistration() {
  console.log("🧪 Testing Registration and Login Functionality...\n")

  try {
    // Test 1: Registration
    console.log("1. Testing user registration...")
    const registrationData = {
      fullName: "Test User",
      email: "test.user@klu.ac.in",
      password: "testpass123",
      department: "Computer Science Engineering",
      acmMember: true,
      acmRole: "Member"
    }

    const registerResponse = await fetch('http://localhost:3000/api/users/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(registrationData),
    })

    const registerResult = await registerResponse.json()
    
    if (registerResponse.ok && registerResult.success) {
      console.log("   ✅ Registration successful")
      console.log(`   User ID: ${registerResult.user.id}`)
    } else {
      console.log("   ❌ Registration failed:", registerResult.error)
    }

    // Test 2: Login with registered user
    console.log("\n2. Testing login with registered user...")
    const loginData = {
      email: "test.user@klu.ac.in",
      password: "testpass123"
    }

    const loginResponse = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(loginData),
    })

    const loginResult = await loginResponse.json()
    
    if (loginResponse.ok && loginResult.success) {
      console.log("   ✅ Login successful")
      console.log(`   User: ${loginResult.user.fullName}`)
      console.log(`   Role: ${loginResult.user.role}`)
      console.log(`   Token: ${loginResult.token ? "Present" : "Missing"}`)
    } else {
      console.log("   ❌ Login failed:", loginResult.error)
    }

    // Test 3: Login with existing admin
    console.log("\n3. Testing admin login...")
    const adminLoginData = {
      email: "admin@gmail.com", // Using the new Gmail admin account
      password: "admin123"
    }

    const adminLoginResponse = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(adminLoginData),
    })

    const adminLoginResult = await adminLoginResponse.json()
    
    if (adminLoginResponse.ok && adminLoginResult.success) {
      console.log("   ✅ Admin login successful")
      console.log(`   User: ${adminLoginResult.user.fullName}`)
      console.log(`   Role: ${adminLoginResult.user.role}`)
    } else {
      console.log("   ❌ Admin login failed:", adminLoginResult.error)
    }

    // Test 4: Login with existing student
    console.log("\n4. Testing student login...")
    const studentLoginData = {
      email: "john.doe@klu.ac.in",
      password: "student123"
    }

    const studentLoginResponse = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(studentLoginData),
    })

    const studentLoginResult = await studentLoginResponse.json()
    
    if (studentLoginResponse.ok && studentLoginResult.success) {
      console.log("   ✅ Student login successful")
      console.log(`   User: ${studentLoginResult.user.fullName}`)
      console.log(`   Role: ${studentLoginResult.user.role}`)
    } else {
      console.log("   ❌ Student login failed:", studentLoginResult.error)
    }

    console.log("\n🎉 Registration and Login tests completed!")

  } catch (error) {
    console.error("❌ Test failed:", error)
  }
}

testRegistration()