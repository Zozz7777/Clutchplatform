const { MongoClient } = require('mongodb');
require('dotenv').config({ path: './shared-backend/.env' });

async function findZiadEmployee() {
  try {
    console.log('🔍 Searching for ziad@yourclutch.com employee in MongoDB Atlas...');
    
    // Connect to MongoDB Atlas
    const uri = process.env.MONGODB_URI;
    if (!uri) {
      throw new Error('MONGODB_URI environment variable not found');
    }
    
    const client = new MongoClient(uri);
    await client.connect();
    
    const db = client.db();
    
    // Search in employees collection with different field structures
    const employeesCollection = db.collection('employees');
    
    console.log('\n🔎 Searching in employees collection...');
    
    // Try different search patterns
    const searchPatterns = [
      { email: 'ziad@yourclutch.com' },
      { 'basicInfo.email': 'ziad@yourclutch.com' },
      { 'personalInfo.email': 'ziad@yourclutch.com' },
      { 'contact.email': 'ziad@yourclutch.com' },
      { 'email': 'ziad@yourclutch.com' }
    ];
    
    for (const pattern of searchPatterns) {
      console.log(`\n🔍 Searching with pattern:`, pattern);
      const employee = await employeesCollection.findOne(pattern);
      if (employee) {
        console.log('✅ Employee found!');
        console.log('📋 Employee data:', JSON.stringify(employee, null, 2));
        return;
      }
    }
    
    // Search in users collection as well
    const usersCollection = db.collection('users');
    console.log('\n🔎 Searching in users collection...');
    
    const user = await usersCollection.findOne({ email: 'ziad@yourclutch.com' });
    if (user) {
      console.log('✅ User found in users collection!');
      console.log('📋 User data:', JSON.stringify(user, null, 2));
      return;
    }
    
    // List all collections to see what's available
    console.log('\n📊 Available collections:');
    const collections = await db.listCollections().toArray();
    collections.forEach(col => {
      console.log(`- ${col.name}`);
    });
    
    // Show all employees to see the structure
    console.log('\n📋 All employees structure:');
    const allEmployees = await employeesCollection.find({}).toArray();
    allEmployees.forEach((emp, index) => {
      console.log(`\nEmployee ${index + 1}:`);
      console.log(JSON.stringify(emp, null, 2));
    });
    
    await client.close();
  } catch (error) {
    console.error('❌ Error searching for employee:', error);
  }
}

findZiadEmployee();
