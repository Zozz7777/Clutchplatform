const axios = require('axios');

const API_BASE_URL = 'https://clutch-main-nk7x.onrender.com/api/v1';

async function createTestEmployee() {
  try {
    console.log('🔧 Creating test employee for admin login...');
    
    const testEmployeeData = {
      basicInfo: {
        firstName: 'Admin',
        lastName: 'User',
        email: 'admin@clutch.com',
        phoneNumber: '+1234567890',
        dateOfBirth: '1990-01-01',
        gender: 'male'
      },
      employment: {
        employeeId: 'EMP001',
        department: 'Administration',
        position: 'System Administrator',
        hireDate: new Date().toISOString(),
        salary: 50000,
        employmentType: 'full-time'
      },
      authentication: {
        password: 'admin123456'
      },
      role: 'admin',
      isActive: true,
      permissions: ['all']
    };

    console.log('📧 Email:', testEmployeeData.basicInfo.email);
    console.log('🔑 Password:', testEmployeeData.authentication.password);
    
    const response = await axios.post(`${API_BASE_URL}/employees`, testEmployeeData, {
      headers: {
        'Content-Type': 'application/json',
        'X-API-Version': 'v1'
      }
    });

    if (response.data.success) {
      console.log('\n🎉 Test employee created successfully!');
      console.log('✅ Employee ID:', response.data.data._id);
      console.log('✅ Email:', response.data.data.basicInfo.email);
      console.log('✅ Full Name:', `${response.data.data.basicInfo.firstName} ${response.data.data.basicInfo.lastName}`);
      console.log('✅ Role:', response.data.data.role);
      
      console.log('\n🧪 You can now login to the admin dashboard with these credentials:');
      console.log('📧 Email: admin@clutch.com');
      console.log('🔑 Password: admin123456');
    } else {
      console.log('❌ Failed to create test employee:', response.data.message);
    }
    
  } catch (error) {
    if (error.response?.data?.error === 'EMPLOYEE_EXISTS' || error.response?.data?.error === 'DUPLICATE_EMAIL') {
      console.log('ℹ️  Test employee already exists!');
      console.log('📧 Email: admin@clutch.com');
      console.log('🔑 Password: admin123456');
      console.log('\n🧪 You can login with these credentials.');
    } else {
      console.error('❌ Error creating test employee:', error.response?.data || error.message);
      
      // Try to login with existing credentials
      console.log('\n🔄 Trying to login with existing credentials...');
      try {
        const loginResponse = await axios.post(`${API_BASE_URL}/auth/employee-login`, {
          email: 'admin@clutch.com',
          password: 'admin123456'
        });
        
        if (loginResponse.data.success) {
          console.log('✅ Login successful! Employee exists and credentials work.');
          console.log('📧 Email: admin@clutch.com');
          console.log('🔑 Password: admin123456');
        }
      } catch (loginError) {
        console.log('❌ Login failed, employee may not exist or credentials are incorrect.');
      }
    }
  }
}

// Run the script
createTestEmployee();
