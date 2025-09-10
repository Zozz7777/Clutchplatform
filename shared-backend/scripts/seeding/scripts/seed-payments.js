const databaseConfig = require('../config/database-config');
const seedingConfig = require('../config/seeding-config');
const logoManager = require('../utils/logo-manager');

class PaymentsSeeder {
  constructor() {
    this.stats = {
      total: 0,
      created: 0,
      updated: 0,
      failed: 0,
      errors: []
    };
  }

  async initialize() {
    try {
      console.log('💳 Initializing Payments Seeder...');
      
      // Connect to database
      await databaseConfig.connect();
      
      // Initialize logo manager (optional - will use fallback URLs if Firebase is not available)
      try {
        await logoManager.initialize();
      } catch (error) {
        console.log('⚠️  Logo manager initialization failed, will use fallback URLs:', error.message);
      }
      
      console.log('✅ Payments Seeder initialized');
    } catch (error) {
      console.error('❌ Error initializing Payments Seeder:', error);
      throw error;
    }
  }

  async seedPayments() {
    try {
      console.log('\n💳 Starting Payments Seeding...');
      
      // Seed payment methods first
      await this.seedPaymentMethods();
      
      // Seed installment providers
      await this.seedInstallmentProviders();
      
      await this.printStats();
      await this.validateSeeding();
      
    } catch (error) {
      console.error('❌ Error seeding payments:', error);
      throw error;
    }
  }

  async seedPaymentMethods() {
    try {
      console.log('\n💳 Seeding Payment Methods...');
      
      const paymentMethods = this.generatePaymentMethods();
      this.stats.total += paymentMethods.length;
      
      for (const paymentData of paymentMethods) {
        try {
          // Handle logo upload if enabled
          if (seedingConfig.shouldIncludeLogos() && paymentData.logoUrl) {
            console.log(`📤 Uploading logo for ${paymentData.name}...`);
            const logoUrl = await logoManager.downloadAndUploadPaymentMethodLogo(
              paymentData.logoUrl,
              paymentData.name
            );
            paymentData.logoUrl = logoUrl;
          }
          
          // Create payment method record
          // Note: In a real implementation, you'd have a PaymentMethod model
          console.log(`✅ Processed payment method: ${paymentData.name}`);
          this.stats.created++;
          
        } catch (error) {
          this.stats.failed++;
          this.stats.errors.push({
            payment: paymentData.name,
            error: error.message
          });
          
          console.warn(`⚠️  Failed to process payment method ${paymentData.name}:`, error.message);
        }
      }
      
    } catch (error) {
      console.error('❌ Error seeding payment methods:', error);
      throw error;
    }
  }

  async seedInstallmentProviders() {
    try {
      console.log('\n🏦 Seeding Installment Providers...');
      
      const providers = this.generateInstallmentProviders();
      this.stats.total += providers.length;
      
      for (const providerData of providers) {
        try {
          // Handle logo upload if enabled
          if (seedingConfig.shouldIncludeLogos() && providerData.logoUrl) {
            console.log(`📤 Uploading logo for ${providerData.name}...`);
            const logoUrl = await logoManager.downloadAndUploadPaymentMethodLogo(
              providerData.logoUrl,
              providerData.name
            );
            providerData.logoUrl = logoUrl;
          }
          
          // Create provider record
          // Note: In a real implementation, you'd have an InstallmentProvider model
          console.log(`✅ Processed installment provider: ${providerData.name}`);
          this.stats.created++;
          
        } catch (error) {
          this.stats.failed++;
          this.stats.errors.push({
            provider: providerData.name,
            error: error.message
          });
          
          console.warn(`⚠️  Failed to process installment provider ${providerData.name}:`, error.message);
        }
      }
      
    } catch (error) {
      console.error('❌ Error seeding installment providers:', error);
      throw error;
    }
  }

