'use client';

import { Box, Container, Typography, Link as MuiLink } from '@mui/material';

export default function Footer() {
  return (
    <Box
      component="footer"
      sx={{
        py: 3,
        px: 2,
        mt: 'auto',
        backgroundColor: (theme) =>
          theme.palette.mode === 'light'
            ? theme.palette.grey[200]
            : theme.palette.grey[800],
      }}
    >
      <Container maxWidth="lg">
        <Typography variant="body2" color="text.secondary" align="center">
          {'© '}
          {new Date().getFullYear()}
          {' Investing101 - Educational Investment Platform'}
        </Typography>
        <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 1 }}>
          {'Market data provided by '}
          <MuiLink color="inherit" href="https://finance.yahoo.com/" target="_blank" rel="noopener">
            Yahoo Finance
          </MuiLink>
        </Typography>
        <Typography variant="caption" color="text.secondary" align="center" display="block" sx={{ mt: 1 }}>
          This is a demo application. No real money is involved.
        </Typography>
      </Container>
    </Box>
  );
}
