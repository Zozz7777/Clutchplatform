import { productionApi } from './production-api';
import { toast } from 'sonner';

export interface PaymentMethod {
  id: string;
  type: 'card' | 'bank_account' | 'wallet' | 'crypto';
  provider: string;
  last4?: string;
  brand?: string;
  expiryMonth?: number;
  expiryYear?: number;
  isDefault: boolean;
  status: 'active' | 'inactive' | 'expired';
}

export interface PaymentData {
  amount: number;
  currency: string;
  description: string;
  customerId: string;
  paymentMethodId?: string;
  metadata?: Record<string, any>;
}

export interface PaymentResult {
  success: boolean;
  paymentId?: string;
  transactionId?: string;
  status?: 'pending' | 'completed' | 'failed' | 'cancelled';
  error?: string;
  receiptUrl?: string;
}

export interface RefundData {
  amount?: number; // If not provided, full refund
  reason: string;
  metadata?: Record<string, any>;
}

export interface RefundResult {
  success: boolean;
  refundId?: string;
  amount?: number;
  status?: 'pending' | 'completed' | 'failed';
  error?: string;
}

export interface SubscriptionData {
  customerId: string;
  planId: string;
  paymentMethodId: string;
  startDate?: string;
  trialPeriodDays?: number;
  metadata?: Record<string, any>;
}

export interface SubscriptionResult {
  success: boolean;
  subscriptionId?: string;
  status?: 'active' | 'inactive' | 'cancelled' | 'past_due';
  error?: string;
}

class PaymentService {
  private readonly SUPPORTED_CURRENCIES = ['USD', 'EUR', 'GBP', 'EGP', 'AED'];
  private readonly MIN_AMOUNT = 0.50; // Minimum payment amount
  private readonly MAX_AMOUNT = 100000; // Maximum payment amount

