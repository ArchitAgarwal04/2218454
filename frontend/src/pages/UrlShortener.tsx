import React, { useState, useEffect } from 'react';
import {
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  Card,
  CardContent,
  Chip,
  Grid,
  IconButton,
  Tooltip,
  Divider,
} from '@mui/material';
import { Copy, ExternalLink, Plus, Trash2 } from 'lucide-react';
import { urlService } from '../services/urlService';
import { ShortenRequest, ShortenResponse } from '../types';
import { Log } from '../utils/logger';

interface UrlEntry {
  id: number;
  longUrl: string;
  shortcode: string;
  validity: string;
}

interface ShortenedUrl extends ShortenResponse {
  id: number;
  longUrl: string;
}

const UrlShortener: React.FC = () => {
  const [urls, setUrls] = useState<UrlEntry[]>([
    { id: 1, longUrl: '', shortcode: '', validity: '' }
  ]);
  const [shortenedUrls, setShortenedUrls] = useState<ShortenedUrl[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    Log('frontend', 'info', 'page', 'Shortener page loaded');
  }, []);

  const validateUrl = (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const validateShortcode = (shortcode: string): boolean => {
    return shortcode === '' || /^[a-zA-Z0-9]+$/.test(shortcode);
  };

  const validateValidity = (validity: string): boolean => {
    return validity === '' || (!isNaN(Number(validity)) && Number(validity) > 0);
  };

  const addUrlEntry = () => {
    if (urls.length < 5) {
      setUrls([...urls, { 
        id: Date.now(), 
        longUrl: '', 
        shortcode: '', 
        validity: '' 
      }]);
    }
  };

  const removeUrlEntry = (id: number) => {
    if (urls.length > 1) {
      setUrls(urls.filter(url => url.id !== id));
    }
  };

  const updateUrl = (id: number, field: keyof UrlEntry, value: string) => {
    setUrls(urls.map(url => 
      url.id === id ? { ...url, [field]: value } : url
    ));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    Log('frontend', 'info', 'component', 'Shorten request triggered');

    // Validate all URLs
    const validUrls = urls.filter(url => url.longUrl.trim() !== '');
    
    if (validUrls.length === 0) {
      setError('Please enter at least one URL to shorten');
      return;
    }

    // Validate each URL
    for (const url of validUrls) {
      if (!validateUrl(url.longUrl)) {
        setError(`Invalid URL: ${url.longUrl}`);
        return;
      }
      if (!validateShortcode(url.shortcode)) {
        setError(`Invalid shortcode: ${url.shortcode}. Must be alphanumeric.`);
        return;
      }
      if (!validateValidity(url.validity)) {
        setError(`Invalid validity: ${url.validity}. Must be a positive number.`);
        return;
      }
    }

    setLoading(true);

    try {
      const results: ShortenedUrl[] = [];
      
      for (const url of validUrls) {
        const request: ShortenRequest = {
          url: url.longUrl,
          ...(url.shortcode && { shortcode: url.shortcode }),
          ...(url.validity && { expiry: url.validity }),
        };

        const result = await urlService.shortenUrl(request);
        results.push({
          ...result,
          id: url.id,
          longUrl: url.longUrl,
        });
      }

      setShortenedUrls(results);
      setSuccess(`Successfully shortened ${results.length} URL${results.length > 1 ? 's' : ''}`);
      
      // Reset form
      setUrls([{ id: Date.now(), longUrl: '', shortcode: '', validity: '' }]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to shorten URLs');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setSuccess('Copied to clipboard!');
    setTimeout(() => setSuccess(null), 2000);
  };

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        URL Shortener
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        Shorten up to 5 URLs at once. Add optional custom shortcodes and validity periods.
      </Typography>

      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        <form onSubmit={handleSubmit}>
          <Typography variant="h6" gutterBottom>
            URLs to Shorten
          </Typography>
          
          {urls.map((url, index) => (
            <Card key={url.id} variant="outlined" sx={{ mb: 2 }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Typography variant="subtitle1" sx={{ flexGrow: 1 }}>
                    URL #{index + 1}
                  </Typography>
                  {urls.length > 1 && (
                    <IconButton
                      onClick={() => removeUrlEntry(url.id)}
                      color="error"
                      size="small"
                    >
                      <Trash2 size={18} />
                    </IconButton>
                  )}
                </Box>
                
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Long URL"
                      value={url.longUrl}
                      onChange={(e) => updateUrl(url.id, 'longUrl', e.target.value)}
                      error={url.longUrl !== '' && !validateUrl(url.longUrl)}
                      helperText={url.longUrl !== '' && !validateUrl(url.longUrl) ? 'Please enter a valid URL' : ''}
                      required={index === 0}
                      placeholder="https://example.com/very/long/url"
                    />
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <TextField
                      fullWidth
                      label="Custom Shortcode (Optional)"
                      value={url.shortcode}
                      onChange={(e) => updateUrl(url.id, 'shortcode', e.target.value)}
                      error={!validateShortcode(url.shortcode)}
                      helperText={!validateShortcode(url.shortcode) ? 'Alphanumeric only' : ''}
                      placeholder="mycode123"
                    />
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <TextField
                      fullWidth
                      label="Validity (days)"
                      value={url.validity}
                      onChange={(e) => updateUrl(url.id, 'validity', e.target.value)}
                      error={!validateValidity(url.validity)}
                      helperText={!validateValidity(url.validity) ? 'Must be a positive number' : ''}
                      placeholder="30"
                      type="number"
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          ))}

          <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
            {urls.length < 5 && (
              <Button
                variant="outlined"
                onClick={addUrlEntry}
                startIcon={<Plus size={18} />}
              >
                Add Another URL
              </Button>
            )}
            <Button
              type="submit"
              variant="contained"
              disabled={loading}
              sx={{ ml: 'auto' }}
            >
              {loading ? 'Shortening...' : 'Shorten URLs'}
            </Button>
          </Box>
        </form>
      </Paper>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 3 }}>
          {success}
        </Alert>
      )}

      {shortenedUrls.length > 0 && (
        <Paper elevation={2} sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Shortened URLs
          </Typography>
          
          {shortenedUrls.map((url, index) => (
            <Card key={url.id} variant="outlined" sx={{ mb: 2 }}>
              <CardContent>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Original URL:
                  </Typography>
                  <Typography variant="body2" sx={{ wordBreak: 'break-all' }}>
                    {url.longUrl}
                  </Typography>
                </Box>
                
                <Divider sx={{ my: 2 }} />
                
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Short URL:
                  </Typography>
                  <Typography variant="body1" sx={{ flexGrow: 1 }}>
                    {url.shortUrl}
                  </Typography>
                  <Tooltip title="Copy to clipboard">
                    <IconButton
                      onClick={() => copyToClipboard(url.shortUrl)}
                      size="small"
                    >
                      <Copy size={16} />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Open in new tab">
                    <IconButton
                      onClick={() => window.open(url.shortUrl, '_blank')}
                      size="small"
                    >
                      <ExternalLink size={16} />
                    </IconButton>
                  </Tooltip>
                </Box>

                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Chip
                    label={`Shortcode: ${url.shortcode}`}
                    size="small"
                    variant="outlined"
                  />
                  {url.expiry && (
                    <Chip
                      label={`Expires: ${new Date(url.expiry).toLocaleDateString()}`}
                      size="small"
                      variant="outlined"
                      color="warning"
                    />
                  )}
                </Box>
              </CardContent>
            </Card>
          ))}
        </Paper>
      )}
    </Box>
  );
};

export default UrlShortener;