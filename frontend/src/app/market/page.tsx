'use client';

import { useState, useEffect } from 'react';
import {
  Typography,
  Box,
  TextField,
  Button,
  Card,
  CardContent,
  CardActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Alert,
  InputAdornment
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import { marketAPI } from '@/services/api';

// Define types for our data
interface Stock {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent?: number;
}

export default function Market() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Stock[]>([]);
  const [popularStocks, setPopularStocks] = useState<Stock[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch popular stocks on page load
  useEffect(() => {
    const fetchPopularStocks = async () => {
      setLoading(true);
      setError(null);

      try {
        // Popular tech stocks to display
        const popularSymbols = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA', 'META', 'NVDA', 'JPM'];
        const stocksData: Stock[] = [];

        // Fetch data for each popular stock
        for (const symbol of popularSymbols) {
          try {
            const response = await marketAPI.getStockQuote(symbol);
            if (response && response['Global Quote']) {
              const quote = response['Global Quote'];
              stocksData.push({
                symbol: symbol,
                name: symbol, // Alpha Vantage doesn't provide company name in quote endpoint
                price: parseFloat(quote['05. price']),
                change: parseFloat(quote['09. change']),
                changePercent: parseFloat(quote['10. change percent'].replace('%', ''))
              });
            }
          } catch (err) {
            console.error(`Error fetching data for ${symbol}:`, err);
            // Continue with other stocks even if one fails
          }
        }

        setPopularStocks(stocksData);
      } catch (err: any) {
        console.error('Error fetching popular stocks:', err);
        setError('Failed to load popular stocks');
      } finally {
        setLoading(false);
      }
    };

    fetchPopularStocks();
  }, []);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setSearchLoading(true);
    setError(null);

    try {
      // Use the real API to search for stocks
      const response = await marketAPI.searchStocks(searchQuery);

      if (response && response.bestMatches && Array.isArray(response.bestMatches)) {
        // Transform the API response to our Stock interface
        const results: Stock[] = response.bestMatches.map((match: any) => ({
          symbol: match['1. symbol'],
          name: match['2. name'],
          price: 0, // Price not available in search results, will need to fetch separately
          change: 0  // Change not available in search results
        }));

        // For each stock in search results, fetch the current price and change
        const enhancedResults = await Promise.all(
          results.map(async (stock) => {
            try {
              const quoteData = await marketAPI.getStockQuote(stock.symbol);
              if (quoteData && quoteData['Global Quote']) {
                const quote = quoteData['Global Quote'];
                return {
                  ...stock,
                  price: parseFloat(quote['05. price']),
                  change: parseFloat(quote['09. change']),
                  changePercent: parseFloat(quote['10. change percent'].replace('%', ''))
                };
              }
              return stock;
            } catch (err) {
              console.error(`Error fetching quote for ${stock.symbol}:`, err);
              return stock;
            }
          })
        );

        setSearchResults(enhancedResults);

        if (enhancedResults.length === 0) {
          setError('No stocks found matching your search criteria.');
        }
      } else {
        setError('No stocks found matching your search criteria.');
      }
    } catch (err: any) {
      console.error('Error searching stocks:', err);
      setError('Failed to search stocks');
    } finally {
      setSearchLoading(false);
    }
  };

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Market
      </Typography>

      {/* Search Section */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Search Stocks
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <TextField
            fullWidth
            label="Search by company name or symbol"
            variant="outlined"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            aria-label="Search stocks"
            sx={{
              '& .MuiOutlinedInput-root': {
                '& fieldset': {
                  borderColor: 'rgba(0, 0, 0, 0.23)',
                },
                '&:hover fieldset': {
                  borderColor: 'rgba(0, 0, 0, 0.87)',
                },
                '&.Mui-focused fieldset': {
                  borderColor: 'primary.main',
                },
              },
            }}
            // Using the startAdornment with InputProps
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
          <Button
            variant="contained"
            onClick={handleSearch}
            disabled={searchLoading || !searchQuery.trim()}
          >
            {searchLoading ? <CircularProgress size={24} /> : 'Search'}
          </Button>
        </Box>
      </Paper>

      {/* Search Results */}
      {searchResults.length > 0 && (
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            Search Results
          </Typography>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Symbol</TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell align="right">Price</TableCell>
                  <TableCell align="right">Change</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {searchResults.map((stock) => (
                  <TableRow key={stock.symbol}>
                    <TableCell component="th" scope="row">
                      <strong>{stock.symbol}</strong>
                    </TableCell>
                    <TableCell>{stock.name}</TableCell>
                    <TableCell align="right">${stock.price.toFixed(2)}</TableCell>
                    <TableCell
                      align="right"
                      sx={{
                        color: stock.change >= 0 ? 'success.main' : 'error.main',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'flex-end'
                      }}
                    >
                      {stock.change >= 0 ? (
                        <TrendingUpIcon fontSize="small" sx={{ mr: 0.5 }} />
                      ) : (
                        <TrendingDownIcon fontSize="small" sx={{ mr: 0.5 }} />
                      )}
                      {stock.change >= 0 ? '+' : ''}{stock.change}%
                    </TableCell>
                    <TableCell align="right">
                      <Button
                        variant="outlined"
                        size="small"
                        sx={{ mr: 1 }}
                        href={`/market/${stock.symbol}`}
                      >
                        Details
                      </Button>
                      <Button
                        variant="contained"
                        size="small"
                        href={`/market/${stock.symbol}/trade`}
                      >
                        Trade
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}

      {error && (
        <Alert severity="info" sx={{ mb: 4 }}>
          {error}
        </Alert>
      )}

      {/* Popular Stocks */}
      <Typography variant="h6" gutterBottom>
        Popular Stocks
      </Typography>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
        {loading ? (
          Array.from(new Array(8)).map((_, index) => (
            <Box key={index} sx={{ flexBasis: { xs: '100%', sm: 'calc(50% - 12px)', md: 'calc(25% - 18px)' } }}>
              <Card sx={{ height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', p: 2 }}>
                <CircularProgress size={30} />
              </Card>
            </Box>
          ))
        ) : popularStocks.length > 0 ? popularStocks.map((stock) => (
          <Box key={stock.symbol} sx={{ flexBasis: { xs: '100%', sm: 'calc(50% - 12px)', md: 'calc(25% - 18px)' } }}>
            <Card>
              <CardContent>
                <Typography variant="h6" component="div">
                  {stock.symbol}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {stock.name}
                </Typography>
                <Typography variant="h5" component="div">
                  ${stock.price.toFixed(2)}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                  {stock.change >= 0 ? (
                    <TrendingUpIcon color="success" fontSize="small" sx={{ mr: 0.5 }} />
                  ) : (
                    <TrendingDownIcon color="error" fontSize="small" sx={{ mr: 0.5 }} />
                  )}
                  <Typography
                    variant="body2"
                    color={stock.change >= 0 ? 'success.main' : 'error.main'}
                  >
                    {stock.change >= 0 ? '+' : ''}{stock.change}%
                  </Typography>
                </Box>
              </CardContent>
              <CardActions>
                <Button
                  size="small"
                  href={`/market/${stock.symbol}`}
                >
                  Details
                </Button>
                <Button
                  size="small"
                  variant="contained"
                  href={`/market/${stock.symbol}/trade`}
                >
                  Trade
                </Button>
              </CardActions>
            </Card>
          </Box>
        )) : (
          <Box sx={{ width: '100%' }}>
            <Alert severity="info">
              No stocks available. Please try again later.
            </Alert>
          </Box>
        )}
      </Box>
    </Box>
  );
}
