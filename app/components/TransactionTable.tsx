import React from 'react'
import { Transaction } from '../types/Transaction';
import PaginatedTable from './PaginatedTable';

interface TransactionTableProps {
  txs: Transaction[];
  unit: string
}

const TransactionTable: React.FC<TransactionTableProps> = ({ txs, unit }) => {

  // Helper function to format timestamp
  const formatTimestamp = (timestamp: string): string => {
    const date = new Date(parseInt(timestamp) * 1000);
    return date.toLocaleString();
  };

  // Helper function to format value from wei to ETH
  const formatValue = (value: number, precision = 8): string => {
    const ethValue = value / Math.pow(10, 18);
    return ethValue.toFixed(precision);
  };

  // Helper function to truncate hash/address for display
  const truncateHash = (hash: string, length: number = 10): string => {
    if (hash.length <= length) return hash;
    return `${hash.slice(0, length)}...${hash.slice(-4)}`;
  };

  const renderHeader = () => {
    <thead>
      <tr>
        <th>Hash</th>
        <th>From</th>
        <th>To</th>
        <th>Value</th>
        <th>Tx Fee</th>
        <th>Timestamp</th>
        <th>Status</th>
      </tr>
    </thead>
  }

  const renderBody = (currentTransactions: Transaction[]) => (
    <tbody>
      {currentTransactions.map((tx, index) => (
        <tr key={tx.hash + index}>
          <td>
            <a
              href={`https://etherscan.io/tx/${tx.hash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="link link-primary"
            >
              {truncateHash(tx.hash)}
            </a>
          </td>
          <td>
            <a
              href={`https://etherscan.io/address/${tx.from}`}
              target="_blank"
              rel="noopener noreferrer"
              className="link"
            >
              {truncateHash(tx.from)}
            </a>
          </td>
          <td>
            <a
              href={`https://etherscan.io/address/${tx.to}`}
              target="_blank"
              rel="noopener noreferrer"
              className="link"
            >
              {truncateHash(tx.to)}
            </a>
          </td>
          <td>{formatValue(parseInt(tx.value), 4)} {unit}</td>
          <td>{formatValue(parseInt(tx.gasUsed) * parseInt(tx.gasPrice))}</td>
          <td>{formatTimestamp(tx.timeStamp)}</td>
          <td>
            <span className={`badge ${tx.isError === '0' ? 'badge-success' : 'badge-error'}`}>
              {tx.isError === '0' ? 'Success' : 'Failed'}
            </span>
          </td>
        </tr>
      ))}
    </tbody>
  );

  return (
    <PaginatedTable
      data={txs}
      pageSize={10}
      renderHeader={() => renderHeader()}
      renderBody={(currentData) => renderBody(currentData)}
      itemName="transactions"
    />
  )
}

export default TransactionTable;
