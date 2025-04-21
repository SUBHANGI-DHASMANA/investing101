'use client';

import { useState, useEffect } from 'react';
import {
  Typography,
  Box,
  Paper,
  Button,
  CircularProgress,
  Alert,
  Tabs,
  Tab,
  Divider,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow
} from '@mui/material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import Link from 'next/link';

import { marketAPI } from '@/services/api';

export default function ClientStockDetail({ symbol }: { symbol: string }) {
  // Log the symbol for debugging
  console.log('Stock detail page symbol:', symbol);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stockData, setStockData] = useState<any>(null);
  const [tabValue, setTabValue] = useState(0);

  // Fetch stock data from the real API
  useEffect(() => {
    const fetchStockData = async () => {
      setLoading(true);

      // Check if symbol is defined
      if (!symbol) {
        setError('No stock symbol provided.');
        setLoading(false);
        return;
      }

      try {
        // Get the current quote
        const quoteResponse = await marketAPI.getStockQuote(symbol);

        if (!quoteResponse || !quoteResponse['Global Quote'] || Object.keys(quoteResponse['Global Quote']).length === 0) {
          setError(`Stock data for ${symbol} not found.`);
          setLoading(false);
          return;
        }

        const quote = quoteResponse['Global Quote'];

        // Get the daily time series data for the chart
        const dailyResponse = await marketAPI.getDailyData(symbol);

        // Format the data for our UI
        const stockData = {
          symbol: symbol,
          name: symbol, // Alpha Vantage doesn't provide company name in quote endpoint
          price: parseFloat(quote['05. price']),
          change: parseFloat(quote['09. change']),
          changePercent: parseFloat(quote['10. change percent'].replace('%', '')),
          previousClose: parseFloat(quote['08. previous close']),
          open: parseFloat(quote['02. open']),
          dayHigh: parseFloat(quote['03. high']),
          dayLow: parseFloat(quote['04. low']),
          volume: parseInt(quote['06. volume']),
          // Default values for fields not provided by Alpha Vantage
          marketCap: 'N/A',
          peRatio: 'N/A',
          dividend: 0,
          dividendYield: 0,
          description: `${symbol} is a publicly traded company. Detailed information is not available.`,
          // Format historical data if available
          historicalData: dailyResponse && dailyResponse['Time Series (Daily)'] ?
            Object.entries(dailyResponse['Time Series (Daily)']).slice(0, 30).map(([date, data]: [string, any]) => ({
              date,
              price: parseFloat(data['4. close'])
            })).reverse() : [],
          // Default news and key stats
          news: [
            { title: 'No recent news available', date: new Date().toLocaleDateString(), source: 'InvestDemo' }
          ],
          keyStats: [
            { label: '52 Week Range', value: 'N/A' },
            { label: 'Avg. Volume', value: quote['06. volume'] },
            { label: 'Market Cap', value: 'N/A' }
          ]
        };

        setStockData(stockData);
      } catch (err) {
        console.error('Error fetching stock data:', err);
        setError(`Failed to load data for ${symbol}. Please try again later.`);
      } finally {
        setLoading(false);
      }
    };

    fetchStockData();
  }, [symbol]);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !stockData) {
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
              {stockData.name} ({stockData.symbol})
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Typography variant="h3" component="div" sx={{ fontWeight: 'bold', mr: 2 }}>
                ${stockData.price.toFixed(2)}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                {stockData.change >= 0 ? (
                  <TrendingUpIcon color="success" sx={{ mr: 0.5 }} />
                ) : (
                  <TrendingDownIcon color="error" sx={{ mr: 0.5 }} />
                )}
                <Typography
                  variant="h6"
                  color={stockData.change >= 0 ? 'success.main' : 'error.main'}
                >
                  {stockData.change >= 0 ? '+' : ''}${stockData.change.toFixed(2)}
                  ({stockData.changePercent >= 0 ? '+' : ''}{stockData.changePercent.toFixed(2)}%)
                </Typography>
              </Box>
            </Box>
          </Box>
          <Button
            variant="contained"
            size="large"
            component={Link}
            href={`/market/${stockData.symbol}/trade`}
          >
            Trade
          </Button>
        </Box>
      </Paper>

      {/* Tabs for different sections */}
      <Box sx={{ mb: 2 }}>
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="stock information tabs">
          <Tab label="Overview" />
          <Tab label="Key Statistics" />
          <Tab label="News" />
        </Tabs>
      </Box>

      <Divider sx={{ mb: 3 }} />

      {/* Tab Content */}
      {tabValue === 0 && (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
          <Box sx={{ flexBasis: { xs: '100%', md: '66.666%' } }}>
            <Typography variant="h6" gutterBottom>
              About {stockData.name}
            </Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>
              {stockData.description}
            </Typography>

            {/* Stock Price Chart */}
            <Paper
              sx={{
                height: 300,
                p: 2,
                mb: 3
              }}
            >
              <Typography variant="h6" gutterBottom>
                Stock Price History - Last 30 Days
              </Typography>
              {stockData.historicalData ? (
                <ResponsiveContainer width="100%" height="80%">
                  <LineChart
                    data={stockData.historicalData}
                    margin={{
                      top: 5,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 12 }}
                      tickFormatter={(value) => {
                        const date = new Date(value);
                        return `${date.getMonth() + 1}/${date.getDate()}`;
                      }}
                    />
                    <YAxis
                      domain={['auto', 'auto']}
                      tick={{ fontSize: 12 }}
                      tickFormatter={(value) => `$${value}`}
                    />
                    <Tooltip
                      formatter={(value) => [`$${value}`, 'Price']}
                      labelFormatter={(label) => {
                        const date = new Date(label);
                        return date.toLocaleDateString();
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="price"
                      stroke="#8884d8"
                      activeDot={{ r: 8 }}
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80%' }}>
                  <Typography variant="body1" color="text.secondary">
                    No historical data available
                  </Typography>
                </Box>
              )}
            </Paper>
          </Box>
          <Box sx={{ flexBasis: { xs: '100%', md: '33.333%' } }}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Market Data
                </Typography>
                <TableContainer>
                  <Table size="small">
                    <TableBody>
                      <TableRow>
                        <TableCell component="th" scope="row">Previous Close</TableCell>
                        <TableCell align="right">${stockData.previousClose.toFixed(2)}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell component="th" scope="row">Open</TableCell>
                        <TableCell align="right">${stockData.open.toFixed(2)}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell component="th" scope="row">Day's Range</TableCell>
                        <TableCell align="right">${stockData.dayLow.toFixed(2)} - ${stockData.dayHigh.toFixed(2)}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell component="th" scope="row">Volume</TableCell>
                        <TableCell align="right">{stockData.volume.toLocaleString()}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell component="th" scope="row">Market Cap</TableCell>
                        <TableCell align="right">{stockData.marketCap}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell component="th" scope="row">P/E Ratio</TableCell>
                        <TableCell align="right">{stockData.peRatio}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell component="th" scope="row">Dividend</TableCell>
                        <TableCell align="right">${stockData.dividend.toFixed(2)}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell component="th" scope="row">Dividend Yield</TableCell>
                        <TableCell align="right">{stockData.dividendYield.toFixed(2)}%</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Box>
        </Box>
      )}

      {tabValue === 1 && (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
          {stockData.keyStats.map((stat: any, index: number) => (
            <Box key={index} sx={{ flexBasis: { xs: '100%', sm: '45%', md: '30%' } }}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {stat.label}
                  </Typography>
                  <Typography variant="h4" component="div">
                    {stat.value}
                  </Typography>
                </CardContent>
              </Card>
            </Box>
          ))}
        </Box>
      )}

      {tabValue === 2 && (
        <Box>
          <Typography variant="h6" gutterBottom>
            Recent News
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {stockData.news.map((newsItem: any, index: number) => (
              <Box key={index}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      {newsItem.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {newsItem.date} • {newsItem.source}
                    </Typography>
                  </CardContent>
                </Card>
              </Box>
            ))}
          </Box>
        </Box>
      )}
    </Box>
  );
}
