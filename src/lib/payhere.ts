import md5 from 'crypto-js/md5';

// Types
export interface PayHereConfig {
  merchantId: string;
  merchantSecret: string;
  environment: 'sandbox' | 'live';
}

export interface PayHerePayment {
  orderId: string;
  items: string;
  currency: 'LKR' | 'USD';
  amount: number;
  customer: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    country: string;
  };
  urls: {
    returnUrl: string;
    cancelUrl: string;
    notifyUrl: string;
  };
  custom1?: string;
  custom2?: string;
}

export interface PayHereNotification {
  merchant_id: string;
  order_id: string;
  payment_id: string;
  payhere_amount: string;
  payhere_currency: string;
  status_code: string;
  md5sig: string;
  custom_1?: string;
  custom_2?: string;
  method: string;
  status_message: string;
  card_holder_name?: string;
  card_no?: string;
  card_expiry?: string;
}

// PayHere Configuration
const PAYHERE_CONFIG: PayHereConfig = {
  merchantId: process.env.PAYHERE_MERCHANT_ID || '',
  merchantSecret: process.env.PAYHERE_MERCHANT_SECRET || '',
  environment: (process.env.NODE_ENV === 'production') ? 'live' : 'sandbox'
};

// Payment URLs
const PAYHERE_URLS = {
  sandbox: 'https://sandbox.payhere.lk/pay/checkout',
  live: 'https://www.payhere.lk/pay/checkout'
};

// Subscription plans for Bible Aura
export const SUBSCRIPTION_PLANS = {
  free: {
    id: 'free',
    name: 'Free',
    price: 0,
    currency: 'LKR',
    period: 'forever',
    features: [
      '5 AI chats per month',
      '2 AI analyses per month',
      '5 journal entries per month',
      'Basic Bible study tools'
    ]
  },
  pro: {
    id: 'pro',
    name: 'Pro',
    price: 1000,
    currency: 'LKR',
    period: 'month',
    features: [
      '100 AI chats per month',
      '20 AI analyses per month',
      '50 journal entries per month',
      'Advanced AI features',
      'Extended sermon library'
    ]
  },
  supporter: {
    id: 'supporter',
    name: 'Supporter',
    price: 2500,
    currency: 'LKR',
    period: 'month',
    features: [
      '200 AI chats per month',
      '50 AI analyses per month',
      '100 journal entries per month',
      'Full sermon library access',
      'Priority support'
    ]
  },
  partner: {
    id: 'partner',
    name: 'Partner',
    price: 4000,
    currency: 'LKR',
    period: 'month',
    features: [
      'Unlimited AI chats',
      'Unlimited AI analyses',
      'Unlimited journal entries',
      'Premium sermon access',
      'Ministry partnership benefits'
    ]
  }
};

// PayHere Service Class
export class PayHereService {
  // Generate hash for payment security
  static generateHash(
    merchantId: string,
    orderId: string,
    amount: number,
    currency: string,
    merchantSecret: string
  ): string {
    const hashedSecret = md5(merchantSecret).toString().toUpperCase();
    const amountFormatted = parseFloat(amount.toString()).toLocaleString('en-us', { 
      minimumFractionDigits: 2 
    }).replace(/,/g, '');
    
    const hashString = merchantId + orderId + amountFormatted + currency + hashedSecret;
    return md5(hashString).toString().toUpperCase();
  }

  // Verify payment notification
  static verifyNotification(
    notification: PayHereNotification,
    merchantSecret: string
  ): boolean {
    const localMd5sig = this.generateNotificationHash(
      notification.merchant_id,
      notification.order_id,
      notification.payhere_amount,
      notification.payhere_currency,
      notification.status_code,
      merchantSecret
    );
    
    return localMd5sig === notification.md5sig && notification.status_code === '2';
  }

