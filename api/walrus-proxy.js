// Vercel serverless function to proxy Walrus images with proper headers
// This allows images to display in browser instead of downloading

// List of Walrus testnet aggregators for fallback
const WALRUS_AGGREGATORS = [
  'https://aggregator.walrus-testnet.walrus.space',
  'https://aggregator.testnet.walrus.atalma.io',
  'https://aggregator.walrus-01.tududes.com',
  'https://aggregator.walrus.banansen.dev'
];

export default async function handler(req, res) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { blobId } = req.query;

  if (!blobId) {
    return res.status(400).json({ error: 'Blob ID is required' });
  }

  try {
    // Try each aggregator until one works
    let imageBuffer = null;
    let lastError = null;

    for (const aggregator of WALRUS_AGGREGATORS) {
      try {
        const walrusUrl = `${aggregator}/v1/blobs/${blobId}`;
        console.log(`Trying aggregator: ${aggregator}`);
        
        const response = await fetch(walrusUrl, {
          method: 'GET',
          headers: {
            'User-Agent': 'Walrus-Proxy/1.0'
          }
        });
        
        if (response.ok) {
          imageBuffer = await response.arrayBuffer();
          console.log(`Successfully fetched from ${aggregator}`);
          break;
        } else {
          console.warn(`Failed to fetch from ${aggregator}: ${response.status}`);
          lastError = `HTTP ${response.status}: ${response.statusText}`;
        }
      } catch (error) {
        console.warn(`Error fetching from ${aggregator}:`, error.message);
        lastError = error.message;
      }
    }

    if (!imageBuffer) {
      console.error('All aggregators failed. Last error:', lastError);
      return res.status(404).json({ 
        error: 'Image not found or all aggregators unavailable',
        details: lastError
      });
    }

    // Determine content type
    const contentType = getContentType(blobId);
    
    // Set proper headers for browser display
    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Length', imageBuffer.byteLength);
    res.setHeader('Cache-Control', 'public, max-age=3600'); // Cache for 1 hour
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    // Send the image
    res.status(200).send(Buffer.from(imageBuffer));
    
  } catch (error) {
    console.error('Proxy error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      details: error.message 
    });
  }
}

// Helper function to determine content type
function getContentType(blobId) {
  // For now, assume all images are PNG since we're generating PNGs
  // You could extend this to detect file type from blobId or other means
  return 'image/png';
}

// Handle CORS preflight requests
export async function options(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.status(200).end();
} 