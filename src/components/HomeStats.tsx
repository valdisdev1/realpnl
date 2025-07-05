import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { DollarSign, TrendingUp, BarChart3, Users } from 'lucide-react';
import StatCard from './StatCard';

interface StatsData {
  totalRealizedPnl: number;
  shortPercentage: number;
  longPercentage: number;
  totalTrades: number;
}

const HomeStats = () => {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch all PNL data
        const { data: pnlRecords, error: pnlError } = await supabase
          .from('bybit_pnl')
          .select('closed_pnl, side');

        if (pnlError) {
          console.error('Error fetching PNL data:', pnlError);
          setError('Failed to fetch trading statistics');
          setLoading(false);
          return;
        }

        if (!pnlRecords || pnlRecords.length === 0) {
          setStats({
            totalRealizedPnl: 0,
            shortPercentage: 0,
            longPercentage: 0,
            totalTrades: 0
          });
          setLoading(false);
          return;
        }

        // Calculate total realized PNL
        const totalRealizedPnl = pnlRecords.reduce((sum, record) => sum + (record.closed_pnl || 0), 0);

        // Calculate short and long percentages
        const totalTrades = pnlRecords.length;
        const shortTrades = pnlRecords.filter(record => record.side === 'Sell').length;
        const longTrades = pnlRecords.filter(record => record.side === 'Buy').length;

        const shortPercentage = totalTrades > 0 ? (shortTrades / totalTrades) * 100 : 0;
        const longPercentage = totalTrades > 0 ? (longTrades / totalTrades) * 100 : 0;

        setStats({
          totalRealizedPnl,
          shortPercentage,
          longPercentage,
          totalTrades
        });

      } catch (err) {
        console.error('Error in fetchStats:', err);
        setError('An unexpected error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatPercentage = (percentage: number) => {
    return `${percentage.toFixed(1)}%`;
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white rounded-lg shadow-md p-6 border border-gray-100">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
              <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
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

  if (!stats) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <StatCard
        title="Total Realized PNL"
        value={formatCurrency(stats.totalRealizedPnl)}
        subtitle="All time"
        icon={<DollarSign className="h-8 w-8" />}
        trend={stats.totalRealizedPnl >= 0 ? "up" : "down"}
        trendValue={stats.totalRealizedPnl >= 0 ? "Positive" : "Negative"}
      />
      
      <StatCard
        title="Short %"
        value={formatPercentage(stats.shortPercentage)}
        subtitle="Sell orders"
        icon={<TrendingUp className="h-8 w-8" />}
        trend="neutral"
        trendValue={`${stats.shortPercentage.toFixed(0)}% of total`}
      />
      
      <StatCard
        title="Long %"
        value={formatPercentage(stats.longPercentage)}
        subtitle="Buy orders"
        icon={<BarChart3 className="h-8 w-8" />}
        trend="neutral"
        trendValue={`${stats.longPercentage.toFixed(0)}% of total`}
      />
      
      <StatCard
        title="Total Trades"
        value={stats.totalTrades.toLocaleString()}
        subtitle="All time"
        icon={<Users className="h-8 w-8" />}
        trend="neutral"
        trendValue="Total orders"
      />
    </div>
  );
};

export default HomeStats; 