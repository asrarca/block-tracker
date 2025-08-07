import React, { ReactElement } from 'react'
import { TokenFormatted } from '../services/AlchemyService';
import Image from 'next/image';
import PaginatedTable from './PaginatedTable';

interface TokensTableProps {
  tokens: TokenFormatted[];
}

const TokensTable: React.FC<TokensTableProps> = ({ tokens }) => {

  // Helper function to format value from wei to ETH
  const formatValue = (value: number, decimals: number): number => {
    const ethValue = value / Math.pow(10, decimals);
    return ethValue;
  };

  const formatValueUsd = (balance: number, price: number|string): string => {
    if (typeof price == 'string') {
      price = parseFloat(price);
    }
    // Calculate the total USD value
    const usdValue = balance * price;

    // Determine sensible decimal places based on value
    let decimals;
    if (usdValue >= 100) {
      decimals = 2;
    } else if (usdValue >= 1) {
      decimals = 4;
    } else if (usdValue >= 0.01) {
      decimals = 6;
    } else if (usdValue >= 0.0001) {
      decimals = 8;
    } else {
      decimals = 12;
    }

    return usdValue.toFixed(decimals);
  }

  const getTokenRow = (token: TokenFormatted, index: number): ReactElement<HTMLTableRowElement> => {
    const imageUrl = token.metadata.logo ||  '/placeholder-100.svg';
    const tokenBalance = formatValue(parseFloat(token.balance), parseInt(token.metadata.decimals));
    const tokenPrice = token.price.value;
    return (
      <tr key={index}>
        <td>
          <div className="h-[50px] w-[50px] relative">
            <Image src={imageUrl} alt={token.metadata.symbol} className="w-full h-full rounded-full object-cover" width="50" height="50" />
          </div>
        </td>
        <td>
          <div>
            <div className="font-medium text-base">{token.metadata.name}</div>
            <div className="text-sm text-gray-500">{token.address}</div>
          </div>
        </td>
        <td>
          <div className="text-right">
            $ {formatValueUsd(1, tokenPrice)}
          </div>
        </td>
        <td>
          <div className="text-right">
            {tokenBalance.toFixed(4)} {token.metadata.symbol}
          </div>
        </td>
        <td>
          <div className="text-right">
           $ {formatValueUsd(tokenBalance, tokenPrice)}
          </div>
        </td>
      </tr>
    );
  }

  const renderHeader = () => (
    <thead>
      <tr>
        <th></th>
        <th>Token</th>
        <th className="text-right">Price (USD)</th>
        <th className="text-right">Balance</th>
        <th className="text-right">Value (USD)</th>
      </tr>
    </thead>
  )

  const renderBody = (tokens: TokenFormatted[]) => (
    <tbody>
      {tokens.map((token, index) => getTokenRow(token, index))}
    </tbody>
  );

  return (
    <PaginatedTable
      data={tokens}
      pageSize={10}
      renderHeader={() => renderHeader()}
      renderBody={(data) => renderBody(data)}
      itemName="tokens"
    />
  )
}

export default TokensTable;
