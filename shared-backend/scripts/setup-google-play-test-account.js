const { MongoClient } = require('mongodb');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/clutch';
const DB_NAME = process.env.DB_NAME || 'clutch';

async function setupGooglePlayTestAccount() {
    const client = new MongoClient(MONGODB_URI);
    
    try {
        await client.connect();
        console.log('✅ Connected to MongoDB');
        
        const db = client.db(DB_NAME);
        const partnersCollection = db.collection('partnerusers');
        const ordersCollection = db.collection('partnerorders');
        const paymentsCollection = db.collection('partnerpayments');
        
        // Check if test account already exists
        const existingPartner = await partnersCollection.findOne({ 
            email: 'reviewer@yourclutch.com' 
        });
        
        if (existingPartner) {
            console.log('⚠️  Test account already exists, updating...');
            await partnersCollection.deleteOne({ email: 'reviewer@yourclutch.com' });
        }
        
        // Create test partner account
        const hashedPassword = await bcrypt.hash('Clutch@2025', 10);
        
        const testPartner = {
            _id: new Date().getTime().toString(),
            email: 'reviewer@yourclutch.com',
            phone: '+201234567890',
            password: hashedPassword,
            role: 'owner',
            partnerId: 'REVIEWER001',
            businessName: 'Google Play Review Auto Parts',
            ownerName: 'Google Play Reviewer',
            partnerType: 'auto_parts_shop',
            businessAddress: {
                street: '123 Review Street',
                city: 'Cairo',
                state: 'Cairo',
                zipCode: '11511',
                country: 'Egypt'
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
            businessSettings: {
                isActive: true,
                acceptsOnlineOrders: true,
                requiresApproval: false,
                maxOrderValue: 50000,
                deliveryRadius: 25
            },
            financialInfo: {
                bankAccount: 'EG1234567890123456789012345',
                taxId: 'TAX123456789',
                currency: 'EGP'
            },
            notificationPreferences: {
                pushNotifications: true,
                emailNotifications: true,
                smsNotifications: true,
                orderUpdates: true,
                paymentUpdates: true,
                marketingEmails: false
            },
            appPreferences: {
                language: 'ar',
                theme: 'light',
                currency: 'EGP',
                timezone: 'Africa/Cairo'
            },
            isVerified: true,
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date()
        };
        
        await partnersCollection.insertOne(testPartner);
        console.log('✅ Test partner account created');
        
        // Create demo orders
        const demoOrders = [
            {
                _id: new Date().getTime().toString() + '1',
                partnerId: testPartner._id,
                orderId: 'ORD001',
                customerName: 'Ahmed Mohamed',
                customerPhone: '+201111111111',
                customerEmail: 'ahmed@example.com',
                serviceType: 'oil_change',
                serviceName: 'Engine Oil Change',
                productDetails: {
                    name: 'Castrol GTX 5W-30',
                    quantity: 1,
                    price: 450
                },
                totalAmount: 450,
                status: 'pending',
                orderDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
                scheduledDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // tomorrow
                notes: 'Customer requested synthetic oil',
                createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
                updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
            },
            {
                _id: new Date().getTime().toString() + '2',
                partnerId: testPartner._id,
                orderId: 'ORD002',
                customerName: 'Fatma Ali',
                customerPhone: '+201222222222',
                customerEmail: 'fatma@example.com',
                serviceType: 'brake_service',
                serviceName: 'Brake Pad Replacement',
                productDetails: {
                    name: 'Brembo Brake Pads',
                    quantity: 2,
                    price: 800
                },
                totalAmount: 1600,
                status: 'paid',
                orderDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
                scheduledDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // yesterday
                notes: 'Front brake pads only',
                createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
                updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
            },
            {
                _id: new Date().getTime().toString() + '3',
                partnerId: testPartner._id,
                orderId: 'ORD003',
                customerName: 'Omar Hassan',
                customerPhone: '+201333333333',
                customerEmail: 'omar@example.com',
                serviceType: 'tire_service',
                serviceName: 'Tire Replacement',
                productDetails: {
                    name: 'Michelin Pilot Sport 4',
                    quantity: 4,
                    price: 1200
                },
                totalAmount: 4800,
                status: 'rejected',
                orderDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
                scheduledDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
                notes: 'Customer cancelled due to price',
                rejectionReason: 'Customer requested cancellation',
                createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
                updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
            },
            {
                _id: new Date().getTime().toString() + '4',
                partnerId: testPartner._id,
                orderId: 'ORD004',
                customerName: 'Nour Ibrahim',
                customerPhone: '+201444444444',
                customerEmail: 'nour@example.com',
                serviceType: 'battery_service',
                serviceName: 'Battery Replacement',
                productDetails: {
                    name: 'Varta Blue Dynamic',
                    quantity: 1,
                    price: 1200
                },
                totalAmount: 1200,
                status: 'completed',
                orderDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
                scheduledDate: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000), // 8 days ago
                notes: 'Battery warranty included',
                createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
                updatedAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000)
            },
            {
                _id: new Date().getTime().toString() + '5',
                partnerId: testPartner._id,
                orderId: 'ORD005',
                customerName: 'Youssef Mahmoud',
                customerPhone: '+201555555555',
                customerEmail: 'youssef@example.com',
                serviceType: 'air_filter',
                serviceName: 'Air Filter Replacement',
                productDetails: {
                    name: 'Mann-Filter C 30 015',
                    quantity: 1,
                    price: 180
                },
                totalAmount: 180,
                status: 'pending',
                orderDate: new Date(),
                scheduledDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // day after tomorrow
                notes: 'Regular maintenance',
                createdAt: new Date(),
                updatedAt: new Date()
            }
        ];
        
        await ordersCollection.insertMany(demoOrders);
        console.log('✅ Demo orders created');
        
        // Create demo payments
        const demoPayments = [
            {
                _id: new Date().getTime().toString() + 'p1',
                partnerId: testPartner._id,
                paymentId: 'PAY001',
                amount: 1600,
                currency: 'EGP',
                status: 'completed',
                type: 'weekly_payout',
                description: 'Weekly payout for orders ORD001, ORD002',
                orderIds: [demoOrders[0]._id, demoOrders[1]._id],
                paymentDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
                createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
                updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
            },
            {
                _id: new Date().getTime().toString() + 'p2',
                partnerId: testPartner._id,
                paymentId: 'PAY002',
                amount: 1200,
                currency: 'EGP',
                status: 'completed',
                type: 'weekly_payout',
                description: 'Weekly payout for order ORD004',
                orderIds: [demoOrders[3]._id],
                paymentDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
                createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
                updatedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000)
            },
            {
                _id: new Date().getTime().toString() + 'p3',
                partnerId: testPartner._id,
                paymentId: 'PAY003',
                amount: 450,
                currency: 'EGP',
                status: 'pending',
                type: 'weekly_payout',
                description: 'Pending payout for order ORD001',
                orderIds: [demoOrders[0]._id],
                paymentDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000), // 4 days from now
                createdAt: new Date(),
                updatedAt: new Date()
            }
        ];
        
        await paymentsCollection.insertMany(demoPayments);
        console.log('✅ Demo payments created');
        
        console.log('\n🎉 Google Play test account setup completed!');
        console.log('📧 Email: reviewer@yourclutch.com');
        console.log('🔑 Password: Clutch@2025');
        console.log('📱 Partner Type: Auto Parts Shop');
        console.log('📊 Demo Data: 5 orders, 3 payments');
        
    } catch (error) {
        console.error('❌ Error setting up test account:', error);
    } finally {
        await client.close();
    }
}

// Run the setup
setupGooglePlayTestAccount();
