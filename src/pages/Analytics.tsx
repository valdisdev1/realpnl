import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import ApiCredentialsModal from '../components/ApiCredentialsModal';
import PnlAnalytics from '../components/PnlAnalytics';
import RecentTrades from '../components/RecentTrades';
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

        {/* PNL Analytics */}
        <PnlAnalytics />

        {/* Recent Trades */}
        <RecentTrades />

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
