import { BarChart3, PieChart, LineChart, Activity, Plus } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import ApiCredentialsModal from '../components/ApiCredentialsModal';
import MarketOverview from '../components/MarketOverview';
import { useState } from 'react';
import { Button } from '@/components/ui/button';

const Analytics = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);

  
  const getUserDisplayName = () => {
    if (user?.user_metadata?.full_name) {
      return user.user_metadata.full_name;
    }
    return user?.email?.split('@')[0] || 'User';
  };

  const handleAddInputClick = () => {
    if (!user) {
      
      navigate('/login', { state: { from: { pathname: '/analytics' } } });
      return;
    }
    
    
    setIsModalOpen(true);
  };

  const handleModalSuccess = () => {
    console.log('API credentials saved successfully');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
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
        </div>

        {/* API Credentials Section */}
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-100 mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                API Credentials
              </h2>
              <p className="text-sm text-gray-600">
                Add your exchange API credentials to fetch live data
              </p>
            </div>
            <Button onClick={() => setIsModalOpen(true)}>
              + Add Input
            </Button>
          </div>
          
          {profile?.api_key && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="space-y-2">
                <p className="text-green-800 text-sm font-medium">
                  ✓ API credentials configured
                </p>
                <div className="text-sm text-gray-600 space-y-1">
                  <div className="flex justify-between">
                    <span>API Key:</span>
                    <span className="font-mono">{profile.api_key.substring(0, 5)}••••••••••••••••</span>
                  </div>
                  <div className="flex justify-between">
                    <span>API Secret:</span>
                    <span className="font-mono">{profile.api_secret?.substring(0, 5)}••••••••••••••••</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Market Overview */}
        <MarketOverview />

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

        {/* Trading Statistics */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Trading Statistics</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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

            <div className="bg-white rounded-lg shadow-md p-6 border border-gray-100">
              <div className="flex items-center mb-4">
                <LineChart className="h-6 w-6 text-blue-600 mr-2" />
                <h3 className="text-lg font-semibold text-gray-900">Performance</h3>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Total P&L</span>
                  <span className="font-semibold text-green-600">+$124,580</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">ROI</span>
                  <span className="font-semibold text-green-600">+18.7%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Total Trades</span>
                  <span className="font-semibold">1,247</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* API Credentials Modal */}
        <ApiCredentialsModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSuccess={handleModalSuccess}
        />
      </div>
    </div>
  );
};

export default Analytics;
