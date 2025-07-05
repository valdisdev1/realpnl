import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, DollarSign, Activity, Gauge } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

interface MarketData {
  totalMarketCap: number;
  totalOpenInterest: number;
  fearGreedIndex: number;
  fearGreedClassification: string;
  lastUpdated: string;
}

const MarketOverview = () => {
  const [marketData, setMarketData] = useState<MarketData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchMarketData();
  }, []);

  const fetchMarketData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch data from multiple APIs
      const [marketCapData, openInterestData, fearGreedData] = await Promise.all([
        fetchMarketCap(),
        fetchOpenInterest(),
        fetchFearGreedIndex(),
      ]);

      setMarketData({
        totalMarketCap: marketCapData,
        totalOpenInterest: openInterestData,
        fearGreedIndex: fearGreedData.value,
        fearGreedClassification: fearGreedData.classification,
        lastUpdated: new Date().toLocaleTimeString(),
      });
    } catch (err) {
      setError('Failed to fetch market data');
      console.error('Market data fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMarketCap = async (): Promise<number> => {
    try {
      // Using CoinGecko API (free tier)
      const response = await fetch('https://api.coingecko.com/api/v3/global');
      const data = await response.json();
      return data.data.total_market_cap.usd;
    } catch (error) {
      console.error('Market cap fetch error:', error);
      return 0;
    }
  };

  const fetchOpenInterest = async (): Promise<number> => {
    try {
      // Using CoinAPI for comprehensive open interest data
      // This requires a CoinAPI key - you'll need to add it to your .env file
      const apiKey = import.meta.env.VITE_COINAPI_KEY;
      
      if (!apiKey) {
        console.warn('CoinAPI key not found. Using fallback data.');
        return 45000000000; // Fallback value in USD
      }

      // CoinAPI endpoint for open interest data
      const response = await fetch('https://rest.coinapi.io/v1/futures/open-interest', {
        headers: {
          'X-CoinAPI-Key': apiKey,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`CoinAPI error: ${response.status}`);
      }

      const data = await response.json();
      
      // Calculate total open interest across all exchanges and symbols
      const totalOpenInterest = data.reduce((total: number, item: any) => {
        // Convert to USD if the quote asset is not USD
        let valueInUSD = parseFloat(item.open_interest);
        
        // If quote asset is not USD, we'd need to convert it
        // For now, assuming most data is in USD
        if (item.quote_asset && item.quote_asset !== 'USD') {
          // You might want to add conversion logic here
          console.log(`Non-USD quote asset: ${item.quote_asset} for ${item.symbol}`);
        }
        
        return total + valueInUSD;
      }, 0);

      return totalOpenInterest;
    } catch (error) {
      console.error('Open interest fetch error:', error);
      
      // Fallback to Binance API if CoinAPI fails
      try {
        console.log('Falling back to Binance API...');
        const binanceResponse = await fetch('https://fapi.binance.com/fapi/v1/openInterest?symbol=BTCUSDT');
        const binanceData = await binanceResponse.json();
        return parseFloat(binanceData.openInterest) * 50000; // Rough BTC price estimate
      } catch (fallbackError) {
        console.error('Fallback API also failed:', fallbackError);
        return 0;
      }
    }
  };

  const fetchFearGreedIndex = async (): Promise<{ value: number; classification: string }> => {
    try {
      // Using Alternative.me API (free)
      const response = await fetch('https://api.alternative.me/fng/');
      const data = await response.json();
      
      return {
        value: parseInt(data.data[0].value),
        classification: data.data[0].value_classification,
      };
    } catch (error) {
      console.error('Fear & Greed fetch error:', error);
      return { value: 50, classification: 'Neutral' };
    }
  };

  const formatCurrency = (value: number): string => {
    if (value >= 1e12) return `$${(value / 1e12).toFixed(2)}T`;
    if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`;
    if (value >= 1e6) return `$${(value / 1e6).toFixed(2)}M`;
    return `$${value.toLocaleString()}`;
  };

  const getFearGreedColor = (value: number): string => {
    if (value >= 75) return 'text-green-600';
    if (value >= 50) return 'text-yellow-600';
    if (value >= 25) return 'text-orange-600';
    return 'text-red-600';
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-20" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Card className="mb-8">
        <CardContent className="pt-6">
          <p className="text-red-600 text-center">{error}</p>
          <button 
            onClick={fetchMarketData}
            className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Retry
          </button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="mb-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">Market Overview</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Market Cap</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {marketData ? formatCurrency(marketData.totalMarketCap) : 'N/A'}
            </div>
            <p className="text-xs text-muted-foreground">
              Global cryptocurrency market capitalization
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Open Interest</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {marketData ? formatCurrency(marketData.totalOpenInterest) : 'N/A'}
            </div>
            <p className="text-xs text-muted-foreground">
              Futures market open interest across CEXs
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Fear & Greed Index</CardTitle>
            <Gauge className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${marketData ? getFearGreedColor(marketData.fearGreedIndex) : ''}`}>
              {marketData ? marketData.fearGreedIndex : 'N/A'}
            </div>
            <p className="text-xs text-muted-foreground">
              {marketData ? marketData.fearGreedClassification : 'Market sentiment'}
            </p>
          </CardContent>
        </Card>
      </div>
      
      {marketData && (
        <p className="text-xs text-gray-500 mt-4 text-center">
          Last updated: {marketData.lastUpdated}
        </p>
      )}
    </div>
  );
};

export default MarketOverview; 