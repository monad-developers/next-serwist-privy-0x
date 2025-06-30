import { ChangeEvent } from "react";
import Image from "next/image";
import { Token } from "@/utils/types";

interface TokenSelectorProps {
  selectedToken: string;
  tokens: Token[];
  onTokenChange: (e: ChangeEvent<HTMLSelectElement>) => void;
  label: string;
  amount: string;
  onAmountChange?: (e: ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
  className?: string;
}

export default function TokenSelector({
  selectedToken,
  tokens,
  onTokenChange,
  label,
  amount,
  onAmountChange,
  disabled = false,
  className = "",
}: TokenSelectorProps) {
  const selectedTokenData = tokens.find(
    (token) => token.symbol.toLowerCase() === selectedToken.toLowerCase()
  );

  return (
    <div className={`bg-slate-100 dark:bg-slate-800 p-4 rounded-lg ${className}`}>
      <label className="block text-gray-700 dark:text-gray-200 mb-2 text-sm font-medium">
        {label}
      </label>
      
      <div className="flex items-center gap-3">
        {/* Token Icon */}
        {selectedTokenData && (
          <Image
            alt={selectedTokenData.symbol}
            className="h-10 w-10 rounded-full border border-gray-200 dark:border-gray-600"
            src={selectedTokenData.logoURI}
            width={40}
            height={40}
          />
        )}

        {/* Token Select */}
        <select
          value={selectedToken}
          onChange={onTokenChange}
          className="flex-1 max-w-32 h-11 px-3 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          aria-label={`Select ${label.toLowerCase()} token`}
        >
          {tokens.map((token) => (
            <option key={token.address} value={token.symbol.toLowerCase()}>
              {token.symbol}
            </option>
          ))}
        </select>

        {/* Amount Input */}
        <input
          type="number"
          value={amount}
          onChange={onAmountChange}
          disabled={disabled}
          placeholder="0.0"
          className={`flex-1 h-11 px-3 rounded-lg text-right font-mono border transition-colors ${
            disabled
              ? "bg-gray-100 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed border-gray-300 dark:border-gray-600"
              : "bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          }`}
          aria-label={`${label} amount`}
          step="any"
          min="0"
        />
      </div>
    </div>
  );
} 