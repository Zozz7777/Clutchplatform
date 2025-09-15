#!/usr/bin/env node

/**
 * Create CEO Employee Script
 * Ensures the CEO employee exists in the database with correct credentials
 */

const bcrypt = require('bcryptjs');
const { getCollection } = require('../config/optimized-database');

const CEO_EMAIL = 'ziad@yourclutch.com';
const CEO_PASSWORD = '4955698*Z*z';

async function createCEOEmployee() {
  try {
    console.log('🔗 Connecting to database...');
    
    console.log('🔍 Checking if CEO employee exists...');
    
    // Check if CEO already exists
    const usersCollection = await getCollection('users');
    const existingCEO = await usersCollection.findOne({ 
      email: CEO_EMAIL.toLowerCase() 
    });
    
    if (existingCEO) {
      console.log('✅ CEO employee already exists');
      console.log('📧 Email:', existingCEO.email);
      console.log('👤 Name:', existingCEO.name);
      console.log('🎭 Role:', existingCEO.role);
      console.log('👥 Is Employee:', existingCEO.isEmployee);
      console.log('🟢 Is Active:', existingCEO.isActive);
      
      // Update password if needed
      const isPasswordCorrect = await bcrypt.compare(CEO_PASSWORD, existingCEO.password);
      if (!isPasswordCorrect) {
        console.log('🔐 Updating CEO password...');
        const hashedPassword = await bcrypt.hash(CEO_PASSWORD, 12);
        await usersCollection.updateOne(
          { _id: existingCEO._id },
          { 
            $set: { 
              password: hashedPassword,
              updatedAt: new Date()
            }
          }
        );
        console.log('✅ CEO password updated successfully');
      } else {
        console.log('✅ CEO password is correct');
      }
      
      // Ensure CEO has correct role and permissions
      if (existingCEO.role !== 'admin' || !existingCEO.isEmployee) {
        console.log('🔧 Updating CEO role and employee status...');
        await usersCollection.updateOne(
          { _id: existingCEO._id },
          { 
            $set: { 
              role: 'admin',
              isEmployee: true,
              permissions: ['all'],
              updatedAt: new Date()
            }
          }
        );
        console.log('✅ CEO role and permissions updated');
      }
      
    } else {
      console.log('👤 Creating new CEO employee...');
      
      // Hash password
      const hashedPassword = await bcrypt.hash(CEO_PASSWORD, 12);
      
      // Create CEO employee
      const ceoEmployee = {
        email: CEO_EMAIL.toLowerCase(),
        password: hashedPassword,
        name: 'Ziad - CEO',
        role: 'admin',
        department: 'Executive',
        position: 'Chief Executive Officer',
        permissions: ['all'],
        isActive: true,
        isEmployee: true,
        createdAt: new Date(),
        lastLogin: null,
        profile: {
          avatar: null,
          bio: 'Chief Executive Officer of Clutch Platform',
          skills: ['Leadership', 'Strategy', 'Management'],
          emergencyContact: null
        }
      };
      
      const result = await usersCollection.insertOne(ceoEmployee);
      console.log('✅ CEO employee created successfully');
      console.log('🆔 Employee ID:', result.insertedId);
    }
    
    // Verify the CEO can be found
    console.log('🔍 Verifying CEO employee...');
    const verifiedCEO = await usersCollection.findOne({ 
      email: CEO_EMAIL.toLowerCase(),
      isEmployee: true 
    });
    
    if (verifiedCEO) {
      console.log('✅ CEO employee verification successful');
      console.log('📧 Email:', verifiedCEO.email);
      console.log('👤 Name:', verifiedCEO.name);
      console.log('🎭 Role:', verifiedCEO.role);
      console.log('👥 Is Employee:', verifiedCEO.isEmployee);
      console.log('🟢 Is Active:', verifiedCEO.isActive);
      console.log('🔑 Permissions:', verifiedCEO.permissions);
      
      // Test password
      const passwordTest = await bcrypt.compare(CEO_PASSWORD, verifiedCEO.password);
      console.log('🔐 Password test:', passwordTest ? '✅ Correct' : '❌ Incorrect');
      
    } else {
      console.log('❌ CEO employee verification failed');
    }
    
  } catch (error) {
    console.error('❌ Error creating CEO employee:', error);
    process.exit(1);
  }
}

// Run the script
createCEOEmployee().catch(console.error);
