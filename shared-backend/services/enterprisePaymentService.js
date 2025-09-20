const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const userService = require('./userService');
const databaseUtils = require('../utils/databaseUtils');
const crypto = require('crypto');

class EnterprisePaymentService {
    constructor() {
        this.isInitialized = false;
        this.paymentGateways = new Map();
        this.subscriptionPlans = new Map();
        this.financialMetrics = {
            totalRevenue: 0,
            monthlyRecurringRevenue: 0,
            averageOrderValue: 0,
            conversionRate: 0,
            refundRate: 0
        };
    }

    async initialize() {
        try {
            await this.setupPaymentGateways();
            await this.initializeSubscriptionManagement();
            await this.setupFinancialAnalytics();
            await this.initializeTaxCompliance();
            
            this.isInitialized = true;
            console.log('✅ Enterprise Payment Service initialized');
            
            // Start periodic financial calculations
            setInterval(() => this.calculateFinancialMetrics(), 60 * 60 * 1000); // Every hour
            
        } catch (error) {
            console.error('❌ Enterprise Payment Service initialization failed:', error.message);
            throw error;
        }
    }

    // Multi-Gateway Payment Processing
    async setupPaymentGateways() {
        console.log('💳 Setting up Multi-Gateway Payment Processing...');
        
        // Stripe Gateway
        this.paymentGateways.set('stripe', {
            name: 'Stripe',
            enabled: true,
            config: {
                secretKey: process.env.STRIPE_SECRET_KEY,
                publishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
                webhookSecret: process.env.STRIPE_WEBHOOK_SECRET
            },
            supportedMethods: ['card', 'bank_transfer', 'sepa_debit'],
            processingFee: 0.029, // 2.9% + 30¢
            processingTime: '2-3 business days'
        });

        // PayPal Gateway
        this.paymentGateways.set('paypal', {
            name: 'PayPal',
            enabled: true,
            config: {
                clientId: process.env.PAYPAL_CLIENT_ID,
                clientSecret: process.env.PAYPAL_CLIENT_SECRET,
                mode: process.env.PAYPAL_MODE || 'sandbox'
            },
            supportedMethods: ['paypal', 'card'],
            processingFee: 0.029, // 2.9% + fixed fee
            processingTime: '1-2 business days'
        });

        // Apple Pay Gateway
        this.paymentGateways.set('applepay', {
            name: 'Apple Pay',
            enabled: true,
            config: {
                merchantId: process.env.APPLE_PAY_MERCHANT_ID,
                domain: process.env.APPLE_PAY_DOMAIN
            },
            supportedMethods: ['apple_pay'],
            processingFee: 0.029, // 2.9% + 30¢
            processingTime: '2-3 business days'
        });

        // Google Pay Gateway
        this.paymentGateways.set('googlepay', {
            name: 'Google Pay',
            enabled: true,
            config: {
                merchantId: process.env.GOOGLE_PAY_MERCHANT_ID,
                environment: process.env.GOOGLE_PAY_ENVIRONMENT || 'TEST'
            },
            supportedMethods: ['google_pay'],
            processingFee: 0.029, // 2.9% + 30¢
            processingTime: '2-3 business days'
        });

        // Local Payment Methods
        this.paymentGateways.set('local', {
            name: 'Local Payment Methods',
            enabled: true,
            config: {
                methods: ['bank_transfer', 'cash_on_delivery', 'mobile_money']
            },
            supportedMethods: ['bank_transfer', 'cash_on_delivery', 'mobile_money'],
            processingFee: 0.01, // 1%
            processingTime: '3-5 business days'
        });
    }

