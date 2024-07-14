// src/App.jsx
import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import './App.css';
import contractABI from './contracts/MultiSigWallet.json';

const contractAddress = '0xfD0A8A18CFe3A95b9A5168a6C4FfD5B03381e685'; // Replace with your deployed contract address

function App() {
  const [signers, setSigners] = useState(['', '', '']);
  const [txData, setTxData] = useState({ to: '', value: '', data: '' });
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [contract, setContract] = useState(null);
  const [txId, setTxId] = useState(null);

  useEffect(() => {
    if (window.ethereum) {
      const newProvider = new ethers.providers.Web3Provider(window.ethereum);
      setProvider(newProvider);
    } else {
      console.error("Please install MetaMask!");
    }
  }, []);

  const connectWallet = async () => {
    if (provider) {
      await provider.send("eth_requestAccounts", []);
      const newSigner = provider.getSigner();
      const newContract = new ethers.Contract(contractAddress, contractABI, newSigner);
      setSigner(newSigner);
      setContract(newContract);
    }
  };

  const handleInputChange = (index, value) => {
    const newSigners = [...signers];
    newSigners[index] = value;
    setSigners(newSigners);
  };

  const handleTxDataChange = (key, value) => {
    setTxData({ ...txData, [key]: value });
  };

  const createTransaction = async () => {
    if (contract) {
      try {
        const tx = await contract.createTransaction(txData.to, ethers.utils.parseEther(txData.value), txData.data);
        const receipt = await tx.wait();
        console.log("Transaction created:", receipt);
        setTxId(receipt.transactionHash);
      } catch (error) {
        console.error("Error creating transaction:", error);
      }
    }
  };

  const signTransaction = async () => {
    if (contract && txId) {
      try {
        const tx = await contract.signTransaction(txId);
        const receipt = await tx.wait();
        console.log("Transaction signed:", receipt);
      } catch (error) {
        console.error("Error signing transaction:", error);
      }
    }
  };

  const executeTransaction = async () => {
    if (contract && txId) {
      try {
        const tx = await contract.executeTransaction(txId);
        const receipt = await tx.wait();
        console.log("Transaction executed:", receipt);
      } catch (error) {
        console.error("Error executing transaction:", error);
      }
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>MultiSig Wallet</h1>
        <button onClick={connectWallet}>Connect Wallet</button>
        <div>
          <h2>Signers</h2>
          {signers.map((signer, index) => (
            <input
              key={index}
              type="text"
              value={signer}
              onChange={(e) => handleInputChange(index, e.target.value)}
              placeholder={`Signer ${index + 1}`}
            />
          ))}
        </div>
        <div>
          <h2>Transaction Data</h2>
          <input
            type="text"
            value={txData.to}
            onChange={(e) => handleTxDataChange('to', e.target.value)}
            placeholder="To Address"
          />
          <input
            type="text"
            value={txData.value}
            onChange={(e) => handleTxDataChange('value', e.target.value)}
            placeholder="Value in Ether"
          />
          <input
            type="text"
            value={txData.data}
            onChange={(e) => handleTxDataChange('data', e.target.value)}
            placeholder="Data"
          />
        </div>
        <button onClick={createTransaction}>Create Transaction</button>
        <button onClick={signTransaction}>Sign Transaction</button>
        <button onClick={executeTransaction}>Execute Transaction</button>
      </header>
    </div>
  );
}

export default App;
