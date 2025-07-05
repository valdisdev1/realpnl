import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import PnlAnalytics from '../components/PnlAnalytics';
import RecentTrades from '../components/RecentTrades';

const Analytics = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

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

        {/* PNL Analytics */}
        <PnlAnalytics />

        {/* Recent Trades */}
        <RecentTrades />
      </div>
    </div>
  );
};

export default Analytics;
