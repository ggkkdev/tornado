import "@nomiclabs/hardhat-ethers"
import {HardhatUserConfig} from "hardhat/config";
import '@nomicfoundation/hardhat-toolbox';
/** @type import('hardhat/config').HardhatUserConfig */
const config: HardhatUserConfig = {
  solidity: "0.8.19",
  typechain: {
    outDir: "typechain",
    target: "ethers-v6",
  },
};

export default config;
