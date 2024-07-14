require("@nomicfoundation/hardhat-toolbox");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.19",
  networks: {
    hardhat: {},
    // Add any test networks you want to deploy to
     sepolia: {
        url: "https://eth-sepolia.g.alchemy.com/v2/PB3yhtEtlXCnVH-Ice8zZc0UdmJRMRnw",
        accounts: ["0xb3bcbe0fd30706e47330620a292c669b85c89487ce9886e998a463d2c3f3962f"]
    }
  },
};
