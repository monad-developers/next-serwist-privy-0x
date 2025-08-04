import { Token } from "./types";

export const PERMIT2_ADDRESS = "0x000000000022D473030F116dDEE9F6B43aC78BA3";

export const MAGIC_CALLDATA_STRING = "f".repeat(130); // used when signing the eip712 message

export const AFFILIATE_FEE = 100; // 1% affiliate fee. Denoted in Bps.
export const FEE_RECIPIENT = "0x75A94931B81d81C7a62b76DC0FcFAC77FbE1e917"; // The ETH address that should receive affiliate fees

export const MAX_ALLOWANCE = BigInt(
  "115792089237316195423570985008687907853269984665640564039457584007913129639935"
);

// UI Constants
export const DEBOUNCE_DELAY = 500; // ms
export const MIN_TRADE_AMOUNT = "0.001";
export const DEFAULT_SLIPPAGE = 0.01; // 1%

export const MONAD_TESTNET_TOKENS: Token[] = [
  {
    chainId: 1,
    name: "Wrapped MON",
    symbol: "WMON",
    decimals: 18,
    address: "0x760AfE86e5de5fa0Ee542fc7B7B713e1c5425701",
    logoURI:
      "https://imagedelivery.net/cBNDGgkrsEA-b_ixIp9SkQ/I_t8rg_V_400x400.jpg/public",
  },
  {
    chainId: 1,
    name: "USDT",
    symbol: "USDT",
    decimals: 6,
    address: "0xfBC2D240A5eD44231AcA3A9e9066bc4b33f01149",
    logoURI:
      "https://imagedelivery.net/cBNDGgkrsEA-b_ixIp9SkQ/images.png/public",
  },
];

export const MONAD_TESTNET_TOKENS_BY_SYMBOL: Record<string, Token> = {
  wmon: {
    chainId: 1,
    name: "Wrapped MON",
    symbol: "WMON",
    decimals: 18,
    address: "0x760AfE86e5de5fa0Ee542fc7B7B713e1c5425701",
    logoURI:
      "https://imagedelivery.net/cBNDGgkrsEA-b_ixIp9SkQ/I_t8rg_V_400x400.jpg/public",
  },
  usdt: {
    chainId: 1,
    name: "USDT",
    symbol: "USDT",
    decimals: 6,
    address: "0xfBC2D240A5eD44231AcA3A9e9066bc4b33f01149",
    logoURI:
      "https://imagedelivery.net/cBNDGgkrsEA-b_ixIp9SkQ/images.png/public",
  },
};

export const MONAD_TESTNET_TOKENS_BY_ADDRESS: Record<string, Token> = {
  "0x760afe86e5de5fa0ee542fc7b7b713e1c5425701": {
    chainId: 1,
    name: "Wrapped MON",
    symbol: "WMON",
    decimals: 18,
    address: "0x760afe86e5de5fa0ee542fc7b7b713e1c5425701",
    logoURI:
      "https://imagedelivery.net/cBNDGgkrsEA-b_ixIp9SkQ/I_t8rg_V_400x400.jpg/public",
  },
  "0xfbc2d240a5ed44231aca3a9e9066bc4b33f01149": {
    chainId: 1,
    name: "USDT",
    symbol: "USDT",
    decimals: 6,
    address: "0xfBC2D240A5eD44231AcA3A9e9066bc4b33f01149",
    logoURI:
      "https://imagedelivery.net/cBNDGgkrsEA-b_ixIp9SkQ/images.png/public",
  },
};