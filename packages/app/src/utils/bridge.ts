import ftmImage from "../assets/img/chains/Fantom.svg";
import ethImage from "../assets/img/chains/Ethereum.svg";
import bscImage from "../assets/img/chains/BSC.png";
import polyImage from "../assets/img/chains/Polygon.png";
import avaxImage from "../assets/img/chains/Avalanche.png";
import arbImage from "../assets/img/chains/Arbitrum.png";

export const supportedChainsForBridge = [250, 1, 56, 137, 43114, 42161];
export const chainToNetworkInfoMap = {
  250: { symbol: "ftm", name: "Fantom", image: ftmImage },
  1: { symbol: "eth", name: "Ethereum", image: ethImage },
  56: { symbol: "bsc", name: "BNB Chain", image: bscImage },
  137: { symbol: "matic", name: "Polygon", image: polyImage },
  43114: { symbol: "avax", name: "Avalanche", image: avaxImage },
  42161: { symbol: "arb", name: "Arbitrum", image: arbImage },
} as any;
export const transactionStatusMapping = {
  3: "Failed: exceeded limit",
  8: "Pending: confirming",
  9: "Pending: swapping",
  10: "Success: completed",
  12: "BigAmount: Wait 24 hours",
  14: "Failed",
} as any;
export const bridgeNetworks = {
  1: {
    chainId: 1,
    network: "Ethereum",
    hex: "1",
    rpc: "https://rpc.ankr.com/eth",
    name: "Ethereum",
    symbol: "ETH",
    blockExp: "https://etherscan.com",
    explorerTransactionPath: "tx/",
    decimals: 18,
  },
  56: {
    chainId: 56,
    network: "BSC",
    hex: "38",
    rpc: "https://rpc.ankr.com/bsc",
    name: "Binance Coin",
    symbol: "BNB",
    blockExp: "https://bscscan.com",
    explorerTransactionPath: "tx/",
    decimals: 18,
  },
  137: {
    chainId: 137,
    network: "Polygon",
    hex: "89",
    rpc: "https://rpc.ankr.com/polygon",
    name: "MATIC",
    symbol: "MATIC",
    blockExp: "https://polygonscan.com/",
    explorerTransactionPath: "tx/",
    decimals: 18,
  },
  250: {
    chainId: 250,
    network: "Fantom",
    hex: "fa",
    rpc: "https://rpc.ankr.com/fantom",
    name: "Fantom",
    symbol: "FTM",
    blockExp: "https://ftmscan.com/",
    explorerTransactionPath: "tx/",
    decimals: 18,
  },
  43114: {
    chainId: 43114,
    network: "Avalanche",
    hex: "A86A",
    rpc: "https://api.avax.network/ext/bc/C/rpc",
    // rpc: "https://rpc.ankr.com/avalanche-c",
    name: "AVAX",
    symbol: "AVAX",
    blockExp: "https://cchain.explorer.avax.network/",
    explorerTransactionPath: "tx/",
    decimals: 18,
  },
  42161: {
    chainId: 42161,
    network: "Arbitrum",
    hex: "A4B1",
    rpc: "https://rpc.ankr.com/arbitrum",
    name: "AETH",
    symbol: "AETH",
    blockExp: "https://arbiscan.io",
    explorerTransactionPath: "tx/",
    decimals: 18,
  },
  // 100: {
  //   chainId: 100,
  //   network: "xDai",
  //   hex: "64",
  //   rpc: "https://rpc.xdaichain.com/",
  //   name: "xDai",
  //   symbol: "xDai",
  //   blockExp: "https://blockscout.com/xdai/mainnet/",
  //   decimals: 18,
  // },
} as any;
