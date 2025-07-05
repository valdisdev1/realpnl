import { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Clock, TrendingUp, TrendingDown, Download, Upload } from 'lucide-react';
import html2canvas from 'html2canvas';
import { walrusAPI } from '../lib/walrus-api';

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
  const [uploadingStates, setUploadingStates] = useState<{ [key: string]: boolean }>({});
  const [uploadedImages, setUploadedImages] = useState<{ [key: string]: { blobId: string; browserUrl: string; directUrl: string } }>({});

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
    
        
        // First, let's check what api_id values exist in the database
        const { data: allApiIds, error: apiIdError } = await supabase
          .from('bybit_pnl')
          .select('api_id, updated_time')
          .order('updated_time', { ascending: false })
          .limit(10);
        

        
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

        
        if (tradeRecords && tradeRecords.length > 0) {
          // Data is already sorted by updated_time desc from the database
          // Take only the 10 most recent
          setTrades(tradeRecords.slice(0, 10));
          

        } else {
          setTrades([]);

        }

        // Fetch existing uploaded images for these trades
        const tradeIds = tradeRecords?.slice(0, 10).map(t => t.id) || [];
        if (tradeIds.length > 0) {
          const { data: imageRecords, error: imageError } = await supabase
            .from('trade_images')
            .select('trade_id, ipfs_hash, ipfs_url')
            .in('trade_id', tradeIds);

          if (!imageError && imageRecords) {
            const existingImages: { [key: string]: { blobId: string; browserUrl: string; directUrl: string } } = {};
            imageRecords.forEach(img => {
              const baseUrl = window.location.origin;
              existingImages[img.trade_id] = {
                blobId: img.ipfs_hash,
                browserUrl: `${baseUrl}/api/walrus-proxy?blobId=${img.ipfs_hash}`,
                directUrl: `${walrusAPI.getConfig().aggregator}/v1/blobs/${img.ipfs_hash}`
              };
            });
            setUploadedImages(existingImages);
          }
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

  const generateTradePNG = async (trade: Trade) => {
    try {
      // Create a temporary div for the image
      const tempDiv = document.createElement('div');
      tempDiv.style.position = 'absolute';
      tempDiv.style.left = '-9999px';
      tempDiv.style.top = '-9999px';
      tempDiv.style.width = '400px';
      tempDiv.style.height = '200px';
      tempDiv.style.backgroundColor = 'white';
      tempDiv.style.padding = '20px';
      tempDiv.style.borderRadius = '12px';
      tempDiv.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
      tempDiv.style.fontFamily = 'Arial, sans-serif';
      tempDiv.style.color = '#1f2937';
      
      const formattedTime = formatTime(trade.updated_time);
      const formattedPnl = formatCurrency(trade.closed_pnl);
      const isPositive = trade.closed_pnl >= 0;
      
      tempDiv.innerHTML = `
        <div style="display: flex; flex-direction: column; height: 100%; justify-content: space-between;">
          <div style="text-align: center; margin-bottom: 20px;">
            <h2 style="margin: 0; font-size: 24px; font-weight: bold; color: #374151;">Trade Summary</h2>
          </div>
          
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
            <div>
              <div style="font-size: 18px; font-weight: bold; color: #374151;">${trade.symbol}</div>
              <div style="font-size: 14px; color: #6b7280; margin-top: 4px;">${trade.side}</div>
            </div>
            <div style="text-align: right;">
              <div style="font-size: 24px; font-weight: bold; color: ${isPositive ? '#059669' : '#dc2626'};">
                ${formattedPnl}
              </div>
            </div>
          </div>
          
          <div style="text-align: center; font-size: 14px; color: #6b7280;">
            ${formattedTime}
          </div>
        </div>
      `;
      
      document.body.appendChild(tempDiv);
      
      // Generate the image
      const canvas = await html2canvas(tempDiv, {
        backgroundColor: 'white',
        width: 400,
        height: 200,
        scale: 2, // Higher resolution
      });
      
      // Remove the temporary div
      document.body.removeChild(tempDiv);
      
      // Convert to blob and download
      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `trade-${trade.symbol}-${formattedTime.replace(/[^a-zA-Z0-9]/g, '-')}.png`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
        }
      }, 'image/png');
      
    } catch (error) {
      console.error('Error generating PNG:', error);
    }
  };

  const uploadToIPFS = async (trade: Trade) => {
    try {
      setUploadingStates(prev => ({ ...prev, [trade.id]: true }));
      
      // Create a temporary div for the image (same as generateTradePNG)
      const tempDiv = document.createElement('div');
      tempDiv.style.position = 'absolute';
      tempDiv.style.left = '-9999px';
      tempDiv.style.top = '-9999px';
      tempDiv.style.width = '400px';
      tempDiv.style.height = '200px';
      tempDiv.style.backgroundColor = 'white';
      tempDiv.style.padding = '20px';
      tempDiv.style.borderRadius = '12px';
      tempDiv.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
      tempDiv.style.fontFamily = 'Arial, sans-serif';
      tempDiv.style.color = '#1f2937';
      
      const formattedTime = formatTime(trade.updated_time);
      const formattedPnl = formatCurrency(trade.closed_pnl);
      const isPositive = trade.closed_pnl >= 0;
      
      tempDiv.innerHTML = `
        <div style="display: flex; flex-direction: column; height: 100%; justify-content: space-between;">
          <div style="text-align: center; margin-bottom: 20px;">
            <h2 style="margin: 0; font-size: 24px; font-weight: bold; color: #374151;">Trade Summary</h2>
          </div>
          
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
            <div>
              <div style="font-size: 18px; font-weight: bold; color: #374151;">${trade.symbol}</div>
              <div style="font-size: 14px; color: #6b7280; margin-top: 4px;">${trade.side}</div>
            </div>
            <div style="text-align: right;">
              <div style="font-size: 24px; font-weight: bold; color: ${isPositive ? '#059669' : '#dc2626'};">
                ${formattedPnl}
              </div>
            </div>
          </div>
          
          <div style="text-align: center; font-size: 14px; color: #6b7280;">
            ${formattedTime}
          </div>
        </div>
      `;
      
      document.body.appendChild(tempDiv);
      
      // Generate the image
      const canvas = await html2canvas(tempDiv, {
        backgroundColor: 'white',
        width: 400,
        height: 200,
        scale: 2, // Higher resolution
      });
      
      // Remove the temporary div
      document.body.removeChild(tempDiv);
      
      // Convert to blob and upload to Walrus IPFS
      canvas.toBlob(async (blob) => {
        if (blob) {
          try {
            // Upload to Walrus IPFS
            const response = await walrusAPI.storeBlob(
              blob, 
              `trade-${trade.symbol}-${formattedTime.replace(/[^a-zA-Z0-9]/g, '-')}.png`,
              1 // Store for 1 epoch
            );
            
            // Get blob information
            const blobInfo = walrusAPI.getBlobInfo(response);
            
            if (blobInfo) {
              // Store the IPFS hash in your database
              const { error: dbError } = await supabase
                .from('trade_images')
                .upsert({
                  trade_id: trade.id,
                  ipfs_hash: blobInfo.blobId,
                  ipfs_url: blobInfo.browserUrl, // Use browser-friendly URL
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString()
                });
              
              if (dbError) {
                console.error('Error saving to database:', dbError);
                alert('Image uploaded to IPFS but failed to save to database. Please try again.');
              } else {
                // Store uploaded image info in state for UI display
                setUploadedImages(prev => ({
                  ...prev,
                  [trade.id]: {
                    blobId: blobInfo.blobId,
                    browserUrl: blobInfo.browserUrl,
                    directUrl: blobInfo.gatewayUrl
                  }
                }));
                
                // Show success message with browser-friendly link
                alert(`✅ Trade image uploaded to Walrus IPFS!

📋 Blob ID: ${blobInfo.blobId}

🌐 View in browser: ${blobInfo.browserUrl}

The image is now permanently stored on IPFS and can be viewed in any browser!`);
              }
            } else {
              throw new Error('Failed to get blob information from Walrus response');
            }
          } catch (uploadError) {
            console.error('Error uploading to Walrus IPFS:', uploadError);
            alert('Failed to upload to Walrus IPFS. Please try again.');
          }
        }
      }, 'image/png');
      
    } catch (error) {
      console.error('Error in uploadToIPFS:', error);
      alert('Error uploading to Walrus IPFS. Please try again.');
    } finally {
      setUploadingStates(prev => ({ ...prev, [trade.id]: false }));
    }
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
              
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <div className={`font-bold text-lg ${trade.closed_pnl >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatCurrency(trade.closed_pnl)}
                  </div>
                  <div className="text-sm text-gray-600">
                    {formatTime(trade.updated_time)}
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => generateTradePNG(trade)}
                    className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Download trade as PNG"
                  >
                    <Download className="h-4 w-4" />
                  </button>
                  
                  <button
                    onClick={() => uploadToIPFS(trade)}
                    disabled={uploadingStates[trade.id]}
                    className={`p-2 rounded-lg transition-colors ${
                      uploadingStates[trade.id]
                        ? 'text-gray-400 bg-gray-100 cursor-not-allowed'
                        : 'text-gray-500 hover:text-green-600 hover:bg-green-50'
                    }`}
                    title="Upload to IPFS for NFT minting"
                  >
                    <Upload className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* Display uploaded images */}
      {Object.keys(uploadedImages).length > 0 && (
        <div className="mt-8 pt-6 border-t border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">📸 Uploaded Trade Images</h3>
          <div className="space-y-3">
            {Object.entries(uploadedImages).map(([tradeId, imageInfo]) => {
              const trade = trades.find(t => t.id === tradeId);
              return (
                <div key={tradeId} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 text-sm font-semibold">📊</span>
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">
                        {trade ? `${trade.symbol} ${trade.side}` : 'Trade Image'}
                      </div>
                      <div className="text-sm text-gray-600">
                        Blob ID: {imageInfo.blobId.substring(0, 12)}...
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <a
                      href={imageInfo.browserUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
                    >
                      🌐 View
                    </a>
                    <a
                      href={imageInfo.directUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1 bg-gray-600 text-white text-sm rounded hover:bg-gray-700 transition-colors"
                    >
                      ⬇️ Download
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default RecentTrades; 