require("@nomicfoundation/hardhat-ethers");
require("@nomicfoundation/hardhat-ignition-ethers");

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  solidity: {
    compilers: [
      {
        version: "0.8.20",
      },
    ],
  },
  defaultNetwork: "radius",
  networks: {
    radius: {
      // This URL is the PArSEC agent Node endpoint
      // NOTE: "localhost" (instead of 127.0.0.1) may work on some systems
      url: "https://rpc.testnet.tryradi.us/62036b877e733bbcb08289075fc546fe4bce2658ec1537e4",
      // Private key corresponding to a wallet account
      accounts: ["82e5c2442f81da6d860398560743b041557608b1489310749e4867b89aff0c8f"]
    }
  }
};