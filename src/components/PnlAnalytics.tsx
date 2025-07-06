import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { TrendingUp, Award, BarChart3, Key, AlertCircle } from 'lucide-react';
import { hasActiveApiCredentials } from '../lib/utils';

interface PnlData {
  lifetime_pnl: number;
  highest_pnl: number;
  most_traded_pair: string;
  pair_trade_count: number;
}

const PnlAnalytics = () => {
  const { profile } = useAuth();
  const [pnlData, setPnlData] = useState<PnlData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPnlData = async () => {
      if (!profile?.id) {
        setLoading(false);
        return;
      }

      // Check if user has active API credentials
      if (!hasActiveApiCredentials(profile)) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Fetch all PNL data for the user
        const { data: pnlRecords, error: pnlError } = await supabase
          .from('bybit_pnl')
          .select('symbol, closed_pnl')
          .eq('api_id', profile.id);

        if (pnlError) {
          console.error('Error fetching PNL data:', pnlError);
          setError('Failed to fetch PNL data');
          setLoading(false);
          return;
        }

        if (!pnlRecords || pnlRecords.length === 0) {
          setPnlData({
            lifetime_pnl: 0,
            highest_pnl: 0,
            most_traded_pair: 'No trades yet',
            pair_trade_count: 0
          });
          setLoading(false);
          return;
        }

        // Calculate lifetime PNL
        const lifetimePnl = pnlRecords.reduce((sum, record) => sum + (record.closed_pnl || 0), 0);

        // Find highest PNL
        const highestPnl = Math.max(...pnlRecords.map(record => record.closed_pnl || 0));

        // Find most traded pair
        const pairCounts: { [key: string]: number } = {};
        pnlRecords.forEach(record => {
          if (record.symbol) {
            pairCounts[record.symbol] = (pairCounts[record.symbol] || 0) + 1;
          }
        });

        const mostTradedPair = Object.keys(pairCounts).length > 0 
          ? Object.keys(pairCounts).reduce((a, b) => pairCounts[a] > pairCounts[b] ? a : b)
          : 'No trades yet';
        
        const pairTradeCount = pairCounts[mostTradedPair] || 0;

        setPnlData({
          lifetime_pnl: lifetimePnl,
          highest_pnl: highestPnl,
          most_traded_pair: mostTradedPair,
          pair_trade_count: pairTradeCount
        });

      } catch (err) {
        console.error('Error in fetchPnlData:', err);
        setError('An unexpected error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchPnlData();
  }, [profile?.id]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  // Show API credentials required message
  if (profile && !hasActiveApiCredentials(profile)) {
    return (
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">PNL Analytics</h2>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <div className="flex items-start">
            <AlertCircle className="h-6 w-6 text-yellow-600 mr-3 mt-0.5" />
            <div>
              <h3 className="text-lg font-semibold text-yellow-800 mb-2">
                API Credentials Required
              </h3>
              <p className="text-yellow-700 mb-4">
                To view your PNL analytics, you need to configure your exchange API credentials first.
              </p>
              <div className="flex items-center space-x-2">
                <Key className="h-4 w-4 text-yellow-600" />
                <span className="text-sm text-yellow-700">
                  Go to Settings → API Credentials to add your API key
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-lg shadow-md p-6 border border-gray-100">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
              <div className="h-8 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8">
        <p className="text-red-800">{error}</p>
      </div>
    );
  }

  return (
    <div className="mb-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">PNL Analytics</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Lifetime PNL */}
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-100">
          <div className="flex items-center mb-4">
            <TrendingUp className="h-6 w-6 text-green-600 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900">Lifetime PNL</h3>
          </div>
          <div className="text-3xl font-bold text-green-600">
            {formatCurrency(pnlData?.lifetime_pnl || 0)}
          </div>
          <p className="text-sm text-gray-600 mt-2">
            Total profit/loss from all closed trades
          </p>
        </div>

        {/* Highest PNL */}
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-100">
          <div className="flex items-center mb-4">
            <Award className="h-6 w-6 text-blue-600 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900">Highest PNL</h3>
          </div>
          <div className="text-3xl font-bold text-blue-600">
            {formatCurrency(pnlData?.highest_pnl || 0)}
          </div>
          <p className="text-sm text-gray-600 mt-2">
            Best single trade performance
          </p>
        </div>

        {/* Most Traded Pair */}
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-100">
          <div className="flex items-center mb-4">
            <BarChart3 className="h-6 w-6 text-purple-600 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900">Most Traded Pair</h3>
          </div>
          <div className="text-3xl font-bold text-purple-600">
            {pnlData?.most_traded_pair || 'N/A'}
          </div>
          <p className="text-sm text-gray-600 mt-2">
            {pnlData?.pair_trade_count || 0} trades
          </p>
        </div>
      </div>
    </div>
  );
};

export default PnlAnalytics; 