    // Subscription Management
    async initializeSubscriptionManagement() {
        console.log('🔄 Initializing Subscription Management...');
        
        // Define subscription plans
        this.subscriptionPlans.set('basic', {
            id: 'basic',
            name: 'Basic Plan',
            price: 29.99,
            currency: 'EGP',
            interval: 'month',
            features: ['basic_support', 'standard_services', 'email_notifications'],
            maxUsers: 1,
            maxVehicles: 2
        });

        this.subscriptionPlans.set('professional', {
            id: 'professional',
            name: 'Professional Plan',
            price: 79.99,
            currency: 'EGP',
            interval: 'month',
            features: ['priority_support', 'advanced_services', 'sms_notifications', 'ai_recommendations'],
            maxUsers: 5,
            maxVehicles: 10
        });

        this.subscriptionPlans.set('enterprise', {
            id: 'enterprise',
            name: 'Enterprise Plan',
            price: 199.99,
            currency: 'EGP',
            interval: 'month',
            features: ['dedicated_support', 'premium_services', 'all_notifications', 'ai_recommendations', 'fleet_management'],
            maxUsers: -1, // Unlimited
            maxVehicles: -1 // Unlimited
        });

        // Usage-based billing tiers
        this.usageTiers = {
            api_calls: [
                { tier: 1, limit: 1000, price: 0.001 },
                { tier: 2, limit: 10000, price: 0.0008 },
                { tier: 3, limit: 100000, price: 0.0005 },
                { tier: 4, limit: -1, price: 0.0002 } // Unlimited
            ],
            storage: [
                { tier: 1, limit: 10, price: 0.1 }, // GB
                { tier: 2, limit: 100, price: 0.08 },
                { tier: 3, limit: 1000, price: 0.05 },
                { tier: 4, limit: -1, price: 0.02 }
            ]
        };
    }

    // Financial Analytics
    async setupFinancialAnalytics() {
        console.log('📊 Setting up Financial Analytics...');
        
        this.analytics = {
            revenueTracking: true,
            costAnalysis: true,
            profitabilityTracking: true,
            cashFlowManagement: true,
            forecasting: true
        };

        // Revenue metrics
        this.revenueMetrics = {
            totalRevenue: 0,
            monthlyRecurringRevenue: 0,
            annualRecurringRevenue: 0,
            averageOrderValue: 0,
            customerLifetimeValue: 0,
            churnRate: 0
        };

        // Cost metrics
        this.costMetrics = {
            processingFees: 0,
            infrastructureCosts: 0,
            operationalCosts: 0,
            marketingCosts: 0,
            totalCosts: 0
        };
    }

    // Tax Compliance
    async initializeTaxCompliance() {
        console.log('🧾 Initializing Tax Compliance...');
        
        this.taxCompliance = {
            enabled: true,
            jurisdictions: ['US', 'EU', 'UK', 'CA', 'AU'],
            automaticCalculation: true,
            reporting: true
        };

        // Tax rates by jurisdiction
        this.taxRates = {
            US: {
                federal: 0,
                state: {
                    CA: 0.075,
                    NY: 0.085,
                    TX: 0.0625
                }
            },
            EU: {
                VAT: 0.20,
                reduced: 0.10
            },
            UK: {
                VAT: 0.20,
                reduced: 0.05
            }
        };
    }

    // Process Payment
    async processPayment(paymentData) {
        try {
            const {
                userId,
                amount,
                currency = 'EGP',
                paymentMethod,
                gateway = 'stripe',
                description,
                metadata = {}
            } = paymentData;

            // Validate payment data
            const validation = await this.validatePaymentData(paymentData);
            if (!validation.valid) {
                throw new Error(validation.error);
            }

            // Select payment gateway
            const selectedGateway = this.paymentGateways.get(gateway);
            if (!selectedGateway || !selectedGateway.enabled) {
                throw new Error(`Payment gateway ${gateway} is not available`);
            }

            // Calculate fees
            const fees = this.calculateProcessingFees(amount, selectedGateway);
            const totalAmount = amount + fees.processingFee;

            // Process payment through selected gateway
            let paymentResult;
            switch (gateway) {
                case 'stripe':
                    paymentResult = await this.processStripePayment(paymentData, totalAmount);
                    break;
                case 'paypal':
                    paymentResult = await this.processPayPalPayment(paymentData, totalAmount);
                    break;
                case 'applepay':
                    paymentResult = await this.processApplePayPayment(paymentData, totalAmount);
                    break;
                case 'googlepay':
                    paymentResult = await this.processGooglePayPayment(paymentData, totalAmount);
                    break;
                case 'local':
                    paymentResult = await this.processLocalPayment(paymentData, totalAmount);
                    break;
                default:
                    throw new Error(`Unsupported payment gateway: ${gateway}`);
            }

            // Create payment record
            const payment = new Payment({
                userId,
                amount: totalAmount,
                currency,
                paymentMethod,
                gateway,
                status: paymentResult.status,
                transactionId: paymentResult.transactionId,
                fees: fees,
                description,
                metadata: {
                    ...metadata,
                    gatewayResponse: paymentResult
                }
            });

            await payment.save();

            // Update financial metrics
            await this.updateFinancialMetrics(payment);

            // Log payment event
            await this.logPaymentEvent('payment_processed', {
                userId,
                paymentId: payment._id,
                amount: totalAmount,
                gateway,
                status: paymentResult.status
            });

            return {
                success: true,
                paymentId: payment._id,
                transactionId: paymentResult.transactionId,
                status: paymentResult.status,
                amount: totalAmount,
                fees: fees
            };

        } catch (error) {
            console.error('Error in processPayment:', error);
            
            // Log failed payment
            await this.logPaymentEvent('payment_failed', {
                userId: paymentData.userId,
                amount: paymentData.amount,
                gateway: paymentData.gateway,
                error: error.message
            });

            throw error;
        }
    }

