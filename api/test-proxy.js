// Test endpoint to verify the Walrus proxy is working
export default async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  const testData = {
    message: 'Walrus Proxy is working!',
    timestamp: new Date().toISOString(),
    endpoints: {
      proxy: '/api/walrus-proxy?blobId=YOUR_BLOB_ID',
      test: '/api/test-proxy'
    },
    instructions: [
      '1. Upload an image using the RecentTrades component',
      '2. Copy the blob ID from the success message',
      '3. Test the proxy: /api/walrus-proxy?blobId=YOUR_BLOB_ID',
      '4. The image should display in browser instead of downloading'
    ]
  };
  
  res.status(200).json(testData);
} 