'use client';

import { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Box,
  Container,
  useMediaQuery,
  useTheme,
  Menu,
  MenuItem,
  Avatar
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import HomeIcon from '@mui/icons-material/Home';
import DashboardIcon from '@mui/icons-material/Dashboard';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import HistoryIcon from '@mui/icons-material/History';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import LogoutIcon from '@mui/icons-material/Logout';
import PersonIcon from '@mui/icons-material/Person';

const navItems = [
  { text: 'Home', href: '/', icon: <HomeIcon /> },
  { text: 'Dashboard', href: '/dashboard', icon: <DashboardIcon /> },
  { text: 'Market', href: '/market', icon: <ShowChartIcon /> },
  { text: 'Transactions', href: '/transactions', icon: <HistoryIcon /> },
  { text: 'Portfolio', href: '/portfolio', icon: <AccountBalanceWalletIcon /> },
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { user, signOut } = useAuth();
  const router = useRouter();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    handleMenuClose();
    await signOut();
    router.push('/');
  };

  const handleLogin = () => {
    router.push('/login');
  };

  const handleProfile = () => {
    handleMenuClose();
    router.push('/dashboard');
  };

  const drawer = (
    <Box onClick={handleDrawerToggle} sx={{ textAlign: 'center' }}>
      <Typography variant="h6" sx={{ my: 2 }}>
        Investing101
      </Typography>
      <List>
        {navItems.map((item) => (
          <Link href={item.href} key={item.text} style={{ textDecoration: 'none', color: 'inherit' }}>
            <ListItem component="button">
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItem>
          </Link>
        ))}
        {user && (
          <ListItem component="button" onClick={handleLogout}>
            <ListItemIcon><LogoutIcon /></ListItemIcon>
            <ListItemText primary="Logout" />
          </ListItem>
        )}
      </List>
    </Box>
  );

  return (
    <>
      <AppBar position="static">
        <Container maxWidth="lg">
          <Toolbar>
            {isMobile && (
              <IconButton
                color="inherit"
                aria-label="open drawer"
                edge="start"
                onClick={handleDrawerToggle}
                sx={{ mr: 2 }}
              >
                <MenuIcon />
              </IconButton>
            )}
            <Typography
              variant="h6"
              component="div"
              sx={{ flexGrow: 1 }}
            >
              Investing101
            </Typography>
            <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
              {navItems.map((item) => (
                <Link href={item.href} key={item.text} style={{ textDecoration: 'none' }}>
                  <Button color="inherit">{item.text}</Button>
                </Link>
              ))}
            </Box>
            {user ? (
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <IconButton
                  onClick={handleProfileMenuOpen}
                  size="small"
                  sx={{ ml: 2 }}
                  aria-controls="profile-menu"
                  aria-haspopup="true"
                >
                  <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
                    {user.email?.charAt(0).toUpperCase()}
                  </Avatar>
                </IconButton>
                <Menu
                  id="profile-menu"
                  anchorEl={anchorEl}
                  keepMounted
                  open={Boolean(anchorEl)}
                  onClose={handleMenuClose}
                >
                  <MenuItem onClick={handleProfile}>
                    <PersonIcon fontSize="small" sx={{ mr: 1 }} />
                    Profile
                  </MenuItem>
                  <MenuItem onClick={handleLogout}>
                    <LogoutIcon fontSize="small" sx={{ mr: 1 }} />
                    Logout
                  </MenuItem>
                </Menu>
              </Box>
            ) : (
              <Button
                color="inherit"
                variant="outlined"
                sx={{ ml: 2 }}
                onClick={handleLogin}
              >
                Login
              </Button>
            )}
          </Toolbar>
        </Container>
      </AppBar>
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true, // Better open performance on mobile
        }}
        sx={{
          display: { xs: 'block', sm: 'none' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 240 },
        }}
      >
        {drawer}
      </Drawer>
    </>
  );
}
