import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Clock, TrendingUp, TrendingDown } from 'lucide-react';

interface Trade {
  id: string;
  symbol: string;
  side: 'Buy' | 'Sell';
  closed_pnl: number;
  avg_entry_price: number;
  created_time: string;
  updated_time: string;
  api_id: string;
}

const RecentTrades = () => {
  const { profile } = useAuth();
  const [trades, setTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRecentTrades = async () => {
      if (!profile?.id) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Debug: Log the profile ID we're searching for
        console.log('Searching for trades with api_id:', profile.id);
        
        // First, let's check what api_id values exist in the database
        const { data: allApiIds, error: apiIdError } = await supabase
          .from('bybit_pnl')
          .select('api_id, updated_time')
          .order('updated_time', { ascending: false })
          .limit(10);
        
        console.log('Recent api_ids in database:', allApiIds);
        
        // Fetch all trades for the user with a higher limit and proper ordering
        const { data: tradeRecords, error: tradeError } = await supabase
          .from('bybit_pnl')
          .select('id, symbol, side, closed_pnl, avg_entry_price, created_time, updated_time, api_id')
          .eq('api_id', profile.id)
          .order('updated_time', { ascending: false })
          .limit(500); // Much higher limit to ensure we get recent trades

        if (tradeError) {
          console.error('Error fetching recent trades:', tradeError);
          setError('Failed to fetch recent trades');
          setLoading(false);
          return;
        }

        // Debug: Log all returned records
        console.log('Total records returned:', tradeRecords?.length || 0);
        console.log('First 3 records:', tradeRecords?.slice(0, 3));
        
        if (tradeRecords && tradeRecords.length > 0) {
          // Data is already sorted by updated_time desc from the database
          // Take only the 10 most recent
          setTrades(tradeRecords.slice(0, 10));
          
          // Debug: Log the first few trades to see timestamp format
          console.log('Top 3 most recent trades:', tradeRecords.slice(0, 3).map(t => ({
            symbol: t.symbol,
            updated_time: t.updated_time,
            parsed_time: parseUnixTimestamp(t.updated_time).toISOString(),
            type: typeof t.updated_time,
            length: t.updated_time?.toString().length
          })));
        } else {
          setTrades([]);
          console.log('No trades found for api_id:', profile.id);
        }

      } catch (err) {
        console.error('Error in fetchRecentTrades:', err);
        setError('An unexpected error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchRecentTrades();
  }, [profile?.id]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  const parseUnixTimestamp = (timestamp: string | number): Date => {
    // Handle Unix timestamp (seconds since epoch)
    let date: Date;
    
    // Check if it's a Unix timestamp (numeric string or number)
    if (typeof timestamp === 'string' && /^\d+$/.test(timestamp)) {
      // If it's a string of digits, treat as Unix timestamp
      const unixTime = parseInt(timestamp);
      // Always treat as seconds (multiply by 1000 for milliseconds)
      date = new Date(unixTime * 1000);
    } else if (typeof timestamp === 'number') {
      // If it's a number, treat as Unix timestamp in seconds
      date = new Date(timestamp * 1000);
    } else {
      // Treat as regular date string
      date = new Date(timestamp);
    }
    
    return date;
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 8
    }).format(price);
  };

  const formatTime = (timestamp: string) => {
    const date = parseUnixTimestamp(timestamp);
    
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  };

  const getSideIcon = (side: string) => {
    return side === 'Buy' ? (
      <TrendingUp className="h-4 w-4 text-green-600" />
    ) : (
      <TrendingDown className="h-4 w-4 text-red-600" />
    );
  };

  const getSideColor = (side: string) => {
    return side === 'Buy' ? 'text-green-600' : 'text-red-600';
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 border border-gray-100 mb-8">
        <div className="flex items-center mb-6">
          <Clock className="h-6 w-6 text-gray-600 mr-2" />
          <h2 className="text-2xl font-bold text-gray-900">Recent Trades</h2>
        </div>
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 border border-gray-100 mb-8">
        <div className="flex items-center mb-6">
          <Clock className="h-6 w-6 text-gray-600 mr-2" />
          <h2 className="text-2xl font-bold text-gray-900">Recent Trades</h2>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-100 mb-8">
      <div className="flex items-center mb-6">
        <Clock className="h-6 w-6 text-gray-600 mr-2" />
        <h2 className="text-2xl font-bold text-gray-900">Recent Trades</h2>
      </div>
      
      {trades.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">No trades found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {trades.map((trade) => (
            <div key={trade.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  {getSideIcon(trade.side)}
                  <span className={`font-semibold ${getSideColor(trade.side)}`}>
                    {trade.side}
                  </span>
                </div>
                <div>
                  <div className="font-semibold text-gray-900">{trade.symbol}</div>
                  <div className="text-sm text-gray-600">
                    Entry: ${formatPrice(trade.avg_entry_price)}
                  </div>
                </div>
              </div>
              
              <div className="text-right">
                <div className={`font-bold text-lg ${trade.closed_pnl >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(trade.closed_pnl)}
                </div>
                <div className="text-sm text-gray-600">
                  {formatTime(trade.updated_time)}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RecentTrades; 