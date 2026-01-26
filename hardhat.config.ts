import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

const PRIVATE_KEY = "ad622e40696eeb98115816682d004bfda83d2555d87b664e8a56aa4bb787b7fe";

const config: HardhatUserConfig = {
  solidity: "0.8.28",
  networks: {
    amoy: {
      url: "https://rpc-amoy.polygon.technology",
      accounts: [PRIVATE_KEY],
    },
  },
};

export default config;