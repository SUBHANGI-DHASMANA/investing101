'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  Divider,
  CircularProgress,
  Alert,
  InputAdornment
} from '@mui/material';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/services/supabase';

interface TradeFormProps {
  symbol: string;
  name?: string;
  price: number;
}

export default function TradeForm({ symbol, name, price }: TradeFormProps) {
  const [tradeType, setTradeType] = useState('buy');
  const [quantity, setQuantity] = useState('1');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [userBalance, setUserBalance] = useState<number | null>(null);
  const [userShares, setUserShares] = useState<number>(0);
  const { user } = useAuth();

  // Fetch user balance and shares
  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) return;

      try {
        // Fetch user balance from API
        const balanceResponse = await fetch(`/api/user/balance`, {
          headers: { 'user-id': user.id }
        });

        if (!balanceResponse.ok) {
          throw new Error('Failed to fetch balance data');
        }

        const balanceData = await balanceResponse.json();
        setUserBalance(balanceData.cash_balance);

        // Fetch user portfolio to check if they own this stock
        const portfolioResponse = await fetch(`/api/user/portfolio`, {
          headers: { 'user-id': user.id }
        });

        if (!portfolioResponse.ok) {
          throw new Error('Failed to fetch portfolio data');
        }

        const portfolioItems = await portfolioResponse.json();

        // Find the current stock in the portfolio
        const currentStock = portfolioItems.find((item: any) => item.symbol === symbol);

        if (currentStock) {
          setUserShares(currentStock.quantity);
        } else {
          setUserShares(0);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    fetchUserData();
  }, [user, symbol]);

  const handleTradeTypeChange = (event: SelectChangeEvent) => {
    setTradeType(event.target.value);
  };

  const handleQuantityChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    // Only allow positive integers
    const value = event.target.value;
    if (value === '' || /^[1-9]\d*$/.test(value)) {
      setQuantity(value);
    }
  };

  const handleSubmit = async () => {
    if (!user) {
      setError('You must be logged in to trade');
      return;
    }

    // Validate inputs
    if (!quantity || parseInt(quantity) <= 0) {
      setError('Please enter a valid quantity');
      return;
    }

    // Check if user has enough cash for buy order
    if (tradeType === 'buy' && userBalance !== null) {
      const totalCost = parseInt(quantity) * price;
      if (totalCost > userBalance) {
        setError('Insufficient funds for this purchase');
        return;
      }
    }

    // Check if user has enough shares for sell order
    if (tradeType === 'sell') {
      if (parseInt(quantity) > userShares) {
        setError('You do not have enough shares to sell');
        return;
      }
    }

    // Clear any previous errors
    setError(null);

    // Submit the order
    setLoading(true);

    try {
      // Create transaction data
      const transactionData = {
        symbol: symbol,
        quantity: parseInt(quantity),
        price: price,
        type: tradeType
      };

      // Call API to create transaction
      const response = await fetch('/api/user/transactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'user-id': user.id
        },
        body: JSON.stringify(transactionData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to process transaction');
      }

      // Get updated user data
      const result = await response.json();

      // Update local state with new balance
      if (result.new_balance) {
        setUserBalance(result.new_balance);
      }

      // Update shares owned if it was a buy
      if (tradeType === 'buy') {
        setUserShares(userShares + parseInt(quantity));
      } else {
        setUserShares(userShares - parseInt(quantity));
      }

      setSuccess(true);

      // Reset form after success
      setTimeout(() => {
        setSuccess(false);
      }, 3000);
    } catch (error: any) {
      setError(error.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Calculate total cost/proceeds
  const calculateTotal = () => {
    if (!quantity) return 0;
    return parseInt(quantity) * price;
  };

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Trade {name || symbol}
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

      <Box sx={{ mb: 3 }}>
        <Typography variant="body2" color="text.secondary">
          Current Price
        </Typography>
        <Typography variant="h5" component="div">
          ${price.toFixed(2)}
        </Typography>
      </Box>

      <FormControl fullWidth sx={{ mb: 2 }}>
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

      <TextField
        fullWidth
        label="Quantity"
        variant="outlined"
        value={quantity}
        onChange={handleQuantityChange}
        type="text"
        sx={{ mb: 2 }}
        InputProps={{
          inputProps: { min: 1 }
        }}
      />

      <Divider sx={{ my: 2 }} />

      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="body1">
          Estimated {tradeType === 'buy' ? 'Cost' : 'Proceeds'}:
        </Typography>
        <Typography variant="body1" fontWeight="bold">
          ${calculateTotal().toFixed(2)}
        </Typography>
      </Box>

      {userBalance !== null && (
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Available Cash:
          </Typography>
          <Typography variant="body2" color="text.secondary">
            ${userBalance.toFixed(2)}
          </Typography>
        </Box>
      )}

      {tradeType === 'sell' && (
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Shares Owned:
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {userShares}
          </Typography>
        </Box>
      )}

      <Button
        fullWidth
        variant="contained"
        size="large"
        onClick={handleSubmit}
        disabled={loading || !user}
        color={tradeType === 'buy' ? 'primary' : 'secondary'}
      >
        {loading ? (
          <CircularProgress size={24} />
        ) : !user ? (
          'Login to Trade'
        ) : (
          `${tradeType === 'buy' ? 'Buy' : 'Sell'} ${quantity || 0} Shares`
        )}
      </Button>
    </Paper>
  );
}
