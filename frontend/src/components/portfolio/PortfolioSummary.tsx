'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  CircularProgress,
  Alert
} from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import { useAuth } from '@/context/AuthContext';

interface PortfolioSummaryProps {
  onDataLoaded?: (data: any) => void;
}

export default function PortfolioSummary({ onDataLoaded }: PortfolioSummaryProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [portfolioData, setPortfolioData] = useState<any>(null);
  const { user } = useAuth();

  // Fetch portfolio data
  useEffect(() => {
    const fetchPortfolioData = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        // Fetch portfolio data from API
        const portfolioResponse = await fetch(`/api/user/portfolio`, {
          headers: { 'user-id': user.id }
        });

        if (!portfolioResponse.ok) {
          throw new Error('Failed to fetch portfolio data');
        }

        const portfolioItems = await portfolioResponse.json();

        // Fetch user balance
        const balanceResponse = await fetch(`/api/user/balance`, {
          headers: { 'user-id': user.id }
        });

        if (!balanceResponse.ok) {
          throw new Error('Failed to fetch balance data');
        }

        const balanceData = await balanceResponse.json();
        const cashBalance = balanceData.cash_balance;

        // Calculate portfolio value
        let portfolioValue = 0;

        // For each portfolio item, get current price
        for (const item of portfolioItems) {
          if (item.quantity > 0) {
            try {
              const quoteResponse = await fetch(`/api/market/quote/${item.symbol}`);
              if (quoteResponse.ok) {
                const quoteData = await quoteResponse.json();
                const price = parseFloat(quoteData.Global Quote['05. price']);
                portfolioValue += price * item.quantity;
              }
            } catch (err) {
              console.error(`Error fetching price for ${item.symbol}:`, err);
            }
          }
        }

        // Calculate total value and gain/loss
        const totalValue = portfolioValue + cashBalance;
        const initialInvestment = 100000; // Assuming initial investment was 100,000
        const gainLoss = totalValue - initialInvestment;
        const gainLossPercent = (gainLoss / initialInvestment) * 100;

        const summaryData = {
          totalValue,
          portfolioValue,
          cashBalance,
          initialInvestment,
          gainLoss,
          gainLossPercent,
          stockCount: portfolioItems.length
        };

        setPortfolioData(summaryData);

        if (onDataLoaded) {
          onDataLoaded(summaryData);
        }
      } catch (error: any) {
        setError(error.message || 'Failed to load portfolio data');
      } finally {
        setLoading(false);
      }
    };

    fetchPortfolioData();
  }, [user, onDataLoaded]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 3 }}>
        {error}
      </Alert>
    );
  }

  if (!user) {
    return (
      <Alert severity="info" sx={{ mb: 3 }}>
        Please log in to view your portfolio.
      </Alert>
    );
  }

  if (!portfolioData) {
    return (
      <Alert severity="info" sx={{ mb: 3 }}>
        No portfolio data available.
      </Alert>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
      <Box sx={{ flexBasis: { xs: '100%', md: 'calc(33.333% - 16px)' } }}>
        <Paper sx={{ p: 3, height: '100%' }}>
          <Typography variant="h6" gutterBottom>
            Total Portfolio Value
          </Typography>
          <Typography variant="h3" component="div" sx={{ fontWeight: 'bold' }}>
            ${portfolioData.totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
            {portfolioData.gainLoss >= 0 ? (
              <TrendingUpIcon color="success" sx={{ mr: 1 }} />
            ) : (
              <TrendingDownIcon color="error" sx={{ mr: 1 }} />
            )}
            <Typography
              variant="body1"
              color={portfolioData.gainLoss >= 0 ? 'success.main' : 'error.main'}
            >
              {portfolioData.gainLoss >= 0 ? '+' : ''}
              ${portfolioData.gainLoss.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              ({portfolioData.gainLossPercent.toFixed(2)}%)
            </Typography>
          </Box>
        </Paper>
      </Box>
      <Box sx={{ flexBasis: { xs: '100%', md: 'calc(33.333% - 16px)' } }}>
        <Paper sx={{ p: 3, height: '100%' }}>
          <Typography variant="h6" gutterBottom>
            Invested Value
          </Typography>
          <Typography variant="h3" component="div" sx={{ fontWeight: 'bold' }}>
            ${portfolioData.portfolioValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            {portfolioData.stockCount} stocks in portfolio
          </Typography>
        </Paper>
      </Box>
      <Box sx={{ flexBasis: { xs: '100%', md: 'calc(33.333% - 16px)' } }}>
        <Paper sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
          <Typography variant="h6" gutterBottom>
            Cash Balance
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <AccountBalanceWalletIcon sx={{ mr: 1, fontSize: 30 }} color="primary" />
            <Typography variant="h3" component="div" sx={{ fontWeight: 'bold' }}>
              ${portfolioData.cashBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </Typography>
          </Box>
        </Paper>
      </Box>
    </Box>
  );
}
