'use client';

import { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  CircularProgress, 
  Alert,
  ToggleButtonGroup,
  ToggleButton
} from '@mui/material';

// This is a placeholder component for a stock chart
// In a real app, you would use a charting library like Chart.js, Recharts, or ApexCharts

interface StockChartProps {
  symbol: string;
  name?: string;
}

export default function StockChart({ symbol, name }: StockChartProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState('1D');

  // Simulate loading data
  useEffect(() => {
    setLoading(true);
    setError(null);
    
    // Simulate API call
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1500);
    
    return () => clearTimeout(timer);
  }, [symbol, timeRange]);

  const handleTimeRangeChange = (
    event: React.MouseEvent<HTMLElement>,
    newTimeRange: string,
  ) => {
    if (newTimeRange !== null) {
      setTimeRange(newTimeRange);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300 }}>
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

  return (
    <Paper sx={{ p: 2, mb: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">
          {name || symbol} Price Chart
        </Typography>
        <ToggleButtonGroup
          value={timeRange}
          exclusive
          onChange={handleTimeRangeChange}
          size="small"
        >
          <ToggleButton value="1D">1D</ToggleButton>
          <ToggleButton value="1W">1W</ToggleButton>
          <ToggleButton value="1M">1M</ToggleButton>
          <ToggleButton value="3M">3M</ToggleButton>
          <ToggleButton value="1Y">1Y</ToggleButton>
          <ToggleButton value="5Y">5Y</ToggleButton>
        </ToggleButtonGroup>
      </Box>
      
      {/* This is a placeholder for the actual chart */}
      <Box 
        sx={{ 
          height: 300, 
          bgcolor: 'grey.100', 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center',
          borderRadius: 1
        }}
      >
        <Typography variant="body1" color="text.secondary">
          Stock Price Chart for {symbol} ({timeRange}) - Placeholder
        </Typography>
      </Box>
    </Paper>
  );
}
