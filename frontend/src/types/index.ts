export interface ShortenRequest {
  longUrl: string;
  shortcode?: string;
  validity?: number;
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