    // Stripe Payment Processing
    async processStripePayment(paymentData, totalAmount) {
        try {
            const paymentIntent = await stripe.paymentIntents.create({
                amount: Math.round(totalAmount * 100), // Convert to cents
                currency: paymentData.currency,
                payment_method_types: ['card'],
                description: paymentData.description,
                metadata: paymentData.metadata
            });

            return {
                status: 'succeeded',
                transactionId: paymentIntent.id,
                gatewayResponse: paymentIntent
            };

        } catch (error) {
            console.error('Stripe payment error:', error);
            throw new Error(`Stripe payment failed: ${error.message}`);
        }
    }

    // PayPal Payment Processing
    async processPayPalPayment(paymentData, totalAmount) {
        try {
            // Simulate PayPal payment processing
            const transactionId = `paypal_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            
            return {
                status: 'succeeded',
                transactionId: transactionId,
                gatewayResponse: { id: transactionId }
            };

        } catch (error) {
            console.error('PayPal payment error:', error);
            throw new Error(`PayPal payment failed: ${error.message}`);
        }
    }

    // Apple Pay Payment Processing
    async processApplePayPayment(paymentData, totalAmount) {
        try {
            // Simulate Apple Pay payment processing
            const transactionId = `applepay_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            
            return {
                status: 'succeeded',
                transactionId: transactionId,
                gatewayResponse: { id: transactionId }
            };

        } catch (error) {
            console.error('Apple Pay payment error:', error);
            throw new Error(`Apple Pay payment failed: ${error.message}`);
        }
    }

    // Google Pay Payment Processing
    async processGooglePayPayment(paymentData, totalAmount) {
        try {
            // Simulate Google Pay payment processing
            const transactionId = `googlepay_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            
            return {
                status: 'succeeded',
                transactionId: transactionId,
                gatewayResponse: { id: transactionId }
            };

        } catch (error) {
            console.error('Google Pay payment error:', error);
            throw new Error(`Google Pay payment failed: ${error.message}`);
        }
    }

    // Local Payment Processing
    async processLocalPayment(paymentData, totalAmount) {
        try {
            // Simulate local payment processing
            const transactionId = `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            
            return {
                status: 'pending', // Local payments are typically pending until confirmed
                transactionId: transactionId,
                gatewayResponse: { id: transactionId }
            };

        } catch (error) {
            console.error('Local payment error:', error);
            throw new Error(`Local payment failed: ${error.message}`);
        }
    }

    // Subscription Management
    async createSubscription(subscriptionData) {
        try {
            const {
                userId,
                planId,
                paymentMethod,
                gateway = 'stripe',
                startDate = new Date(),
                trialDays = 0
            } = subscriptionData;

            // Validate plan
            const plan = this.subscriptionPlans.get(planId);
            if (!plan) {
                throw new Error(`Invalid subscription plan: ${planId}`);
            }

            // Create subscription through gateway
            let subscriptionResult;
            switch (gateway) {
                case 'stripe':
                    subscriptionResult = await this.createStripeSubscription(subscriptionData, plan);
                    break;
                default:
                    throw new Error(`Subscription not supported for gateway: ${gateway}`);
            }

            // Create subscription record
            const subscription = {
                userId,
                planId,
                status: subscriptionResult.status,
                subscriptionId: subscriptionResult.subscriptionId,
                currentPeriodStart: startDate,
                currentPeriodEnd: this.calculatePeriodEnd(startDate, plan.interval),
                trialEnd: trialDays > 0 ? new Date(startDate.getTime() + trialDays * 24 * 60 * 60 * 1000) : null,
                gateway,
                paymentMethod
            };

            // Update user subscription
            await userService.updateUserSubscription(userId, subscription);

            return {
                success: true,
                subscriptionId: subscriptionResult.subscriptionId,
                status: subscriptionResult.status,
                plan: plan
            };

        } catch (error) {
            console.error('Error in createSubscription:', error);
            throw error;
        }
    }

