// Walrus HTTP API service for IPFS storage
// Based on https://docs.wal.app/usage/web-api.html

import { getWalrusConfig, getWalrusFallbackConfig, WALRUS_CONFIG } from './walrus-config';

export interface WalrusBlobResponse {
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

export interface WalrusConfig {
  publisher: string;
  aggregator: string;
  epochs?: number;
  deletable?: boolean;
}

export class WalrusAPI {
  private config: WalrusConfig;
  private fallbackConfig: WalrusConfig;

  constructor(config?: Partial<WalrusConfig>) {
    const defaultConfig = getWalrusConfig();
    this.config = { 
      ...defaultConfig, 
      epochs: WALRUS_CONFIG.epochs,
      deletable: WALRUS_CONFIG.deletable,
      ...config 
    };
    
    const fallbackEndpoints = getWalrusFallbackConfig();
    this.fallbackConfig = { 
      ...fallbackEndpoints, 
      epochs: WALRUS_CONFIG.epochs,
      deletable: WALRUS_CONFIG.deletable 
    };
  }

  /**
   * Store a blob (file) to Walrus IPFS with fallback support
   * @param blob - The blob to store
   * @param filename - Optional filename
   * @param epochs - Number of storage epochs (default: from config)
   * @returns Promise with blob information
   */
  async storeBlob(
    blob: Blob, 
    filename?: string, 
    epochs?: number
  ): Promise<WalrusBlobResponse> {
    // Check file size
    if (blob.size > WALRUS_CONFIG.maxFileSize) {
      throw new Error(`File size ${blob.size} bytes exceeds maximum allowed size of ${WALRUS_CONFIG.maxFileSize} bytes`);
    }

    const storageEpochs = epochs || this.config.epochs || 1;
    
    try {
      return await this._storeBlobToEndpoint(blob, this.config, storageEpochs);
    } catch (error) {
      console.warn('Primary Walrus endpoint failed, trying fallback:', error);
      try {
        return await this._storeBlobToEndpoint(blob, this.fallbackConfig, storageEpochs);
      } catch (fallbackError) {
        console.error('Both primary and fallback Walrus endpoints failed:', fallbackError);
        throw new Error(`Failed to upload to Walrus IPFS: ${fallbackError instanceof Error ? fallbackError.message : 'Unknown error'}`);
      }
    }
  }

