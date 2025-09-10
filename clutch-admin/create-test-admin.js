// Create a test admin user
const API_BASE_URL = 'https://clutch-main-nk7x.onrender.com/api/v1';

async function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function createTestAdmin() {
  console.log('🔍 Creating Test Admin User...');
  
  // Wait 5 seconds to ensure rate limits are reset
  console.log('⏳ Waiting 5 seconds...');
  await delay(5000);
  
  const adminData = {
    email: 'admin@clutch.com',
    password: 'admin123',
    firstName: 'Admin',
    lastName: 'User',
    jobTitle: 'System Administrator',
    role: 'super_admin'
  };
  
  console.log('Creating admin user with data:', adminData);
  
  try {
    const response = await fetch(`${API_BASE_URL}/auth/create-employee`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(adminData)
    });
    
    const data = await response.json();
    console.log('Create employee response status:', response.status);
    console.log('Create employee response:', data);
    
    if (response.ok && data.success) {
      console.log('✅ Admin user created successfully!');
      console.log('You can now login with:');
      console.log('Email: admin@clutch.com');
      console.log('Password: admin123');
    } else {
      console.log('❌ Failed to create admin user:', data.message);
    }
    
  } catch (error) {
    console.log('❌ Error creating admin user:', error.message);
  }
}

// Run the function
createTestAdmin();