  // Generate hash for notification verification
  static generateNotificationHash(
    merchantId: string,
    orderId: string,
    payhereAmount: string,
    payhereCurrency: string,
    statusCode: string,
    merchantSecret: string
  ): string {
    const hashedSecret = md5(merchantSecret).toString().toUpperCase();
    const hashString = merchantId + orderId + payhereAmount + payhereCurrency + statusCode + hashedSecret;
    return md5(hashString).toString().toUpperCase();
  }

  // Create payment form data
  static createPaymentForm(payment: PayHerePayment): Record<string, string> {
    const hash = this.generateHash(
      PAYHERE_CONFIG.merchantId,
      payment.orderId,
      payment.amount,
      payment.currency,
      PAYHERE_CONFIG.merchantSecret
    );

    return {
      merchant_id: PAYHERE_CONFIG.merchantId,
      return_url: payment.urls.returnUrl,
      cancel_url: payment.urls.cancelUrl,
      notify_url: payment.urls.notifyUrl,
      order_id: payment.orderId,
      items: payment.items,
      currency: payment.currency,
      amount: payment.amount.toString(),
      first_name: payment.customer.firstName,
      last_name: payment.customer.lastName,
      email: payment.customer.email,
      phone: payment.customer.phone,
      address: payment.customer.address,
      city: payment.customer.city,
      country: payment.customer.country,
      hash: hash,
      ...(payment.custom1 && { custom_1: payment.custom1 }),
      ...(payment.custom2 && { custom_2: payment.custom2 })
    };
  }

  // Get PayHere checkout URL
  static getCheckoutUrl(): string {
    return PAYHERE_URLS[PAYHERE_CONFIG.environment];
  }

  // Create subscription payment
  static createSubscriptionPayment(
    planId: string,
    userId: string,
    customer: PayHerePayment['customer']
  ): PayHerePayment {
    const plan = SUBSCRIPTION_PLANS[planId as keyof typeof SUBSCRIPTION_PLANS];
    
    if (!plan) {
      throw new Error('Invalid subscription plan');
    }

    const baseUrl = window.location.origin;
    const orderId = `SUBSCRIPTION_${planId.toUpperCase()}_${userId}_${Date.now()}`;

    return {
      orderId,
      items: `✦Bible Aura ${plan.name} Subscription`,
      currency: 'LKR',
      amount: plan.price,
      customer,
      urls: {
        returnUrl: `${baseUrl}/subscription/success`,
        cancelUrl: `${baseUrl}/subscription/cancelled`,
        notifyUrl: `${baseUrl}/api/payhere/notify`
      },
      custom1: userId,
      custom2: planId
    };
  }

  // Submit payment form programmatically
  static submitPayment(payment: PayHerePayment): void {
    const formData = this.createPaymentForm(payment);
    const checkoutUrl = this.getCheckoutUrl();

    // Create and submit form
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = checkoutUrl;
    form.style.display = 'none';

    Object.entries(formData).forEach(([key, value]) => {
      const input = document.createElement('input');
      input.type = 'hidden';
      input.name = key;
      input.value = value;
      form.appendChild(input);
    });

    document.body.appendChild(form);
    form.submit();
  }
}

// Payment status codes
export const PAYMENT_STATUS = {
  SUCCESS: '2',
  PENDING: '0',
  CANCELLED: '-1',
  FAILED: '-2',
  CHARGEBACK: '-3'
} as const;

// Utility functions
export const formatPrice = (amount: number, currency: string = 'LKR') => {
  if (amount === 0) return 'Free';
  
  return new Intl.NumberFormat('en-LK', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
  }).format(amount);
};

export const getPlanDisplayName = (planId: string) => {
  return SUBSCRIPTION_PLANS[planId as keyof typeof SUBSCRIPTION_PLANS]?.name || 'Unknown Plan';
};

export const isPaidPlan = (planId: string) => {
  return planId !== 'free' && SUBSCRIPTION_PLANS[planId as keyof typeof SUBSCRIPTION_PLANS]?.price > 0;
};

export default PayHereService; 