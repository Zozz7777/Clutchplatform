const axios = require('axios');

const BACKEND_URL = 'https://clutch-main-nk7x.onrender.com/api/v1';

async function createAdminEmployee() {
  try {
    console.log('🔧 Creating admin employee account...');
    
    const response = await axios.post(`${BACKEND_URL}/auth/create-employee`, {
      email: 'admin@clutchapp.one',
      password: 'admin123456',
      firstName: 'Admin',
      lastName: 'User',
      jobTitle: 'System Administrator',
      role: 'admin',
      department: 'IT',
      phone: '+1234567890'
    });

    console.log('✅ Admin employee creation response:', response.data);
    
    if (response.data.success) {
      console.log('\n🎉 Admin employee created successfully!');
      console.log('📧 Email:', response.data.data.email);
      console.log('🔑 Password:', response.data.data.password);
      console.log('👤 Name:', response.data.data.firstName, response.data.data.lastName);
      console.log('💼 Job Title:', response.data.data.jobTitle);
      console.log('🔐 Role:', response.data.data.role);
      
      console.log('\n🧪 Now you can login to the admin dashboard with these credentials!');
      console.log('🌐 Admin Dashboard URL: https://admin.yourclutch.com');
    }
    
  } catch (error) {
    console.error('❌ Error creating admin employee:', error.response?.data || error.message);
  }
}

// Run the script
createAdminEmployee();
