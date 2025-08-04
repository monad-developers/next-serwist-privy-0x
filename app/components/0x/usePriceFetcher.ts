import { useEffect, useState, useCallback } from "react";
import qs from "qs";
import { PriceRequest, ExtendedPriceResponse, ValidationError } from "@/utils/types";
import { DEBOUNCE_DELAY } from "@/utils/constants";

interface UsePriceFetcherProps {
  enabled: boolean;
  request: PriceRequest;
}

interface UsePriceFetcherReturn {
  price: ExtendedPriceResponse | null;
  isLoading: boolean;
  error: string | null;
  validationErrors: ValidationError[];
}

export function usePriceFetcher({ enabled, request }: UsePriceFetcherProps): UsePriceFetcherReturn {
  const [price, setPrice] = useState<ExtendedPriceResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);

  const fetchPrice = useCallback(async () => {
    if (!enabled) return;

    setIsLoading(true);
    setError(null);
    setValidationErrors([]);

    try {
      const response = await fetch(`/api/price?${qs.stringify(request)}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: ExtendedPriceResponse = await response.json();

      if (data.validationErrors && data.validationErrors.length > 0) {
        setValidationErrors(data.validationErrors);
      }

      setPrice(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch price";
      setError(errorMessage);
      console.error("Price fetch error:", err);
    } finally {
      setIsLoading(false);
    }
  }, [enabled, request]);

  // Debounced price fetching
  useEffect(() => {
    if (!enabled) return;

    const timeoutId = setTimeout(() => {
      fetchPrice();
    }, DEBOUNCE_DELAY);

    return () => clearTimeout(timeoutId);
  }, [fetchPrice, enabled]);

  return {
    price,
    isLoading,
    error,
    validationErrors,
  };
} 