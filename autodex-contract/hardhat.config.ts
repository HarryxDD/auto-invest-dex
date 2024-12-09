/**
 * Import libraries
 */
import dotenv from "dotenv";
import { extendEnvironment, HardhatUserConfig } from "hardhat/config";
import Web3 from "web3";
import "@nomicfoundation/hardhat-toolbox";
import "tsconfig-paths/register";
import "@openzeppelin/hardhat-upgrades";
/**
 * Config dotenv first
 */
dotenv.config();

/**
 * Default hardhat configs
 */
const config: HardhatUserConfig = {
  solidity: {
    compilers: [
      {
        version: "0.8.19",
        settings: {
          viaIR: true,
          optimizer: {
            enabled: true,
            runs: 9999999,
          },
        },
      },
    ],
  },
};

/**
 * Extract env vars
 */
const privateKey = process.env.PRIVATE_KEY || "";

/**
 * If private key is available, attach network configs
 */
if (privateKey) {
  config.networks = {
    avaxc: {
      url: "https://rpc.ankr.com/avalanche",
      accounts: [privateKey],
      gas: "auto",
      gasPrice: "auto",
      chainId: 43114,
    },
  };
}

/**
 * Load etherscan key
 */
const etherscanKey = process.env.ETHERSCAN_KEY || "";

if (etherscanKey) {
  config.etherscan = {
    apiKey: etherscanKey,
  };
}

export default config;

extendEnvironment((hre) => {
  (hre as any).Web3 = Web3;

  // hre.network.provider is an EIP1193-compatible provider.
  (hre as any).web3 = new Web3(hre.network.provider);
});