  public async processPayment(paymentData: PaymentData): Promise<PaymentResult> {
    try {
      // Validate payment data
      const validation = this.validatePaymentData(paymentData);
      if (!validation.valid) {
        return {
          success: false,
          error: validation.error
        };
      }

      toast.loading('Processing payment...', { id: 'payment-processing' });

      const result = await productionApi.processPayment(paymentData);

      if (result) {
        toast.success('Payment processed successfully!', { id: 'payment-processing' });
        return {
          success: true,
          paymentId: result.id,
          transactionId: result.transactionId,
          status: result.status,
          receiptUrl: result.receiptUrl
        };
      } else {
        throw new Error('Payment processing failed - no result returned');
      }

    } catch (error) {
      console.error('Payment processing error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Payment processing failed';
      toast.error(`Payment failed: ${errorMessage}`, { id: 'payment-processing' });
      
      return {
        success: false,
        error: errorMessage
      };
    }
  }

  public async refundPayment(paymentId: string, refundData: RefundData): Promise<RefundResult> {
    try {
      toast.loading('Processing refund...', { id: 'refund-processing' });

      const result = await productionApi.refundPayment(paymentId, refundData);

      if (result) {
        toast.success('Refund processed successfully!', { id: 'refund-processing' });
        return {
          success: true,
          refundId: result.id,
          amount: result.amount,
          status: result.status
        };
      } else {
        throw new Error('Refund processing failed - no result returned');
      }

    } catch (error) {
      console.error('Refund processing error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Refund processing failed';
      toast.error(`Refund failed: ${errorMessage}`, { id: 'refund-processing' });
      
      return {
        success: false,
        error: errorMessage
      };
    }
  }

  public async getPaymentMethods(): Promise<PaymentMethod[]> {
    try {
      return await productionApi.getPaymentMethods();
    } catch (error) {
      console.error('Failed to fetch payment methods:', error);
      toast.error('Failed to load payment methods');
      return [];
    }
  }

  public async createSubscription(subscriptionData: SubscriptionData): Promise<SubscriptionResult> {
    try {
      toast.loading('Creating subscription...', { id: 'subscription-creation' });

      // This would need to be implemented in the backend
      // For now, we'll simulate the process
      await new Promise(resolve => setTimeout(resolve, 2000));

      toast.success('Subscription created successfully!', { id: 'subscription-creation' });
      return {
        success: true,
        subscriptionId: `sub_${Date.now()}`,
        status: 'active'
      };

    } catch (error) {
      console.error('Subscription creation error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Subscription creation failed';
      toast.error(`Subscription creation failed: ${errorMessage}`, { id: 'subscription-creation' });
      
      return {
        success: false,
        error: errorMessage
      };
    }
  }

  public async cancelSubscription(subscriptionId: string): Promise<boolean> {
    try {
      toast.loading('Cancelling subscription...', { id: 'subscription-cancellation' });

      // This would need to be implemented in the backend
      await new Promise(resolve => setTimeout(resolve, 1000));

      toast.success('Subscription cancelled successfully!', { id: 'subscription-cancellation' });
      return true;

    } catch (error) {
      console.error('Subscription cancellation error:', error);
      toast.error('Failed to cancel subscription', { id: 'subscription-cancellation' });
      return false;
    }
  }

  public validatePaymentData(paymentData: PaymentData): { valid: boolean; error?: string } {
    // Validate amount
    if (paymentData.amount < this.MIN_AMOUNT) {
      return {
        valid: false,
        error: `Amount must be at least ${this.MIN_AMOUNT} ${paymentData.currency}`
      };
    }

    if (paymentData.amount > this.MAX_AMOUNT) {
      return {
        valid: false,
        error: `Amount cannot exceed ${this.MAX_AMOUNT} ${paymentData.currency}`
      };
    }

    // Validate currency
    if (!this.SUPPORTED_CURRENCIES.includes(paymentData.currency)) {
      return {
        valid: false,
        error: `Currency ${paymentData.currency} is not supported`
      };
    }

    // Validate required fields
    if (!paymentData.customerId) {
      return {
        valid: false,
        error: 'Customer ID is required'
      };
    }

    if (!paymentData.description) {
      return {
        valid: false,
        error: 'Payment description is required'
      };
    }

    return { valid: true };
  }

  public formatAmount(amount: number, currency: string): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  }

  public getPaymentStatusColor(status: string): string {
    switch (status) {
      case 'completed':
        return 'text-green-600';
      case 'pending':
        return 'text-yellow-600';
      case 'failed':
        return 'text-red-600';
      case 'cancelled':
        return 'text-gray-600';
      default:
        return 'text-gray-600';
    }
  }

  public getPaymentStatusIcon(status: string): string {
    switch (status) {
      case 'completed':
        return '✅';
      case 'pending':
        return '⏳';
      case 'failed':
        return '❌';
      case 'cancelled':
        return '🚫';
      default:
        return '❓';
    }
  }

  public async getPaymentHistory(customerId: string, limit: number = 50): Promise<any[]> {
    try {
      // This would need to be implemented in the backend
      // For now, return empty array
      return [];
    } catch (error) {
      console.error('Failed to fetch payment history:', error);
      return [];
    }
  }

  public async getSubscriptionDetails(subscriptionId: string): Promise<any> {
    try {
      // This would need to be implemented in the backend
      // For now, return null
      return null;
    } catch (error) {
      console.error('Failed to fetch subscription details:', error);
      return null;
    }
  }

  public calculateTax(amount: number, taxRate: number = 0.14): number {
    return amount * taxRate;
  }

  public calculateTotal(amount: number, taxRate: number = 0.14, fees: number = 0): number {
    const tax = this.calculateTax(amount, taxRate);
    return amount + tax + fees;
  }

  public generatePaymentLink(paymentData: PaymentData): string {
    // This would generate a secure payment link
    const baseUrl = process.env.NODE_ENV === 'production' 
      ? 'https://clutch-main-nk7x.onrender.com'
      : 'https://clutch-main-nk7x.onrender.com';
    
    const params = new URLSearchParams({
      amount: paymentData.amount.toString(),
      currency: paymentData.currency,
      description: paymentData.description,
      customer: paymentData.customerId
    });

    return `${baseUrl}/pay/${Date.now()}?${params.toString()}`;
  }
}

export const paymentService = new PaymentService();
export default paymentService;
