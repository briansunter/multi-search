/**
 * Logger Abstraction
 *
 * Provides a consistent logging interface across the codebase.
 * Supports log levels and can be configured for different environments.
 */

export type LogLevel = "debug" | "info" | "warn" | "error" | "none";

/**
 * Logger configuration
 */
export interface LoggerConfig {
  /** Minimum log level to output */
  level: LogLevel;
  /** Prefix for all log messages */
  prefix?: string;
  /** Whether to include timestamps */
  timestamp?: boolean;
}

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
  none: 4,
};

/**
 * Simple logger implementation
 */
export class Logger {
  private config: LoggerConfig;

  constructor(config: Partial<LoggerConfig> = {}) {
    this.config = {
      level: config.level ?? (process.env.DEBUG ? "debug" : "info"),
      prefix: config.prefix,
      timestamp: config.timestamp ?? false,
    };
  }

  /**
   * Check if a log level should be output
   */
  private shouldLog(level: LogLevel): boolean {
    return LOG_LEVELS[level] >= LOG_LEVELS[this.config.level];
  }

  /**
   * Format a log message
   */
  private format(_level: LogLevel, message: string): string {
    const parts: string[] = [];

    if (this.config.timestamp) {
      parts.push(new Date().toISOString());
    }

    if (this.config.prefix) {
      parts.push(`[${this.config.prefix}]`);
    }

    parts.push(message);
    return parts.join(" ");
  }

  /**
   * Log a debug message
   */
  debug(message: string, ...args: unknown[]): void {
    if (this.shouldLog("debug")) {
      console.log(this.format("debug", message), ...args);
    }
  }

  /**
   * Log an info message
   */
  info(message: string, ...args: unknown[]): void {
    if (this.shouldLog("info")) {
      console.log(this.format("info", message), ...args);
    }
  }

  /**
   * Log a warning message
   */
  warn(message: string, ...args: unknown[]): void {
    if (this.shouldLog("warn")) {
      console.warn(this.format("warn", message), ...args);
    }
  }

  /**
   * Log an error message
   */
  error(message: string, ...args: unknown[]): void {
    if (this.shouldLog("error")) {
      console.error(this.format("error", message), ...args);
    }
  }

  /**
   * Create a child logger with a prefix
   */
  child(prefix: string): Logger {
    const parentPrefix = this.config.prefix;
    return new Logger({
      ...this.config,
      prefix: parentPrefix ? `${parentPrefix}:${prefix}` : prefix,
    });
  }

  /**
   * Set the log level
   */
  setLevel(level: LogLevel): void {
    this.config.level = level;
  }
}

/**
 * Default logger instance
 * Can be configured globally via environment variables:
 * - DEBUG: Set to any value to enable debug logging
 * - LOG_LEVEL: Set to debug, info, warn, error, or none
 */
export const logger = new Logger({
  level: (process.env.LOG_LEVEL as LogLevel) ?? (process.env.DEBUG ? "debug" : "warn"),
});

/**
 * Create a logger with a specific prefix
 *
 * @example
 * ```typescript
 * const log = createLogger('DockerLifecycle');
 * log.info('Starting container...');
 * // Output: [DockerLifecycle] Starting container...
 * ```
 */
export function createLogger(prefix: string): Logger {
  return logger.child(prefix);
}
