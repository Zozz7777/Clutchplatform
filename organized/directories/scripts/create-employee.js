const axios = require('axios');

const BACKEND_URL = 'https://clutch-main-nk7x.onrender.com';

async function createEmployee() {
  try {
    console.log('🔧 Creating employee with credentials...');
    
    const response = await axios.post(`${BACKEND_URL}/api/auth/create-employee`, {
      email: 'ziad@clutchapp.one',
      password: '4955698',
      firstName: 'Ziad',
      lastName: 'Abdelmageed',
      jobTitle: 'CEO & Founder'
    });

    console.log('✅ Employee creation response:', response.data);
    
    if (response.data.success) {
      console.log('\n🎉 Employee created successfully!');
      console.log('📧 Email:', response.data.data.email);
      console.log('🔑 Password:', response.data.data.password);
      console.log('👤 Name:', response.data.data.firstName, response.data.data.lastName);
      console.log('💼 Job Title:', response.data.data.jobTitle);
      
      console.log('\n🧪 Now you can test login with these credentials!');
    }
    
  } catch (error) {
    console.error('❌ Error creating employee:', error.response?.data || error.message);
  }
}

// Run the script
createEmployee();
