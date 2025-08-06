import { useEffect } from "react";
import { formatUnits } from "viem";
import {
  useSignTypedData,
  useSendTransaction,
  useWaitForTransactionReceipt,
  useWalletClient,
  type BaseError,
} from "wagmi";
import { Address, concat, numberToHex, size, type Hex } from "viem";
import type { PriceResponse, QuoteResponse } from "@/utils/types";
import {
  MONAD_TESTNET_TOKENS_BY_ADDRESS,
  AFFILIATE_FEE,
  FEE_RECIPIENT,
} from "@/utils/constants";
import qs from "qs";
import Image from "next/image";

export default function QuoteView({
  taker,
  price,
  quote,
  setQuote,
  chainId,
  onClose,
}: {
  taker: Address | undefined;
  price: PriceResponse;
  quote: QuoteResponse | undefined;
  setQuote: (quote: QuoteResponse) => void;
  chainId: number;
  onClose?: () => void;
}) {
  const sellTokenInfo = () => {
    return MONAD_TESTNET_TOKENS_BY_ADDRESS[price.sellToken.toLowerCase()];
  };

  const buyTokenInfo = (chainId: number) => {
    if (chainId === 1) {
      return MONAD_TESTNET_TOKENS_BY_ADDRESS[price.buyToken.toLowerCase()];
    }
    return MONAD_TESTNET_TOKENS_BY_ADDRESS[price.buyToken.toLowerCase()];
  };

  const { signTypedDataAsync } = useSignTypedData();
  const { data: walletClient } = useWalletClient();

  // Fetch quote data
  useEffect(() => {
    const params = {
      chainId: chainId,
      sellToken: price.sellToken,
      buyToken: price.buyToken,
      sellAmount: price.sellAmount,
      taker,
      swapFeeRecipient: FEE_RECIPIENT,
      swapFeeBps: AFFILIATE_FEE,
      swapFeeToken: price.buyToken,
      tradeSurplusRecipient: FEE_RECIPIENT,
    };

    async function main() {
      const response = await fetch(`/api/quote?${qs.stringify(params)}`);
      const data = await response.json();
      setQuote(data);
    }
    main();
  }, [
    chainId,
    price.sellToken,
    price.buyToken,
    price.sellAmount,
    taker,
    setQuote,
  ]);

  const {
    data: hash,
    isPending,
    error,
    sendTransaction,
  } = useSendTransaction();

  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({
      hash,
    });



  if (!quote) {
    return <div className="text-gray-900 dark:text-white">Getting best quote...</div>;
  }

  console.log("quote", quote);

  // Helper function to format tax basis points to percentage
  const formatTax = (taxBps: string) => (parseFloat(taxBps) / 100).toFixed(2);

  return (
    <div className="p-4">
      <form>
        <div className="bg-slate-200 dark:bg-slate-800 p-4 rounded-sm mb-3">
          <div className="text-xl mb-2 text-gray-900 dark:text-white">You pay</div>
          <div className="flex items-center text-lg sm:text-3xl text-gray-900 dark:text-white">
            <Image
              alt={sellTokenInfo().symbol}
              className="h-9 w-9 mr-2 rounded-md"
              src={sellTokenInfo()?.logoURI}
              width={9}
              height={9}
            />
            <span>
              {formatUnits(
                BigInt(quote.sellAmount),
                sellTokenInfo().decimals
              )}
            </span>
            <div className="ml-2">{sellTokenInfo().symbol}</div>
          </div>
        </div>

        <div className="bg-slate-200 dark:bg-slate-800 p-4 rounded-sm mb-3">
          <div className="text-xl mb-2 text-gray-900 dark:text-white">You receive</div>
          <div className="flex items-center text-lg sm:text-3xl text-gray-900 dark:text-white">
            <Image
              alt={
                MONAD_TESTNET_TOKENS_BY_ADDRESS[price.buyToken.toLowerCase()].symbol
              }
              className="h-9 w-9 mr-2 rounded-md"
              src={
                MONAD_TESTNET_TOKENS_BY_ADDRESS[price.buyToken.toLowerCase()].logoURI
              }
              width={9}
              height={9}
            />
            <span>
              {formatUnits(
                BigInt(quote.buyAmount),
                buyTokenInfo(chainId).decimals
              )}
            </span>
            <div className="ml-2">{buyTokenInfo(chainId).symbol}</div>
          </div>
        </div>

        <div className="bg-slate-200 dark:bg-slate-800 p-4 rounded-sm mb-3">
          <div className="text-gray-600 dark:text-gray-300">
            {quote &&
            quote.fees &&
            quote.fees.integratorFee &&
            quote.fees.integratorFee.amount
              ? "Affiliate Fee: " +
                Number(
                  formatUnits(
                    BigInt(quote.fees.integratorFee.amount),
                    buyTokenInfo(chainId).decimals
                  )
                ) +
                " " +
                buyTokenInfo(chainId).symbol
              : null}
          </div>
          {/* Tax Information Display */}
          <div className="text-gray-600 dark:text-gray-300">
            {quote.tokenMetadata.buyToken.buyTaxBps &&
              quote.tokenMetadata.buyToken.buyTaxBps !== "0" && (
                <p>
                  {buyTokenInfo(chainId).symbol +
                    ` Buy Tax: ${formatTax(
                      quote.tokenMetadata.buyToken.buyTaxBps
                    )}%`}
                </p>
              )}
            {quote.tokenMetadata.sellToken.sellTaxBps &&
              quote.tokenMetadata.sellToken.sellTaxBps !== "0" && (
                <p>
                  {sellTokenInfo().symbol +
                    ` Sell Tax: ${formatTax(
                      quote.tokenMetadata.sellToken.sellTaxBps
                    )}%`}
                </p>
              )}
          </div>
        </div>
      </form>

      <div className="space-y-3">
        <button
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded w-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={isPending || isConfirming || isConfirmed}
          onClick={async () => {
            console.log("submitting quote to blockchain");
            console.log("to", quote.transaction.to);
            console.log("value", quote.transaction.value);

            // On click, (1) Sign the Permit2 EIP-712 message returned from quote
            if (quote.permit2?.eip712) {
              let signature: Hex | undefined;
              try {
                signature = await signTypedDataAsync(quote.permit2.eip712);
                console.log("Signed permit2 message from quote response");
              } catch (error) {
                console.error("Error signing permit2 coupon:", error);
              }

              // (2) Append signature length and signature data to calldata

              if (signature && quote?.transaction?.data) {
                const signatureLengthInHex = numberToHex(size(signature), {
                  signed: false,
                  size: 32,
                });

                const transactionData = quote.transaction.data as Hex;
                const sigLengthHex = signatureLengthInHex as Hex;
                const sig = signature as Hex;

                quote.transaction.data = concat([
                  transactionData,
                  sigLengthHex,
                  sig,
                ]);
              } else {
                throw new Error("Failed to obtain signature or transaction data");
              }
            }

            // (3) Submit the transaction with Permit2 signature

            sendTransaction?.({
              account: walletClient?.account.address,
              gas: !!quote?.transaction.gas
                ? BigInt(quote?.transaction.gas)
                : undefined,
              to: quote?.transaction.to,
              data: quote.transaction.data, // submit
              value: quote?.transaction.value
                ? BigInt(quote.transaction.value)
                : undefined, // value is used for native tokens
              chainId: chainId,
            });
          }}
        >
          {isPending 
            ? "Confirming..." 
            : isConfirmed 
            ? "Order Completed ✓" 
            : "Place Order"}
        </button>

        {onClose && (
          <button
            onClick={onClose}
            className="w-full py-2 px-4 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100 transition-colors border border-gray-300 dark:border-gray-600 rounded"
          >
            Cancel
          </button>
        )}
      </div>

      {isConfirming && (
        <div className="text-center text-gray-900 dark:text-white mt-4">Waiting for confirmation ⏳ ...</div>
      )}
      {isConfirmed && (
        <div className="text-center text-gray-900 dark:text-white mt-4">
          Transaction Confirmed! 🎉{" "}
          <a 
            href={`https://testnet.monadscan.com/tx/${hash}`} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-600 dark:text-blue-400 underline"
          >
            Check Monadscan
          </a>
        </div>
      )}
      {error && (
        <div className="text-red-600 dark:text-red-400 mt-4">Error: {(error as BaseError).shortMessage || error.message}</div>
      )}
    </div>
  );
}
