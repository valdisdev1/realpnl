
import { DollarSign, TrendingUp, Users, BarChart3 } from 'lucide-react';
import Navbar from '../components/Navbar';
import StatCard from '../components/StatCard';

const Index = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Trading Dashboard</h1>
          <p className="text-lg text-gray-600">Real-time trading statistics and performance metrics</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Realized PNL"
            value="$2,847,592"
            subtitle="All time"
            icon={<DollarSign className="h-8 w-8" />}
            trend="up"
            trendValue="+12.5% this month"
          />
          
          <StatCard
            title="Average PNL %"
            value="8.7%"
            subtitle="Per trade"
            icon={<TrendingUp className="h-8 w-8" />}
            trend="up"
            trendValue="+2.1% vs last month"
          />
          
          <StatCard
            title="Median Trade Size"
            value="$45,230"
            subtitle="USD value"
            icon={<BarChart3 className="h-8 w-8" />}
            trend="neutral"
            trendValue="Stable"
          />
          
          <StatCard
            title="Active Traders"
            value="1,247"
            subtitle="This month"
            icon={<Users className="h-8 w-8" />}
            trend="up"
            trendValue="+156 new traders"
          />
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-100">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Market Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <p className="text-2xl font-bold text-green-600">73%</p>
              <p className="text-sm text-gray-600">Profitable Trades</p>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <p className="text-2xl font-bold text-blue-600">$127M</p>
              <p className="text-sm text-gray-600">Total Volume</p>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <p className="text-2xl font-bold text-purple-600">4.2x</p>
              <p className="text-sm text-gray-600">Avg Risk/Reward</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
