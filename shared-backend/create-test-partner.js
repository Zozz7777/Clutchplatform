const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const PartnerUser = require('./models/PartnerUser');

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/clutch_partners', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

// Generate a unique partner ID
const generatePartnerId = () => {
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.random().toString(36).substr(2, 4).toUpperCase();
  return `CLT${timestamp}${random}`;
};

// Create test partner
const createTestPartner = async () => {
  try {
    await connectDB();

    // Check if test partner already exists
    const existingPartner = await PartnerUser.findOne({ 
      $or: [
        { email: 'test@clutch.com' },
        { phone: '+201234567890' }
      ]
    });

    if (existingPartner) {
      console.log('Test partner already exists:');
      console.log('Partner ID:', existingPartner.partnerId);
      console.log('Email:', existingPartner.email);
      console.log('Phone:', existingPartner.phone);
      console.log('Business Name:', existingPartner.businessName);
      console.log('Password: test123');
      return;
    }

    // Generate partner ID
    const partnerId = generatePartnerId();

    // Hash password
    const hashedPassword = await bcrypt.hash('test123', 12);

    // Create test partner
    const testPartner = new PartnerUser({
      partnerId: partnerId,
      email: 'test@clutch.com',
      phone: '+201234567890',
      password: hashedPassword,
      businessName: 'Test Auto Shop',
      ownerName: 'Ahmed Test',
      partnerType: 'repair_center',
      businessAddress: {
        street: '123 Test Street',
        city: 'Cairo',
        state: 'Cairo',
        zipCode: '11511',
        country: 'Egypt'
      },
      isVerified: true,
      isActive: true,
      role: 'owner',
      profilePicture: null,
      businessLicense: null,
      taxId: null,
      bankAccount: {
        accountNumber: '1234567890',
        bankName: 'Test Bank',
        accountHolderName: 'Test Auto Shop'
      },
      workingHours: {
        monday: { open: '09:00', close: '18:00', isOpen: true },
        tuesday: { open: '09:00', close: '18:00', isOpen: true },
        wednesday: { open: '09:00', close: '18:00', isOpen: true },
        thursday: { open: '09:00', close: '18:00', isOpen: true },
        friday: { open: '09:00', close: '18:00', isOpen: true },
        saturday: { open: '10:00', close: '16:00', isOpen: true },
        sunday: { open: '10:00', close: '16:00', isOpen: false }
      },
      services: [
        {
          name: 'Oil Change',
          description: 'Complete oil change service',
          price: 150,
          duration: 30,
          isActive: true
        },
        {
          name: 'Brake Repair',
          description: 'Brake pad and disc replacement',
          price: 450,
          duration: 120,
          isActive: true
        },
        {
          name: 'Engine Diagnostic',
          description: 'Complete engine diagnostic check',
          price: 200,
          duration: 60,
          isActive: true
        }
      ],
      kycDocuments: [],
      supportTickets: [],
      warrantyClaims: [],
      disputes: [],
      scheduledExports: [],
      customReports: [],
      staffMembers: [],
      purchaseOrders: [],
      suppliers: [],
      auditLogs: [],
      createdAt: new Date(),
      updatedAt: new Date()
    });

    await testPartner.save();

    console.log('✅ Test partner created successfully!');
    console.log('📋 Partner Details:');
    console.log('   Partner ID:', partnerId);
    console.log('   Email:', 'test@clutch.com');
    console.log('   Phone:', '+201234567890');
    console.log('   Business Name:', 'Test Auto Shop');
    console.log('   Owner Name:', 'Ahmed Test');
    console.log('   Partner Type:', 'Repair Center');
    console.log('   Password:', 'test123');
    console.log('');
    console.log('🔐 Login Credentials:');
    console.log('   Email/Phone:', 'test@clutch.com');
    console.log('   Password:', 'test123');
    console.log('');
    console.log('📱 You can now test the signup and signin in the mobile app!');

  } catch (error) {
    console.error('Error creating test partner:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
};

// Run the script
createTestPartner();
