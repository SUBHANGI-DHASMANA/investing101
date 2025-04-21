/**
 * Mock data service for the Investing101 application.
 * This provides hardcoded data for development and testing.
 */

// Define types for our data
export interface Stock {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent?: number;
  previousClose?: number;
  open?: number;
  dayHigh?: number;
  dayLow?: number;
  volume?: number;
  marketCap?: string;
  peRatio?: number;
  dividend?: number;
  dividendYield?: number;
  description?: string;
  news?: {
    title: string;
    date: string;
    source: string;
  }[];
  keyStats?: {
    label: string;
    value: string;
  }[];
  historicalData?: {
    date: string;
    price: number;
  }[];
}

// Mock portfolio item
export interface Portfolio {
  id: string;
  user_id: string;
  symbol: string;
  quantity: number;
  avg_price: number;
  name?: string;
  current_price?: number;
  value?: number;
  gain_loss?: number;
  gain_loss_percent?: number;
  change?: number;
}

// Mock transaction
export interface Transaction {
  id: string;
  user_id: string;
  symbol: string;
  quantity: number;
  price: number;
  type: string;
  total: number;
  created_at: string;
  status?: string;
}

// Mock user data
export interface User {
  id: string;
  email: string;
  cash_balance: number;
}

// Popular stocks data
const popularStocks: Stock[] = [
  {
    symbol: 'AAPL',
    name: 'Apple Inc.',
    price: 177.85,
    change: 1.65,
    changePercent: 0.94,
    previousClose: 176.20,
    open: 175.50,
    dayHigh: 178.25,
    dayLow: 174.75,
    volume: 65432100,
    marketCap: '$2.8T',
    peRatio: 29.5,
    dividend: 0.92,
    dividendYield: 0.52,
    description: 'Apple Inc. designs, manufactures, and markets smartphones, personal computers, tablets, wearables, and accessories worldwide. The company offers iPhone, a line of smartphones; Mac, a line of personal computers; iPad, a line of multi-purpose tablets; and wearables, home, and accessories comprising AirPods, Apple TV, Apple Watch, Beats products, and HomePod.',
    news: [
      { title: 'Apple Reports Record Q2 Earnings', date: '2025-04-10', source: 'Financial Times' },
      { title: 'New iPhone Models Expected in September', date: '2025-04-08', source: 'Tech Insider' },
      { title: 'Apple Expands Services Business with New Offerings', date: '2025-04-05', source: 'Wall Street Journal' },
    ],
    keyStats: [
      { label: '52 Week High', value: '$198.23' },
      { label: '52 Week Low', value: '$124.17' },
      { label: 'Avg. Volume', value: '65.32M' },
      { label: 'EPS (TTM)', value: '$6.14' },
      { label: 'Beta', value: '1.28' },
    ],
    historicalData: Array.from({ length: 30 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (30 - i));
      return {
        date: date.toISOString().split('T')[0],
        price: 177.85 - (Math.random() * 20) + (i * 0.5)
      };
    })
  },
  {
    symbol: 'MSFT',
    name: 'Microsoft Corporation',
    price: 413.80,
    change: 3.90,
    changePercent: 0.95,
    previousClose: 409.90,
    open: 410.25,
    dayHigh: 415.75,
    dayLow: 408.50,
    volume: 23456700,
    marketCap: '$3.1T',
    peRatio: 34.8,
    dividend: 2.72,
    dividendYield: 0.66,
    description: 'Microsoft Corporation develops, licenses, and supports software, services, devices, and solutions worldwide. The company operates in three segments: Productivity and Business Processes, Intelligent Cloud, and More Personal Computing.',
    news: [
      { title: 'Microsoft Cloud Revenue Soars in Q1', date: '2025-04-12', source: 'CNBC' },
      { title: 'Microsoft Expands AI Capabilities in Azure', date: '2025-04-09', source: 'Tech Crunch' },
      { title: 'New Surface Devices Announced for 2025', date: '2025-04-06', source: 'The Verge' },
    ],
    keyStats: [
      { label: '52 Week High', value: '$438.56' },
      { label: '52 Week Low', value: '$313.43' },
      { label: 'Avg. Volume', value: '28.45M' },
      { label: 'EPS (TTM)', value: '$11.21' },
      { label: 'Beta', value: '0.93' },
    ],
    historicalData: Array.from({ length: 30 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (30 - i));
      return {
        date: date.toISOString().split('T')[0],
        price: 413.80 - (Math.random() * 30) + (i * 0.8)
      };
    })
  },
  {
    symbol: 'GOOGL',
    name: 'Alphabet Inc.',
    price: 176.75,
    change: 1.85,
    changePercent: 1.06,
    previousClose: 174.90,
    open: 175.30,
    dayHigh: 177.80,
    dayLow: 174.20,
    volume: 18765400
  },
  {
    symbol: 'AMZN',
    name: 'Amazon.com Inc.',
    price: 184.60,
    change: 1.50,
    changePercent: 0.82,
    previousClose: 183.10,
    open: 182.50,
    dayHigh: 185.25,
    dayLow: 181.75,
    volume: 32145600
  },
  {
    symbol: 'TSLA',
    name: 'Tesla Inc.',
    price: 218.90,
    change: 2.60,
    changePercent: 1.20,
    previousClose: 216.30,
    open: 215.75,
    dayHigh: 220.50,
    dayLow: 214.25,
    volume: 54321000
  },
  {
    symbol: 'META',
    name: 'Meta Platforms Inc.',
    price: 488.90,
    change: 4.30,
    changePercent: 0.89,
    previousClose: 484.60,
    open: 485.25,
    dayHigh: 490.75,
    dayLow: 483.50,
    volume: 12345600
  },
  {
    symbol: 'NVDA',
    name: 'NVIDIA Corporation',
    price: 930.80,
    change: 6.50,
    changePercent: 0.70,
    previousClose: 924.30,
    open: 925.50,
    dayHigh: 935.25,
    dayLow: 920.75,
    volume: 28765400
  },
  {
    symbol: 'JPM',
    name: 'JPMorgan Chase & Co.',
    price: 197.85,
    change: 1.45,
    changePercent: 0.74,
    previousClose: 196.40,
    open: 195.25,
    dayHigh: 198.50,
    dayLow: 194.75,
    volume: 10987600
  }
];

