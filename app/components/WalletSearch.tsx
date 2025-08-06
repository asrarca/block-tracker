'use client';
import React, { useState, useEffect, useRef } from 'react'
import TransactionTable from './TransactionTable';
import TokensTable from './TokensTable';
import { Transaction } from '../types/Transaction';
import { TokenBalance } from '../types/TokenBalance';
import config from '../config';
import { TokenMetaData } from '@/app/types/TokenMetaData';

// Type definitions for API responses
interface BalanceResponse {
  address: string;
  balance: string;
  unit: string;
}

interface WalletData extends BalanceResponse {
  transactions: Transaction[];
  tokens: TokenBalance[];
}

interface ApiErrorResponse {
  error: string;
}

interface SearchHistoryItem {
  address: string;
  timestamp: number;
}
interface PriceResult {
  ethbtc: string;
  ethbtc_timestamp: string;
  ethusd: string;
  ethusd_timestamp: string;
}

interface WalletSearchProps {
  price: PriceResult;
  tokensCache: Map<string, TokenMetaData>;
}


const WalletSearch: React.FC<WalletSearchProps> = ({ price, tokensCache }) => {
  const [walletAddress, setWalletAddress] = useState<string>('');
  const [chainId, setChainId] = useState<string>('1'); // Default to Ethereum
  const [walletData, setWalletData] = useState<WalletData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [searchHistory, setSearchHistory] = useState<SearchHistoryItem[]>([]);
  const [showDropdown, setShowDropdown] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // localStorage utility functions
  const saveSearchToHistory = (address: string): void => {
    const newItem: SearchHistoryItem = {
      address: address.trim(),
      timestamp: Date.now()
    };

    const existingHistory = getSearchHistory();
    // Remove duplicate addresses and add new item at the beginning
    const updatedHistory = [newItem, ...existingHistory.filter(item => item.address !== address.trim())];
    // Keep only the last 10 items
    const trimmedHistory = updatedHistory.slice(0, 10);

    localStorage.setItem('walletSearchHistory', JSON.stringify(trimmedHistory));
    setSearchHistory(trimmedHistory);
  };

  // Helper function to truncate hash/address for display
  const truncateHash = (hash: string, length: number = 10): string => {
    if (hash.length <= length) return hash;
    return `${hash.slice(0, length)}...${hash.slice(-4)}`;
  };

  const getSearchHistory = (): SearchHistoryItem[] => {
    try {
      const stored = localStorage.getItem('walletSearchHistory');
      if (stored) {
        const parsed = JSON.parse(stored) as SearchHistoryItem[];
        return parsed.sort((a, b) => b.timestamp - a.timestamp);
      }
    } catch (error) {
      console.error('Error loading search history:', error);
    }
    return [];
  };

  const formatTimeAgo = (timestamp: number): string => {
    const now = Date.now();
    const diffInSeconds = Math.floor((now - timestamp) / 1000);

    if (diffInSeconds < 60) {
      return 'Just now';
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes} minute${minutes === 1 ? '' : 's'} ago`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours} hour${hours === 1 ? '' : 's'} ago`;
    } else if (diffInSeconds < 2592000) {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days} day${days === 1 ? '' : 's'} ago`;
    } else {
      const months = Math.floor(diffInSeconds / 2592000);
      return `${months} month${months === 1 ? '' : 's'} ago`;
    }
  };

  // Event handlers
  const handleInputFocus = (): void => {
    const history = getSearchHistory();
    setSearchHistory(history);
    if (history.length > 0) {
      setShowDropdown(true);
    }
  };

  const handleInputBlur = (): void => {
    // Delay hiding dropdown to allow for clicks
    setTimeout(() => setShowDropdown(false), 150);
  };

  const selectHistoryItem = (address: string): void => {
    setWalletAddress(address);
    setShowDropdown(false);
  };

  // Load search history on component mount
  useEffect(() => {
    const history = getSearchHistory();
    setSearchHistory(history);
  }, []);

  // Handle click outside dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchData = async (): Promise<void> => {
    if (!walletAddress.trim()) {
      setError('Please enter a wallet address');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // use Promise.all for concurrent API calls
      const [balanceResponse, transactionsResponse, tokensResponse] = await Promise.all([
        fetch(`/api/wallet/balance?address=${walletAddress}&chainid=${chainId}`),
        fetch(`/api/wallet/transactions?address=${walletAddress}&chainid=${chainId}`),
        fetch(`/api/wallet/tokens?address=${walletAddress}`),
      ]);

      if (!balanceResponse.ok || !transactionsResponse.ok) {
        throw new Error('Failed to fetch wallet data');
      }

      // parse responses concurrently
      const [balanceData, transactionsData, tokensData] = await Promise.all([
        balanceResponse.json() as Promise<BalanceResponse | ApiErrorResponse>,
        transactionsResponse.json() as Promise<Transaction[] | ApiErrorResponse>,
        tokensResponse.json() as Promise<TokenBalance[] | ApiErrorResponse>
      ]);

      if ('error' in balanceData) {
        throw new Error(balanceData.error);
      }
      if ('error' in transactionsData) {
        throw new Error(transactionsData.error);
      }

      // all good
      const combinedData: WalletData = {
        ...balanceData,
        tokens: tokensData as TokenBalance[],
        transactions: transactionsData as Transaction[]
      };

      setWalletData(combinedData);

      // Save successful search to history
      saveSearchToHistory(walletAddress);

    } catch (err) {
      console.error('Error fetching wallet data:', err);
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
      setWalletData(null);
    } finally {
      setLoading(false);
    }
  };

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>): void => {
    event.preventDefault();
    fetchData();
  };

  const balanceInUsd = (balance_eth: string): string => {
    const priceInUsd = parseFloat(balance_eth) * parseFloat(price.ethusd);
    const formattedUsd = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(priceInUsd);
    return formattedUsd;
  };

  return (
    <div>
      <div className="my-5">
        <div className="relative inline-block" ref={dropdownRef}>
          <input
            type="text"
            placeholder="Enter wallet address"
            className="input mr-1 w-96 font-mono"
            value={walletAddress}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setWalletAddress(e.target.value)}
            onFocus={handleInputFocus}
            onBlur={handleInputBlur}
            disabled={loading}
          />
          {showDropdown && searchHistory.length > 0 && (
            <div className="absolute top-full left-0 right-0 border border-base-400 rounded-md shadow-lg z-10 max-h-60 overflow-y-auto">
              {searchHistory.slice(0, 5).map((item, index) => (
                <div
                  key={`${item.address}-${item.timestamp}`}
                  className="flex justify-between items-center px-3 py-2 bg-base-100 hover:bg-base-300 cursor-pointer border-b border-base-300 last:border-b-0"
                  onClick={() => selectHistoryItem(item.address)}
                >
                  <span className="text-sm font-mono truncate flex-1 mr-2">
                    {truncateHash(item.address)}
                  </span>
                  <span className="text-xs text-base-content/60 whitespace-nowrap">
                    {formatTimeAgo(item.timestamp)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
        <select
          className="select mr-1"
          value={chainId}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setChainId(e.target.value)}
          disabled={loading}
        >
          {Object.entries(config.CHAINS).map(([id, chain]) => (
            <option key={id} value={id}>
              {chain.name}
            </option>
          ))}
        </select>
        <button
          className="btn btn-primary rounded-md"
          onClick={handleClick}
          disabled={loading || !walletAddress.trim()}
        >
          {loading ? 'Loading...' : 'Go'}
        </button>
      </div>

      {error && (
        <div className="alert alert-error mb-4">
          <p>{error}</p>
        </div>
      )}

      {walletData && (
        <div>
          <p className="ml-3 text-md font-bold font-mono pb-3">{walletData.address}</p>
          <hr className="border-gray-400" />
          <div role="tablist" className="tabs tabs-border">
            <input type="radio" name="my_tabs_2" className="tab" aria-label="Balance" defaultChecked={true} />
            <div className="tab-content border-base-300 bg-base-100 p-10">
              <div className="mt-3 text-xl">
                <p>{walletData.balance} {walletData.unit}</p>
                <p>{balanceInUsd(walletData.balance)}</p>
              </div>
            </div>

            <input type="radio" name="my_tabs_2" className="tab" aria-label={`Transactions (${walletData.transactions.length})`} />
            <div className="tab-content border-base-300 bg-base-100 p-10">
              {walletData.transactions && walletData.transactions.length > 0 && (
                <TransactionTable txs={walletData.transactions} unit={walletData.unit}/>
              )}
            </div>

            <input type="radio" name="my_tabs_2" className="tab" aria-label={`Tokens (${walletData.tokens.length})`} />
            <div className="tab-content border-base-300 bg-base-100 p-10">
              {walletData.tokens && walletData.tokens.length > 0 && (
                <TokensTable tokenBalances={walletData.tokens} tokensCache={tokensCache}/>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  )
}

export default WalletSearch;
