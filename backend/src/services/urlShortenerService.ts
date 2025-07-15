import { logEvent } from '../utils/logger';
import { LowSync, JSONFileSync } from 'lowdb';
import { Request, Response } from 'express';
import { nanoid } from 'nanoid';
import path from 'path';
import { ShortenRequest, ShortenResponse, UrlStats } from '../types';

// DB setup
const dbFile = path.join(__dirname, '../../data/db.json');
const adapter = new JSONFileSync<Data>(dbFile);
const db = new LowSync<Data>(adapter);

db.read();
db.data ||= { urls: [] };

type UrlEntry = {
  url: string;
  shortcode: string;
  createdAt: string;
  expiry?: string;
  clicks: number;
  stats: Array<{ timestamp: string; ip: string; geo?: any }>;
};
type Data = {
  urls: UrlEntry[];
};

export async function shortenUrlService(url: string, expiry: string, shortcode: string, res: Response): Promise<ShortenResponse> {
  db.read();
  if (shortcode && db.data!.urls.some((u) => u.shortcode === shortcode)) {
    await logEvent('backend', 'warn', 'db', 'Shortcode already exists');
    throw new Error('Shortcode already exists');
  }
  const code = shortcode || nanoid(7);
  const entry: UrlEntry = {
    url,
    shortcode: code,
    createdAt: new Date().toISOString(),
    expiry,
    clicks: 0,
    stats: [],
  };
  db.data!.urls.push(entry);
  try {
    db.write();
    await logEvent('backend', 'info', 'service', `URL shortened successfully: ${code}`);
    return { shortcode: code, url, shortUrl: `http://localhost:8080/go/${code}` };
  } catch (err: any) {
    await logEvent('backend', 'fatal', 'db', `DB failure: ${err.message}`);
    throw new Error('DB failure');
  }
}

export async function getUrlStatsService(shortcode: string, res: Response): Promise<UrlStats> {
  db.read();
  const entry = db.data!.urls.find((u) => u.shortcode === shortcode);
  if (!entry) {
    await logEvent('backend', 'warn', 'handler', 'Shortcode invalid for stats');
    throw new Error('Shortcode not found');
  }
  await logEvent('backend', 'info', 'service', 'Statistics retrieved');
  return {
    url: entry.url,
    shortcode: entry.shortcode,
    clicks: entry.clicks,
    stats: entry.stats,
    expiry: entry.expiry,
  };
}

export async function redirectService(shortcode: string, req: Request, res: Response): Promise<void> {
  db.read();
  const entry = db.data!.urls.find((u) => u.shortcode === shortcode);
  await logEvent('backend', 'debug', 'handler', `Redirection attempt for ${shortcode}`);
  if (!entry) {
    await logEvent('backend', 'warn', 'handler', 'Shortcode invalid for redirect');
    res.status(404).json({ error: 'Shortcode not found' });
    return;
  }
  if (entry.expiry && new Date(entry.expiry) < new Date()) {
    await logEvent('backend', 'warn', 'handler', 'Shortcode expired');
    res.status(410).json({ error: 'Shortcode expired' });
    return;
  }
  entry.clicks++;
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '';
  let geo = undefined;
  try {
    // Optionally, call a geo API here
    // geo = await fetchGeo(ip);
  } catch (err: any) {
    await logEvent('backend', 'error', 'utils', 'Geo API failure');
  }
  entry.stats.push({ timestamp: new Date().toISOString(), ip: String(ip), geo });
  try {
    db.write();
    await logEvent('backend', 'info', 'service', 'Click data saved');
  } catch (err: any) {
    await logEvent('backend', 'fatal', 'db', `DB failure: ${err.message}`);
  }
  res.redirect(entry.url);
} 