// Mock portfolio data
const portfolioData: Portfolio[] = [
  {
    id: '1',
    user_id: 'user123',
    symbol: 'AAPL',
    name: 'Apple Inc.',
    quantity: 10,
    avg_price: 150.25,
    current_price: 177.85,
    value: 1778.50,
    gain_loss: 275.00,
    gain_loss_percent: 18.30,
    change: 0.94
  },
  {
    id: '2',
    user_id: 'user123',
    symbol: 'MSFT',
    name: 'Microsoft Corporation',
    quantity: 5,
    avg_price: 380.50,
    current_price: 413.80,
    value: 2069.00,
    gain_loss: 166.50,
    gain_loss_percent: 8.75,
    change: 0.95
  },
  {
    id: '3',
    user_id: 'user123',
    symbol: 'GOOGL',
    name: 'Alphabet Inc.',
    quantity: 8,
    avg_price: 160.30,
    current_price: 176.75,
    value: 1414.00,
    gain_loss: 131.60,
    gain_loss_percent: 10.26,
    change: 1.06
  },
  {
    id: '4',
    user_id: 'user123',
    symbol: 'AMZN',
    name: 'Amazon.com Inc.',
    quantity: 6,
    avg_price: 170.20,
    current_price: 184.60,
    value: 1107.60,
    gain_loss: 86.40,
    gain_loss_percent: 8.46,
    change: 0.82
  },
  {
    id: '5',
    user_id: 'user123',
    symbol: 'TSLA',
    name: 'Tesla Inc.',
    quantity: 4,
    avg_price: 200.50,
    current_price: 218.90,
    value: 875.60,
    gain_loss: 73.60,
    gain_loss_percent: 9.18,
    change: 1.20
  }
];

