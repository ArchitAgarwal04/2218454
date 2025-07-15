export interface ShortenRequest {
  url: string;
  shortcode?: string;
  expiry?: string;
}

export interface ShortenResponse {
  shortcode: string;
  url: string;
  shortUrl: string;
  expiry?: string;
}

export interface UrlStats {
  url: string;
  shortcode: string;
  clicks: number;
  stats: Array<{ timestamp: string; ip: string; geo?: any }>;
  expiry?: string;
} 