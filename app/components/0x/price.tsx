/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useMemo, useCallback } from "react";
import { formatUnits, parseUnits, Address } from "viem";
import { useBalance, useAccount } from "wagmi";
import {
  MAINNET_TOKENS,
  MAINNET_TOKENS_BY_SYMBOL,
  AFFILIATE_FEE,
  FEE_RECIPIENT,
  MIN_TRADE_AMOUNT,
} from "@/utils/contants";
import {
  ExtendedPriceResponse,
  TradeDirection,
  TokenTax,
  PriceRequest,
} from "@/utils/types";
import { usePrivy, useWallets } from "@privy-io/react-auth";
import { useSetActiveWallet } from "@privy-io/wagmi";
import TokenSelector from "./TokenSelector";
import ApproveButton from "./ApproveButton";
import { usePriceFetcher } from "./usePriceFetcher";

interface PriceViewProps {
  price: ExtendedPriceResponse | null;
  taker: Address | undefined;
  setPrice: (price: ExtendedPriceResponse | null) => void;
  setFinalize: (finalize: boolean) => void;
  chainId: number;
}

export default function PriceView({
  taker,
  setPrice,
  setFinalize,
  chainId,
}: PriceViewProps) {
  const [sellToken, setSellToken] = useState("wmon");
  const [buyToken, setBuyToken] = useState("usdt");
  const [sellAmount, setSellAmount] = useState("");
  const [buyAmount, setBuyAmount] = useState("");
  const [tradeDirection, setTradeDirection] = useState<TradeDirection>("sell");
  const [buyTokenTax, setBuyTokenTax] = useState<TokenTax>({
    buyTaxBps: "0",
    sellTaxBps: "0",
  });
  const [sellTokenTax, setSellTokenTax] = useState<TokenTax>({
    buyTaxBps: "0",
    sellTaxBps: "0",
  });
  const { ready, user, login } = usePrivy();
  const { wallets, ready: walletsReady } = useWallets();
  const { address } = useAccount();
  const { setActiveWallet } = useSetActiveWallet();

  const handleSellTokenChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      setSellToken(e.target.value);
    },
    []
  );

  const handleBuyTokenChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      setBuyToken(e.target.value);
    },
    []
  );

  const handleSellAmountChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setTradeDirection("sell");
      setSellAmount(e.target.value);
    },
    []
  );

  const handleBuyAmountChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setTradeDirection("buy");
      setBuyAmount(e.target.value);
    },
    []
  );

  const tokensByChain = useMemo(() => {
    if (chainId === 1) {
      return MAINNET_TOKENS_BY_SYMBOL;
    }
    return MAINNET_TOKENS_BY_SYMBOL;
  }, [chainId]);

  const sellTokenObject = tokensByChain[sellToken];
  const buyTokenObject = tokensByChain[buyToken];

  const parsedSellAmount = useMemo(() => {
    return sellAmount && tradeDirection === "sell"
      ? parseUnits(sellAmount, sellTokenObject.decimals).toString()
      : undefined;
  }, [sellAmount, tradeDirection, sellTokenObject.decimals]);

  const parsedBuyAmount = useMemo(() => {
    return buyAmount && tradeDirection === "buy"
      ? parseUnits(buyAmount, buyTokenObject.decimals).toString()
      : undefined;
  }, [buyAmount, tradeDirection, buyTokenObject.decimals]);

  const priceRequest: PriceRequest = useMemo(
    () => ({
      chainId,
      sellToken: sellTokenObject.address,
      buyToken: buyTokenObject.address,
      sellAmount: parsedSellAmount,
      buyAmount: parsedBuyAmount,
      taker,
      swapFeeRecipient: FEE_RECIPIENT,
      swapFeeBps: AFFILIATE_FEE,
      swapFeeToken: buyTokenObject.address,
      tradeSurplusRecipient: FEE_RECIPIENT,
    }),
    [
      chainId,
      sellTokenObject.address,
      buyTokenObject.address,
      parsedSellAmount,
      parsedBuyAmount,
      taker,
    ]
  );

  const {
    price: fetchedPrice,
    isLoading: isPriceLoading,
    error: priceError,
    validationErrors,
  } = usePriceFetcher({
    enabled:
      sellAmount !== "" &&
      parseFloat(sellAmount) >= parseFloat(MIN_TRADE_AMOUNT),
    request: priceRequest,
  });

  useMemo(() => {
    if (fetchedPrice) {
      setPrice(fetchedPrice);
      if (fetchedPrice.buyAmount) {
        setBuyAmount(
          formatUnits(BigInt(fetchedPrice.buyAmount), buyTokenObject.decimals)
        );
      }
      if (fetchedPrice.tokenMetadata) {
        setBuyTokenTax(fetchedPrice.tokenMetadata.buyToken);
        setSellTokenTax(fetchedPrice.tokenMetadata.sellToken);
      }
    }
  }, [fetchedPrice, setPrice, buyTokenObject.decimals]);

  const { data: sellTokenBalance } = useBalance({
    address: taker,
    token: sellTokenObject.address,
  });

  const insufficientBalance = useMemo(() => {
    if (!sellTokenBalance || !sellAmount) return true;
    try {
      return (
        parseUnits(sellAmount, sellTokenObject.decimals) >
        sellTokenBalance.value
      );
    } catch {
      return true;
    }
  }, [sellTokenBalance, sellAmount, sellTokenObject.decimals]);

  const formatTax = (taxBps: string) => (parseFloat(taxBps) / 100).toFixed(2);

  if (!ready) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <header className="text-center py-6">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
          0x Swap Demo
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Powered by the 0x Protocol
        </p>
      </header>
      {walletsReady && address && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4 mb-6">
          <div>
            <h2 className="text-blue-800 dark:text-blue-200 font-semibold mb-3">
              Connected Wallets
            </h2>
            <div className="text-sm text-gray-700 dark:text-gray-300 mb-2">
              <span className="font-medium">Active:</span>{" "}
              <span className="font-mono">{address}</span>
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">
              <a
                href="https://docs.privy.io/wallets/connectors/ethereum/integrations/wagmi"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 dark:text-blue-400 hover:underline"
              >
                Learn more about what Active Wallet means here →
              </a>
            </p>
          </div>

          {walletsReady && (
            <div className="space-y-2">
              {wallets.map((wallet) => (
                <div
                  key={wallet.address}
                  className="flex items-center justify-between gap-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg p-3"
                >
                  <span className="text-gray-900 dark:text-gray-100 font-mono text-sm">
                    {wallet.address}
                  </span>
                  <button
                    onClick={() => setActiveWallet(wallet)}
                    className="bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-500 text-white px-3 py-1 rounded text-sm transition-colors"
                  >
                    Make Active
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {priceError && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg p-4 mb-4">
          <p className="text-red-800 dark:text-red-200 font-medium">
            Error fetching price:
          </p>
          <p className="text-red-700 dark:text-red-300 text-sm">{priceError}</p>
        </div>
      )}

      {validationErrors.length > 0 && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg p-4 mb-4">
          <p className="text-yellow-800 dark:text-yellow-200 font-medium mb-2">
            Validation Issues:
          </p>
          <ul className="text-yellow-700 dark:text-yellow-300 text-sm space-y-1">
            {validationErrors.map((error, index) => (
              <li key={index}>• {error.reason}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="space-y-4 mb-6">
        <TokenSelector
          selectedToken={sellToken}
          tokens={MAINNET_TOKENS}
          onTokenChange={handleSellTokenChange}
          label="Sell"
          amount={sellAmount}
          onAmountChange={handleSellAmountChange}
        />

        <div className="flex justify-center">
          <div className="bg-gray-100 dark:bg-gray-700 p-2 rounded-full">
            <svg
              className="w-5 h-5 text-gray-600 dark:text-gray-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 14l-7 7m0 0l-7-7m7 7V3"
              />
            </svg>
          </div>
        </div>

        <TokenSelector
          selectedToken={buyToken}
          tokens={MAINNET_TOKENS}
          onTokenChange={handleBuyTokenChange}
          label="Buy"
          amount={buyAmount}
          onAmountChange={handleBuyAmountChange}
          disabled={true}
        />
      </div>

      {fetchedPrice && (
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 mb-6 space-y-2">
          {isPriceLoading && (
            <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
              <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
              <span className="text-sm">Fetching latest price...</span>
            </div>
          )}

          {fetchedPrice.fees?.integratorFee?.amount && (
            <div className="text-gray-600 dark:text-gray-300 text-sm">
              <span className="font-medium">Affiliate Fee:</span>{" "}
              {Number(
                formatUnits(
                  BigInt(fetchedPrice.fees.integratorFee.amount),
                  buyTokenObject.decimals
                )
              ).toFixed(6)}{" "}
              {buyTokenObject.symbol}
            </div>
          )}

          {buyTokenTax.buyTaxBps !== "0" && (
            <div className="text-gray-600 dark:text-gray-300 text-sm">
              <span className="font-medium">
                {buyTokenObject.symbol} Buy Tax:
              </span>{" "}
              {formatTax(buyTokenTax.buyTaxBps)}%
            </div>
          )}

          {sellTokenTax.sellTaxBps !== "0" && (
            <div className="text-gray-600 dark:text-gray-300 text-sm">
              <span className="font-medium">
                {sellTokenObject.symbol} Sell Tax:
              </span>{" "}
              {formatTax(sellTokenTax.sellTaxBps)}%
            </div>
          )}

          {sellTokenBalance && (
            <div className="text-gray-600 dark:text-gray-300 text-sm">
              <span className="font-medium">Available Balance:</span>{" "}
              {formatUnits(sellTokenBalance.value, sellTokenObject.decimals)}{" "}
              {sellTokenObject.symbol}
            </div>
          )}
        </div>
      )}

      <div className="space-y-4">
        {taker ? (
          <ApproveButton
            sellTokenAddress={sellTokenObject.address}
            taker={taker}
            onClick={() => setFinalize(true)}
            disabled={insufficientBalance || !fetchedPrice}
            price={fetchedPrice}
          />
        ) : (
          <button
            onClick={login}
            disabled={!!user}
            className={`w-full font-semibold py-3 px-6 rounded-lg transition-all duration-200 shadow-md ${
              user
                ? "bg-gray-400 dark:bg-gray-600 text-white cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 text-white hover:shadow-lg transform hover:-translate-y-0.5"
            }`}
            aria-label={user ? "Already logged in" : "Login to continue"}
          >
            {user ? "Logged In" : "Login to Continue"}
          </button>
        )}
      </div>

      <div className="mt-8 text-center">
        <a
          href="https://0x.org/docs/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 dark:text-blue-400 hover:underline"
        >
          Learn more about building with 0x
        </a>
      </div>
    </div>
  );
}
