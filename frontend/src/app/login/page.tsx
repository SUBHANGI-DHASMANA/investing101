'use client';

import { useState } from 'react';
import {
  Typography,
  Box,
  Paper,
  TextField,
  Button,
  Link as MuiLink,
  Alert,
  CircularProgress,
  Tabs,
  Tab
} from '@mui/material';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [tabValue, setTabValue] = useState(0);
  const { signIn, signUp, loading } = useAuth();
  const router = useRouter();

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      if (tabValue === 0) {
        // Login
        await signIn(email, password);
        router.push('/dashboard');
      } else {
        // Register
        await signUp(email, password);
        // Show success message or redirect
        setError('Registration successful! Please check your email to confirm your account.');
      }
    } catch (error: any) {
      setError(error.message || 'An error occurred');
    }
  };

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '70vh' }}>
      <Paper sx={{ p: 4, maxWidth: 500, width: '100%' }}>
        <Typography variant="h4" component="h1" align="center" gutterBottom>
          {tabValue === 0 ? 'Sign In' : 'Create Account'}
        </Typography>

        <Tabs value={tabValue} onChange={handleTabChange} centered sx={{ mb: 3 }}>
          <Tab label="Sign In" />
          <Tab label="Register" />
        </Tabs>

        {error && (
          <Alert severity={error.includes('successful') ? 'success' : 'error'} sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit}>
          <TextField
            label="Email"
            type="email"
            fullWidth
            margin="normal"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <TextField
            label="Password"
            type="password"
            fullWidth
            margin="normal"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <Button
            type="submit"
            variant="contained"
            fullWidth
            size="large"
            sx={{ mt: 3, mb: 2 }}
            disabled={loading}
          >
            {loading ? (
              <CircularProgress size={24} />
            ) : tabValue === 0 ? (
              'Sign In'
            ) : (
              'Register'
            )}
          </Button>

          <Box sx={{ display: 'flex', justifyContent: 'center' }}>
            <Box>
              {tabValue === 0 ? (
                <MuiLink component={Link} href="/forgot-password" variant="body2">
                  Forgot password?
                </MuiLink>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  By registering, you agree to our Terms and Privacy Policy
                </Typography>
              )}
            </Box>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
}
