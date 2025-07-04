import { BarChart3, PieChart, LineChart, Activity } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import Navbar from '../components/Navbar';

const Analytics = () => {
  const { user } = useAuth();

  // Get user display name from metadata or email
  const getUserDisplayName = () => {
    if (user?.user_metadata?.full_name) {
      return user.user_metadata.full_name;
    }
    return user?.email?.split('@')[0] || 'User';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Advanced Analytics</h1>
          <p className="text-lg text-gray-600">Detailed performance analysis and trading insights</p>
          {user && (
            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-800">
                Welcome back, <span className="font-semibold">{getUserDisplayName()}</span>! 
                You have access to exclusive trading analytics.
              </p>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6 border border-gray-100">
            <div className="flex items-center mb-4">
              <LineChart className="h-6 w-6 text-blue-600 mr-2" />
              <h3 className="text-lg font-semibold text-gray-900">Performance Trends</h3>
            </div>
            <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
              <p className="text-gray-500">Chart visualization coming soon</p>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 border border-gray-100">
            <div className="flex items-center mb-4">
              <PieChart className="h-6 w-6 text-green-600 mr-2" />
              <h3 className="text-lg font-semibold text-gray-900">Asset Distribution</h3>
            </div>
            <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
              <p className="text-gray-500">Chart visualization coming soon</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow-md p-6 border border-gray-100">
            <div className="flex items-center mb-4">
              <BarChart3 className="h-6 w-6 text-purple-600 mr-2" />
              <h3 className="text-lg font-semibold text-gray-900">Trade Volume</h3>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Daily Avg</span>
                <span className="font-semibold">$2.4M</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Weekly Avg</span>
                <span className="font-semibold">$16.8M</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Monthly Avg</span>
                <span className="font-semibold">$72.3M</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 border border-gray-100">
            <div className="flex items-center mb-4">
              <Activity className="h-6 w-6 text-red-600 mr-2" />
              <h3 className="text-lg font-semibold text-gray-900">Risk Metrics</h3>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Max Drawdown</span>
                <span className="font-semibold text-red-600">-12.4%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Sharpe Ratio</span>
                <span className="font-semibold">2.34</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Win Rate</span>
                <span className="font-semibold text-green-600">73.2%</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Performers</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-sm text-gray-600">Trader #2847</span>
                <span className="font-semibold text-green-600">+$45,230</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-sm text-gray-600">Trader #1593</span>
                <span className="font-semibold text-green-600">+$38,450</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-sm text-gray-600">Trader #3721</span>
                <span className="font-semibold text-green-600">+$31,870</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
