export interface ShortenRequest {
  url: string;
  expiry?: string;
  shortcode?: string;
}

export interface ShortenResponse {
  shortcode: string;
  url: string;
}

export interface UrlStats {
  url: string;
  shortcode: string;
  clicks: number;
  stats: Array<{ timestamp: string; ip: string; geo?: any }>;
  expiry?: string;
} 