/**
 * Production-level logging utility
 */

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  FATAL = 4,
}

export interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  context?: Record<string, any>;
  error?: Error;
  stack?: string;
}

class Logger {
  private minLevel: LogLevel;
  private logs: LogEntry[] = [];
  private maxLogs: number = 1000;

  constructor() {
    this.minLevel = process.env.NODE_ENV === 'production' ? LogLevel.INFO : LogLevel.DEBUG;
  }

  private shouldLog(level: LogLevel): boolean {
    return level >= this.minLevel;
  }

  private formatMessage(entry: LogEntry): string {
    const levelName = LogLevel[entry.level];
    const timestamp = entry.timestamp;
    const context = entry.context ? ` ${JSON.stringify(entry.context)}` : '';
    return `[${timestamp}] [${levelName}] ${entry.message}${context}`;
  }

  private log(level: LogLevel, message: string, context?: Record<string, any>, error?: Error): void {
    if (!this.shouldLog(level)) {
      return;
    }

    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date().toISOString(),
      context,
      error,
      stack: error?.stack,
    };

    // Store in memory (in production, send to logging service)
    this.logs.push(entry);
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }

    // Console output with appropriate method
    const formatted = this.formatMessage(entry);
    switch (level) {
      case LogLevel.DEBUG:
        console.debug(formatted);
        break;
      case LogLevel.INFO:
        console.log(formatted);
        break;
      case LogLevel.WARN:
        console.warn(formatted);
        break;
      case LogLevel.ERROR:
      case LogLevel.FATAL:
        console.error(formatted);
        if (error) {
          console.error(error);
        }
        break;
    }

    // In production, send to external logging service
    if (process.env.NODE_ENV === 'production' && level >= LogLevel.ERROR) {
      this.sendToExternalService(entry);
    }
  }

  private async sendToExternalService(entry: LogEntry): Promise<void> {
    // Implement integration with services like:
    // - Sentry
    // - DataDog
    // - CloudWatch
    // - LogRocket
    // For now, just a placeholder
    try {
      // Example: await fetch('https://logging-service.com/api/logs', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(entry)
      // });
    } catch (error) {
      console.error('Failed to send log to external service:', error);
    }
  }

  debug(message: string, context?: Record<string, any>): void {
    this.log(LogLevel.DEBUG, message, context);
  }

  info(message: string, context?: Record<string, any>): void {
    this.log(LogLevel.INFO, message, context);
  }

  warn(message: string, context?: Record<string, any>): void {
    this.log(LogLevel.WARN, message, context);
  }

  error(message: string, error?: Error, context?: Record<string, any>): void {
    this.log(LogLevel.ERROR, message, context, error);
  }

  fatal(message: string, error?: Error, context?: Record<string, any>): void {
    this.log(LogLevel.FATAL, message, context, error);
  }

  // Get recent logs (for debugging)
  getRecentLogs(count: number = 100): LogEntry[] {
    return this.logs.slice(-count);
  }

  // Clear logs
  clearLogs(): void {
    this.logs = [];
  }

  // Get logs by level
  getLogsByLevel(level: LogLevel): LogEntry[] {
    return this.logs.filter(log => log.level === level);
  }
}

// Singleton instance
export const logger = new Logger();

/**
 * API request logger middleware helper
 */
export function logApiRequest(
  method: string,
  path: string,
  duration: number,
  status: number,
  context?: Record<string, any>
): void {
  const level = status >= 500 ? LogLevel.ERROR : status >= 400 ? LogLevel.WARN : LogLevel.INFO;
  const message = `${method} ${path} - ${status} (${duration}ms)`;
  
  if (level === LogLevel.ERROR) {
    logger.error(message, undefined, { method, path, duration, status, ...context });
  } else if (level === LogLevel.WARN) {
    logger.warn(message, { method, path, duration, status, ...context });
  } else {
    logger.info(message, { method, path, duration, status, ...context });
  }
}

/**
 * Database operation logger
 */
export function logDbOperation(
  operation: string,
  collection: string,
  duration: number,
  success: boolean,
  context?: Record<string, any>
): void {
  const message = `DB ${operation} on ${collection} (${duration}ms)`;
  const ctx = { operation, collection, duration, success, ...context };
  
  if (success) {
    logger.debug(message, ctx);
  } else {
    logger.error(message, undefined, ctx);
  }
}

/**
 * Blockchain transaction logger
 */
export function logBlockchainTx(
  type: string,
  signature: string,
  success: boolean,
  context?: Record<string, any>
): void {
  const message = `Blockchain ${type} - ${signature}`;
  const ctx = { type, signature, success, ...context };
  
  if (success) {
    logger.info(message, ctx);
  } else {
    logger.error(message, undefined, ctx);
  }
}

/**
 * Performance monitoring helper
 */
export class PerformanceMonitor {
  private startTime: number;
  private checkpoints: Map<string, number>;

  constructor() {
    this.startTime = Date.now();
    this.checkpoints = new Map();
  }

  checkpoint(name: string): void {
    this.checkpoints.set(name, Date.now() - this.startTime);
  }

  finish(operation: string): number {
    const duration = Date.now() - this.startTime;
    
    const checkpointData: Record<string, number> = {};
    this.checkpoints.forEach((time, name) => {
      checkpointData[name] = time;
    });

    logger.debug(`Performance: ${operation}`, {
      totalDuration: duration,
      checkpoints: checkpointData,
    });

    return duration;
  }
}

/**
 * Error tracking helper
 */
export function trackError(
  error: Error,
  context?: Record<string, any>
): void {
  logger.error('Unhandled error', error, context);
  
  // In production, send to error tracking service
  if (process.env.NODE_ENV === 'production') {
    // Example: Sentry.captureException(error, { extra: context });
  }
}
