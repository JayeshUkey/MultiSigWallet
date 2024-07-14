// scripts/deploy.js
const { ethers } = require("hardhat");

async function main() {
  // Signer addresses (replace with actual addresses)
  const signers = [
    "0xSignerAddress1",
    "0xSignerAddress2",
    "0xSignerAddress3"
  ];

  // The number of required signatures
  const requiredSignatures = 2;

  // Get the contract factory
  const MultiSigWallet = await ethers.getContractFactory("MultiSigWallet");

  // Deploy the contract
  const multiSigWallet = await MultiSigWallet.deploy(signers, requiredSignatures);

  // Wait for the contract to be deployed
  await multiSigWallet.deployed();

  console.log("MultiSigWallet deployed to:", multiSigWallet.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
