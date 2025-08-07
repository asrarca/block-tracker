import { NextRequest, NextResponse } from 'next/server';
import config from '../config';

export interface TokenPrice {
  currency: string;
  value: string;
  lastUpdatedAt: string;
};

interface TokensByWallet {
  address: string;
  network: string;
  tokenAddress: string | null;
  tokenBalance: string;
  tokenMetadata: TokenMetaData;
  tokenPrices: TokenPrice[]
}

export interface TokenFormatted {
  address: string | null;
  balance: number;
  metadata: TokenMetaData;
  price: TokenPrice;
  value: number;
}


interface TokenMetaData {
  name: string;
  symbol: string;
  decimals: string;
  logo: string;
};

/**
 * Responses could optionally contain a pageKey key
 */
interface PageKey {
  pageKey?: string;
}

/**
 * All responses will contain a data key with an optional PageKey.
 */
interface APIResponse {
  data: PageKey;
}

/**
 * TokensByWallet response has a tokens key in addition to the
 * optional pageKey key.
 *
 * Expected format:
 * {
 *   "data": {
 *     "tokens": [...]
 *     "pageKey": ""
 *   }
 * }
 */
interface TokensByWalletData extends PageKey {
  tokens: TokensByWallet[];
}

/**
 * Extend the default response with TokensByWalletData
 */
interface APIResponse_TokensByWallet extends APIResponse {
  data: TokensByWalletData;
}

export class AlchemyService {
  /**
  * Extract wallet address from request parameters
  */
  extractAddress(req: NextRequest): string {
    const { searchParams } = new URL(req.url);
    return searchParams.get('address') || '';
  }

  /**
  * Convert hex token balance to decimal string
  */
  private convertHexToDecimal(hexBalance: string): string {
    try {
      // Handle edge cases
      if (!hexBalance || hexBalance === '0x' || hexBalance === '0x0') {
        return '0';
      }

      // Convert hex to decimal using BigInt to handle large numbers
      const decimal = BigInt(hexBalance);
      return decimal.toString();
    } catch (error) {
      console.warn('Failed to convert hex balance:', hexBalance, error);
      return '0';
    }
  }

  // Helper function to format value from wei to ETH
  private formatValue(value: number|string, decimals: number|string): number {
    if (typeof value == 'string') {
      value = parseFloat(value);
    }
    if (typeof decimals == 'string') {
      decimals = parseInt(decimals);
    }
    const ethValue = value / Math.pow(10, decimals);
    return ethValue;
  };

  /**
  * Make request to Alchemy API (V1)
  */
  private async fetchFromAPI(path: string, options: RequestInit): Promise<APIResponse_TokensByWallet> {
    const url = config.ALCHEMY_API_URL_V1 + path;
    options.next = {
      revalidate: 300
    };

    const response = await fetch(url, options);

    if (!response.ok) {
      if (response.status == 401) {
        console.log('Unauthorized: Alchemy API key might be missing from this environment.');
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  }



  /**
  * Fetch a single page of token balances from Alchemy API
  */
  private async fetchTokenBalancePage(address: string, pageKey?: string) {
    interface RequestBody {
      addresses: Array<{address: string, networks: ['eth-mainnet']}>;
      withMetadata: boolean;
      withPrices: boolean;
      includeNativeTokens: boolean;
      pageKey?: string
    };

    const requestBody:RequestBody = {
      addresses: [{
        address,
        networks: [
          "eth-mainnet"
        ]
      }],
      withMetadata: true,
      withPrices: true,
      includeNativeTokens: false,
    };

    if (pageKey) {
      requestBody.pageKey = pageKey;
    }
    const requestOptions:RequestInit = {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(requestBody)
    };

    const data = await this.fetchFromAPI('/assets/tokens/by-address', requestOptions);

    if (typeof data.data === 'object' && 'tokens' in data.data) {
      return {
        tokens: data.data.tokens,
        pageKey: data.data.pageKey
      };
    }

    throw new Error('Unexpected API response format');
  }

  /**
   * Public function for getting token balances for a given wallet address.
   *
   * @param address string
   * @returns TokenFormatted[]
   */
  public async getTokenBalance(address: string): Promise<TokenFormatted[]> {
    if (!address) {
      throw new Error('Missing wallet address');
    }

    const allTokenBalances: TokenFormatted[] = [];
    let currentPageKey: string | undefined = undefined;
    let pageCount = 0;

    try {
      // Fetch all pages of token balances
      do {

        const pageResult = await this.fetchTokenBalancePage(address, currentPageKey);

        // Convert hex balances to decimal and add to each token balance object
        const tokenBalances = pageResult.tokens.map(token => {
          const balanceDecimal = this.convertHexToDecimal(token.tokenBalance);
          const balance = this.formatValue(balanceDecimal, token.tokenMetadata.decimals);
          const price = token.tokenPrices.length ? token.tokenPrices[0] : {
              currency: 'usd',
              value: '0',
              lastUpdatedAt: ''
            } as TokenPrice;

          return {
            address: token.tokenAddress,
            balance,
            metadata: token.tokenMetadata,
            price,
            value: parseFloat(price.value) * balance
          }
        });

        // Add to our collection
        allTokenBalances.push(...tokenBalances);

        // Update pageKey for next iteration
        currentPageKey = pageResult.pageKey;
        pageCount++;

        console.log(`Page ${pageCount} fetched: ${tokenBalances.length} tokens`);

      } while (currentPageKey && pageCount < 10);

      // Filter out tokens with zero balances or insignificant value
      const nonZeroBalances = allTokenBalances.filter(token =>
        token.balance !== 0 &&
        token.price.value !== '0' &&
        token.value > 0.01
      ).sort((a, b) => b.value - a.value);

      // console.log(`Total pages fetched: ${pageCount}`);
      // console.log(`Total tokens found: ${allTokenBalances.length}`);
      // console.log(`Tokens with non-zero balances: ${nonZeroBalances.length}`);
      // console.log(nonZeroBalances);
      return nonZeroBalances;

    } catch (error) {
      console.error('Error fetching paginated token balances:', error);
      throw error;
    }
  }

  /**
  * Create a successful NextResponse with data
  */
  createSuccessResponse(data: TokenFormatted[]): NextResponse {
    return NextResponse.json(data);
  }

  /**
  * Handle errors and return appropriate NextResponse
  */
  handleError(error: unknown): NextResponse {
    console.error('AlchemyService error:', error);

    const errorMessage = error instanceof Error ? error.message : 'Server error';
    const statusCode = errorMessage === 'Missing wallet address' ? 400 : 500;

    return NextResponse.json({ error: errorMessage }, { status: statusCode });
  }

}