// Mock transaction data
const transactionData: Transaction[] = [
  {
    id: '1',
    user_id: 'user123',
    symbol: 'AAPL',
    quantity: 10,
    price: 150.25,
    type: 'buy',
    total: 1502.50,
    created_at: '2025-04-15T14:30:00Z',
    status: 'COMPLETED'
  },
  {
    id: '2',
    user_id: 'user123',
    symbol: 'MSFT',
    quantity: 5,
    price: 380.50,
    type: 'buy',
    total: 1902.50,
    created_at: '2025-04-16T10:15:00Z',
    status: 'COMPLETED'
  },
  {
    id: '3',
    user_id: 'user123',
    symbol: 'GOOGL',
    quantity: 8,
    price: 160.30,
    type: 'buy',
    total: 1282.40,
    created_at: '2025-04-17T09:45:00Z',
    status: 'COMPLETED'
  },
  {
    id: '4',
    user_id: 'user123',
    symbol: 'AMZN',
    quantity: 6,
    price: 170.20,
    type: 'buy',
    total: 1021.20,
    created_at: '2025-04-18T11:20:00Z',
    status: 'COMPLETED'
  },
  {
    id: '5',
    user_id: 'user123',
    symbol: 'TSLA',
    quantity: 4,
    price: 200.50,
    type: 'buy',
    total: 802.00,
    created_at: '2025-04-19T13:10:00Z',
    status: 'COMPLETED'
  },
  {
    id: '6',
    user_id: 'user123',
    symbol: 'NVDA',
    quantity: 2,
    price: 900.75,
    type: 'buy',
    total: 1801.50,
    created_at: '2025-04-19T15:30:00Z',
    status: 'COMPLETED'
  },
  {
    id: '7',
    user_id: 'user123',
    symbol: 'NVDA',
    quantity: 2,
    price: 930.80,
    type: 'sell',
    total: 1861.60,
    created_at: '2025-04-20T10:05:00Z',
    status: 'COMPLETED'
  }
];

// Mock user data
const userData: User = {
  id: 'user123',
  email: 'user@example.com',
  cash_balance: 93273.40
};

// Get all stocks
export function getAllStocks(): Stock[] {
  return popularStocks;
}

// Search stocks by keyword
export function searchStocks(keyword: string): Stock[] {
  const lowerKeyword = keyword.toLowerCase();
  return popularStocks.filter(
    stock =>
      stock.symbol.toLowerCase().includes(lowerKeyword) ||
      stock.name.toLowerCase().includes(lowerKeyword)
  );
}

// Get stock by symbol
export function getStockBySymbol(symbol: string): Stock | undefined {
  return popularStocks.find(stock => stock.symbol === symbol);
}

// Get user portfolio
export function getUserPortfolio(userId: string): Portfolio[] {
  return portfolioData;
}

// Get user transactions
export function getUserTransactions(userId: string): Transaction[] {
  return transactionData;
}

// Get user data
export function getUserData(userId: string): User {
  return userData;
}

// Calculate portfolio summary
export function getPortfolioSummary(userId: string) {
  const portfolio = getUserPortfolio(userId);
  const user = getUserData(userId);

  const portfolioValue = portfolio.reduce((total, item) => total + (item.value || 0), 0);
  const totalValue = portfolioValue + user.cash_balance;
  const initialInvestment = 100000; // Assuming initial investment was 100,000
  const gainLoss = totalValue - initialInvestment;
  const gainLossPercent = (gainLoss / initialInvestment) * 100;

  return {
    portfolioValue,
    cashBalance: user.cash_balance,
    totalValue,
    gainLoss,
    gainLossPercent
  };
}
