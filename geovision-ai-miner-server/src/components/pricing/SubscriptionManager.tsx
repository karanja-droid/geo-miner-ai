import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  CreditCardIcon, 
  CalendarIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';

interface Subscription {
  subscription_id: string;
  plan_id: string;
  status: string;
  billing_cycle: string;
  start_date: string;
  end_date?: string;
  auto_renew: boolean;
}

interface PricingPlan {
  plan_id: string;
  name: string;
  price_monthly: number;
  price_yearly: number;
  features: string[];
}

interface SubscriptionManagerProps {
  onSubscriptionChange?: () => void;
}

const SubscriptionManager: React.FC<SubscriptionManagerProps> = ({
  onSubscriptionChange
}) => {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [availablePlans, setAvailablePlans] = useState<PricingPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<PricingPlan | null>(null);

  useEffect(() => {
    fetchSubscriptionData();
  }, []);

  const fetchSubscriptionData = async () => {
    try {
      const [subscriptionRes, plansRes] = await Promise.all([
        fetch('/api/pricing/subscriptions/current'),
        fetch('/api/pricing/plans')
      ]);

      if (subscriptionRes.ok) {
        const subscriptionData = await subscriptionRes.json();
        setSubscription(subscriptionData);
      }

      if (plansRes.ok) {
        const plansData = await plansRes.json();
        setAvailablePlans(plansData);
      }
    } catch (error) {
      console.error('Error fetching subscription data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpgrade = async (plan: PricingPlan) => {
    try {
      const response = await fetch(`/api/pricing/subscriptions/${subscription?.subscription_id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          plan_id: plan.plan_id,
          billing_cycle: subscription?.billing_cycle || 'monthly'
        }),
      });

      if (response.ok) {
        await fetchSubscriptionData();
        setShowUpgradeModal(false);
        onSubscriptionChange?.();
      } else {
        throw new Error('Failed to upgrade subscription');
      }
    } catch (error) {
      console.error('Error upgrading subscription:', error);
    }
  };

  const handleCancel = async () => {
    if (!subscription) return;

    try {
      const response = await fetch(`/api/pricing/subscriptions/${subscription.subscription_id}/cancel`, {
        method: 'POST',
      });

      if (response.ok) {
        await fetchSubscriptionData();
        setShowCancelModal(false);
        onSubscriptionChange?.();
      } else {
        throw new Error('Failed to cancel subscription');
      }
    } catch (error) {
      console.error('Error canceling subscription:', error);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getCurrentPlan = () => {
    return availablePlans.find(plan => plan.plan_id === subscription?.plan_id);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!subscription) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 mb-4">No active subscription found.</p>
        <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">
          Subscribe to a Plan
        </button>
      </div>
    );
  }

  const currentPlan = getCurrentPlan();

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Subscription Management</h1>
        <p className="text-gray-600 mt-2">
          Manage your subscription settings and billing preferences
        </p>
      </div>

      {/* Current Subscription Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-lg shadow-md p-6 mb-8"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <CreditCardIcon className="h-8 w-8 text-blue-600 mr-3" />
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {currentPlan?.name || 'Unknown Plan'}
              </h2>
              <p className="text-gray-600">
                {subscription.billing_cycle === 'monthly' 
                  ? formatCurrency(currentPlan?.price_monthly || 0) + '/month'
                  : formatCurrency(currentPlan?.price_yearly || 0) + '/year'
                }
              </p>
            </div>
          </div>
          
          <div className="flex items-center">
            <div className={`w-3 h-3 rounded-full mr-2 ${
              subscription.status === 'active' 
                ? 'bg-green-500' 
                : subscription.status === 'cancelled'
                ? 'bg-red-500'
                : 'bg-yellow-500'
            }`} />
            <span className="text-sm font-medium capitalize">
              {subscription.status}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-2">Subscription Details</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Start Date:</span>
                <span className="text-gray-900">{formatDate(subscription.start_date)}</span>
              </div>
              {subscription.end_date && (
                <div className="flex justify-between">
                  <span className="text-gray-600">End Date:</span>
                  <span className="text-gray-900">{formatDate(subscription.end_date)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-600">Billing Cycle:</span>
                <span className="text-gray-900 capitalize">{subscription.billing_cycle}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Auto Renew:</span>
                <span className="text-gray-900">
                  {subscription.auto_renew ? (
                    <CheckCircleIcon className="h-4 w-4 text-green-500" />
                  ) : (
                    <XCircleIcon className="h-4 w-4 text-red-500" />
                  )}
                </span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-2">Plan Features</h3>
            <ul className="space-y-1 text-sm">
              {currentPlan?.features.map((feature, index) => (
                <li key={index} className="flex items-center text-gray-700">
                  <CheckCircleIcon className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                  {feature}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-4">
          <button
            onClick={() => setShowUpgradeModal(true)}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Change Plan
          </button>
          <button
            onClick={() => setShowCancelModal(true)}
            className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors"
          >
            Cancel Subscription
          </button>
          <button className="bg-gray-100 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-200 transition-colors">
            Download Invoice
          </button>
        </div>
      </motion.div>

      {/* Upgrade Modal */}
      {showUpgradeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg p-6 max-w-md w-full mx-4"
          >
            <h3 className="text-xl font-bold text-gray-900 mb-4">Change Plan</h3>
            <p className="text-gray-600 mb-6">
              Select a new plan for your subscription. Changes will take effect immediately.
            </p>
            
            <div className="space-y-3 mb-6">
              {availablePlans
                .filter(plan => plan.plan_id !== subscription.plan_id)
                .map(plan => (
                  <button
                    key={plan.plan_id}
                    onClick={() => setSelectedPlan(plan)}
                    className={`w-full p-4 border rounded-lg text-left transition-colors ${
                      selectedPlan?.plan_id === plan.plan_id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="font-medium text-gray-900">{plan.name}</div>
                    <div className="text-sm text-gray-600">
                      {subscription.billing_cycle === 'monthly' 
                        ? formatCurrency(plan.price_monthly) + '/month'
                        : formatCurrency(plan.price_yearly) + '/year'
                      }
                    </div>
                  </button>
                ))}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowUpgradeModal(false);
                  setSelectedPlan(null);
                }}
                className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => selectedPlan && handleUpgrade(selectedPlan)}
                disabled={!selectedPlan}
                className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Confirm Change
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Cancel Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg p-6 max-w-md w-full mx-4"
          >
            <div className="flex items-center mb-4">
              <ExclamationTriangleIcon className="h-6 w-6 text-red-500 mr-2" />
              <h3 className="text-xl font-bold text-gray-900">Cancel Subscription</h3>
            </div>
            
            <p className="text-gray-600 mb-6">
              Are you sure you want to cancel your subscription? You'll continue to have access until the end of your current billing period.
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setShowCancelModal(false)}
                className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Keep Subscription
              </button>
              <button
                onClick={handleCancel}
                className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
              >
                Cancel Subscription
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default SubscriptionManager; 