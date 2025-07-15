import { Router } from 'express';
import urlShortenerRoutes from './urlShortener';
import fs from 'fs';
import path from 'path';

const router = Router();

router.use('/', urlShortenerRoutes);

// Endpoint to receive frontend logs and write to logged-middleware/frontend-logs.json
router.post('/frontend-log', (req, res) => {
  const logObj = req.body;
  const logPath = path.join(__dirname, '../../../logged-middleware/frontend-logs.json');
  try {
    fs.appendFileSync(logPath, JSON.stringify(logObj) + '\n');
    res.status(200).json({ status: 'ok' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to write frontend log' });
  }
});

export default router; 