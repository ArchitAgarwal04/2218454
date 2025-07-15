interface LogEntry {
  timestamp: string;
  stack: string;
  level: 'debug' | 'info' | 'warn' | 'error' | 'fatal';
  package: string;
  message: string;
}

class FileLogger {
  private logs: LogEntry[] = [];

  async log(stack: string, level: LogEntry['level'], packageName: string, message: string) {
    const logEntry: LogEntry = {
      timestamp: new Date().toISOString(),
      stack,
      level,
      package: packageName,
      message
    };

    this.logs.push(logEntry);
    await this.writeToFile(logEntry);
    // Send to backend for persistent logging
    try {
      await fetch('http://localhost:8080/frontend-log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(logEntry),
      });
    } catch (err) {
      // Ignore network errors for logging
    }
  }

  private async writeToFile(logEntry: LogEntry) {
    try {
      // Create log line in a structured format
      const logLine = `[${logEntry.timestamp}] ${logEntry.level.toUpperCase()} [${logEntry.stack}:${logEntry.package}] ${logEntry.message}\n`;
      
      // In a browser environment, we'll store logs in localStorage and provide download functionality
      const existingLogs = localStorage.getItem('application_logs') || '';
      const updatedLogs = existingLogs + logLine;
      localStorage.setItem('application_logs', updatedLogs);
      
      // Also trigger download of log file periodically (every 10 logs)
      if (this.logs.length % 10 === 0) {
        this.downloadLogs();
      }
    } catch (error) {
      // Fallback: if file operations fail, at least keep in memory
      // (no console.log per requirements)
    }
  }

  downloadLogs() {
    const logs = localStorage.getItem('application_logs') || '';
    if (logs) {
      const blob = new Blob([logs], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `application_logs_${new Date().toISOString().split('T')[0]}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  }

  clearLogs() {
    this.logs = [];
    localStorage.removeItem('application_logs');
  }

  getLogs(): LogEntry[] {
    return [...this.logs];
  }
}

export const fileLogger = new FileLogger();

// Convenience function for easier usage
export const Log = async (stack: string, level: LogEntry['level'], packageName: string, message: string) => {
  fileLogger.log(stack, level, packageName, message);

  // Send to backend for persistent logging
  try {
    await fetch('http://localhost:8080/frontend-log', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        timestamp: new Date().toISOString(),
        stack,
        level,
        package: packageName,
        message,
      }),
    });
  } catch (err) {
    // Ignore network errors for logging
  }

  // Send to remote evaluation service
  const LOG_URL = 'http://20.244.56.144/evaluation-service/logs';
  const LOG_AUTH_TOKEN = import.meta.env.VITE_LOG_AUTH_TOKEN;
  if (!LOG_AUTH_TOKEN) return;
  try {
    await fetch(LOG_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${LOG_AUTH_TOKEN}`,
      },
      body: JSON.stringify({
        stack,
        level,
        package: packageName,
        message,
      }),
    });
  } catch (err) {
    // Ignore network errors for logging
  }
};