import React from 'react';
import { AppBar, Toolbar, Typography, Container, Box, Button } from '@mui/material';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import { LinkIcon, BarChart } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static" sx={{ bgcolor: 'primary.main' }}>
        <Toolbar>
          <LinkIcon style={{ marginRight: '12px' }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            URL Shortener
          </Typography>
          <Button
            color="inherit"
            component={RouterLink}
            to="/"
            sx={{ 
              mr: 2,
              bgcolor: location.pathname === '/' ? 'rgba(255,255,255,0.1)' : 'transparent'
            }}
          >
            Shorten URLs
          </Button>
        </Toolbar>
      </AppBar>
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        {children}
      </Container>
    </Box>
  );
};

export default Layout;