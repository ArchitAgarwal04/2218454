import express from 'express';
import cors from 'cors';
import { logEvent } from './utils/logger';
import routes from './routes';

const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors({ origin: 'http://localhost:3000' }));
app.use(express.json());
app.use('/', routes);

app.listen(PORT, async () => {
  await logEvent('backend', 'info', 'service', `Server started on port ${PORT}`);
  // eslint-disable-next-line no-console
  console.log(`Server running on port ${PORT}`);
}); 