    // Stripe Subscription Creation
    async createStripeSubscription(subscriptionData, plan) {
        try {
            // Create customer if not exists
            const user = await userService.getUserById(subscriptionData.userId);
            let customer;
            
            if (user.stripeCustomerId) {
                customer = await stripe.customers.retrieve(user.stripeCustomerId);
            } else {
                customer = await stripe.customers.create({
                    email: user.email,
                    name: user.name,
                    metadata: { userId: user._id.toString() }
                });
                
                await userService.updateUser(user._id, { stripeCustomerId: customer.id });
            }

            // Create subscription
            const subscription = await stripe.subscriptions.create({
                customer: customer.id,
                items: [{ price: plan.stripePriceId }],
                trial_period_days: subscriptionData.trialDays,
                metadata: { userId: user._id.toString(), planId: plan.id }
            });

            return {
                status: subscription.status,
                subscriptionId: subscription.id
            };

        } catch (error) {
            console.error('Stripe subscription error:', error);
            throw new Error(`Stripe subscription failed: ${error.message}`);
        }
    }

    // Financial Analytics
    async generateFinancialReports(options = {}) {
        try {
            const {
                startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
                endDate = new Date(),
                reportType = 'comprehensive'
            } = options;

            const reports = {};

            // Revenue Report
            if (reportType === 'comprehensive' || reportType === 'revenue') {
                reports.revenue = await this.generateRevenueReport(startDate, endDate);
            }

            // Cost Report
            if (reportType === 'comprehensive' || reportType === 'costs') {
                reports.costs = await this.generateCostReport(startDate, endDate);
            }

            // Profitability Report
            if (reportType === 'comprehensive' || reportType === 'profitability') {
                reports.profitability = await this.generateProfitabilityReport(startDate, endDate);
            }

            // Cash Flow Report
            if (reportType === 'comprehensive' || reportType === 'cashflow') {
                reports.cashFlow = await this.generateCashFlowReport(startDate, endDate);
            }

            return reports;

        } catch (error) {
            console.error('Error in generateFinancialReports:', error);
            throw error;
        }
    }

    // Revenue Report Generation
    async generateRevenueReport(startDate, endDate) {
        try {
            const payments = await Payment.find({
                createdAt: { $gte: startDate, $lte: endDate },
                status: 'succeeded'
            });

            const totalRevenue = payments.reduce((sum, payment) => sum + payment.amount, 0);
            const totalFees = payments.reduce((sum, payment) => sum + payment.fees.processingFee, 0);
            const netRevenue = totalRevenue - totalFees;

            const revenueByGateway = {};
            payments.forEach(payment => {
                if (!revenueByGateway[payment.gateway]) {
                    revenueByGateway[payment.gateway] = 0;
                }
                revenueByGateway[payment.gateway] += payment.amount;
            });

            return {
                period: { startDate, endDate },
                totalRevenue,
                netRevenue,
                totalFees,
                paymentCount: payments.length,
                averageOrderValue: totalRevenue / payments.length,
                revenueByGateway,
                currency: 'EGP'
            };

        } catch (error) {
            console.error('Error in generateRevenueReport:', error);
            throw error;
        }
    }

    // Tax Calculation
    async calculateTax(amount, jurisdiction, address = null) {
        try {
            const taxRates = this.taxRates[jurisdiction];
            if (!taxRates) {
                return { taxAmount: 0, taxRate: 0, jurisdiction };
            }

            let taxRate = 0;
            let taxAmount = 0;

            switch (jurisdiction) {
                case 'US':
                    // Federal tax (if applicable)
                    taxRate += taxRates.federal;
                    
                    // State tax (if address provided)
                    if (address && address.state && taxRates.state[address.state]) {
                        taxRate += taxRates.state[address.state];
                    }
                    break;

                case 'EU':
                case 'UK':
                    taxRate = taxRates.VAT;
                    break;

                default:
                    taxRate = 0;
            }

            taxAmount = amount * taxRate;

            return {
                taxAmount: Math.round(taxAmount * 100) / 100,
                taxRate,
                jurisdiction,
                taxableAmount: amount
            };

        } catch (error) {
            console.error('Error in calculateTax:', error);
            throw error;
        }
    }

    // Utility Methods
    validatePaymentData(paymentData) {
        const { userId, amount, currency, paymentMethod } = paymentData;

        if (!userId) {
            return { valid: false, error: 'User ID is required' };
        }

        if (!amount || amount <= 0) {
            return { valid: false, error: 'Valid amount is required' };
        }

        if (!currency) {
            return { valid: false, error: 'Currency is required' };
        }

        if (!paymentMethod) {
            return { valid: false, error: 'Payment method is required' };
        }

        return { valid: true };
    }

