'use client';

import { useState, useEffect } from 'react';
import {
  Typography,
  Box,
  Paper,
  Card,
  CardContent,
  CardHeader,
  List,
  ListItem,
  ListItemText,
  Divider,
  Button,
  CircularProgress
} from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { db, supabase } from '@/services/supabase';
import { userAPI } from '@/services/api';
// import { getUserPortfolio, getUserTransactions, getPortfolioSummary } from '@/services/mockData';

// Define types for our data
interface Portfolio {
  id: string;
  user_id: string;
  symbol: string;
  quantity: number;
  avg_price: number;
  name?: string;
  current_price?: number;
  value?: number;
  change?: number;
}

interface Transaction {
  id: string;
  user_id: string;
  symbol: string;
  quantity: number;
  price: number;
  type: string;
  total: number;
  created_at: string;
}

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [portfolioValue, setPortfolioValue] = useState(0);
  const [cashBalance, setCashBalance] = useState(0);
  const [totalValue, setTotalValue] = useState(0);
  const [gainLoss, setGainLoss] = useState(0);
  const [gainLossPercent, setGainLossPercent] = useState(0);
  const [topHoldings, setTopHoldings] = useState<Portfolio[]>([]);
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
  const { user } = useAuth();

  // Fetch data from the API
  useEffect(() => {
    const fetchData = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        // Fetch user's cash balance first
        let userData = null;
        try {
          userData = await db.getUser(user.id);
        } catch (userErr) {
          console.log('Error fetching user data:', userErr);
          // Continue with default values
        }

        if (!userData) {
          try {
            // Create a new user if one doesn't exist
            const newUser = {
              id: user.id,
              email: user.email,
              cash_balance: 100000
            };

            // Insert the new user into the database
            const { data, error } = await supabase
              .from('users')
              .insert(newUser)
              .select();

            if (!error && data) {
              userData = data[0];
            } else {
              console.error('Error creating new user:', error);
            }
          } catch (createErr) {
            console.error('Error creating new user:', createErr);
          }

          if (!userData) {
            // If we still don't have user data, use default values
            setCashBalance(100000); // Default starting balance
            setTotalValue(100000);
            setGainLoss(0);
            setGainLossPercent(0);
            setTopHoldings([]);
            setRecentTransactions([]);
            setLoading(false);
            return;
          }
        }

        setCashBalance(userData.cash_balance || 100000);

        // Fetch portfolio data
        let portfolioData = [];
        try {
          portfolioData = await db.getPortfolio(user.id);
        } catch (portfolioErr) {
          console.log('No portfolio data yet:', portfolioErr);
          // Continue with empty portfolio
          portfolioData = [];
        }

        // Calculate portfolio value
        let portfolioTotal = 0;
        let enhancedPortfolio: Portfolio[] = [];

        if (portfolioData && portfolioData.length > 0) {
          enhancedPortfolio = portfolioData.map((item: Portfolio) => {
            // In a real app, you would fetch current prices from your API
            // For now, we'll use the average price as the current price
            const currentPrice = item.avg_price * 1.05; // Simulate a 5% increase
            const value = item.quantity * currentPrice;
            portfolioTotal += value;

            return {
              ...item,
              current_price: currentPrice,
              value: value,
              change: 5 // Simulate a 5% change
            };
          });

          // Sort by value (descending)
          enhancedPortfolio.sort((a, b) => (b.value || 0) - (a.value || 0));
        }

        setTopHoldings(enhancedPortfolio.slice(0, 5)); // Top 5 holdings
        setPortfolioValue(portfolioTotal);

        // Calculate total value and gain/loss
        const total = portfolioTotal + (userData.cash_balance || 100000);
        setTotalValue(total);

        // Assuming initial investment was 100000 (this should come from your database in a real app)
        const initialInvestment = 100000;
        const gain = total - initialInvestment;
        setGainLoss(gain);
        setGainLossPercent((gain / initialInvestment) * 100);

        // Fetch recent transactions
        let transactionsData = [];
        try {
          transactionsData = await db.getTransactions(user.id);
          // Sort by date (descending)
          if (transactionsData && transactionsData.length > 0) {
            transactionsData.sort((a: Transaction, b: Transaction) =>
              new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
            );
          }
        } catch (transErr) {
          console.log('No transaction data yet:', transErr);
          // Continue with empty transactions
          transactionsData = [];
        }

        setRecentTransactions(transactionsData.slice(0, 4)); // Most recent 4 transactions
      } catch (err: any) {
        console.error('Error fetching dashboard data:', err);
        setError(err.message || 'Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  // Even if there's an error, we'll show a friendly UI instead of an error message
  if (error) {
    console.error('Dashboard error:', error);
  }

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Dashboard
      </Typography>

      {/* Portfolio Summary */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mb: 4 }}>
        <Box sx={{ flexBasis: { xs: '100%', md: 'calc(33.333% - 16px)' } }}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Total Portfolio Value
            </Typography>
            <Typography variant="h3" component="div" sx={{ fontWeight: 'bold' }}>
              ${totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
              {gainLoss >= 0 ? (
                <TrendingUpIcon color="success" sx={{ mr: 1 }} />
              ) : (
                <TrendingDownIcon color="error" sx={{ mr: 1 }} />
              )}
              <Typography
                variant="body1"
                color={gainLoss >= 0 ? 'success.main' : 'error.main'}
              >
                {gainLoss >= 0 ? '+' : ''}
                ${gainLoss.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                ({gainLossPercent.toFixed(2)}%)
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
              ${portfolioValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </Typography>
            <Button
              variant="outlined"
              size="small"
              sx={{ mt: 2 }}
              component={Link}
              href="/portfolio"
            >
              View Portfolio
            </Button>
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
                ${cashBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </Typography>
            </Box>
            <Button
              variant="contained"
              sx={{ mt: 'auto', alignSelf: 'flex-start' }}
              component={Link}
              href="/market"
            >
              Invest Now
            </Button>
          </Paper>
        </Box>
      </Box>

      {/* Top Holdings and Recent Transactions */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
        <Box sx={{ flexBasis: { xs: '100%', md: 'calc(50% - 12px)' } }}>
          <Card>
            <CardHeader title="Top Holdings" />
            <CardContent>
              <List>
                {topHoldings.length > 0 ? topHoldings.map((holding, index) => (
                  <Box key={holding.id || holding.symbol}>
                    <ListItem>
                      <ListItemText
                        primary={`${holding.symbol}`}
                        secondary={`$${(holding.value || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                      />
                      <Typography
                        variant="body2"
                        color={(holding.change || 0) >= 0 ? 'success.main' : 'error.main'}
                      >
                        {(holding.change || 0) >= 0 ? '+' : ''}{holding.change || 0}%
                      </Typography>
                    </ListItem>
                    {index < topHoldings.length - 1 && <Divider />}
                  </Box>
                )) : (
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 3 }}>
                    <Typography variant="body1" sx={{ mb: 2, textAlign: 'center' }}>
                      You don't have any investments yet.
                    </Typography>
                    <Button
                      variant="contained"
                      component={Link}
                      href="/market"
                    >
                      Start Investing
                    </Button>
                  </Box>
                )}
              </List>
              <Button
                variant="text"
                component={Link}
                href="/portfolio"
                sx={{ mt: 2 }}
              >
                View All Holdings
              </Button>
            </CardContent>
          </Card>
        </Box>
        <Box sx={{ flexBasis: { xs: '100%', md: 'calc(50% - 12px)' } }}>
          <Card>
            <CardHeader title="Recent Transactions" />
            <CardContent>
              <List>
                {recentTransactions.length > 0 ? recentTransactions.map((transaction, index) => (
                  <Box key={transaction.id}>
                    <ListItem>
                      <ListItemText
                        primary={`${transaction.type.toUpperCase()} ${transaction.quantity} ${transaction.symbol}`}
                        secondary={`${new Date(transaction.created_at).toLocaleDateString()} • $${transaction.price.toFixed(2)} per share`}
                      />
                      <Typography
                        variant="body2"
                        color={transaction.type.toLowerCase() === 'buy' ? 'primary.main' : 'secondary.main'}
                      >
                        ${transaction.total.toFixed(2)}
                      </Typography>
                    </ListItem>
                    {index < recentTransactions.length - 1 && <Divider />}
                  </Box>
                )) : (
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 3 }}>
                    <Typography variant="body1" sx={{ mb: 2, textAlign: 'center' }}>
                      You haven't made any transactions yet.
                    </Typography>
                    <Button
                      variant="contained"
                      component={Link}
                      href="/market"
                    >
                      Start Trading
                    </Button>
                  </Box>
                )}
              </List>
              <Button
                variant="text"
                component={Link}
                href="/transactions"
                sx={{ mt: 2 }}
              >
                View All Transactions
              </Button>
            </CardContent>
          </Card>
        </Box>
      </Box>
    </Box>
  );
}
