import { useEffect } from "react";
import { Address, erc20Abi } from "viem";
import {
  useReadContract,
  useSimulateContract,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import { MAX_ALLOWANCE } from "@/utils/contants";
import { ExtendedPriceResponse } from "@/utils/types";

interface ApproveButtonProps {
  taker: Address;
  onClick: () => void;
  sellTokenAddress: Address;
  disabled?: boolean;
  price: ExtendedPriceResponse | null;
}

export default function ApproveButton({
  taker,
  onClick,
  sellTokenAddress,
  disabled = false,
  price,
}: ApproveButtonProps) {
  // Determine the spender from price.issues.allowance
  const spender = price?.issues?.allowance?.spender;
  const needsApproval = price?.issues?.allowance != null;

  // Always call hooks at the top level
  const { data: allowance, refetch } = useReadContract({
    address: sellTokenAddress,
    abi: erc20Abi,
    functionName: "allowance",
    args: spender ? [taker, spender] : undefined,
    query: { enabled: needsApproval && !!spender },
  });

  const { data: simulateData } = useSimulateContract({
    address: sellTokenAddress,
    abi: erc20Abi,
    functionName: "approve",
    args: spender ? [spender, MAX_ALLOWANCE] : undefined,
    query: { enabled: needsApproval && !!spender },
  });

  const {
    data: writeContractResult,
    writeContractAsync: writeContract,
    error,
    isPending,
  } = useWriteContract();

  const { isLoading: isApproving } = useWaitForTransactionReceipt({
    hash: writeContractResult,
  });

  useEffect(() => {
    if (simulateData) {
      refetch();
    }
  }, [simulateData, refetch]);

  // If price.issues.allowance is null, show the Review Trade button
  if (!needsApproval) {
    return (
      <button
        type="button"
        disabled={disabled}
        onClick={() => {
          onClick();
        }}
        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg"
        aria-label={disabled ? "Insufficient balance to complete trade" : "Review trade details"}
      >
        {disabled ? "Insufficient Balance" : "Review Trade"}
      </button>
    );
  }

  if (error) {
    return (
      <div className="w-full p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg">
        <p className="text-red-800 dark:text-red-200 text-sm">
          Approval failed: {error.message}
        </p>
      </div>
    );
  }

  if (allowance === BigInt(0) || !allowance) {
    return (
      <button
        type="button"
        disabled={isPending || isApproving || !spender}
        onClick={async () => {
          if (!spender) {
            return;
          }
          try {
            await writeContract({
              abi: erc20Abi,
              address: sellTokenAddress,
              functionName: "approve",
              args: [spender, MAX_ALLOWANCE],
            });
            refetch();
          } catch {
            // Silent error handling
          }
        }}
        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg"
        aria-label="Approve token spending"
      >
        {isPending || isApproving ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
                fill="none"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            {isApproving ? "Approving..." : "Confirming..."}
          </span>
        ) : !spender ? (
          "No Spender Available"
        ) : (
          "Approve"
        )}
      </button>
    );
  }

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => {
        onClick();
      }}
      className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg"
      aria-label={disabled ? "Insufficient balance to complete trade" : "Review trade details"}
    >
      {disabled ? "Insufficient Balance" : "Review Trade"}
    </button>
  );
} 