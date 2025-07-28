import { NextRequest, NextResponse } from 'next/server';
import config from '../config';
import { Transaction } from '../types/Transaction';

// Type definitions for Etherscan API responses
interface EtherscanBaseResponse {
  status: string;
  message: string;
  result: string | Transaction[];
}

interface BalanceResult {
  address: string;
  balance: string;
  unit: string;
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
  private buildUrl(params: Record<string, string>): string {
    const urlParams = new URLSearchParams({
      chainid: '1',
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
      next: { revalidate: 60 }, // Cache for 60 seconds
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
      throw new Error(errorMessage);
    }
    return data.result as Transaction[];
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
  async getBalance(address: string): Promise<BalanceResult> {
    this.validateAddress(address);

    const url = this.buildUrl({
      module: 'account',
      action: 'balance',
      address,
      tag: 'latest'
    });

    const data = await this.fetchFromAPI(url);
    const result = this.handleBalanceResponse(data, 'Failed to fetch wallet balance');

    // Convert Wei to ETH
    const balanceInEth = parseFloat(result) / 1e18;

    return {
      address,
      balance: balanceInEth.toFixed(6),
      unit: 'ETH'
    };
  }

  /**
   * Get wallet transactions
   */
  async getTransactions(address: string, page = '1', offset = '0'): Promise<Transaction[]> {
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
    });

    const data = await this.fetchFromAPI(url);
    return this.handleTransactionsResponse(data, 'Failed to fetch wallet transactions');
  }

  /**
   * Create a successful NextResponse with data
   */
  createSuccessResponse(data: BalanceResult | Transaction[]): NextResponse {
    return NextResponse.json(data);
  }
}
