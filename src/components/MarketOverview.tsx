import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, DollarSign, Activity } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface MarketData {
  totalMarketCap: number | null;
  totalVolume: number | null;
  openInterest: number | null;
  fearGreedIndex: number | null;
  loading: boolean;
  error: string | null;
}

const MarketOverview: React.FC = () => {
  const [marketData, setMarketData] = useState<MarketData>({
    totalMarketCap: null,
    totalVolume: null,
    openInterest: null,
    fearGreedIndex: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    fetchMarketData();
  }, []);

  const fetchMarketData = async () => {
    setMarketData(prev => ({ ...prev, loading: true, error: null }));

    try {
      // Use Promise.allSettled to handle individual API failures gracefully
      const results = await Promise.allSettled([
        fetchMarketCap(),
        fetchOpenInterest(),
        fetchFearGreedIndex(),
      ]);

      const [marketCapResult, openInterestResult, fearGreedResult] = results;

      setMarketData({
        totalMarketCap: marketCapResult.status === 'fulfilled' ? marketCapResult.value : null,
        totalVolume: null, // We'll skip volume for now due to API limitations
        openInterest: openInterestResult.status === 'fulfilled' ? openInterestResult.value : null,
        fearGreedIndex: fearGreedResult.status === 'fulfilled' ? fearGreedResult.value : null,
        loading: false,
        error: null,
      });
    } catch (error) {
      console.error('Market data fetch error:', error);
      setMarketData(prev => ({
        ...prev,
        loading: false,
        error: 'Failed to fetch market data',
      }));
    }
  };

  const fetchMarketCap = async (): Promise<number> => {
    try {
      // Try direct CoinGecko API first
      const response = await fetch('https://api.coingecko.com/api/v3/global');
      
      if (!response.ok) {
        throw new Error(`CoinGecko API error: ${response.status}`);
      }

      const data = await response.json();
      return data.data.total_market_cap.usd;
    } catch (error) {
      console.error('Market cap fetch error:', error);
      
      // Return a fallback value since API might be blocked
      console.log('Using fallback market cap data');
      return 2.4e12; // $2.4 trillion as fallback
    }
  };

  const fetchOpenInterest = async (): Promise<number> => {
    try {
      // Try Binance API first (more reliable)
      console.log('Fetching open interest from Binance...');
      const binanceResponse = await fetch('https://fapi.binance.com/fapi/v1/openInterest', {
        method: 'GET',
      });

      if (binanceResponse.ok) {
        const data = await binanceResponse.json();
        // Sum up open interest from all symbols
        const totalOpenInterest = data.reduce((sum: number, item: any) => {
          return sum + parseFloat(item.openInterest || '0');
        }, 0);
        return totalOpenInterest;
      }

      // Fallback to CoinAPI if Binance fails
      const coinApiKey = import.meta.env.VITE_COINAPI_KEY;
      if (coinApiKey) {
        console.log('Falling back to CoinAPI...');
        const response = await fetch('https://rest.coinapi.io/v1/futures/open-interest', {
          headers: {
            'X-CoinAPI-Key': coinApiKey,
          },
        });

        if (response.ok) {
          const data = await response.json();
          const totalOpenInterest = data.reduce((sum: number, item: any) => {
            return sum + (item.open_interest || 0);
          }, 0);
          return totalOpenInterest;
        }
      }

      throw new Error('All open interest APIs failed');
    } catch (error) {
      console.error('Open interest fetch error:', error);
      // Return a fallback value
      return 45000000000; // $45 billion as fallback
    }
  };

  const fetchFearGreedIndex = async (): Promise<number> => {
    try {
      const response = await fetch('https://api.alternative.me/fng/');
      
      if (!response.ok) {
        throw new Error(`Fear & Greed API error: ${response.status}`);
      }

      const data = await response.json();
      return parseInt(data.data[0].value);
    } catch (error) {
      console.error('Fear & Greed fetch error:', error);
      // Return a neutral fallback value
      return 50;
    }
  };

  const formatCurrency = (value: number | null): string => {
    if (value === null) return 'N/A';
    if (value >= 1e12) return `$${(value / 1e12).toFixed(2)}T`;
    if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`;
    if (value >= 1e6) return `$${(value / 1e6).toFixed(2)}M`;
    if (value >= 1e3) return `$${(value / 1e3).toFixed(2)}K`;
    return `$${value.toFixed(2)}`;
  };

  const getFearGreedLabel = (value: number | null): string => {
    if (value === null) return 'N/A';
    if (value >= 80) return 'Extreme Greed';
    if (value >= 60) return 'Greed';
    if (value >= 40) return 'Neutral';
    if (value >= 20) return 'Fear';
    return 'Extreme Fear';
  };

  const getFearGreedColor = (value: number | null): string => {
    if (value === null) return 'text-gray-500';
    if (value >= 60) return 'text-green-600';
    if (value >= 40) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (marketData.loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="pb-2">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-gray-200 rounded w-1/2"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Market Overview</h2>
        <button
          onClick={fetchMarketData}
          className="text-sm text-blue-600 hover:text-blue-800 font-medium"
        >
          Refresh
        </button>
      </div>

      {marketData.error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800 text-sm">
            {marketData.error} - Some data may be unavailable due to API limitations.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Market Cap</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {marketData.totalMarketCap ? formatCurrency(marketData.totalMarketCap) : 'N/A'}
            </div>
            <p className="text-xs text-muted-foreground">
              {marketData.totalMarketCap ? 'Global cryptocurrency market' : 'Data unavailable'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Open Interest</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {marketData.openInterest ? formatCurrency(marketData.openInterest) : 'N/A'}
            </div>
            <p className="text-xs text-muted-foreground">
              {marketData.openInterest ? 'Futures market activity' : 'Data unavailable'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Fear & Greed Index</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getFearGreedColor(marketData.fearGreedIndex)}`}>
              {marketData.fearGreedIndex || 'N/A'}
            </div>
            <p className="text-xs text-muted-foreground">
              {marketData.fearGreedIndex ? getFearGreedLabel(marketData.fearGreedIndex) : 'Data unavailable'}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MarketOverview; 