import { apiClient } from './apiClient';

// Types
export interface PricingPlan {
  plan_id: string;
  name: string;
  description?: string;
  price_monthly: number;
  price_yearly: number;
  features: string[];
  limits: Record<string, any>;
  is_active: boolean;
  created_at: string;
}

export interface Subscription {
  subscription_id: string;
  user_id: string;
  plan_id: string;
  status: string;
  billing_cycle: 'monthly' | 'yearly';
  start_date: string;
  end_date?: string;
  auto_renew: boolean;
  stripe_subscription_id?: string;
  created_at: string;
  updated_at: string;
}

export interface Usage {
  usage_id: string;
  user_id: string;
  subscription_id?: string;
  usage_type: string;
  amount: number;
  limit: number;
  period_start: string;
  period_end: string;
  created_at: string;
}

export interface UsageSummary {
  usage_type: string;
  current_usage: number;
  limit: number;
  percentage_used: number;
  period_start: string;
  period_end: string;
}

export interface Billing {
  billing_id: string;
  subscription_id: string;
  amount: number;
  currency: string;
  status: string;
  billing_date: string;
  due_date: string;
  paid_date?: string;
  stripe_invoice_id?: string;
  description?: string;
  created_at: string;
}

export interface Payment {
  payment_id: string;
  billing_id: string;
  amount: number;
  currency: string;
  payment_method: string;
  status: string;
  stripe_payment_id?: string;
  transaction_date: string;
  created_at: string;
}

export interface BillingSummary {
  current_plan: PricingPlan;
  subscription: Subscription;
  next_billing_date: string;
  total_usage: UsageSummary[];
  recent_bills: Billing[];
}

export interface SubscriptionStatus {
  is_active: boolean;
  plan_name: string;
  billing_cycle: string;
  next_billing_date?: string;
  usage_warnings: string[];
}