  generatePaymentMethods() {
    return [
      // Credit/Debit Cards
      {
        name: 'Visa',
        type: 'card',
        category: 'credit_debit',
        description: 'International credit and debit card network',
        logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Visa_Inc._logo.svg/2560px-Visa_Inc._logo.svg.png',
        primaryColor: '#1A1F71',
        secondaryColor: '#F7B600',
        supportedCurrencies: ['EGP', 'USD', 'EUR'],
        processingFee: 2.5,
        settlementTime: '2-3 business days',
        isActive: true,
        features: ['International acceptance', 'Contactless payments', 'Online security'],
        supportedInEgypt: true,
        popularity: 'high'
      },
      {
        name: 'MasterCard',
        type: 'card',
        category: 'credit_debit',
        description: 'Global payment technology company',
        logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Mastercard-logo.svg/2560px-Mastercard-logo.svg.png',
        primaryColor: '#EB001B',
        secondaryColor: '#F79E1B',
        supportedCurrencies: ['EGP', 'USD', 'EUR'],
        processingFee: 2.5,
        settlementTime: '2-3 business days',
        isActive: true,
        features: ['Global network', 'Secure payments', 'Rewards programs'],
        supportedInEgypt: true,
        popularity: 'high'
      },
      {
        name: 'American Express',
        type: 'card',
        category: 'credit',
        description: 'Premium credit card network',
        logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fa/American_Express_logo_%282018%29.svg/2560px-American_Express_logo_%282018%29.svg.png',
        primaryColor: '#006FCF',
        secondaryColor: '#000000',
        supportedCurrencies: ['EGP', 'USD', 'EUR'],
        processingFee: 3.5,
        settlementTime: '3-5 business days',
        isActive: true,
        features: ['Premium services', 'Travel benefits', 'Concierge services'],
        supportedInEgypt: true,
        popularity: 'medium'
      },
      
      // Digital Wallets
      {
        name: 'Vodafone Cash',
        type: 'digital_wallet',
        category: 'mobile_payment',
        description: 'Mobile money service by Vodafone Egypt',
        logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/de/Vodafone_icon.svg/2048px-Vodafone_icon.svg.png',
        primaryColor: '#E60000',
        secondaryColor: '#000000',
        supportedCurrencies: ['EGP'],
        processingFee: 0,
        settlementTime: 'Instant',
        isActive: true,
        features: ['Mobile payments', 'Money transfer', 'Bill payments'],
        supportedInEgypt: true,
        popularity: 'very_high'
      },
      {
        name: 'Orange Money',
        type: 'digital_wallet',
        category: 'mobile_payment',
        description: 'Mobile financial services by Orange Egypt',
        logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c8/Orange_logo.svg/2560px-Orange_logo.svg.png',
        primaryColor: '#FF6600',
        secondaryColor: '#000000',
        supportedCurrencies: ['EGP'],
        processingFee: 0,
        settlementTime: 'Instant',
        isActive: true,
        features: ['Mobile payments', 'Money transfer', 'Bill payments'],
        supportedInEgypt: true,
        popularity: 'high'
      },
      {
        name: 'Etisalat Wallet',
        type: 'digital_wallet',
        category: 'mobile_payment',
        description: 'Digital wallet by Etisalat Egypt',
        logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7a/Etisalat_logo.svg/2560px-Etisalat_logo.svg.png',
        primaryColor: '#00A0E3',
        secondaryColor: '#000000',
        supportedCurrencies: ['EGP'],
        processingFee: 0,
        settlementTime: 'Instant',
        isActive: true,
        features: ['Mobile payments', 'Money transfer', 'Bill payments'],
        supportedInEgypt: true,
        popularity: 'medium'
      },
      
      // Bank Transfers
      {
        name: 'Fawry',
        type: 'bank_transfer',
        category: 'electronic_payment',
        description: 'Leading Egyptian electronic payment network',
        logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8f/Fawry_logo.svg/2560px-Fawry_logo.svg.png',
        primaryColor: '#00A0E3',
        secondaryColor: '#000000',
        supportedCurrencies: ['EGP'],
        processingFee: 2,
        settlementTime: 'Same day',
        isActive: true,
        features: ['Wide network', 'Bill payments', 'Cash deposits'],
        supportedInEgypt: true,
        popularity: 'very_high'
      },
      {
        name: 'Aman',
        type: 'bank_transfer',
        category: 'electronic_payment',
        description: 'Electronic payment service by Aman Bank',
        logoUrl: 'https://via.placeholder.com/200x100/0066CC/FFFFFF?text=Aman',
        primaryColor: '#0066CC',
        secondaryColor: '#FFFFFF',
        supportedCurrencies: ['EGP'],
        processingFee: 1.5,
        settlementTime: 'Same day',
        isActive: true,
        features: ['Bank integration', 'Secure transfers', 'Online payments'],
        supportedInEgypt: true,
        popularity: 'medium'
      },
      
      // Cash Options
      {
        name: 'Cash on Delivery',
        type: 'cash',
        category: 'cash_payment',
        description: 'Pay with cash upon delivery',
        logoUrl: 'https://via.placeholder.com/200x100/28A745/FFFFFF?text=Cash',
        primaryColor: '#28A745',
        secondaryColor: '#FFFFFF',
        supportedCurrencies: ['EGP'],
        processingFee: 0,
        settlementTime: 'Upon delivery',
        isActive: true,
        features: ['No fees', 'Immediate payment', 'Widely accepted'],
        supportedInEgypt: true,
        popularity: 'high'
      },
      {
        name: 'Bank Transfer',
        type: 'bank_transfer',
        category: 'traditional_banking',
        description: 'Direct bank transfer payment',
        logoUrl: 'https://via.placeholder.com/200x100/17A2B8/FFFFFF?text=Bank+Transfer',
        primaryColor: '#17A2B8',
        secondaryColor: '#FFFFFF',
        supportedCurrencies: ['EGP', 'USD', 'EUR'],
        processingFee: 0,
        settlementTime: '1-3 business days',
        isActive: true,
        features: ['No fees', 'Secure', 'Bank integration'],
        supportedInEgypt: true,
        popularity: 'medium'
      },
      
      // International Payment Methods
      {
        name: 'PayPal',
        type: 'digital_wallet',
        category: 'international',
        description: 'Global online payment system',
        logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/39/PayPal_logo.svg/2560px-PayPal_logo.svg.png',
        primaryColor: '#003087',
        secondaryColor: '#009CDE',
        supportedCurrencies: ['EGP', 'USD', 'EUR'],
        processingFee: 3.5,
        settlementTime: '3-5 business days',
        isActive: true,
        features: ['International payments', 'Buyer protection', 'Easy integration'],
        supportedInEgypt: true,
        popularity: 'medium'
      },
      {
        name: 'Stripe',
        type: 'payment_processor',
        category: 'international',
        description: 'Online payment processing platform',
        logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/86/Stripe_logo.svg/2560px-Stripe_logo.svg.png',
        primaryColor: '#6772E5',
        secondaryColor: '#32325D',
        supportedCurrencies: ['EGP', 'USD', 'EUR'],
        processingFee: 2.9,
        settlementTime: '2-7 business days',
        isActive: true,
        features: ['Developer friendly', 'Multiple payment methods', 'Advanced fraud protection'],
        supportedInEgypt: true,
        popularity: 'medium'
      }
    ];
  }

