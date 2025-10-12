import { Injectable, LoggerService as NestLoggerService, LogLevel, Scope, Optional } from '@nestjs/common';
import { ENV_CONSTANTS } from '../constants/env.constants';

/**
 * Custom logger service that extends NestJS Logger
 * This provides more consistent logging across the application
 */
@Injectable()
export class LoggerService implements NestLoggerService {
  private context?: string;

  constructor(@Optional() context?: string) {
    this.context = context;
  }

  setContext(context: string): void {
    this.context = context;
  }

  /**
   * Get appropriate log levels based on environment
   */
  private getLogLevels(): LogLevel[] {
    const isProduction = ENV_CONSTANTS.NODE_ENV === 'production';
    return isProduction 
      ? ['error', 'warn', 'log'] 
      : ['error', 'warn', 'log', 'debug', 'verbose'];
  }

  /**
   * Format log message with timestamp and context
   */
  private formatMessage(message: any, context?: string): string {
    const timestamp = new Date().toISOString();
    const ctx = context || this.context || 'Application';
    return `[${timestamp}] [${ctx}] ${message}`;
  }

  log(message: any, context?: string): void {
    if (this.getLogLevels().includes('log')) {
      console.log(this.formatMessage(message, context));
    }
  }

  error(message: any, trace?: string, context?: string): void {
    if (this.getLogLevels().includes('error')) {
      console.error(this.formatMessage(message, context));
      if (trace) {
        console.error(trace);
      }
    }
  }

  warn(message: any, context?: string): void {
    if (this.getLogLevels().includes('warn')) {
      console.warn(this.formatMessage(message, context));
    }
  }

  debug(message: any, context?: string): void {
    if (this.getLogLevels().includes('debug')) {
      console.debug(this.formatMessage(message, context));
    }
  }

  verbose(message: any, context?: string): void {
    if (this.getLogLevels().includes('verbose')) {
      console.log(this.formatMessage(`VERBOSE: ${message}`, context));
    }
  }
}
