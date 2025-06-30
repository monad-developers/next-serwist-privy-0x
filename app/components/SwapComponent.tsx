"use client";

import { useAccount, useChainId } from "wagmi";
import { useState } from "react";
import { ExtendedPriceResponse, QuoteResponse } from "@/utils/types";
import QuoteView from "./0x/quote";
import PriceView from "./0x/price";

export default function SwapComponent() {
  const { address } = useAccount();

  const chainId = useChainId() || 1;

  const [finalize, setFinalize] = useState(false);
  const [price, setPrice] = useState<ExtendedPriceResponse | null>(null);
  const [quote, setQuote] = useState<QuoteResponse | undefined>();

  const closeModal = () => {
    setFinalize(false);
    setQuote(undefined);
  };

  return (
    <>
      <div className="flex flex-col items-center justify-between">
        <PriceView
          taker={address}
          price={price}
          setPrice={setPrice}
          setFinalize={setFinalize}
          chainId={chainId}
        />

        {/* Modal Overlay */}
        {finalize && price && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm p-4">
            <div className="relative bg-white dark:bg-gray-900 rounded-lg shadow-xl max-w-lg w-full max-h-[95vh] overflow-hidden flex flex-col">
              {/* Modal Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Review Trade
                </h3>
                <button
                  onClick={closeModal}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
                  aria-label="Close modal"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              {/* Modal Content */}
              <div className="overflow-y-auto flex-1">
                <QuoteView
                  taker={address}
                  price={price}
                  quote={quote}
                  setQuote={setQuote}
                  chainId={chainId}
                  onClose={closeModal}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
