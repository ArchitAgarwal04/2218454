export interface ShortenRequest {
  url: string;
  shortcode?: string;
  expiry?: string;
}

export interface ShortenResponse {
  shortUrl: string;
  expiry?: string;
  shortcode: string;
}

export interface UrlStats {
  shortcode: string;
  longUrl: string;
  clicks: number;
  createdAt: string;
  expiry?: string;
}