    calculateProcessingFees(amount, gateway) {
        const processingFee = amount * gateway.processingFee;
        const fixedFee = gateway.fixedFee || 0;
        
        return {
            processingFee: Math.round((processingFee + fixedFee) * 100) / 100,
            percentage: gateway.processingFee,
            fixedFee: fixedFee
        };
    }

    calculatePeriodEnd(startDate, interval) {
        const endDate = new Date(startDate);
        
        switch (interval) {
            case 'day':
                endDate.setDate(endDate.getDate() + 1);
                break;
            case 'week':
                endDate.setDate(endDate.getDate() + 7);
                break;
            case 'month':
                endDate.setMonth(endDate.getMonth() + 1);
                break;
            case 'year':
                endDate.setFullYear(endDate.getFullYear() + 1);
                break;
            default:
                endDate.setMonth(endDate.getMonth() + 1);
        }
        
        return endDate;
    }

    async updateFinancialMetrics(payment) {
        // Update revenue metrics
        this.revenueMetrics.totalRevenue += payment.amount;
        this.revenueMetrics.averageOrderValue = this.revenueMetrics.totalRevenue / 
            (await Payment.countDocuments({ status: 'succeeded' }));

        // Update cost metrics
        this.costMetrics.processingFees += payment.fees.processingFee;
        this.costMetrics.totalCosts = this.costMetrics.processingFees + 
            this.costMetrics.infrastructureCosts + 
            this.costMetrics.operationalCosts + 
            this.costMetrics.marketingCosts;
    }

    async calculateFinancialMetrics() {
        try {
            const now = new Date();
            const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

            // Calculate MRR
            const monthlyPayments = await Payment.find({
                createdAt: { $gte: thirtyDaysAgo },
                status: 'succeeded'
            });

            this.revenueMetrics.monthlyRecurringRevenue = monthlyPayments.reduce(
                (sum, payment) => sum + payment.amount, 0
            );

            // Calculate ARR
            this.revenueMetrics.annualRecurringRevenue = this.revenueMetrics.monthlyRecurringRevenue * 12;

            console.log('📊 Financial metrics updated');

        } catch (error) {
            console.error('Error in calculateFinancialMetrics:', error);
        }
    }

    async logPaymentEvent(eventType, details) {
        try {
            const auditLog = new AuditLog({
                userId: details.userId,
                action: eventType,
                details: details,
                category: 'payment',
                severity: 'medium',
                timestamp: new Date()
            });

            await auditLog.save();

        } catch (error) {
            console.error('Error in logPaymentEvent:', error);
        }
    }

    async generateCostReport(startDate, endDate) {
        // Generate cost report
        return {
            period: { startDate, endDate },
            processingFees: this.costMetrics.processingFees,
            infrastructureCosts: this.costMetrics.infrastructureCosts,
            operationalCosts: this.costMetrics.operationalCosts,
            marketingCosts: this.costMetrics.marketingCosts,
            totalCosts: this.costMetrics.totalCosts
        };
    }

    async generateProfitabilityReport(startDate, endDate) {
        // Generate profitability report
        const revenueReport = await this.generateRevenueReport(startDate, endDate);
        const costReport = await this.generateCostReport(startDate, endDate);

        return {
            period: { startDate, endDate },
            revenue: revenueReport.totalRevenue,
            costs: costReport.totalCosts,
            grossProfit: revenueReport.totalRevenue - costReport.totalCosts,
            profitMargin: ((revenueReport.totalRevenue - costReport.totalCosts) / revenueReport.totalRevenue) * 100
        };
    }

    async generateCashFlowReport(startDate, endDate) {
        // Generate cash flow report
        return {
            period: { startDate, endDate },
            cashInflows: this.revenueMetrics.totalRevenue,
            cashOutflows: this.costMetrics.totalCosts,
            netCashFlow: this.revenueMetrics.totalRevenue - this.costMetrics.totalCosts
        };
    }

    // Get service status
    async getServiceStatus() {
        return {
            isInitialized: this.isInitialized,
            availableGateways: Array.from(this.paymentGateways.keys()),
            subscriptionPlans: Array.from(this.subscriptionPlans.keys()),
            revenueMetrics: this.revenueMetrics,
            costMetrics: this.costMetrics
        };
    }
}

module.exports = new EnterprisePaymentService();