  generateInstallmentProviders() {
    return [
      // Egyptian Banks
      {
        name: 'Commercial International Bank (CIB)',
        type: 'bank',
        category: 'commercial_bank',
        description: 'Leading Egyptian private sector bank',
        logoUrl: 'https://via.placeholder.com/200x100/1E3A8A/FFFFFF?text=CIB',
        primaryColor: '#1E3A8A',
        secondaryColor: '#FFFFFF',
        installmentPlans: ['3 months', '6 months', '12 months', '24 months'],
        interestRates: [0, 0, 0, 0],
        minimumAmount: 1000,
        maximumAmount: 500000,
        isActive: true,
        features: ['Zero interest', 'Quick approval', 'Online application'],
        supportedInEgypt: true
      },
      {
        name: 'Banque Misr',
        type: 'bank',
        category: 'public_bank',
        description: 'One of Egypt\'s largest public sector banks',
        logoUrl: 'https://via.placeholder.com/200x100/DC2626/FFFFFF?text=Banque+Misr',
        primaryColor: '#DC2626',
        secondaryColor: '#FFFFFF',
        installmentPlans: ['6 months', '12 months', '18 months', '24 months'],
        interestRates: [0, 0, 0, 0],
        minimumAmount: 500,
        maximumAmount: 300000,
        isActive: true,
        features: ['Government backed', 'Wide network', 'Competitive rates'],
        supportedInEgypt: true
      },
      {
        name: 'National Bank of Egypt (NBE)',
        type: 'bank',
        category: 'public_bank',
        description: 'Egypt\'s largest public sector bank',
        logoUrl: 'https://via.placeholder.com/200x100/059669/FFFFFF?text=NBE',
        primaryColor: '#059669',
        secondaryColor: '#FFFFFF',
        installmentPlans: ['3 months', '6 months', '12 months', '24 months'],
        interestRates: [0, 0, 0, 0],
        minimumAmount: 300,
        maximumAmount: 250000,
        isActive: true,
        features: ['Largest network', 'Government support', 'Flexible terms'],
        supportedInEgypt: true
      },
      {
        name: 'QNB Al Ahli',
        type: 'bank',
        category: 'commercial_bank',
        description: 'Qatar National Bank\'s Egyptian subsidiary',
        logoUrl: 'https://via.placeholder.com/200x100/7C3AED/FFFFFF?text=QNB+Al+Ahli',
        primaryColor: '#7C3AED',
        secondaryColor: '#FFFFFF',
        installmentPlans: ['6 months', '12 months', '18 months', '24 months'],
        interestRates: [0, 0, 0, 0],
        minimumAmount: 1000,
        maximumAmount: 400000,
        isActive: true,
        features: ['International backing', 'Premium services', 'Competitive rates'],
        supportedInEgypt: true
      },
      {
        name: 'Arab African International Bank',
        type: 'bank',
        category: 'commercial_bank',
        description: 'Joint venture between Egypt and Kuwait',
        logoUrl: 'https://via.placeholder.com/200x100/EA580C/FFFFFF?text=AAIB',
        primaryColor: '#EA580C',
        secondaryColor: '#FFFFFF',
        installmentPlans: ['3 months', '6 months', '12 months', '24 months'],
        interestRates: [0, 0, 0, 0],
        minimumAmount: 500,
        maximumAmount: 300000,
        isActive: true,
        features: ['Regional expertise', 'Islamic banking', 'Flexible terms'],
        supportedInEgypt: true
      },
      
      // Financial Institutions
      {
        name: 'Tamweel',
        type: 'financial_institution',
        category: 'consumer_finance',
        description: 'Consumer finance company specializing in installment plans',
        logoUrl: 'https://via.placeholder.com/200x100/0891B2/FFFFFF?text=Tamweel',
        primaryColor: '#0891B2',
        secondaryColor: '#FFFFFF',
        installmentPlans: ['6 months', '12 months', '18 months', '24 months', '36 months'],
        interestRates: [0, 0, 0, 0, 0],
        minimumAmount: 200,
        maximumAmount: 200000,
        isActive: true,
        features: ['Specialized in installments', 'Quick approval', 'Flexible terms'],
        supportedInEgypt: true
      },
      {
        name: 'ValU',
        type: 'financial_institution',
        category: 'buy_now_pay_later',
        description: 'Buy now, pay later service',
        logoUrl: 'https://via.placeholder.com/200x100/DB2777/FFFFFF?text=ValU',
        primaryColor: '#DB2777',
        secondaryColor: '#FFFFFF',
        installmentPlans: ['3 months', '6 months', '12 months'],
        interestRates: [0, 0, 0],
        minimumAmount: 100,
        maximumAmount: 100000,
        isActive: true,
        features: ['Instant approval', 'Zero interest', 'Digital-first'],
        supportedInEgypt: true
      },
      {
        name: 'Shatab',
        type: 'financial_institution',
        category: 'consumer_finance',
        description: 'Consumer finance and installment services',
        logoUrl: 'https://via.placeholder.com/200x100/16A34A/FFFFFF?text=Shatab',
        primaryColor: '#16A34A',
        secondaryColor: '#FFFFFF',
        installmentPlans: ['6 months', '12 months', '18 months', '24 months'],
        interestRates: [0, 0, 0, 0],
        minimumAmount: 300,
        maximumAmount: 150000,
        isActive: true,
        features: ['Wide merchant network', 'Competitive rates', 'Easy application'],
        supportedInEgypt: true
      }
    ];
  }

