'use client';

import {
  Typography,
  Box,
  Button,
  Card,
  CardContent,
  CardActions,
  Stack,
  Paper
} from '@mui/material';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import SchoolIcon from '@mui/icons-material/School';
import Link from 'next/link';

export default function Home() {
  return (
    <Box>
      {/* Hero Section */}
      <Paper
        elevation={0}
        sx={{
          p: 6,
          mb: 4,
          borderRadius: 2,
          backgroundImage: 'linear-gradient(120deg, #e0f7fa 0%, #bbdefb 100%)',
          textAlign: 'center'
        }}
      >
        <Typography variant="h2" component="h1" gutterBottom>
          Learn Investing with Virtual Money
        </Typography>
        <Typography variant="h5" color="text.secondary" sx={{ mb: 2 }}>
          Practice investing in the stock market with dummy cash and real-time market data.
          Build your portfolio, track performance, and learn without risking real money.
        </Typography>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={2}
          justifyContent="center"
          sx={{ mt: 4 }}
        >
          <Button
            variant="contained"
            size="large"
            component={Link}
            href="/dashboard"
          >
            Get Started
          </Button>
          <Button
            variant="outlined"
            size="large"
            component={Link}
            href="/market"
          >
            Explore Markets
          </Button>
        </Stack>
      </Paper>

      {/* Features Section */}
      <Typography variant="h4" component="h2" gutterBottom sx={{ mt: 6, mb: 4 }}>
        Why Use Investing101?
      </Typography>

      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
        <Box sx={{ flexBasis: { xs: '100%', md: 'calc(33.333% - 16px)' }, display: 'flex' }}>
          <Card sx={{ height: '100%', width: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                <ShowChartIcon color="primary" sx={{ fontSize: 60 }} />
              </Box>
              <Typography variant="h5" component="h3" gutterBottom align="center">
                Real Market Data
              </Typography>
              <Typography variant="body1">
                Access real-time stock market data powered by Yahoo Finance. Search for stocks, view charts, and make informed decisions based on actual market conditions.
              </Typography>
            </CardContent>
            <CardActions>
              <Button size="small" component={Link} href="/market">Explore Markets</Button>
            </CardActions>
          </Card>
        </Box>

        <Box sx={{ flexBasis: { xs: '100%', md: 'calc(33.333% - 16px)' }, display: 'flex' }}>
          <Card sx={{ height: '100%', width: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                <AccountBalanceWalletIcon color="primary" sx={{ fontSize: 60 }} />
              </Box>
              <Typography variant="h5" component="h3" gutterBottom align="center">
                Risk-Free Practice
              </Typography>
              <Typography variant="body1">
                Start with $100,000 in virtual cash. Buy and sell stocks, build your portfolio, and track your performance without risking real money. Perfect for beginners.
              </Typography>
            </CardContent>
            <CardActions>
              <Button size="small" component={Link} href="/portfolio">View Portfolio</Button>
            </CardActions>
          </Card>
        </Box>

        <Box sx={{ flexBasis: { xs: '100%', md: 'calc(33.333% - 16px)' }, display: 'flex' }}>
          <Card sx={{ height: '100%', width: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                <SchoolIcon color="primary" sx={{ fontSize: 60 }} />
              </Box>
              <Typography variant="h5" component="h3" gutterBottom align="center">
                Learn & Improve
              </Typography>
              <Typography variant="body1">
                Track your investment history, analyze your performance, and learn from your decisions. Develop your investment strategy in a safe environment.
              </Typography>
            </CardContent>
            <CardActions>
              <Button size="small" component={Link} href="/transactions">View Transactions</Button>
            </CardActions>
          </Card>
        </Box>
      </Box>

      {/* Call to Action */}
      <Paper
        elevation={1}
        sx={{
          p: 4,
          mt: 6,
          borderRadius: 2,
          textAlign: 'center',
          backgroundColor: (theme) => theme.palette.primary.light,
          color: 'white'
        }}
      >
        <Typography variant="h5" component="h3" gutterBottom>
          Ready to start your investment journey?
        </Typography>
        <Button
          variant="contained"
          size="large"
          sx={{
            mt: 2,
            backgroundColor: 'white',
            color: (theme) => theme.palette.primary.main,
            '&:hover': {
              backgroundColor: '#f5f5f5',
            }
          }}
          component={Link}
          href="/dashboard"
        >
          Create Your Account
        </Button>
      </Paper>
    </Box>
  );
}
