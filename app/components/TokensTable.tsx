import React, { ReactElement } from 'react'
import { TokenBalance } from '../types/TokenBalance';
import { TokenMetaData } from '@/app/types/TokenMetaData';
import Image from 'next/image';
import PaginatedTable from './PaginatedTable';

interface TokensTableProps {
  tokenBalances: TokenBalance[];
  tokensCache: Map<string, TokenMetaData>;
}

const TokensTable: React.FC<TokensTableProps> = ({ tokenBalances, tokensCache }) => {

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

  const renderHeader = () => (
    <thead>
      <tr>
        <th></th>
        <th>Token</th>
        <th className="text-right">Balance</th>
      </tr>
    </thead>
  )

  const renderBody = (currentTokens: TokenBalance[]) => (
    <tbody>
      {currentTokens.map((token, index) => getTokenRow(token, index))}
    </tbody>
  );

  return (
    <PaginatedTable
      data={tokenBalances}
      pageSize={10}
      renderHeader={() => renderHeader()}
      renderBody={(currentData) => renderBody(currentData)}
      itemName="tokens"
    />
  )
}

export default TokensTable;
