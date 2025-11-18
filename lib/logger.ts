/**
 * Logging utility for structured application logs
 */

type LogLevel = 'info' | 'warn' | 'error' | 'debug';

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: Record<string, unknown>;
  error?: Error;
}

class Logger {
  private context: Record<string, unknown> = {};

  /**
   * Set global context for all logs
   */
  setContext(context: Record<string, unknown>): void {
    this.context = { ...this.context, ...context };
  }

  /**
   * Clear global context
   */
  clearContext(): void {
    this.context = {};
  }

  /**
   * Format log entry
   */
  private formatLog(level: LogLevel, message: string, context?: Record<string, unknown>, error?: Error): LogEntry {
    return {
      timestamp: new Date().toISOString(),
      level,
      message,
      context: { ...this.context, ...context },
      error,
    };
  }

  /**
   * Log info message
   */
  info(message: string, context?: Record<string, unknown>): void {
    const log = this.formatLog('info', message, context);
    console.log(JSON.stringify(log));
  }

  /**
   * Log warning message
   */
  warn(message: string, context?: Record<string, unknown>): void {
    const log = this.formatLog('warn', message, context);
    console.warn(JSON.stringify(log));
  }

  /**
   * Log error message
   */
  error(message: string, error?: Error, context?: Record<string, unknown>): void {
    const log = this.formatLog('error', message, context, error);
    console.error(JSON.stringify(log));
  }

  /**
   * Log debug message (only in development)
   */
  debug(message: string, context?: Record<string, unknown>): void {
    if (process.env.NODE_ENV === 'development') {
      const log = this.formatLog('debug', message, context);
      console.debug(JSON.stringify(log));
    }
  }
}

export const logger = new Logger();
