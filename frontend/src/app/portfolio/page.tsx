'use client';

import { useState, useEffect } from 'react';
import {
  Typography,
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  CircularProgress,
  Alert,
  Chip,
  Card,
  CardContent
} from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import PieChartIcon from '@mui/icons-material/PieChart';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { db, supabase } from '@/services/supabase';
// import { getUserPortfolio, getPortfolioSummary } from '@/services/mockData';

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
  gain_loss?: number;
  gain_loss_percent?: number;
}

export default function Portfolio() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [portfolioValue, setPortfolioValue] = useState(0);
  const [cashBalance, setCashBalance] = useState(0);
  const [totalValue, setTotalValue] = useState(0);
  const [gainLoss, setGainLoss] = useState(0);
  const [gainLossPercent, setGainLossPercent] = useState(0);
  const [portfolioHoldings, setPortfolioHoldings] = useState<Portfolio[]>([]);
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
            setPortfolioHoldings([]);
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
            const gainLoss = value - (item.quantity * item.avg_price);
            const gainLossPercent = (gainLoss / (item.quantity * item.avg_price)) * 100;
            portfolioTotal += value;

            return {
              ...item,
              current_price: currentPrice,
              value: value,
              gain_loss: gainLoss,
              gain_loss_percent: gainLossPercent
            };
          });
        }

        setPortfolioHoldings(enhancedPortfolio);
        setPortfolioValue(portfolioTotal);

        // Calculate total value and gain/loss
        const total = portfolioTotal + (userData.cash_balance || 100000);
        setTotalValue(total);

        // Assuming initial investment was 100000 (this should come from your database in a real app)
        const initialInvestment = 100000;
        const gain = total - initialInvestment;
        setGainLoss(gain);
        setGainLossPercent((gain / initialInvestment) * 100);
      } catch (err: any) {
        console.error('Error fetching portfolio data:', err);
        setError(err.message || 'Failed to load portfolio data');
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
    console.error('Portfolio error:', error);
  }

  // Calculate total portfolio value
  const totalPortfolioValue = portfolioHoldings.reduce((total, holding) => total + (holding.value || 0), 0);

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Portfolio
      </Typography>

      {/* Portfolio Summary */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mb: 4 }}>
        <Box sx={{ flexBasis: { xs: '100%', md: 'calc(33.333% - 16px)' } }}>
          <Paper sx={{ p: 3 }}>
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
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Invested Value
            </Typography>
            <Typography variant="h3" component="div" sx={{ fontWeight: 'bold' }}>
              ${portfolioValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              {portfolioHoldings.length} stocks in portfolio
            </Typography>
          </Paper>
        </Box>
        <Box sx={{ flexBasis: { xs: '100%', md: 'calc(33.333% - 16px)' } }}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Cash Balance
            </Typography>
            <Typography variant="h3" component="div" sx={{ fontWeight: 'bold' }}>
              ${cashBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </Typography>
            <Button
              variant="contained"
              sx={{ mt: 2 }}
              component={Link}
              href="/market"
            >
              Invest Now
            </Button>
          </Paper>
        </Box>
      </Box>

      {/* Portfolio Allocation - In a real app, you would use a chart library here */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <PieChartIcon color="primary" sx={{ mr: 1 }} />
            <Typography variant="h6">
              Portfolio Allocation
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {portfolioHoldings.length > 0 ? portfolioHoldings.map((holding) => {
              const percentage = (((holding.value || 0) / totalPortfolioValue) * 100).toFixed(1);
              return (
                <Chip
                  key={holding.id || holding.symbol}
                  label={`${holding.symbol}: ${percentage}%`}
                  color="primary"
                  variant="outlined"
                />
              );
            }) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 2 }}>
                <Typography variant="body1" sx={{ mb: 2, textAlign: 'center' }}>
                  You don't have any investments yet. Start investing to see your portfolio allocation.
                </Typography>
                <Button
                  variant="contained"
                  component={Link}
                  href="/market"
                >
                  Explore Markets
                </Button>
              </Box>
            )}
          </Box>
        </CardContent>
      </Card>

      {/* Portfolio Holdings */}
      <Typography variant="h6" gutterBottom>
        Holdings
      </Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Symbol</TableCell>
              <TableCell>Name</TableCell>
              <TableCell align="right">Shares</TableCell>
              <TableCell align="right">Avg. Price</TableCell>
              <TableCell align="right">Current Price</TableCell>
              <TableCell align="right">Value</TableCell>
              <TableCell align="right">Gain/Loss</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {portfolioHoldings.length > 0 ? portfolioHoldings.map((holding) => (
              <TableRow key={holding.id || holding.symbol}>
                <TableCell component="th" scope="row">
                  <strong>{holding.symbol}</strong>
                </TableCell>
                <TableCell>{holding.name || holding.symbol}</TableCell>
                <TableCell align="right">{holding.quantity}</TableCell>
                <TableCell align="right">${holding.avg_price.toFixed(2)}</TableCell>
                <TableCell align="right">${(holding.current_price || 0).toFixed(2)}</TableCell>
                <TableCell align="right">${(holding.value || 0).toFixed(2)}</TableCell>
                <TableCell
                  align="right"
                  sx={{ color: (holding.gain_loss || 0) >= 0 ? 'success.main' : 'error.main' }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                    {(holding.gain_loss || 0) >= 0 ? (
                      <TrendingUpIcon fontSize="small" sx={{ mr: 0.5 }} />
                    ) : (
                      <TrendingDownIcon fontSize="small" sx={{ mr: 0.5 }} />
                    )}
                    <span>
                      {(holding.gain_loss || 0) >= 0 ? '+' : ''}${(holding.gain_loss || 0).toFixed(2)}
                      ({(holding.gain_loss_percent || 0) >= 0 ? '+' : ''}{(holding.gain_loss_percent || 0).toFixed(2)}%)
                    </span>
                  </Box>
                </TableCell>
                <TableCell align="right">
                  <Button
                    variant="outlined"
                    size="small"
                    sx={{ mr: 1 }}
                    component={Link}
                    href={`/market/${holding.symbol}`}
                  >
                    Details
                  </Button>
                  <Button
                    variant="contained"
                    size="small"
                    component={Link}
                    href={`/market/${holding.symbol}/trade`}
                  >
                    Trade
                  </Button>
                </TableCell>
              </TableRow>
            )) : (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  <Box sx={{ py: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <Typography variant="h6" sx={{ mb: 1 }}>
                      Your Portfolio is Empty
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 3, textAlign: 'center' }}>
                      Start investing to build your portfolio and track your investments.
                    </Typography>
                    <Button
                      variant="contained"
                      size="large"
                      component={Link}
                      href="/market"
                    >
                      Start Investing Now
                    </Button>
                  </Box>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
