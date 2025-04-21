'use client';

import { useState } from 'react';
import { 
  Typography, 
  Box, 
  Paper, 
  TextField, 
  Button, 
  Alert,
  CircularProgress,
  Link as MuiLink
} from '@mui/material';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const { resetPassword, loading } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    try {
      await resetPassword(email);
      setSuccess(true);
    } catch (error: any) {
      setError(error.message || 'An error occurred');
    }
  };

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '70vh' }}>
      <Paper sx={{ p: 4, maxWidth: 500, width: '100%' }}>
        <Typography variant="h4" component="h1" align="center" gutterBottom>
          Reset Password
        </Typography>
        
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {success ? (
          <Box>
            <Alert severity="success" sx={{ mb: 3 }}>
              Password reset instructions have been sent to your email.
            </Alert>
            <Button 
              component={Link} 
              href="/login" 
              variant="contained" 
              fullWidth
            >
              Back to Login
            </Button>
          </Box>
        ) : (
          <Box component="form" onSubmit={handleSubmit}>
            <Typography variant="body1" sx={{ mb: 3 }}>
              Enter your email address and we'll send you instructions to reset your password.
            </Typography>
            
            <TextField
              label="Email"
              type="email"
              fullWidth
              margin="normal"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
              {loading ? <CircularProgress size={24} /> : 'Send Reset Instructions'}
            </Button>

            <Box sx={{ textAlign: 'center', mt: 2 }}>
              <MuiLink component={Link} href="/login" variant="body2">
                Back to Login
              </MuiLink>
            </Box>
          </Box>
        )}
      </Paper>
    </Box>
  );
}
