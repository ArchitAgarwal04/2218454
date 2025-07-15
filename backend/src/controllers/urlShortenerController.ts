import { Request, Response } from 'express';
import { logEvent } from '../utils/logger';
import { shortenUrlService, getUrlStatsService, redirectService } from '../services/urlShortenerService';

export async function shortenUrlController(req: Request, res: Response) {
  // Input validation
  const { url, expiry, shortcode } = req.body;
  await logEvent('backend', 'debug', 'handler', 'Validating input for /shorten');
  if (!url || typeof url !== 'string') {
    await logEvent('backend', 'error', 'handler', 'Invalid input: url is required');
    return res.status(400).json({ error: 'Invalid input: url is required' });
  }
  try {
    const result = await shortenUrlService(url, expiry, shortcode, res);
    return res.status(201).json(result);
  } catch (err: any) {
    await logEvent('backend', 'fatal', 'service', `Failed to shorten URL: ${err.message}`);
    return res.status(500).json({ error: 'Failed to shorten URL' });
  }
}

export async function getUrlStatsController(req: Request, res: Response) {
  const { shortcode } = req.params;
  if (!shortcode) {
    await logEvent('backend', 'warn', 'handler', 'Shortcode missing in stats request');
    return res.status(400).json({ error: 'Shortcode is required' });
  }
  try {
    const stats = await getUrlStatsService(shortcode, res);
    return res.status(200).json(stats);
  } catch (err: any) {
    await logEvent('backend', 'error', 'service', `Failed to get stats: ${err.message}`);
    return res.status(404).json({ error: 'Shortcode not found' });
  }
}

export async function redirectController(req: Request, res: Response) {
  const { shortcode } = req.params;
  try {
    await redirectService(shortcode, req, res);
  } catch (err: any) {
    await logEvent('backend', 'error', 'handler', `Redirection failed: ${err.message}`);
    return res.status(404).json({ error: 'Redirection failed' });
  }
} 