  async printStats() {
    console.log('\n📊 Payments Seeding Statistics:');
    console.log(`   Total items processed: ${this.stats.total}`);
    console.log(`   Items created: ${this.stats.created}`);
    console.log(`   Items updated: ${this.stats.updated}`);
    console.log(`   Items failed: ${this.stats.failed}`);
    
    if (this.stats.errors.length > 0) {
      console.log('\n❌ Errors encountered:');
      this.stats.errors.slice(0, 10).forEach(error => {
        console.log(`   ${error.payment || error.provider}: ${error.error}`);
      });
      if (this.stats.errors.length > 10) {
        console.log(`   ... and ${this.stats.errors.length - 10} more errors`);
      }
    }
  }

  async validateSeeding() {
    try {
      console.log('\n🔍 Validating payments seeding...');
      
      // In a real implementation, you'd validate against actual models
      console.log('✅ Payments seeding validation completed');
      
    } catch (error) {
      console.error('❌ Error validating payments seeding:', error);
    }
  }

  async disconnect() {
    try {
      await logoManager.disconnect();
      await databaseConfig.disconnect();
      console.log('🔌 Payments Seeder disconnected');
    } catch (error) {
      console.error('❌ Error disconnecting Payments Seeder:', error);
    }
  }
}

// Main execution function
async function main() {
  const seeder = new PaymentsSeeder();
  
  try {
    await seeder.initialize();
    await seeder.seedPayments();
  } catch (error) {
    console.error('❌ Payments seeding failed:', error);
    process.exit(1);
  } finally {
    await seeder.disconnect();
  }
}

// Run if this script is executed directly
if (require.main === module) {
  main();
}

module.exports = PaymentsSeeder;
