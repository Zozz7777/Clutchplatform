const { MongoClient } = require('mongodb');
require('dotenv').config({ path: './shared-backend/.env' });

async function checkEmployees() {
  try {
    console.log('🔍 Checking employees in MongoDB Atlas...');
    
    // Connect to MongoDB Atlas
    const uri = process.env.MONGODB_URI;
    if (!uri) {
      throw new Error('MONGODB_URI environment variable not found');
    }
    
    const client = new MongoClient(uri);
    await client.connect();
    
    const db = client.db();
    const employeesCollection = db.collection('employees');
    
    // Get all employees
    const employees = await employeesCollection.find({}).toArray();
    
    console.log(`📊 Found ${employees.length} employees in database:`);
    employees.forEach((employee, index) => {
      console.log(`${index + 1}. Email: ${employee.basicInfo?.email || 'No email'}`);
      console.log(`   Name: ${employee.basicInfo?.firstName || 'No first name'} ${employee.basicInfo?.lastName || 'No last name'}`);
      console.log(`   Role: ${employee.role || 'No role'}`);
      console.log(`   Roles: ${employee.roles ? employee.roles.join(', ') : 'No roles array'}`);
      console.log('   ---');
    });
    
    await client.close();
  } catch (error) {
    console.error('❌ Error checking employees:', error);
  }
}

checkEmployees();
