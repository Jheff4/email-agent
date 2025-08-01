import { AxiosError } from 'axios';

// Error handling utilities
export interface ApiError {
  message: string;
  status?: number;
  code?: string;
  details?: any;
}

export function handleApiError(error: AxiosError): ApiError {
  if (error.response) {
    // Server responded with error status
    const responseData = error.response.data as any;
    return {
      message: responseData?.message || 'An error occurred',
      status: error.response.status,
      code: responseData?.code,
      details: responseData,
    };
  } else if (error.request) {
    // Request was made but no response received
    return {
      message: 'Unable to connect to server. Please check your connection.',
      code: 'NETWORK_ERROR',
    };
  } else {
    // Something else happened
    return {
      message: error.message || 'An unexpected error occurred',
      code: 'UNKNOWN_ERROR',
    };
  }
}

// Retry logic for failed requests
export async function retryRequest<T>(
  requestFn: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> {
  let lastError: Error;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await requestFn();
    } catch (error) {
      lastError = error as Error;
      
      if (attempt === maxRetries) {
        throw lastError;
      }
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delay * attempt));
    }
  }
  
  throw lastError!;
}

// Debounce function for search/filter inputs
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

// Format API response for consistent handling
export function formatApiResponse<T>(data: T, meta?: any) {
  return {
    data,
    meta: {
      timestamp: new Date().toISOString(),
      ...meta,
    },
  };
}