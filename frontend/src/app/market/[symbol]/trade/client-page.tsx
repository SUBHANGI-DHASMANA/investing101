'use client';

import { useState, useEffect } from 'react';
import {
  Typography,
  Box,
  Paper,
  Button,
  CircularProgress,
  Alert,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
  Card,
  CardContent,
  InputAdornment
} from '@mui/material';
import { SelectChangeEvent } from '@mui/material/Select';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import Link from 'next/link';

import { marketAPI } from '@/services/api';
import { db } from '@/services/supabase';
import { userAPI } from '@/services/api';
import { useAuth } from '@/context/AuthContext';

export default function ClientTradePage({ symbol }: { symbol: string }) {
  // Log the symbol for debugging
  console.log('Trade page symbol:', symbol);
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stockData, setStockData] = useState<any>(null);
  const [userData, setUserData] = useState<any>({
    cashBalance: 100000,
    portfolio: {}
  });
  const [tradeType, setTradeType] = useState('buy');
  const [quantity, setQuantity] = useState('1');
  const [orderType, setOrderType] = useState('market');
  const [limitPrice, setLimitPrice] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  // Fetch stock data and user data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Check if symbol is defined
        if (!symbol) {
          setError('No stock symbol provided.');
          setLoading(false);
          return;
        }

        // Get stock data from the real API
        try {
          const quoteResponse = await marketAPI.getStockQuote(symbol);

          if (!quoteResponse || !quoteResponse['Global Quote'] || Object.keys(quoteResponse['Global Quote']).length === 0) {
            setError(`Stock data for ${symbol} not found.`);
            setLoading(false);
            return;
          }

          const quote = quoteResponse['Global Quote'];

          // Format the data for our UI
          const stockData = {
            symbol: symbol,
            name: symbol, // Alpha Vantage doesn't provide company name in quote endpoint
            price: parseFloat(quote['05. price']),
            change: parseFloat(quote['09. change']),
            changePercent: parseFloat(quote['10. change percent'].replace('%', ''))
          };

          setStockData(stockData);
        } catch (err) {
          console.error('Error fetching stock data:', err);
          setError(`Failed to load data for ${symbol}. Please try again later.`);
          setLoading(false);
          return;
        }

        // Get user data if logged in
        if (user?.id) {
          try {
            // Get user's data
            const userData = await db.getUser(user.id);

            // Get user's portfolio
            const portfolioData = await db.getPortfolio(user.id);

            // Format portfolio data
            const portfolioMap: any = {};
            if (portfolioData && Array.isArray(portfolioData)) {
              portfolioData.forEach((item: any) => {
                portfolioMap[item.symbol] = {
                  shares: item.quantity,
                  avgPrice: item.avg_price
                };
              });
            }

            setUserData({
              cashBalance: userData?.cash_balance || 100000,
              portfolio: portfolioMap
            });
          } catch (userErr) {
            console.error('Error fetching user data:', userErr);
            // Continue with default values
          }
        }
      } catch (err) {
        console.error('Error:', err);
        setError('Failed to load data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [symbol]);

  const handleTradeTypeChange = (event: SelectChangeEvent) => {
    setTradeType(event.target.value);
  };

  const handleOrderTypeChange = (event: SelectChangeEvent) => {
    setOrderType(event.target.value);
    if (event.target.value === 'market') {
      setLimitPrice('');
    } else if (event.target.value === 'limit' && !limitPrice) {
      setLimitPrice(stockData.price.toString());
    }
  };

  const handleQuantityChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    // Only allow positive integers
    const value = event.target.value;
    if (value === '' || /^[1-9]\d*$/.test(value)) {
      setQuantity(value);
    }
  };

  const handleLimitPriceChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    // Only allow positive numbers with up to 2 decimal places
    const value = event.target.value;
    if (value === '' || /^\d+(\.\d{0,2})?$/.test(value)) {
      setLimitPrice(value);
    }
  };

  const handleSubmit = async () => {
    // Validate inputs
    if (!quantity || parseInt(quantity) <= 0) {
      setError('Please enter a valid quantity.');
      return;
    }

    if (orderType === 'limit' && (!limitPrice || parseFloat(limitPrice) <= 0)) {
      setError('Please enter a valid limit price.');
      return;
    }

    // Check if user has enough cash for buy order
    if (tradeType === 'buy') {
      const totalCost = parseInt(quantity) * stockData.price;
      if (totalCost > userData.cashBalance) {
        setError('Insufficient funds for this purchase.');
        return;
      }
    }

    // Check if user has enough shares for sell order
    if (tradeType === 'sell') {
      const userShares = userData.portfolio[symbol]?.shares || 0;
      if (parseInt(quantity) > userShares) {
        setError('You do not have enough shares to sell.');
        return;
      }
    }

    // Check if user is logged in
    if (!user?.id) {
      setError('You must be logged in to trade.');
      return;
    }

    // Clear any previous errors
    setError(null);

    // Submit the order
    setSubmitting(true);

    try {
      // Ensure the user exists in the database (should already be created by AuthContext)
      let userData = null;
      try {
        userData = await db.getUser(user.id);
      } catch (userErr) {
        console.error('User not found in database:', userErr);
        throw new Error('Your user account is not properly set up. Please try logging out and logging back in.');
      }

      if (!userData) {
        throw new Error('Your user account is not properly set up. Please try logging out and logging back in.');
      }

      // Create transaction data
      const transactionData = {
        symbol: symbol,
        quantity: parseInt(quantity),
        price: orderType === 'limit' ? parseFloat(limitPrice) : stockData.price,
        type: tradeType // 'buy' or 'sell'
      };

      // Create transaction using the backend API
      // This will trigger the portfolio update logic in the backend
      const transactionResponse = await userAPI.createTransaction(user.id, {
        symbol: transactionData.symbol,
        quantity: transactionData.quantity,
        price: transactionData.price,
        type: transactionData.type
      });

      // Immediately update the cash balance with the value returned from the API
      if (transactionResponse && transactionResponse.new_balance !== undefined) {
        // Update the cash balance immediately
        setUserData((prevData: { cashBalance: number; portfolio: any }) => ({
          ...prevData,
          cashBalance: transactionResponse.new_balance
        }));
      }

      // Show success message
      setSuccess(true);

      // Reset form after success
      setTimeout(() => {
        setSuccess(false);

        // Refresh all user data to ensure everything is in sync
        const refreshUserData = async () => {
          try {
            const userData = await db.getUser(user.id);
            const portfolioData = await db.getPortfolio(user.id);

            // Format portfolio data
            const portfolioMap: any = {};
            if (portfolioData && Array.isArray(portfolioData)) {
              portfolioData.forEach((item: any) => {
                portfolioMap[item.symbol] = {
                  shares: item.quantity,
                  avgPrice: item.avg_price
                };
              });
            }

            setUserData({
              cashBalance: userData?.cash_balance || 100000,
              portfolio: portfolioMap
            });
          } catch (err) {
            console.error('Error refreshing user data:', err);
          }
        };

        refreshUserData();
      }, 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to create transaction. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // Calculate total cost/proceeds
  const calculateTotal = () => {
    if (!quantity || !stockData) return 0;
    return parseInt(quantity) * stockData.price;
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error && !stockData) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        {error || `Failed to load data for ${symbol}`}
      </Alert>
    );
  }

  return (
    <Box>
      {/* Stock Header */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box>
            <Typography variant="h4" component="h1" gutterBottom>
              Trade {stockData.name} ({stockData.symbol})
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Typography variant="h5" component="div" sx={{ fontWeight: 'bold', mr: 2 }}>
                ${stockData.price.toFixed(2)}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                {stockData.change >= 0 ? (
                  <TrendingUpIcon color="success" sx={{ mr: 0.5 }} />
                ) : (
                  <TrendingDownIcon color="error" sx={{ mr: 0.5 }} />
                )}
                <Typography
                  variant="body1"
                  color={stockData.change >= 0 ? 'success.main' : 'error.main'}
                >
                  {stockData.change >= 0 ? '+' : ''}${stockData.change.toFixed(2)}
                  ({stockData.changePercent >= 0 ? '+' : ''}{stockData.changePercent.toFixed(2)}%)
                </Typography>
              </Box>
            </Box>
          </Box>
          <Button
            variant="outlined"
            component={Link}
            href={`/market/${stockData.symbol}`}
          >
            View Details
          </Button>
        </Box>
      </Paper>

      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
        {/* Trade Form */}
        <Box sx={{ flexBasis: { xs: '100%', md: 'calc(66.666% - 12px)' } }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Place Order
              </Typography>

              {error && (
                <Alert severity="error" sx={{ mb: 3 }}>
                  {error}
                </Alert>
              )}

              {success && (
                <Alert severity="success" sx={{ mb: 3 }}>
                  Order submitted successfully!
                </Alert>
              )}

              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
                <Box sx={{ flexBasis: { xs: '100%', sm: 'calc(50% - 12px)' } }}>
                  <FormControl fullWidth>
                    <InputLabel id="trade-type-label">Order Action</InputLabel>
                    <Select
                      labelId="trade-type-label"
                      id="trade-type"
                      value={tradeType}
                      label="Order Action"
                      onChange={handleTradeTypeChange}
                    >
                      <MenuItem value="buy">Buy</MenuItem>
                      <MenuItem value="sell">Sell</MenuItem>
                    </Select>
                  </FormControl>
                </Box>
                <Box sx={{ flexBasis: { xs: '100%', sm: 'calc(50% - 12px)' } }}>
                  <FormControl fullWidth>
                    <InputLabel id="order-type-label">Order Type</InputLabel>
                    <Select
                      labelId="order-type-label"
                      id="order-type"
                      value={orderType}
                      label="Order Type"
                      onChange={handleOrderTypeChange}
                    >
                      <MenuItem value="market">Market Order</MenuItem>
                      <MenuItem value="limit">Limit Order</MenuItem>
                    </Select>
                  </FormControl>
                </Box>
                <Box sx={{ flexBasis: { xs: '100%', sm: 'calc(50% - 12px)' } }}>
                  <TextField
                    fullWidth
                    label="Quantity"
                    variant="outlined"
                    value={quantity}
                    onChange={handleQuantityChange}
                    type="number"
                    sx={{
                      '& input': {
                        minWidth: 0
                      }
                    }}
                    // Using inputProps for min attribute
                    inputProps={{
                      min: 1
                    }}
                  />
                </Box>
                {orderType === 'limit' && (
                  <Box sx={{ flexBasis: { xs: '100%', sm: 'calc(50% - 12px)' } }}>
                    <TextField
                      fullWidth
                      label="Limit Price"
                      variant="outlined"
                      value={limitPrice}
                      onChange={handleLimitPriceChange}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          '& fieldset': {
                            borderColor: 'rgba(0, 0, 0, 0.23)',
                          }
                        }
                      }}
                      // Using InputProps with startAdornment
                      InputProps={{
                        startAdornment: <InputAdornment position="start">$</InputAdornment>
                      }}
                    />
                  </Box>
                )}
                <Box sx={{ width: '100%' }}>
                  <Divider sx={{ my: 2 }} />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Typography variant="body1">
                      Estimated {tradeType === 'buy' ? 'Cost' : 'Proceeds'}:
                    </Typography>
                    <Typography variant="body1" fontWeight="bold">
                      ${calculateTotal().toFixed(2)}
                    </Typography>
                  </Box>
                  <Button
                    fullWidth
                    variant="contained"
                    size="large"
                    onClick={handleSubmit}
                    disabled={submitting}
                    color={tradeType === 'buy' ? 'primary' : 'secondary'}
                  >
                    {submitting ? (
                      <CircularProgress size={24} />
                    ) : (
                      `${tradeType === 'buy' ? 'Buy' : 'Sell'} ${quantity || 0} Shares`
                    )}
                  </Button>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Box>

        {/* Account Information */}
        <Box sx={{ flexBasis: { xs: '100%', md: 'calc(33.333% - 12px)' } }}>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Account Information
              </Typography>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Available Cash
                </Typography>
                <Typography variant="h5" component="div">
                  ${userData.cashBalance.toFixed(2)}
                </Typography>
              </Box>
              <Divider sx={{ my: 2 }} />
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Current Position
                </Typography>
                {userData.portfolio[symbol] ? (
                  <>
                    <Typography variant="h5" component="div">
                      {userData.portfolio[symbol].shares} Shares
                    </Typography>
                    <Typography variant="body2">
                      Avg. Price: ${userData.portfolio[symbol].avgPrice.toFixed(2)}
                    </Typography>
                    <Typography variant="body2">
                      Current Value: ${(userData.portfolio[symbol].shares * stockData.price).toFixed(2)}
                    </Typography>
                  </>
                ) : (
                  <Typography variant="body1">
                    You don't own any shares of {symbol}
                  </Typography>
                )}
              </Box>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Order Summary
              </Typography>
              <Box sx={{ mb: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  Symbol
                </Typography>
                <Typography variant="body1">
                  {stockData.symbol} - {stockData.name}
                </Typography>
              </Box>
              <Box sx={{ mb: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  Action
                </Typography>
                <Typography variant="body1" sx={{ textTransform: 'capitalize' }}>
                  {tradeType}
                </Typography>
              </Box>
              <Box sx={{ mb: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  Order Type
                </Typography>
                <Typography variant="body1" sx={{ textTransform: 'capitalize' }}>
                  {orderType} {orderType === 'limit' && limitPrice && `@ $${limitPrice}`}
                </Typography>
              </Box>
              <Box sx={{ mb: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  Quantity
                </Typography>
                <Typography variant="body1">
                  {quantity || 0} Shares
                </Typography>
              </Box>
              <Box sx={{ mb: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  Market Price
                </Typography>
                <Typography variant="body1">
                  ${stockData.price.toFixed(2)}
                </Typography>
              </Box>
              <Divider sx={{ my: 2 }} />
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Estimated {tradeType === 'buy' ? 'Cost' : 'Proceeds'}
                </Typography>
                <Typography variant="h6" component="div" fontWeight="bold">
                  ${calculateTotal().toFixed(2)}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Box>
      </Box>
    </Box>
  );
}
