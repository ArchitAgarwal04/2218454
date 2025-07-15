import axios, { AxiosError } from 'axios';
import * as dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
dotenv.config();

const LOG_URL = 'http://20.244.56.144/evaluation-service/logs';
const LOG_AUTH_TOKEN = process.env.LOG_AUTH_TOKEN;
const ALLOWED_STACKS = ['backend', 'frontend'];
const ALLOWED_LEVELS = ['debug', 'info', 'warn', 'error', 'fatal'];
const ALLOWED_PACKAGES = ['route', 'controller', 'service', 'handler', 'db', 'utils', 'api', 'component', 'state'];
const LOCAL_LOG_PATH = path.resolve(__dirname, '../../logged-middleware/backend-logs.json');

export async function logEvent(
  stack: string,
  level: string,
  packageName: string,
  message: string
): Promise<void> {
  if (!ALLOWED_STACKS.includes(stack)) throw new Error('Invalid stack');
  if (!ALLOWED_LEVELS.includes(level)) throw new Error('Invalid log level');
  if (!ALLOWED_PACKAGES.includes(packageName)) throw new Error('Invalid package name');
  if (!LOG_AUTH_TOKEN) throw new Error('Missing log auth token');

  const logObj = {
    timestamp: new Date().toISOString(),
    stack,
    level,
    package: packageName,
    message,
  };

  // Write to local log file as JSON line
  try {
    fs.appendFileSync(LOCAL_LOG_PATH, JSON.stringify(logObj) + '\n');
  } catch (err) {
    process.stderr.write(`Local log write error: ${err instanceof Error ? err.message : String(err)}\n`);
  }

  try {
    await axios.post(
      LOG_URL,
      {
        stack,
        level,
        package: packageName,
        message,
      },
      {
        headers: {
          Authorization: `Bearer ${LOG_AUTH_TOKEN}`,
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (err) {
    const error = err as AxiosError;
    process.stderr.write(`Log error: ${error?.response?.data || error.message}\n`);
  }
} 