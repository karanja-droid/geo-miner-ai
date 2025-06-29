import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  ChartBarIcon, 
  CreditCardIcon, 
  CalendarIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

interface UsageSummary {
  usage_type: string;
  current_usage: number;
  limit: number;
  percentage_used: number;
  period_start: string;
  period_end: string;
}

interface BillingSummary {
  current_plan: {
    name: string;
    price_monthly: number;
    price_yearly: number;
  };
  subscription: {
    status: string;
    billing_cycle: string;
    start_date: string;
  };
  next_billing_date: string;
  total_usage: UsageSummary[];
  recent_bills: Array<{
    billing_id: string;
    amount: number;
    status: string;
    billing_date: string;
    due_date: string;
  }>;
}

const UsageDashboard: React.FC = () => {
  const [billingSummary, setBillingSummary] = useState<BillingSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBillingSummary();
  }, []);

  const fetchBillingSummary = async () => {
    try {
      const response = await fetch('/api/pricing/billing/summary');
      if (response.ok) {
        const data = await response.json();
        setBillingSummary(data);
      }
    } catch (error) {
      console.error('Error fetching billing summary:', error);
    } finally {
      setLoading(false);
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
      month: 'short',
      day: 'numeric',
    });
  };

  const getUsageColor = (percentage: number) => {
    if (percentage >= 90) return 'text-red-600';
    if (percentage >= 75) return 'text-yellow-600';
    return 'text-green-600';
  };

  const getUsageBarColor = (percentage: number) => {
    if (percentage >= 90) return 'bg-red-500';
    if (percentage >= 75) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!billingSummary) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">No billing information available.</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Billing & Usage Dashboard</h1>
        <p className="text-gray-600 mt-2">
          Monitor your usage and manage your subscription
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Current Plan Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg shadow-md p-6"
        >
          <div className="flex items-center mb-4">
            <CreditCardIcon className="h-6 w-6 text-blue-600 mr-2" />
            <h2 className="text-xl font-semibold text-gray-900">Current Plan</h2>
          </div>
          
          <div className="space-y-4">
            <div>
              <h3 className="text-2xl font-bold text-gray-900">
                {billingSummary.current_plan.name}
              </h3>
              <p className="text-gray-600">
                {billingSummary.subscription.billing_cycle === 'monthly' 
                  ? formatCurrency(billingSummary.current_plan.price_monthly) + '/month'
                  : formatCurrency(billingSummary.current_plan.price_yearly) + '/year'
                }
              </p>
            </div>

            <div className="flex items-center">
              <div className={`w-3 h-3 rounded-full mr-2 ${
                billingSummary.subscription.status === 'active' 
                  ? 'bg-green-500' 
                  : 'bg-yellow-500'
              }`} />
              <span className="text-sm font-medium capitalize">
                {billingSummary.subscription.status}
              </span>
            </div>

            <div className="flex items-center text-sm text-gray-600">
              <CalendarIcon className="h-4 w-4 mr-2" />
              <span>Next billing: {formatDate(billingSummary.next_billing_date)}</span>
            </div>
          </div>
        </motion.div>

        {/* Usage Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-2 bg-white rounded-lg shadow-md p-6"
        >
          <div className="flex items-center mb-6">
            <ChartBarIcon className="h-6 w-6 text-blue-600 mr-2" />
            <h2 className="text-xl font-semibold text-gray-900">Usage Overview</h2>
          </div>

          <div className="space-y-6">
            {billingSummary.total_usage.map((usage, index) => (
              <div key={usage.usage_type} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-700 capitalize">
                    {usage.usage_type.replace('_', ' ')}
                  </span>
                  <span className={`text-sm font-semibold ${getUsageColor(usage.percentage_used)}`}>
                    {usage.current_usage.toLocaleString()} / {usage.limit.toLocaleString()}
                  </span>
                </div>
                
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(usage.percentage_used, 100)}%` }}
                    transition={{ delay: index * 0.1, duration: 0.5 }}
                    className={`h-2 rounded-full ${getUsageBarColor(usage.percentage_used)}`}
                  />
                </div>
                
                <div className="flex justify-between items-center text-xs text-gray-500">
                  <span>{usage.percentage_used.toFixed(1)}% used</span>
                  <span>
                    {formatDate(usage.period_start)} - {formatDate(usage.period_end)}
                  </span>
                </div>

                {usage.percentage_used >= 90 && (
                  <div className="flex items-center text-red-600 text-sm">
                    <ExclamationTriangleIcon className="h-4 w-4 mr-1" />
                    <span>Approaching limit</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Recent Billing History */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mt-8 bg-white rounded-lg shadow-md p-6"
      >
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Recent Billing History</h2>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Due Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {billingSummary.recent_bills.map((bill) => (
                <tr key={bill.billing_id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatDate(bill.billing_date)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {formatCurrency(bill.amount)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(bill.due_date)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      bill.status === 'paid' 
                        ? 'bg-green-100 text-green-800'
                        : bill.status === 'pending'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {bill.status === 'paid' && <CheckCircleIcon className="h-3 w-3 mr-1" />}
                      {bill.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Action Buttons */}
      <div className="mt-8 flex flex-wrap gap-4">
        <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">
          View Full Billing History
        </button>
        <button className="bg-gray-100 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-200 transition-colors">
          Download Invoice
        </button>
        <button className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors">
          Upgrade Plan
        </button>
      </div>
    </div>
  );
};

export default UsageDashboard; 