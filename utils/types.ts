import { Address, type Hex } from "viem";
import { EIP712TypedData } from "@/utils/signature";

// This interface is subject to change as the API V2 endpoints aren't finalized.
export interface PriceResponse {
  sellToken: string;
  buyToken: string;
  sellAmount: string;
  buyAmount: string;
  grossSellAmount: string;
  grossBuyAmount: string;
  allowanceTarget: Address;
  route: [];
  fees: {
    integratorFee: {
      amount: string;
      token: string;
      type: "volume" | "gas";
    } | null;
    zeroExFee: {
      billingType: "on-chain" | "off-chain";
      feeAmount: string;
      feeToken: Address;
      feeType: "volume" | "gas";
    };
    gasFee: null;
  } | null;
  gas: string;
  gasPrice: string;
  auxiliaryChainData?: {
    l1GasEstimate?: number;
  };
}

// This interface is subject to change as the API V2 endpoints aren't finalized.
export interface QuoteResponse {
  sellToken: Address;
  buyToken: Address;
  sellAmount: string;
  buyAmount: string;
  grossSellAmount: string;
  grossBuyAmount: string;
  gasPrice: string;
  allowanceTarget: Address;
  route: [];
  fees: {
    integratorFee: {
      amount: string;
      token: string;
      type: "volume" | "gas";
    } | null;
    zeroExFee: {
      billingType: "on-chain" | "off-chain";
      feeAmount: string;
      feeToken: Address;
      feeType: "volume" | "gas";
    };
    gasFee: null;
  } | null;
  auxiliaryChainData: object;
  to: Address;
  data: Hex;
  value: string;
  gas: string;
  permit2: {
    type: "Permit2";
    hash: Hex;
    eip712: EIP712TypedData;
  };
  transaction: V2QuoteTransaction;
  tokenMetadata: {
    buyToken: {
      buyTaxBps: string | null;
      sellTaxBps: string | null;
    };
    sellToken: {
      buyTaxBps: string | null;
      sellTaxBps: string | null;
    };
  };
}

export interface V2QuoteTransaction {
  data: Hex;
  gas: string | null;
  gasPrice: string;
  to: Address;
  value: string;
}

export interface TokenTax {
  buyTaxBps: string;
  sellTaxBps: string;
}

export interface ValidationError {
  field: string;
  code: string;
  reason: string;
}

export interface AllowanceIssue {
  spender: Address;
  allowance: string;
}

export interface PriceRequest {
  chainId: number;
  sellToken: Address;
  buyToken: Address;
  sellAmount?: string;
  buyAmount?: string;
  taker?: Address;
  swapFeeRecipient?: string;
  swapFeeBps?: number;
  swapFeeToken?: Address;
  tradeSurplusRecipient?: string;
}

export interface ExtendedPriceResponse extends PriceResponse {
  issues?: {
    allowance?: AllowanceIssue | null;
  };
  validationErrors?: ValidationError[];
  tokenMetadata?: {
    buyToken: TokenTax;
    sellToken: TokenTax;
  };
}

export type TradeDirection = "sell" | "buy";

export interface Token {
  name: string;
  address: Address;
  symbol: string;
  decimals: number;
  chainId: number;
  logoURI: string;
}