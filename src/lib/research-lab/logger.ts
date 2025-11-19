// Logger Utility for Research Lab
// Environment-aware logging that only logs in development

type LogLevel = 'log' | 'warn' | 'error' | 'debug' | 'info';

interface LogEntry {
  level: LogLevel;
  message: string;
  data?: any;
  timestamp: string;
  context?: string;
}

class Logger {
  private isDevelopment: boolean;
  private isProduction: boolean;

  constructor() {
    this.isDevelopment = 
      typeof window !== 'undefined' 
        ? import.meta.env.DEV 
        : process.env.NODE_ENV === 'development';
    this.isProduction = !this.isDevelopment;
  }

  private formatMessage(level: LogLevel, message: string, data?: any, context?: string): string {
    const timestamp = new Date().toISOString();
    const contextStr = context ? `[${context}]` : '';
    return `${timestamp} ${contextStr} ${message}`;
  }

  private shouldLog(level: LogLevel): boolean {
    // Always log errors, even in production
    if (level === 'error') return true;
    
    // Only log other levels in development
    return this.isDevelopment;
  }

  log(message: string, data?: any, context?: string): void {
    if (!this.shouldLog('log')) return;
    const formatted = this.formatMessage('log', message, data, context);
    if (data) {
      console.log(formatted, data);
    } else {
      console.log(formatted);
    }
  }

  info(message: string, data?: any, context?: string): void {
    if (!this.shouldLog('info')) return;
    const formatted = this.formatMessage('info', message, data, context);
    if (data) {
      console.info(formatted, data);
    } else {
      console.info(formatted);
    }
  }

  warn(message: string, data?: any, context?: string): void {
    if (!this.shouldLog('warn')) return;
    const formatted = this.formatMessage('warn', message, data, context);
    if (data) {
      console.warn(formatted, data);
    } else {
      console.warn(formatted);
    }
  }

  error(message: string, error?: any, context?: string): void {
    // Always log errors
    const formatted = this.formatMessage('error', message, error, context);
    if (error) {
      console.error(formatted, error);
      
      // In production, could send to error tracking service
      if (this.isProduction && typeof window !== 'undefined') {
        // Example: Could send to Sentry, LogRocket, etc.
        // errorTrackingService?.captureException(error, { extra: { message, context } });
      }
    } else {
      console.error(formatted);
    }
  }

  debug(message: string, data?: any, context?: string): void {
    if (!this.shouldLog('debug')) return;
    const formatted = this.formatMessage('debug', message, data, context);
    if (data) {
      console.debug(formatted, data);
    } else {
      console.debug(formatted);
    }
  }
}

// Export singleton instance
export const logger = new Logger();

// Export for use in API routes (server-side)
export default logger;

