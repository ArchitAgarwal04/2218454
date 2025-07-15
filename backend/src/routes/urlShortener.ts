import { Router, Request, Response } from 'express';
import { logEvent } from '../utils/logger';
import { shortenUrlController, getUrlStatsController, redirectController } from '../controllers/urlShortenerController';
import { loggingMiddleware } from '../middleware/loggingMiddleware';

const router = Router();

router.use(loggingMiddleware);

// POST /shorten
router.post('/shorten', async (req: Request, res: Response) => {
  await logEvent('backend', 'info', 'route', 'POST /shorten request received');
  return shortenUrlController(req, res);
});

// GET /shorturls/:shortcode
router.get('/shorturls/:shortcode', async (req: Request, res: Response) => {
  await logEvent('backend', 'info', 'route', `GET /shorturls/${req.params.shortcode} request received`);
  return getUrlStatsController(req, res);
});

// GET /:shortcode (root-level redirect)
router.get('/:shortcode', async (req: Request, res: Response) => {
  return redirectController(req, res);
});

export default router; 