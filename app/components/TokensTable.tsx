import React, { useState, useMemo, ReactElement } from 'react'
import { TokenBalance } from '../types/TokenBalance';
import { TokenMetaData } from '@/app/types/TokenMetaData';
import Image from 'next/image';

interface TokensTableProps {
  tokens: TokenBalance;
  tokensCache: Map<string, TokenMetaData>;
}

const TokensTable: React.FC<TokensTableProps[]> = ({ tokens, tokensCache }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Calculate pagination values
  const totalPages = Math.ceil(tokens.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const currentTokens = tokens.slice(startIndex, endIndex);

  // Calculate which page numbers to show (5 pages centered around current page)
  const getPageNumbers = useMemo(() => {
    const pages: number[] = [];
    let startPage = Math.max(1, currentPage - 2);
    let endPage = Math.min(totalPages, currentPage + 2);

    // Adjust if we're near the beginning or end
    if (endPage - startPage < 4) {
      if (startPage === 1) {
        endPage = Math.min(totalPages, startPage + 4);
      } else if (endPage === totalPages) {
        startPage = Math.max(1, endPage - 4);
      }
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  }, [currentPage, totalPages]);

  // Navigation functions
  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const goToFirst = () => goToPage(1);
  const goToPrevious = () => goToPage(currentPage - 1);
  const goToNext = () => goToPage(currentPage + 1);
  const goToLast = () => goToPage(totalPages);

  // Helper function to format value from wei to ETH
  const formatValue = (value: number, decimals: number, precision = 8): string => {
    const ethValue = value / Math.pow(10, decimals);
    return ethValue.toFixed(precision);
  };

  const getTokenData = (address: string): TokenMetaData => {
    const t = tokensCache.get(address);
    if  (t) {
      return t;
    }
    return {
      chainId: 1,
      address,
      logoURI: 'placeholder-100.svg',
      name: 'Unkown Token',
      symbol: '',
      decimals: '18'
    } as TokenMetaData;
  }

  const getTokenRow = (token: TokenBalance, index: number): ReactElement<HTMLTableRowElement> => {
    const t = getTokenData(token.contractAddress);
    return (
      <tr key={token.contractAddress + index}>
        <td>
          <div className="h-[50px] w-[50px] relative">
            <Image src={t.logoURI} alt={t.name} className="w-full h-full rounded-full object-cover" width="50" height="50" />
          </div>
        </td>
        <td>
          <div>
            <div className="font-medium text-base">{t.name}</div>
            <div className="text-sm text-gray-500">{token.contractAddress}</div>
          </div>
        </td>
        <td>
          <div className="text-right">
          {formatValue(parseFloat(token.tokenBalanceDecimal), parseInt(t.decimals))}
          </div>
        </td>
      </tr>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="table table-zebra w-full">
        <thead>
          <tr>
            <th></th>
            <th>Token</th>
            <th className="text-right">Balance</th>
          </tr>
        </thead>
        <tbody>
          {currentTokens.map((token, index) => getTokenRow(token, index))}
        </tbody>
      </table>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center mt-4 space-x-1">
          {/* First Button */}
          <button
            onClick={goToFirst}
            disabled={currentPage === 1}
            className={`btn btn-sm ${currentPage === 1 ? 'btn-disabled' : 'btn-outline'}`}
          >
            First
          </button>

          {/* Previous Button */}
          <button
            onClick={goToPrevious}
            disabled={currentPage === 1}
            className={`btn btn-sm ${currentPage === 1 ? 'btn-disabled' : 'btn-outline'}`}
          >
            Previous
          </button>

          {/* Page Numbers */}
          {getPageNumbers.map((pageNum) => (
            <button
              key={pageNum}
              onClick={() => goToPage(pageNum)}
              disabled={pageNum === currentPage}
              className={`btn btn-sm ${
                pageNum === currentPage 
                  ? 'btn-primary font-bold cursor-default' 
                  : 'btn-outline'
              }`}
            >
              {pageNum}
            </button>
          ))}

          {/* Next Button */}
          <button
            onClick={goToNext}
            disabled={currentPage === totalPages}
            className={`btn btn-sm ${currentPage === totalPages ? 'btn-disabled' : 'btn-outline'}`}
          >
            Next
          </button>

          {/* Last Button */}
          <button
            onClick={goToLast}
            disabled={currentPage === totalPages}
            className={`btn btn-sm ${currentPage === totalPages ? 'btn-disabled' : 'btn-outline'}`}
          >
            Last
          </button>
        </div>
      )}

      {/* Page Info */}
      {totalPages > 1 && (
        <div className="text-center mt-2 text-sm text-gray-600">
          Showing {startIndex + 1}-{Math.min(endIndex, tokens.length)} of {tokens.length} transactions
        </div>
      )}
    </div>
  )
}

export default TokensTable;
