'use client';
import React, { useState } from 'react'
import TransactionTable from './TransactionTable';
import { Transaction } from '../types/Transaction';
import config from '../config';

// Type definitions for API responses
interface BalanceResponse {
  address: string;
  balance: string;
  unit: string;
}

interface WalletData extends BalanceResponse {
  transactions: Transaction[];
}

interface ApiErrorResponse {
  error: string;
}

const WalletSearch = () => {
  const [walletAddress, setWalletAddress] = useState<string>('');
  const [chainId, setChainId] = useState<string>('1'); // Default to Ethereum
  const [walletData, setWalletData] = useState<WalletData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async (): Promise<void> => {
    if (!walletAddress.trim()) {
      setError('Please enter a wallet address');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // use Promise.all for concurrent API calls
      const [balanceResponse, transactionsResponse] = await Promise.all([
        fetch(`/api/wallet/balance?address=${walletAddress}&chainid=${chainId}`),
        fetch(`/api/wallet/transactions?address=${walletAddress}&chainid=${chainId}`)
      ]);

      if (!balanceResponse.ok || !transactionsResponse.ok) {
        throw new Error('Failed to fetch wallet data');
      }

      // parse responses concurrently
      const [balanceData, transactionsData] = await Promise.all([
        balanceResponse.json() as Promise<BalanceResponse | ApiErrorResponse>,
        transactionsResponse.json() as Promise<Transaction[] | ApiErrorResponse>
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
        transactions: transactionsData as Transaction[]
      };

      setWalletData(combinedData);
      console.log(combinedData);

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


  return (
    <div>
      <div className="my-5">
        <input 
          type="text" 
          placeholder="Enter wallet address" 
          className="input mr-1" 
          value={walletAddress}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setWalletAddress(e.target.value)}
          disabled={loading}
        />
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
          className="btn btn-primary" 
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
          <p>Address: {walletData.address}</p>
          <p>Balance: {walletData.balance} {walletData.unit}</p>
          {walletData.transactions && walletData.transactions.length > 0 && (
            <div>
              <h2>Transactions</h2>
              <TransactionTable txs={walletData.transactions}/>
            </div>
          )}
        </div>
      )}      

    </div>
  )
}

export default WalletSearch;