// Pricing Plans API
export const pricingPlansAPI = {
  // Get all pricing plans
  getPlans: async (params?: {
    skip?: number;
    limit?: number;
    active_only?: boolean;
  }): Promise<PricingPlan[]> => {
    const searchParams = new URLSearchParams();
    if (params?.skip) searchParams.append('skip', params.skip.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    if (params?.active_only !== undefined) searchParams.append('active_only', params.active_only.toString());
    
    const response = await apiClient.get(`/pricing/plans?${searchParams.toString()}`);
    return response.data;
  },

  // Get a specific pricing plan
  getPlan: async (planId: string): Promise<PricingPlan> => {
    const response = await apiClient.get(`/pricing/plans/${planId}`);
    return response.data;
  },

  // Create a new pricing plan (admin only)
  createPlan: async (plan: {
    name: string;
    description?: string;
    price_monthly: number;
    price_yearly: number;
    features: string[];
    limits: Record<string, any>;
  }): Promise<PricingPlan> => {
    const response = await apiClient.post('/pricing/plans', plan);
    return response.data;
  },

  // Update a pricing plan (admin only)
  updatePlan: async (planId: string, updates: Partial<{
    name: string;
    description: string;
    price_monthly: number;
    price_yearly: number;
    features: string[];
    limits: Record<string, any>;
    is_active: boolean;
  }>): Promise<PricingPlan> => {
    const response = await apiClient.put(`/pricing/plans/${planId}`, updates);
    return response.data;
  },

  // Delete a pricing plan (admin only)
  deletePlan: async (planId: string): Promise<boolean> => {
    const response = await apiClient.delete(`/pricing/plans/${planId}`);
    return response.status === 200;
  },
};

// Subscriptions API
export const subscriptionsAPI = {
  // Create a new subscription
  createSubscription: async (subscription: {
    plan_id: string;
    billing_cycle: 'monthly' | 'yearly';
    auto_renew?: boolean;
  }): Promise<Subscription> => {
    const response = await apiClient.post('/pricing/subscriptions', subscription);
    return response.data;
  },

  // Get current user's subscription
  getCurrentSubscription: async (): Promise<Subscription> => {
    const response = await apiClient.get('/pricing/subscriptions/current');
    return response.data;
  },

  // Update subscription
  updateSubscription: async (subscriptionId: string, updates: Partial<{
    billing_cycle: 'monthly' | 'yearly';
    auto_renew: boolean;
    status: string;
  }>): Promise<Subscription> => {
    const response = await apiClient.put(`/pricing/subscriptions/${subscriptionId}`, updates);
    return response.data;
  },

  // Cancel subscription
  cancelSubscription: async (subscriptionId: string): Promise<Subscription> => {
    const response = await apiClient.post(`/pricing/subscriptions/${subscriptionId}/cancel`);
    return response.data;
  },

  // Get all subscriptions (admin only)
  getAllSubscriptions: async (params?: {
    skip?: number;
    limit?: number;
  }): Promise<Subscription[]> => {
    const searchParams = new URLSearchParams();
    if (params?.skip) searchParams.append('skip', params.skip.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    
    const response = await apiClient.get(`/pricing/admin/subscriptions?${searchParams.toString()}`);
    return response.data;
  },
};

// Usage API
export const usageAPI = {
  // Create usage record
  createUsage: async (usage: {
    usage_type: string;
    amount: number;
    limit: number;
    period_start: string;
    period_end: string;
    subscription_id?: string;
  }): Promise<Usage> => {
    const response = await apiClient.post('/pricing/usage', usage);
    return response.data;
  },

  // Get user usage records
  getUserUsage: async (params?: {
    usage_type?: string;
    period_start?: string;
    period_end?: string;
  }): Promise<Usage[]> => {
    const searchParams = new URLSearchParams();
    if (params?.usage_type) searchParams.append('usage_type', params.usage_type);
    if (params?.period_start) searchParams.append('period_start', params.period_start);
    if (params?.period_end) searchParams.append('period_end', params.period_end);
    
    const response = await apiClient.get(`/pricing/usage?${searchParams.toString()}`);
    return response.data;
  },

  // Get usage summary
  getUsageSummary: async (): Promise<UsageSummary[]> => {
    const response = await apiClient.get('/pricing/usage/summary');
    return response.data;
  },

  // Check usage limits
  checkUsageLimits: async (usageType: string, amount: number): Promise<{
    allowed: boolean;
    current_usage: number;
    limit: number;
    new_total: number;
    percentage_used: number;
  }> => {
    const response = await apiClient.get(`/pricing/usage/check?usage_type=${usageType}&amount=${amount}`);
    return response.data;
  },

  // Get all usage records (admin only)
  getAllUsage: async (params?: {
    skip?: number;
    limit?: number;
  }): Promise<Usage[]> => {
    const searchParams = new URLSearchParams();
    if (params?.skip) searchParams.append('skip', params.skip.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    
    const response = await apiClient.get(`/pricing/admin/usage?${searchParams.toString()}`);
    return response.data;
  },
};

// Billing API
export const billingAPI = {
  // Get billing history
  getBillingHistory: async (params?: {
    skip?: number;
    limit?: number;
  }): Promise<Billing[]> => {
    const searchParams = new URLSearchParams();
    if (params?.skip) searchParams.append('skip', params.skip.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    
    const response = await apiClient.get(`/pricing/billing?${searchParams.toString()}`);
    return response.data;
  },

  // Get specific billing record
  getBilling: async (billingId: string): Promise<Billing> => {
    const response = await apiClient.get(`/pricing/billing/${billingId}`);
    return response.data;
  },

  // Get billing summary
  getBillingSummary: async (): Promise<BillingSummary> => {
    const response = await apiClient.get('/pricing/billing/summary');
    return response.data;
  },

  // Create billing record
  createBilling: async (billing: {
    amount: number;
    currency: string;
    billing_date: string;
    due_date: string;
    description?: string;
  }, subscriptionId: string): Promise<Billing> => {
    const response = await apiClient.post(`/pricing/billing?subscription_id=${subscriptionId}`, billing);
    return response.data;
  },

  // Update billing status
  updateBillingStatus: async (billingId: string, status: string, stripeInvoiceId?: string): Promise<Billing> => {
    const response = await apiClient.put(`/pricing/billing/${billingId}`, {
      status,
      stripe_invoice_id: stripeInvoiceId,
    });
    return response.data;
  },
};

// Payments API
export const paymentsAPI = {
  // Create payment record
  createPayment: async (payment: {
    amount: number;
    currency: string;
    payment_method: string;
    transaction_date: string;
  }, billingId: string): Promise<Payment> => {
    const response = await apiClient.post(`/pricing/payments?billing_id=${billingId}`, payment);
    return response.data;
  },

  // Get payment record
  getPayment: async (paymentId: string): Promise<Payment> => {
    const response = await apiClient.get(`/pricing/payments/${paymentId}`);
    return response.data;
  },

  // Update payment status
  updatePaymentStatus: async (paymentId: string, status: string, stripePaymentId?: string): Promise<Payment> => {
    const response = await apiClient.put(`/pricing/payments/${paymentId}`, {
      status,
      stripe_payment_id: stripePaymentId,
    });
    return response.data;
  },
};

// Stripe Webhooks API
export const stripeWebhooksAPI = {
  // Handle Stripe webhook
  handleWebhook: async (webhookData: any): Promise<{ status: string }> => {
    const response = await apiClient.post('/pricing/webhooks/stripe', webhookData);
    return response.data;
  },
};

// Utility functions
export const pricingUtils = {
  // Format currency
  formatCurrency: (amount: number, currency = 'USD'): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
    }).format(amount);
  },

  // Calculate savings percentage
  calculateSavings: (monthlyPrice: number, yearlyPrice: number): number => {
    const monthlyTotal = monthlyPrice * 12;
    return Math.round(((monthlyTotal - yearlyPrice) / monthlyTotal) * 100);
  },

  // Get price based on billing cycle
  getPrice: (plan: PricingPlan, billingCycle: 'monthly' | 'yearly'): number => {
    return billingCycle === 'monthly' ? plan.price_monthly : plan.price_yearly;
  },

  // Check if usage is near limit
  isUsageNearLimit: (percentage: number, threshold = 90): boolean => {
    return percentage >= threshold;
  },

  // Get usage color based on percentage
  getUsageColor: (percentage: number): string => {
    if (percentage >= 90) return 'text-red-600';
    if (percentage >= 75) return 'text-yellow-600';
    return 'text-green-600';
  },

  // Format usage type for display
  formatUsageType: (usageType: string): string => {
    return usageType.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  },
};

// Export all APIs as a single object for convenience
export const pricingService = {
  plans: pricingPlansAPI,
  subscriptions: subscriptionsAPI,
  usage: usageAPI,
  billing: billingAPI,
  payments: paymentsAPI,
  webhooks: stripeWebhooksAPI,
  utils: pricingUtils,
}; 