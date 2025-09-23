const { getCollection } = require('../config/database');
const { ObjectId } = require('mongodb');

async function seedSalesDevData() {
  try {
    console.log('🌱 Seeding sales development data...');

    // Create sample employees for sales system
    const employeesCollection = await getCollection('employees');
    const sampleEmployees = [
      {
        _id: new ObjectId(),
        email: 'sales.rep1@clutch.com',
        name: 'Ahmed Hassan',
        role: 'sales_rep',
        team: 'b2b',
        locale: 'ar',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        _id: new ObjectId(),
        email: 'sales.manager@clutch.com',
        name: 'Fatma Mohamed',
        role: 'sales_manager',
        team: 'b2b',
        locale: 'ar',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        _id: new ObjectId(),
        email: 'legal@clutch.com',
        name: 'Omar Ali',
        role: 'legal',
        team: 'legal',
        locale: 'ar',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        _id: new ObjectId(),
        email: 'hr@clutch.com',
        name: 'Nour Ibrahim',
        role: 'hr',
        team: 'hr',
        locale: 'ar',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    for (const employee of sampleEmployees) {
      await employeesCollection.replaceOne(
        { email: employee.email },
        employee,
        { upsert: true }
      );
    }
    console.log('✓ Sample employees created');

    // Create sample leads
    const leadsCollection = await getCollection('leads');
    const sampleLeads = [
      {
        _id: new ObjectId(),
        title: 'Acme Auto Parts Shop',
        type: 'shop',
        companyName: 'Acme Auto Parts',
        contact: {
          name: 'Ali Mahmoud',
          email: 'ali@acme.com',
          phone: '+201234567890'
        },
        address: {
          text: 'Cairo, Maadi',
          geo: { lat: 30.0, lng: 31.3 }
        },
        source: 'on_ground',
        status: 'new',
        assignedTo: sampleEmployees[0]._id,
        notes: [],
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        _id: new ObjectId(),
        title: 'Delta Fleet Services',
        type: 'fleet',
        companyName: 'Delta Fleet Services',
        contact: {
          name: 'Sara Ahmed',
          email: 'sara@delta.com',
          phone: '+201234567891'
        },
        address: {
          text: 'Alexandria, Sidi Gaber',
          geo: { lat: 31.2, lng: 29.9 }
        },
        source: 'referral',
        status: 'contacted',
        assignedTo: sampleEmployees[0]._id,
        notes: [
          {
            employeeId: sampleEmployees[0]._id,
            text: 'Initial contact made, interested in fleet management solutions',
            createdAt: new Date()
          }
        ],
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        _id: new ObjectId(),
        title: 'Premium Parts Importer',
        type: 'importer',
        companyName: 'Premium Parts Import Co.',
        contact: {
          name: 'Mohamed Farouk',
          email: 'mohamed@premium.com',
          phone: '+201234567892'
        },
        address: {
          text: 'Giza, Dokki',
          geo: { lat: 30.0, lng: 31.2 }
        },
        source: 'website',
        status: 'qualified',
        assignedTo: sampleEmployees[1]._id,
        notes: [
          {
            employeeId: sampleEmployees[1]._id,
            text: 'Qualified lead, ready for proposal',
            createdAt: new Date()
          }
        ],
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    for (const lead of sampleLeads) {
      await leadsCollection.replaceOne(
        { _id: lead._id },
        lead,
        { upsert: true }
      );
    }
    console.log('✓ Sample leads created');

    // Create sample deals
    const dealsCollection = await getCollection('deals');
    const sampleDeals = [
      {
        _id: new ObjectId(),
        leadId: sampleLeads[0]._id,
        pipeline: 'b2b',
        stage: 'prospect',
        valueEGP: 50000,
        probability: 25,
        assignedTo: sampleEmployees[0]._id,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        _id: new ObjectId(),
        leadId: sampleLeads[1]._id,
        pipeline: 'b2b',
        stage: 'proposal',
        valueEGP: 150000,
        probability: 60,
        assignedTo: sampleEmployees[0]._id,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        _id: new ObjectId(),
        leadId: sampleLeads[2]._id,
        pipeline: 'b2b',
        stage: 'negotiation',
        valueEGP: 200000,
        probability: 80,
        assignedTo: sampleEmployees[1]._id,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    for (const deal of sampleDeals) {
      await dealsCollection.replaceOne(
        { _id: deal._id },
        deal,
        { upsert: true }
      );
    }
    console.log('✓ Sample deals created');

    // Create sample contracts
    const contractsCollection = await getCollection('contracts');
    const sampleContracts = [
      {
        _id: new ObjectId(),
        leadId: sampleLeads[1]._id,
        partnerId: null,
        templateId: 'tpl_partner_standard',
        draftPdfUrl: 'https://s3.example.com/contracts/drafts/draft_001.pdf',
        signedPdfUrl: null,
        metadata: {
          signedDate: null,
          repId: sampleEmployees[0]._id,
          notes: 'Standard partnership agreement'
        },
        status: 'draft',
        legalReview: {
          reviewerId: null,
          approved: null,
          reason: null,
          reviewedAt: null
        },
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        _id: new ObjectId(),
        leadId: sampleLeads[2]._id,
        partnerId: null,
        templateId: 'tpl_partner_premium',
        draftPdfUrl: 'https://s3.example.com/contracts/drafts/draft_002.pdf',
        signedPdfUrl: 'https://s3.example.com/contracts/signed/signed_002.pdf',
        metadata: {
          signedDate: new Date(),
          repId: sampleEmployees[1]._id,
          notes: 'Premium partnership agreement'
        },
        status: 'signed_uploaded',
        legalReview: {
          reviewerId: null,
          approved: null,
          reason: null,
          reviewedAt: null
        },
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    for (const contract of sampleContracts) {
      await contractsCollection.replaceOne(
        { _id: contract._id },
        contract,
        { upsert: true }
      );
    }
    console.log('✓ Sample contracts created');

    // Create sample sales partners
    const salesPartnersCollection = await getCollection('sales_partners');
    const samplePartners = [
      {
        _id: new ObjectId(),
        name: 'Cairo Auto Parts Center',
        type: 'shop',
        address: '123 Tahrir Square, Cairo',
        contact: {
          name: 'Hassan Ali',
          email: 'hassan@cairoauto.com',
          phone: '+201234567893'
        },
        city: 'Cairo',
        country: 'Egypt',
        inventorySynced: true,
        status: 'active',
        createdBy: sampleEmployees[0]._id,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        _id: new ObjectId(),
        name: 'Alexandria Service Center',
        type: 'service_center',
        address: '456 Corniche Road, Alexandria',
        contact: {
          name: 'Mona Farid',
          email: 'mona@alexservice.com',
          phone: '+201234567894'
        },
        city: 'Alexandria',
        country: 'Egypt',
        inventorySynced: false,
        status: 'pending',
        createdBy: sampleEmployees[1]._id,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    for (const partner of samplePartners) {
      await salesPartnersCollection.replaceOne(
        { _id: partner._id },
        partner,
        { upsert: true }
      );
    }
    console.log('✓ Sample sales partners created');

    // Create sample communications
    const communicationsCollection = await getCollection('communications');
    const sampleCommunications = [
      {
        _id: new ObjectId(),
        leadId: sampleLeads[0]._id,
        partnerId: null,
        type: 'call',
        subject: 'Initial contact call',
        body: 'Discussed partnership opportunities and pricing',
        attachments: [],
        outcome: 'successful',
        date: new Date(),
        createdBy: sampleEmployees[0]._id,
        createdAt: new Date()
      },
      {
        _id: new ObjectId(),
        leadId: sampleLeads[1]._id,
        partnerId: null,
        type: 'email',
        subject: 'Follow-up email',
        body: 'Sent proposal document and pricing information',
        attachments: [
          {
            url: 'https://s3.example.com/attachments/proposal_001.pdf',
            name: 'Partnership Proposal.pdf'
          }
        ],
        outcome: 'successful',
        date: new Date(),
        createdBy: sampleEmployees[0]._id,
        createdAt: new Date()
      }
    ];

    for (const communication of sampleCommunications) {
      await communicationsCollection.replaceOne(
        { _id: communication._id },
        communication,
        { upsert: true }
      );
    }
    console.log('✓ Sample communications created');

    // Create sample sales activities
    const salesActivitiesCollection = await getCollection('sales_activities');
    const sampleActivities = [
      {
        _id: new ObjectId(),
        userId: sampleEmployees[0]._id,
        type: 'visit',
        targetId: sampleLeads[0]._id,
        notes: 'Visited Acme Auto Parts shop, discussed partnership terms',
        attachments: [],
        createdAt: new Date()
      },
      {
        _id: new ObjectId(),
        userId: sampleEmployees[1]._id,
        type: 'meeting',
        targetId: sampleLeads[2]._id,
        notes: 'Meeting with Premium Parts Import Co. management team',
        attachments: [],
        createdAt: new Date()
      }
    ];

    for (const activity of sampleActivities) {
      await salesActivitiesCollection.replaceOne(
        { _id: activity._id },
        activity,
        { upsert: true }
      );
    }
    console.log('✓ Sample sales activities created');

    // Create sample performance metrics
    const performanceMetricsCollection = await getCollection('performance_metrics');
    const sampleMetrics = [
      {
        _id: new ObjectId(),
        team: 'sales',
        period: 'monthly',
        metricName: 'leads_created',
        value: 15,
        createdAt: new Date()
      },
      {
        _id: new ObjectId(),
        team: 'sales',
        period: 'monthly',
        metricName: 'deals_closed',
        value: 8,
        createdAt: new Date()
      },
      {
        _id: new ObjectId(),
        team: 'sales',
        period: 'monthly',
        metricName: 'revenue_egp',
        value: 400000,
        createdAt: new Date()
      },
      {
        _id: new ObjectId(),
        team: 'sales',
        period: 'monthly',
        metricName: 'conversion_rate',
        value: 53.3,
        createdAt: new Date()
      }
    ];

    for (const metric of sampleMetrics) {
      await performanceMetricsCollection.replaceOne(
        { _id: metric._id },
        metric,
        { upsert: true }
      );
    }
    console.log('✓ Sample performance metrics created');

    console.log('🎉 Sales development data seeded successfully!');
    console.log('\n📊 Sample Data Summary:');
    console.log(`- ${sampleEmployees.length} employees`);
    console.log(`- ${sampleLeads.length} leads`);
    console.log(`- ${sampleDeals.length} deals`);
    console.log(`- ${sampleContracts.length} contracts`);
    console.log(`- ${samplePartners.length} sales partners`);
    console.log(`- ${sampleCommunications.length} communications`);
    console.log(`- ${sampleActivities.length} sales activities`);
    console.log(`- ${sampleMetrics.length} performance metrics`);

  } catch (error) {
    console.error('❌ Error seeding sales development data:', error);
    throw error;
  }
}

// Run if called directly
if (require.main === module) {
  seedSalesDevData()
    .then(() => {
      console.log('Sales data seeding completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Sales data seeding failed:', error);
      process.exit(1);
    });
}

module.exports = { seedSalesDevData };
