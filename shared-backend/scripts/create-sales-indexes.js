const { getCollection } = require('../config/database');

async function createSalesIndexes() {
  try {
    console.log('Creating sales system indexes...');

    // Leads collection indexes
    const leadsCollection = await getCollection('leads');
    await leadsCollection.createIndex({ assignedTo: 1 });
    await leadsCollection.createIndex({ status: 1 });
    await leadsCollection.createIndex({ type: 1 });
    await leadsCollection.createIndex({ createdAt: -1 });
    await leadsCollection.createIndex({ 'contact.email': 1 });
    await leadsCollection.createIndex({ companyName: 1 });
    console.log('✓ Leads indexes created');

    // Deals collection indexes
    const dealsCollection = await getCollection('deals');
    await dealsCollection.createIndex({ assignedTo: 1 });
    await dealsCollection.createIndex({ stage: 1 });
    await dealsCollection.createIndex({ pipeline: 1 });
    await dealsCollection.createIndex({ leadId: 1 });
    await dealsCollection.createIndex({ createdAt: -1 });
    console.log('✓ Deals indexes created');

    // Contracts collection indexes
    const contractsCollection = await getCollection('contracts');
    await contractsCollection.createIndex({ status: 1 });
    await contractsCollection.createIndex({ leadId: 1 });
    await contractsCollection.createIndex({ partnerId: 1 });
    await contractsCollection.createIndex({ createdAt: -1 });
    await contractsCollection.createIndex({ 'legalReview.reviewerId': 1 });
    console.log('✓ Contracts indexes created');

    // Sales Partners collection indexes
    const salesPartnersCollection = await getCollection('sales_partners');
    await salesPartnersCollection.createIndex({ status: 1 });
    await salesPartnersCollection.createIndex({ type: 1 });
    await salesPartnersCollection.createIndex({ createdBy: 1 });
    await salesPartnersCollection.createIndex({ city: 1 });
    await salesPartnersCollection.createIndex({ createdAt: -1 });
    console.log('✓ Sales Partners indexes created');

    // Communications collection indexes
    const communicationsCollection = await getCollection('communications');
    await communicationsCollection.createIndex({ date: -1 });
    await communicationsCollection.createIndex({ leadId: 1 });
    await communicationsCollection.createIndex({ partnerId: 1 });
    await communicationsCollection.createIndex({ type: 1 });
    await communicationsCollection.createIndex({ createdBy: 1 });
    console.log('✓ Communications indexes created');

    // Approvals collection indexes
    const approvalsCollection = await getCollection('approvals');
    await approvalsCollection.createIndex({ status: 1 });
    await approvalsCollection.createIndex({ resourceType: 1 });
    await approvalsCollection.createIndex({ resourceId: 1 });
    await approvalsCollection.createIndex({ approverRole: 1 });
    await approvalsCollection.createIndex({ requesterId: 1 });
    await approvalsCollection.createIndex({ createdAt: -1 });
    console.log('✓ Approvals indexes created');

    // Sales Activities collection indexes
    const salesActivitiesCollection = await getCollection('sales_activities');
    await salesActivitiesCollection.createIndex({ userId: 1 });
    await salesActivitiesCollection.createIndex({ targetId: 1 });
    await salesActivitiesCollection.createIndex({ type: 1 });
    await salesActivitiesCollection.createIndex({ createdAt: -1 });
    console.log('✓ Sales Activities indexes created');

    // Performance Metrics collection indexes
    const performanceMetricsCollection = await getCollection('performance_metrics');
    await performanceMetricsCollection.createIndex({ team: 1, period: 1 });
    await performanceMetricsCollection.createIndex({ metricName: 1 });
    await performanceMetricsCollection.createIndex({ createdAt: -1 });
    console.log('✓ Performance Metrics indexes created');

    // Employees collection indexes (for sales system)
    const employeesCollection = await getCollection('employees');
    await employeesCollection.createIndex({ role: 1 });
    await employeesCollection.createIndex({ team: 1 });
    await employeesCollection.createIndex({ email: 1 }, { unique: true });
    console.log('✓ Employees indexes created');

    console.log('🎉 All sales system indexes created successfully!');
  } catch (error) {
    console.error('❌ Error creating sales indexes:', error);
    throw error;
  }
}

// Run if called directly
if (require.main === module) {
  createSalesIndexes()
    .then(() => {
      console.log('Index creation completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Index creation failed:', error);
      process.exit(1);
    });
}

module.exports = { createSalesIndexes };
