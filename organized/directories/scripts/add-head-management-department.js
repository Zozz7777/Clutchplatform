const { MongoClient } = require('mongodb');
require('dotenv').config({ path: './shared-backend/.env' });

async function addHeadManagementDepartment() {
  // Connect to MongoDB Atlas
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error('MONGODB_URI environment variable not found');
  }
  
  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    console.log('Connected to MongoDB Atlas');
    
    const db = client.db();
    const departmentsCollection = db.collection('departments');
    
    // Check if department already exists
    const existingDepartment = await departmentsCollection.findOne({ 
      name: 'Head Management' 
    });
    
    if (existingDepartment) {
      console.log('Head Management department already exists');
      return;
    }
    
    // Create the Head Management department
    const headManagementDepartment = {
      name: 'Head Management',
      code: 'HM',
      description: 'Executive and senior management department responsible for strategic decision making and organizational leadership',
      level: 1,
      status: 'active',
      budget: {
        annual: 0,
        currency: 'USD',
        allocated: 0,
        remaining: 0
      },
      employeeCount: 0,
      settings: {
        workSchedule: {
          startTime: '09:00',
          endTime: '17:00',
          timezone: 'UTC',
          workDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday']
        },
        leavePolicy: {
          vacationDays: 25,
          sickDays: 15,
          personalDays: 10
        }
      },
      metrics: {
        employeeSatisfaction: 0,
        productivity: 0,
        turnoverRate: 0,
        budgetUtilization: 0,
        lastUpdated: new Date()
      },
      metadata: {
        createdBy: null,
        updatedBy: null,
        lastUpdated: new Date(),
        version: 1
      },
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const result = await departmentsCollection.insertOne(headManagementDepartment);
    console.log('Head Management department created successfully:', result.insertedId);
    
  } catch (error) {
    console.error('Error adding Head Management department:', error);
  } finally {
    await client.close();
    console.log('Disconnected from MongoDB Atlas');
  }
}

// Run the script
addHeadManagementDepartment();
