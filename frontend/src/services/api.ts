// API service for communicating with the backend

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8081/api';

// Helper function for making API requests
async function fetchAPI(endpoint: string, options: RequestInit = {}) {
  const url = `${API_URL}${endpoint}`;

  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    // Try to get error message from response
    try {
      const errorData = await response.json();
      throw new Error(errorData.error || `API error: ${response.status}`);
    } catch (e) {
      throw new Error(`API error: ${response.status}`);
    }
  }

  return response.json();
}

// Market data endpoints
export const marketAPI = {
  searchStocks: (keywords: string) =>
    fetchAPI(`/market/search?keywords=${encodeURIComponent(keywords)}`),

  getStockQuote: (symbol: string) =>
    fetchAPI(`/market/quote/${symbol}`),

  getDailyData: (symbol: string) =>
    fetchAPI(`/market/daily/${symbol}`),
};

// User data endpoints
export const userAPI = {
  getPortfolio: (userId: string) =>
    fetchAPI(`/user/portfolio`, {
      headers: { 'user-id': userId }
    }),

  getTransactions: (userId: string) =>
    fetchAPI(`/user/transactions`, {
      headers: { 'user-id': userId }
    }),

  createTransaction: (userId: string, data: any) =>
    fetchAPI(`/user/transactions`, {
      method: 'POST',
      headers: { 'user-id': userId },
      body: JSON.stringify(data),
    }),

  getBalance: (userId: string) =>
    fetchAPI(`/user/balance`, {
      headers: { 'user-id': userId }
    }),
};

// Health check
export const healthCheck = () => fetchAPI('/health');

export default {
  market: marketAPI,
  user: userAPI,
  healthCheck,
};