  /**
   * Internal method to store blob to a specific endpoint
   */
  private async _storeBlobToEndpoint(
    blob: Blob, 
    endpointConfig: WalrusConfig, 
    epochs: number
  ): Promise<WalrusBlobResponse> {
    const url = new URL('/v1/blobs', endpointConfig.publisher);
    
    // Add query parameters
    if (epochs) {
      url.searchParams.set('epochs', epochs.toString());
    }
    if (endpointConfig.deletable) {
      url.searchParams.set('deletable', 'true');
    }

    const response = await fetch(url.toString(), {
      method: 'PUT',
      body: blob,
      headers: {
        'Content-Type': blob.type || 'application/octet-stream',
      },
    });

    if (!response.ok) {
      throw new Error(`Walrus API error: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  }

  /**
   * Store a string to Walrus IPFS
   * @param content - The string content to store
   * @param epochs - Number of storage epochs (default: from config)
   * @returns Promise with blob information
   */
  async storeString(
    content: string, 
    epochs?: number
  ): Promise<WalrusBlobResponse> {
    const storageEpochs = epochs || this.config.epochs || 1;
    
    try {
      return await this._storeStringToEndpoint(content, this.config, storageEpochs);
    } catch (error) {
      console.warn('Primary Walrus endpoint failed, trying fallback:', error);
      try {
        return await this._storeStringToEndpoint(content, this.fallbackConfig, storageEpochs);
      } catch (fallbackError) {
        console.error('Both primary and fallback Walrus endpoints failed:', fallbackError);
        throw new Error(`Failed to upload string to Walrus IPFS: ${fallbackError instanceof Error ? fallbackError.message : 'Unknown error'}`);
      }
    }
  }

  /**
   * Internal method to store string to a specific endpoint
   */
  private async _storeStringToEndpoint(
    content: string, 
    endpointConfig: WalrusConfig, 
    epochs: number
  ): Promise<WalrusBlobResponse> {
    const url = new URL('/v1/blobs', endpointConfig.publisher);
    
    if (epochs) {
      url.searchParams.set('epochs', epochs.toString());
    }
    if (endpointConfig.deletable) {
      url.searchParams.set('deletable', 'true');
    }

    const response = await fetch(url.toString(), {
      method: 'PUT',
      body: content,
      headers: {
        'Content-Type': 'text/plain',
      },
    });

    if (!response.ok) {
      throw new Error(`Walrus API error: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  }

  /**
   * Read a blob from Walrus IPFS with fallback support
   * @param blobId - The blob ID to read
   * @returns Promise with the blob content
   */
  async readBlob(blobId: string): Promise<Blob> {
    try {
      return await this._readBlobFromEndpoint(blobId, this.config.aggregator);
    } catch (error) {
      console.warn('Primary Walrus aggregator failed, trying fallback:', error);
      try {
        return await this._readBlobFromEndpoint(blobId, this.fallbackConfig.aggregator);
      } catch (fallbackError) {
        console.error('Both primary and fallback Walrus aggregators failed:', fallbackError);
        throw new Error(`Failed to read blob from Walrus IPFS: ${fallbackError instanceof Error ? fallbackError.message : 'Unknown error'}`);
      }
    }
  }

  /**
   * Internal method to read blob from a specific endpoint
   */
  private async _readBlobFromEndpoint(blobId: string, aggregatorUrl: string): Promise<Blob> {
    const url = new URL(`/v1/blobs/${blobId}`, aggregatorUrl);
    
    const response = await fetch(url.toString());

    if (!response.ok) {
      throw new Error(`Walrus API error: ${response.status} ${response.statusText}`);
    }

    return await response.blob();
  }

  /**
   * Read a blob as text from Walrus IPFS
   * @param blobId - The blob ID to read
   * @returns Promise with the text content
   */
  async readBlobAsText(blobId: string): Promise<string> {
    try {
      return await this._readBlobAsTextFromEndpoint(blobId, this.config.aggregator);
    } catch (error) {
      console.warn('Primary Walrus aggregator failed, trying fallback:', error);
      try {
        return await this._readBlobAsTextFromEndpoint(blobId, this.fallbackConfig.aggregator);
      } catch (fallbackError) {
        console.error('Both primary and fallback Walrus aggregators failed:', fallbackError);
        throw new Error(`Failed to read blob as text from Walrus IPFS: ${fallbackError instanceof Error ? fallbackError.message : 'Unknown error'}`);
      }
    }
  }

  /**
   * Internal method to read blob as text from a specific endpoint
   */
  private async _readBlobAsTextFromEndpoint(blobId: string, aggregatorUrl: string): Promise<string> {
    const url = new URL(`/v1/blobs/${blobId}`, aggregatorUrl);
    
    const response = await fetch(url.toString());

    if (!response.ok) {
      throw new Error(`Walrus API error: ${response.status} ${response.statusText}`);
    }

    return await response.text();
  }

  /**
   * Get the IPFS gateway URL for a blob
   * @param blobId - The blob ID
   * @returns The gateway URL
   */
  getGatewayUrl(blobId: string): string {
    return `${this.config.aggregator}/v1/blobs/${blobId}`;
  }

  /**
   * Get a browser-friendly gateway URL that displays content instead of downloading
   * @param blobId - The blob ID
   * @returns The browser-friendly gateway URL
   */
  getBrowserGatewayUrl(blobId: string): string {
    // Use our custom proxy that fetches from Walrus and serves with proper headers
    const baseUrl = typeof window !== 'undefined' 
      ? window.location.origin 
      : process.env.VITE_APP_URL || 'http://localhost:3000';
    return `${baseUrl}/api/walrus-proxy?blobId=${blobId}`;
  }

  /**
   * Get blob information from the response
   * @param response - The Walrus API response
   * @returns Object with blobId and gateway URLs
   */
  getBlobInfo(response: WalrusBlobResponse): { 
    blobId: string; 
    gatewayUrl: string;
    browserUrl: string;
  } | null {
    if (response.newlyCreated) {
      const blobId = response.newlyCreated.blobObject.blobId;
      return {
        blobId,
        gatewayUrl: this.getGatewayUrl(blobId),
        browserUrl: this.getBrowserGatewayUrl(blobId)
      };
    } else if (response.alreadyCertified) {
      const blobId = response.alreadyCertified.blobId;
      return {
        blobId,
        gatewayUrl: this.getGatewayUrl(blobId),
        browserUrl: this.getBrowserGatewayUrl(blobId)
      };
    }
    return null;
  }

  /**
   * Get current configuration
   */
  getConfig(): WalrusConfig {
    return { ...this.config };
  }

  /**
   * Update configuration
   */
  updateConfig(newConfig: Partial<WalrusConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }
}

// Create a default instance
export const walrusAPI = new WalrusAPI();

// Export the default instance for easy use
export default walrusAPI; 