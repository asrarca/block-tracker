import { NextRequest, NextResponse } from 'next/server';
import config from '../config';
import { Transaction } from '../types/Transaction';

// Type definitions for Etherscan API responses
interface EtherscanBaseResponse {
  status: string;
  message: string;
  result: string | Transaction[] | PriceResult;
}

export interface BalanceResult {
  address: string;
  balance: string;
  unit: string;
}

export interface PriceResult {
  ethbtc: string;
  ethbtc_timestamp: string;
  ethusd: string;
  ethusd_timestamp: string;
}

export class EtherscanService {
  private readonly defaultAddress = '0x461894DAAa5b97ae62448eDe13aA65637ee8328d';
  private readonly baseUrl = config.ETHERSCAN_API_URL;
  private readonly apiKey = config.ETHERSCAN_API_KEY;

  /**
   * Extract wallet address from request parameters
   */
  extractAddress(req: NextRequest): string {
    const { searchParams } = new URL(req.url);
    return searchParams.get('address') || this.defaultAddress;
  }

  /**
   * Extract chain ID from request parameters
   */
  extractChainId(req: NextRequest): string {
    const { searchParams } = new URL(req.url);
    return searchParams.get('chainid') || '1';
  }

  /**
   * Validate wallet address
   */
  validateAddress(address: string): void {
    if (!address) {
      throw new Error('Missing wallet address');
    }
  }

  /**
   * Build Etherscan API URL with parameters
   */
  private buildUrl(params: Record<string, string>, chainId: string = '1'): string {
    if (!this.apiKey) {
      throw new Error('Etherscan API key is not configured');
    }

    const urlParams = new URLSearchParams({
      chainid: chainId,
      apikey: this.apiKey,
      ...params
    });

    return `${this.baseUrl}?${urlParams.toString()}`;
  }

  /**
   * Make request to Etherscan API
   */
  private async fetchFromAPI(url: string): Promise<EtherscanBaseResponse> {
    const response = await fetch(url, {
      next: { revalidate: 120 }, // Cache for 120 seconds
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  }

  /**
   * Handle Etherscan API response for balance (string result)
   */
  private handleBalanceResponse(data: EtherscanBaseResponse, errorMessage: string): string {
    if (data.status !== '1') {
      throw new Error(errorMessage);
    }
    return data.result as string;
  }

  /**
   * Handle Etherscan API response for transactions (array result)
   */
  private handleTransactionsResponse(data: EtherscanBaseResponse, errorMessage: string): Transaction[] {
    if (data.status !== '1') {
      console.error(errorMessage);
    }
    return data.result as Transaction[];
  }

  /**
   * Handle Etherscan API response for price (PriceResult object)
   */
  private handlePriceResponse(data: EtherscanBaseResponse, errorMessage: string): PriceResult {
    if (data.status !== '1') {
      throw new Error(errorMessage);
    }

    return data.result as PriceResult;
  }

  /**
   * Handle errors and return appropriate NextResponse
   */
  handleError(error: unknown): NextResponse {
    console.error('EtherscanService error:', error);

    const errorMessage = error instanceof Error ? error.message : 'Server error';
    const statusCode = errorMessage === 'Missing wallet address' ? 400 : 500;

    return NextResponse.json({ error: errorMessage }, { status: statusCode });
  }

  /**
   * Get wallet balance
   */
  async getBalance(address: string, chainId: string = '1'): Promise<BalanceResult> {
    this.validateAddress(address);

    const url = this.buildUrl({
      module: 'account',
      action: 'balance',
      address,
      tag: 'latest'
    }, chainId);

    const data = await this.fetchFromAPI(url);
    const result = this.handleBalanceResponse(data, 'Failed to fetch wallet balance');

    // Convert Wei to native currency
    const balanceInNative = parseFloat(result) / 1e18;

    // Get the correct unit for the chain
    const chainInfo = config.CHAINS[parseInt(chainId) as keyof typeof config.CHAINS];
    const unit = chainInfo ? chainInfo.unit : '?';

    return {
      address,
      balance: balanceInNative.toFixed(6),
      unit
    };
  }

  /**
   * Get wallet transactions
   */
  async getTransactions(address: string, chainId: string = '1', page = '1', offset = '1000'): Promise<Transaction[]> {
    this.validateAddress(address);

    const url = this.buildUrl({
      module: 'account',
      action: 'txlist',
      address,
      startblock: '0',
      endblock: '99999999',
      page,
      offset,
      sort: 'DESC'
    }, chainId);

    const data = await this.fetchFromAPI(url);

    return this.handleTransactionsResponse(data, 'Failed to fetch wallet transactions');
  }

  async getEtherPrice() {
    const url = this.buildUrl({
      module: 'stats',
      action: 'ethprice',
    });

    const data = await this.fetchFromAPI(url);

    return this.handlePriceResponse(data, 'Failed to fetch Ethereum price');
  };

  /**
   * Create a successful NextResponse with data
   */
  createSuccessResponse(data: BalanceResult | Transaction[] | PriceResult): NextResponse {
    return NextResponse.json(data);
  }
}
