import { ShortenRequest, ShortenResponse, UrlStats } from '../types';
import { Log } from '../utils/logger';

const BASE_URL = import.meta.env.VITE_REACT_APP_API_URL || 'http://localhost:8080';

export const urlService = {
  async shortenUrl(data: ShortenRequest): Promise<ShortenResponse> {
    Log('frontend', 'debug', 'api', 'POST /shorten request sent');
    
    try {
      const response = await fetch(`${BASE_URL}/shorten`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorText = await response.text();
        Log('frontend', 'error', 'api', `Failed to shorten URL: ${response.status} ${errorText}`);
        throw new Error(`Failed to shorten URL: ${response.status} ${errorText}`);
      }

      const result = await response.json();
      Log('frontend', 'info', 'state', 'Short link generated and state updated');
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      Log('frontend', 'error', 'api', `Failed to shorten URL: ${errorMessage}`);
      throw error;
    }
  },

  async getUrlStats(shortcode: string): Promise<UrlStats> {
    Log('frontend', 'debug', 'api', `GET /shorturls/${shortcode}`);
    
    try {
      const response = await fetch(`${BASE_URL}/shorturls/${shortcode}`);

      if (!response.ok) {
        Log('frontend', 'error', 'api', 'Failed to fetch stats');
        throw new Error(`Failed to fetch stats: ${response.status}`);
      }

      const result = await response.json();
      Log('frontend', 'info', 'component', 'Stats rendered successfully');
      return result;
    } catch (error) {
      Log('frontend', 'error', 'api', 'Failed to fetch stats');
      throw error;
    }
  },
};