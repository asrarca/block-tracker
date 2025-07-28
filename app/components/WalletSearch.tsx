'use client';
import React, { useState } from 'react'

const WalletSearch = () => {
  const [walletAddress, setWalletAddress] = useState('');
  const [walletData, setWalletData] = useState({});

  const fetchData = async () => {
    const response = await fetch('/api/wallet?address=' + walletAddress);
    const data = await response.json();
    setWalletData(data);
  };

  const handleClick = (event) => {
    event.preventDefault();
    fetchData();
  };

  return (
    <div>
      <div className="my-5">
        <input type="text" placeholder="Enter wallet address" className="input mr-1" onChange={(e) => setWalletAddress(e.target.value)}/>
        <button className="btn btn-primary" onClick={handleClick}>Go</button>
      </div>
      
      {walletData && (
        <div>
          <p>Address: {walletData.address}</p>
          <p>Balance: {walletData.balance} ETH</p>
        </div>
      )}      

    </div>
  )
}

export default WalletSearch;