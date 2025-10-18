// Integration Test for Registration
// Run this in the browser console to test the registration API

const testRegistration = async () => {
  const testUser = {
    user_name: "Test User",
    user_email: `test${Date.now()}@example.com`, // Unique email
    user_password: "TestPass123!",
    user_phone: "1234567890",
    user_studyyear: "1st Year",
    user_branch: "Computer Science", 
    user_section: "A",
    user_residency: "Day Scholar",
    role: "buyer"
  };

  console.log("Testing registration with:", testUser);

  try {
    const response = await fetch('http://localhost:5000/api/auth/signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testUser)
    });

    const data = await response.json();
    
    console.log("Response status:", response.status);
    console.log("Response data:", data);

    if (data.success) {
      console.log("✅ Registration successful!");
      console.log("Access Token:", data.accessToken);
      console.log("Refresh Token:", data.refreshToken);
      console.log("User:", data.user);
    } else {
      console.log("❌ Registration failed:", data.message);
    }

    return data;
  } catch (error) {
    console.error("❌ Network error:", error);
    return { success: false, error: error.message };
  }
};

// Run the test
testRegistration();