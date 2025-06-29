import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CheckIcon, XIcon } from '@heroicons/react/24/outline';

interface PricingPlan {
  plan_id: string;
  name: string;
  description?: string;
  price_monthly: number;
  price_yearly: number;
  features: string[];
  limits: Record<string, any>;
  is_active: boolean;
}

interface PricingPlansProps {
  onSelectPlan?: (plan: PricingPlan) => void;
  currentPlan?: string;
  billingCycle?: 'monthly' | 'yearly';
}

const PricingPlans: React.FC<PricingPlansProps> = ({
  onSelectPlan,
  currentPlan,
  billingCycle = 'monthly'
}) => {
  const [plans, setPlans] = useState<PricingPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCycle, setSelectedCycle] = useState<'monthly' | 'yearly'>(billingCycle);

  useEffect(() => {
    fetchPricingPlans();
  }, []);

  const fetchPricingPlans = async () => {
    try {
      const response = await fetch('/api/pricing/plans');
      const data = await response.json();
      setPlans(data);
    } catch (error) {
      console.error('Error fetching pricing plans:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async (plan: PricingPlan) => {
    try {
      const response = await fetch('/api/pricing/subscriptions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          plan_id: plan.plan_id,
          billing_cycle: selectedCycle,
          auto_renew: true
        }),
      });

      if (response.ok) {
        onSelectPlan?.(plan);
        // Redirect to payment or show success message
      } else {
        throw new Error('Failed to create subscription');
      }
    } catch (error) {
      console.error('Error creating subscription:', error);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  const getPrice = (plan: PricingPlan) => {
    return selectedCycle === 'monthly' ? plan.price_monthly : plan.price_yearly;
  };

  const getSavings = (plan: PricingPlan) => {
    const monthlyTotal = plan.price_monthly * 12;
    const yearlyPrice = plan.price_yearly;
    return Math.round(((monthlyTotal - yearlyPrice) / monthlyTotal) * 100);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="text-center mb-12">
        <h2 className="text-4xl font-bold text-gray-900 mb-4">
          Choose Your Plan
        </h2>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Select the perfect plan for your geological exploration needs. 
          Scale up or down as your requirements change.
        </p>
      </div>

      {/* Billing Cycle Toggle */}
      <div className="flex justify-center mb-8">
        <div className="bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setSelectedCycle('monthly')}
            className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${
              selectedCycle === 'monthly'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setSelectedCycle('yearly')}
            className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${
              selectedCycle === 'yearly'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Yearly
            {selectedCycle === 'yearly' && (
              <span className="ml-2 bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                Save up to 20%
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {plans.map((plan, index) => (
          <motion.div
            key={plan.plan_id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`relative bg-white rounded-2xl shadow-lg border-2 p-8 ${
              currentPlan === plan.plan_id
                ? 'border-blue-500 ring-2 ring-blue-500/20'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            {currentPlan === plan.plan_id && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <span className="bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                  Current Plan
                </span>
              </div>
            )}

            {/* Plan Header */}
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                {plan.name}
              </h3>
              {plan.description && (
                <p className="text-gray-600 mb-6">{plan.description}</p>
              )}
              
              {/* Price */}
              <div className="mb-4">
                <span className="text-4xl font-bold text-gray-900">
                  {formatPrice(getPrice(plan))}
                </span>
                <span className="text-gray-600 ml-2">
                  /{selectedCycle === 'monthly' ? 'month' : 'year'}
                </span>
              </div>

              {selectedCycle === 'yearly' && (
                <div className="text-green-600 text-sm font-medium mb-4">
                  Save {getSavings(plan)}% with yearly billing
                </div>
              )}
            </div>

            {/* Features */}
            <div className="space-y-4 mb-8">
              {plan.features.map((feature, featureIndex) => (
                <div key={featureIndex} className="flex items-start">
                  <CheckIcon className="h-5 w-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
                  <span className="text-gray-700">{feature}</span>
                </div>
              ))}
            </div>

            {/* Limits */}
            {plan.limits && Object.keys(plan.limits).length > 0 && (
              <div className="mb-8">
                <h4 className="text-sm font-medium text-gray-900 mb-3">Usage Limits</h4>
                <div className="space-y-2">
                  {Object.entries(plan.limits).map(([key, value]) => (
                    <div key={key} className="flex justify-between text-sm">
                      <span className="text-gray-600 capitalize">
                        {key.replace('_', ' ')}:
                      </span>
                      <span className="text-gray-900 font-medium">
                        {typeof value === 'number' && value > 1000
                          ? `${(value / 1000).toFixed(1)}K`
                          : value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Action Button */}
            <button
              onClick={() => handleSubscribe(plan)}
              disabled={currentPlan === plan.plan_id}
              className={`w-full py-3 px-6 rounded-lg font-medium transition-colors ${
                currentPlan === plan.plan_id
                  ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
              }`}
            >
              {currentPlan === plan.plan_id ? 'Current Plan' : 'Subscribe Now'}
            </button>
          </motion.div>
        ))}
      </div>

      {/* Additional Info */}
      <div className="mt-12 text-center">
        <p className="text-gray-600 mb-4">
          All plans include 24/7 support and 99.9% uptime guarantee
        </p>
        <p className="text-sm text-gray-500">
          Need a custom plan?{' '}
          <a href="/contact" className="text-blue-600 hover:text-blue-700 font-medium">
            Contact our sales team
          </a>
        </p>
      </div>
    </div>
  );
};

export default PricingPlans; 