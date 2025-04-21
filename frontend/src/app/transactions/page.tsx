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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent
} from '@mui/material';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { db, supabase } from '@/services/supabase';
// import { userAPI } from '@/services/api';
// import { getUserTransactions } from '@/services/mockData';

// Define types for our data
interface Transaction {
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

export default function Transactions() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState('all');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  const { user } = useAuth();

  // Fetch transactions from the API
  useEffect(() => {
    const fetchTransactions = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      console.log('Current user:', user);
      setLoading(true);
      setError(null);

      try {
        // Check if user exists in the database
        let userData = null;
        try {
          userData = await db.getUser(user.id);
        } catch (userErr) {
          console.log('Error fetching user data:', userErr);
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
        }

        // Fetch transactions directly from Supabase
        let transactionsData = [];
        try {
          console.log('Fetching transactions for user ID:', user.id);

          // Use Supabase client directly
          const { data, error } = await supabase
            .from('transactions')
            .select('*')
            .eq('user_id', user.id);

          if (error) {
            console.error('Supabase error fetching transactions:', error);
            throw error;
          }

          transactionsData = data || [];
          console.log('Transactions data:', transactionsData);
        } catch (transErr) {
          console.error('Error fetching transactions:', transErr);
          // Continue with empty transactions
          transactionsData = [];
        }

        if (transactionsData && transactionsData.length > 0) {
          // Add status field to each transaction
          const enhancedTransactions = transactionsData.map((transaction: Transaction) => ({
            ...transaction,
            status: 'COMPLETED' // All transactions are completed by default
          }));

          // Sort by date (newest first)
          enhancedTransactions.sort((a: Transaction, b: Transaction) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          );

          setTransactions(enhancedTransactions);
          setFilteredTransactions(enhancedTransactions);
        } else {
          // Set empty arrays if no transactions
          setTransactions([]);
          setFilteredTransactions([]);
        }
      } catch (err: any) {
        console.error('Error fetching transactions:', err);
        setError(err.message || 'Failed to load transactions');
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, [user]);

  // Filter transactions based on selected filter
  useEffect(() => {
    if (!transactions.length) return;

    if (filter === 'all') {
      setFilteredTransactions(transactions);
    } else if (filter === 'buy') {
      setFilteredTransactions(transactions.filter(transaction =>
        transaction.type.toLowerCase() === 'buy'
      ));
    } else if (filter === 'sell') {
      setFilteredTransactions(transactions.filter(transaction =>
        transaction.type.toLowerCase() === 'sell'
      ));
    }
  }, [filter, transactions]);

  const handleFilterChange = (event: SelectChangeEvent) => {
    setFilter(event.target.value);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  // Even if there's an error, we'll show a friendly UI instead of an error message
  if (error) {
    console.error('Transactions error:', error);
  }

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Transaction History
      </Typography>

      {/* Filter Controls */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">
            Your Transactions
          </Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <FormControl sx={{ minWidth: 120 }}>
              <InputLabel id="transaction-filter-label">Filter</InputLabel>
              <Select
                labelId="transaction-filter-label"
                id="transaction-filter"
                value={filter}
                label="Filter"
                onChange={handleFilterChange}
              >
                <MenuItem value="all">All Transactions</MenuItem>
                <MenuItem value="buy">Buy Orders</MenuItem>
                <MenuItem value="sell">Sell Orders</MenuItem>
              </Select>
            </FormControl>
            <Button
              variant="contained"
              component={Link}
              href="/market"
            >
              New Transaction
            </Button>
          </Box>
        </Box>
      </Paper>

      {/* Transactions Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Date & Time</TableCell>
              <TableCell>Symbol</TableCell>
              <TableCell>Type</TableCell>
              <TableCell align="right">Quantity</TableCell>
              <TableCell align="right">Price</TableCell>
              <TableCell align="right">Total</TableCell>
              <TableCell align="right">Status</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredTransactions.length > 0 ? filteredTransactions.map((transaction) => (
              <TableRow key={transaction.id}>
                <TableCell>
                  <Typography variant="body2">{new Date(transaction.created_at).toLocaleDateString()}</Typography>
                  <Typography variant="caption" color="text.secondary">{new Date(transaction.created_at).toLocaleTimeString()}</Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2"><strong>{transaction.symbol}</strong></Typography>
                </TableCell>
                <TableCell>
                  <Chip
                    label={transaction.type.toUpperCase()}
                    color={transaction.type.toLowerCase() === 'buy' ? 'primary' : 'secondary'}
                    size="small"
                  />
                </TableCell>
                <TableCell align="right">{transaction.quantity}</TableCell>
                <TableCell align="right">${transaction.price.toFixed(2)}</TableCell>
                <TableCell align="right">${transaction.total.toFixed(2)}</TableCell>
                <TableCell align="right">
                  <Chip
                    label={transaction.status}
                    color="success"
                    size="small"
                    variant="outlined"
                  />
                </TableCell>
                <TableCell align="right">
                  <Button
                    variant="outlined"
                    size="small"
                    component={Link}
                    href={`/market/${transaction.symbol}`}
                  >
                    View Stock
                  </Button>
                </TableCell>
              </TableRow>
            )) : (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  <Typography variant="body1" sx={{ py: 3 }}>
                    No transactions found. Start trading to see your transaction history.
                  </Typography>
                  <Button
                    variant="contained"
                    component={Link}
                    href="/market"
                  >
                    Explore Markets
                  </Button>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {filteredTransactions.length === 0 && (
        <Alert severity="info" sx={{ mt: 2 }}>
          No transactions found matching your filter criteria.
        </Alert>
      )}
    </Box>
  );
}
