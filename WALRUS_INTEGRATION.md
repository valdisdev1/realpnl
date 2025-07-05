# Walrus IPFS Integration

This project uses [Walrus](https://docs.wal.app/) for decentralized storage on the Sui blockchain. Since Walrus is Sui-based (not traditional IPFS), we've implemented a custom proxy to enable browser-friendly image display.

## Features

- **Decentralized Storage**: Files are stored on the Sui blockchain with permanent, verifiable storage
- **Fallback Support**: Automatic fallback to alternative aggregators if primary fails
- **Browser Display**: Custom proxy enables images to display in browser instead of downloading
- **Configurable Networks**: Easy switching between testnet and mainnet
- **File Size Validation**: Automatic file size checking before upload
- **Error Handling**: Comprehensive error handling with detailed messages

## Architecture

### Storage Flow
1. **Upload**: Image → Walrus Publisher → Sui Blockchain
2. **Retrieval**: Walrus Aggregator → Custom Proxy → Browser Display

### Proxy System
- **Location**: `/api/walrus-proxy.js` (Vercel serverless function)
- **Purpose**: Fetches images from Walrus aggregators and serves with proper headers
- **Fallback**: Tries multiple aggregators for reliability
- **Caching**: 1-hour cache for performance

## Configuration

### Environment Variables

Add these to your `.env` file:

```env
# Walrus Network (testnet or mainnet)
VITE_WALRUS_NETWORK=testnet

# Storage epochs (how long to store the file)
VITE_WALRUS_EPOCHS=1

# Whether files are deletable (true/false)
VITE_WALRUS_DELETABLE=false

# Maximum file size in bytes (default: 10MB)
VITE_WALRUS_MAX_FILE_SIZE=10485760

# App URL for proxy (optional, auto-detected)
VITE_APP_URL=https://your-app.vercel.app
```

### Networks

#### Testnet (Default)
- **Publisher**: `https://publisher.walrus-testnet.walrus.space`
- **Aggregator**: `https://aggregator.walrus-testnet.walrus.space`

#### Mainnet
- **Publisher**: `https://publisher.walrus-mainnet.walrus.space`
- **Aggregator**: `https://aggregator.walrus-mainnet.walrus.space`

## Usage

### Basic Upload

```typescript
import { walrusAPI } from '../lib/walrus-api';

// Upload a blob (file)
const blob = new Blob(['Hello World'], { type: 'text/plain' });
const response = await walrusAPI.storeBlob(blob, 'hello.txt', 1);

// Get blob information with browser-friendly URL
const blobInfo = walrusAPI.getBlobInfo(response);
console.log('Blob ID:', blobInfo?.blobId);
console.log('Browser URL:', blobInfo?.browserUrl); // Displays in browser via proxy
console.log('Direct URL:', blobInfo?.gatewayUrl); // Downloads file
```

### Upload Trade Images

The `RecentTrades` component automatically uploads trade images to Walrus IPFS when you click the upload button. The process:

1. Generates a PNG image of the trade data
2. Uploads to Walrus IPFS
3. Stores the blob ID and proxy URL in the database
4. Shows success message with clickable link
5. Displays uploaded images in a dedicated section

### Browser-Friendly URLs

The integration provides two gateway options:

- **🌐 Proxy**: `/api/walrus-proxy?blobId={blobId}` - Displays images in browser
- **⬇️ Walrus Direct**: `{aggregator}/v1/blobs/{blobId}` - Direct download

### Reading Files

```typescript
// Read as blob
const blob = await walrusAPI.readBlob(blobId);

// Read as text
const text = await walrusAPI.readBlobAsText(blobId);
```

## API Reference

### WalrusAPI Class

#### Methods

- `storeBlob(blob: Blob, filename?: string, epochs?: number)`: Upload a file
- `storeString(content: string, epochs?: number)`: Upload text content
- `readBlob(blobId: string)`: Read a file as blob
- `readBlobAsText(blobId: string)`: Read a file as text
- `getGatewayUrl(blobId: string)`: Get the direct Walrus gateway URL
- `getBrowserGatewayUrl(blobId: string)`: Get IPFS.io URL for browser viewing
- `getBlobInfo(response: WalrusBlobResponse)`: Extract blob info from response

#### Configuration

- `getConfig()`: Get current configuration
- `updateConfig(newConfig)`: Update configuration

### Response Format

```typescript
interface WalrusBlobResponse {
  newlyCreated?: {
    blobObject: {
      id: string;
      registeredEpoch: number;
      blobId: string;
      size: number;
      encodingType: string;
      certifiedEpoch: number;
      storage: {
        id: string;
        startEpoch: number;
        endEpoch: number;
        storageSize: number;
      };
      deletable: boolean;
    };
    resourceOperation: {
      registerFromScratch: {
        encodedLength: number;
        epochsAhead: number;
      };
    };
    cost: number;
  };
  alreadyCertified?: {
    blobId: string;
    event: {
      txDigest: string;
      eventSeq: string;
    };
    endEpoch: number;
  };
}
```

## Fallback Endpoints

If the primary Walrus endpoint fails, the system automatically tries these alternative testnet endpoints:

1. `https://publisher.testnet.walrus.atalma.io`
2. `https://publisher.walrus-01.tududes.com`
3. `https://publisher.walrus.banansen.dev`

## Error Handling

The integration includes comprehensive error handling:

- **File Size Validation**: Checks file size before upload
- **Network Failures**: Automatic fallback to alternative endpoints
- **API Errors**: Detailed error messages with status codes
- **Database Errors**: Separate handling for upload vs database errors

## Migration from Pinata

The migration from Pinata to Walrus is complete. Key changes:

1. **Removed Pinata JWT dependency**: No more API keys needed
2. **Updated upload logic**: Uses Walrus HTTP API instead of Pinata
3. **Enhanced error handling**: Better fallback and retry logic
4. **Improved configuration**: Environment-based network selection

## Benefits of Walrus

- **Decentralized**: No single point of failure
- **Permanent**: Files are stored on blockchain with permanent availability
- **Verifiable**: Cryptographic proofs ensure data integrity
- **Cost-effective**: Competitive pricing for permanent storage
- **No API Keys**: No authentication required for basic usage

## Troubleshooting

### Common Issues

1. **"File size exceeds maximum"**: Reduce file size or increase `VITE_WALRUS_MAX_FILE_SIZE`
2. **"Primary endpoint failed"**: System will automatically try fallback endpoints
3. **"Both endpoints failed"**: Check network connectivity and try again later

### Debug Mode

Enable debug logging by checking the browser console for detailed error messages and fallback attempts.

## Resources

- [Walrus Documentation](https://docs.wal.app/)
- [Walrus HTTP API Reference](https://docs.wal.app/usage/web-api.html)
- [Sui Blockchain](https://sui.io/)

## UI Features

### Uploaded Images Display

After uploading trade images, they appear in a dedicated section below the trade list with:

- **📊 Trade Information**: Shows symbol and side of the trade
- **🔗 Two Gateway Options**: 
  - 🌐 **View**: Opens image in browser using IPFS.io
  - ⬇️ **Download**: Direct download from Walrus
- **📋 Blob ID**: Shortened display of the IPFS hash
- **🎨 Clean Design**: Simple, organized layout

### Success Messages

Upload success messages include:
- ✅ Confirmation emoji
- 📋 Blob ID for reference
- 🌐 Direct link to view in browser
- Clear explanation that the image is permanently stored

### Persistent Display

Uploaded images are:
- Stored in component state for immediate display
- Loaded from database on component mount
- Persisted across page refreshes
- Available for all previously uploaded trades 