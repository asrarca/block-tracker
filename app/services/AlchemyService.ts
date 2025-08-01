import { NextRequest, NextResponse } from 'next/server';
import config from '../config';
import { TokenBalance } from '../types/TokenBalance';

interface AlchemyBaseResponse {
	jsonrpc: string;
	id: string;
	result: {
		address: string;
		tokenBalances: TokenBalance[];
		pageKey?: string;
	} | string | TokenMetaData;
}

interface TokenMetaData {
	name: string;
	symbol: string;
	decimals: string;
	logo: string;
};

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

  /**
   * Make request to Alchemy API
   */
  private async fetchFromAPI(options: object): Promise<AlchemyBaseResponse> {
		const url = config.ALCHEMY_API_URL;
    options.next = {
      revalidate: 10
    };

		const response = await fetch(url, options);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  }

  /**
   * Fetch a single page of token balances from Alchemy API
   */
  private async fetchTokenBalancePage(address: string, pageKey?: string): Promise<{ tokenBalances: TokenBalance[], pageKey?: string }> {
    const params: (string | { maxCount: number; pageKey?: string })[] = [address, "erc20"];
    
    // Add options object with maxCount and optional pageKey
    const options: { maxCount: number; pageKey?: string } = { maxCount: 100 };
    if (pageKey) {
      options.pageKey = pageKey;
    }
    params.push(options);
    console.log('params');
    console.log(params);

    const requestOptions = {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        jsonrpc: "2.0",
        method: "alchemy_getTokenBalances",
        params: params,
        id: 1
      })
    };

    const data = await this.fetchFromAPI(requestOptions);

    if (typeof data.result === 'object' && data.result !== null && 'tokenBalances' in data.result) {
      return {
        tokenBalances: data.result.tokenBalances,
        pageKey: data.result.pageKey
      };
    }
    
    throw new Error('Unexpected API response format');
  }

  async getTokenBalance(address: string): Promise<TokenBalance[]> {
		if (!address) {
			throw new Error('Missing wallet address');
		}

		const allTokenBalances: TokenBalance[] = [];
		let currentPageKey: string | undefined = undefined;
		let pageCount = 0;

		try {
			// Fetch all pages of token balances
			do {
				console.log(`Fetching token balances page ${pageCount + 1}${currentPageKey ? ` with pageKey: ${currentPageKey}` : ''}`);
				console.log("\n\nhey there\n\n");
				
				const pageResult = await this.fetchTokenBalancePage(address, currentPageKey);

				// Convert hex balances to decimal and add to each token balance object
				const tokenBalancesWithDecimal = pageResult.tokenBalances.map(token => ({
					contractAddress: token.contractAddress,
					tokenBalance: token.tokenBalance,
					tokenBalanceDecimal: this.convertHexToDecimal(token.tokenBalance)
				}));

				// Add to our collection
				allTokenBalances.push(...tokenBalancesWithDecimal);
				
				// Update pageKey for next iteration
				currentPageKey = pageResult.pageKey;
				pageCount++;
				
				console.log(`Page ${pageCount} fetched: ${tokenBalancesWithDecimal.length} tokens`);
				
			} while (currentPageKey);

			// Filter out tokens with zero balances
			const nonZeroBalances = allTokenBalances.filter(token => 
				token.tokenBalanceDecimal !== '0' && 
				token.tokenBalance !== '0x0' && 
        token.tokenBalance !== '0x0000000000000000000000000000000000000000000000000000000000000000' && 
				token.tokenBalance !== '0x'
			);

			console.log(`Total pages fetched: ${pageCount}`);
			console.log(`Total tokens found: ${allTokenBalances.length}`);
			console.log(`Tokens with non-zero balances: ${nonZeroBalances.length}`);
      console.log(nonZeroBalances);
			return nonZeroBalances;

		} catch (error) {
			console.error('Error fetching paginated token balances:', error);
			throw error;
		}
	}

	/**
	 * Create a successful NextResponse with data
	 */
	createSuccessResponse(data: TokenBalance[] | TokenMetaData): NextResponse {
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
