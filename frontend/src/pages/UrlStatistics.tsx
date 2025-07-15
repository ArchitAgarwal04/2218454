import React, { useState, useEffect } from 'react';
import {
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Card,
  CardContent,
  Grid,
  Chip,
  CircularProgress,
} from '@mui/material';
import { Search, ExternalLink, TrendingUp } from 'lucide-react';
import { urlService } from '../services/urlService';
import { UrlStats } from '../types';
import { Log } from '../utils/logger';

const UrlStatistics: React.FC = () => {
  const [shortcode, setShortcode] = useState('');
  const [stats, setStats] = useState<UrlStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Log('frontend', 'info', 'page', 'Statistics page loaded');
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setStats(null);

    if (!shortcode.trim()) {
      setError('Please enter a shortcode');
      return;
    }

    setLoading(true);

    try {
      const result = await urlService.getUrlStats(shortcode.trim());
      setStats(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch statistics');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        URL Statistics
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        Enter a shortcode to view detailed statistics and analytics for your shortened URL.
      </Typography>

      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        <form onSubmit={handleSubmit}>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
            <TextField
              fullWidth
              label="Enter Shortcode"
              value={shortcode}
              onChange={(e) => setShortcode(e.target.value)}
              placeholder="e.g., abc123"
              helperText="Enter the shortcode of the URL you want to analyze"
            />
            <Button
              type="submit"
              variant="contained"
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} /> : <Search size={20} />}
              sx={{ minWidth: 120, height: 56 }}
            >
              {loading ? 'Loading...' : 'Get Stats'}
            </Button>
          </Box>
        </form>
      </Paper>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {stats && (
        <Box>
          {/* Overview Cards */}
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <TrendingUp size={40} color="#1976d2" style={{ marginBottom: 8 }} />
                  <Typography variant="h4" component="div" color="primary">
                    {stats.clicks}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Clicks
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <ExternalLink size={40} color="#2e7d32" style={{ marginBottom: 8 }} />
                  <Typography variant="h6" component="div" color="success.main">
                    Active
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    URL Status
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography variant="h6" component="div">
                    {stats.shortcode}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Shortcode
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Detailed Statistics Table */}
          <Paper elevation={2}>
            <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
              <Typography variant="h6">
                Detailed Statistics
              </Typography>
            </Box>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell><strong>Property</strong></TableCell>
                    <TableCell><strong>Value</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow>
                    <TableCell>Shortcode</TableCell>
                    <TableCell>
                      <Chip label={stats.shortcode} variant="outlined" />
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Original URL</TableCell>
                    <TableCell sx={{ wordBreak: 'break-all' }}>
                      <Typography variant="body2">
                        {stats.longUrl}
                      </Typography>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Total Clicks</TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="h6" color="primary">
                          {stats.clicks}
                        </Typography>
                        <TrendingUp size={16} color="#1976d2" />
                      </Box>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Created At</TableCell>
                    <TableCell>{formatDate(stats.createdAt)}</TableCell>
                  </TableRow>
                  {stats.expiry && (
                    <TableRow>
                      <TableCell>Expires At</TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          {formatDate(stats.expiry)}
                          <Chip
                            label="Expiring"
                            size="small"
                            color="warning"
                          />
                        </Box>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>

          {/* Additional Analytics */}
          <Paper elevation={2} sx={{ mt: 3, p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Quick Actions
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <Button
                variant="outlined"
                startIcon={<ExternalLink size={18} />}
                onClick={() => window.open(stats.longUrl, '_blank')}
              >
                Visit Original URL
              </Button>
              <Button
                variant="outlined"
                onClick={() => {
                  const shortUrl = `${window.location.origin}/${stats.shortcode}`;
                  navigator.clipboard.writeText(shortUrl);
                }}
              >
                Copy Short URL
              </Button>
            </Box>
          </Paper>
        </Box>
      )}

      {!stats && !loading && !error && (
        <Paper elevation={1} sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No Statistics to Display
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Enter a shortcode above to view detailed analytics and statistics.
          </Typography>
        </Paper>
      )}
    </Box>
  );
};

export default UrlStatistics;