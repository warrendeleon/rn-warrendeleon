/**
 * MSW Debug Handlers
 *
 * Provides request/response logging for debugging test failures.
 * Use these handlers to trace HTTP calls during test execution.
 *
 * ## Usage
 *
 * ```typescript
 * import { server } from '@app/test-utils';
 * import { enableMSWLogging, createRequestLogger } from '@app/test-utils/msw/debugHandlers';
 *
 * // Enable logging for all requests
 * beforeAll(() => {
 *   server.use(...enableMSWLogging());
 * });
 *
 * // Or use a logger to capture requests for assertions
 * const logger = createRequestLogger();
 * server.use(...logger.handlers);
 * // ... run test
 * expect(logger.requests).toHaveLength(2);
 * ```
 */

import { http, type HttpHandler, HttpResponse } from 'msw';

/**
 * Log entry for a captured HTTP request
 */
export interface RequestLogEntry {
  /** HTTP method (GET, POST, etc.) */
  method: string;
  /** Full URL of the request */
  url: string;
  /** Request headers */
  headers: Record<string, string>;
  /** Request body (if JSON) */
  body?: unknown;
  /** Timestamp of the request */
  timestamp: Date;
}

/**
 * Log entry for a captured HTTP response
 */
export interface ResponseLogEntry extends RequestLogEntry {
  /** HTTP status code */
  status: number;
  /** Response body (if JSON) */
  responseBody?: unknown;
  /** Duration in milliseconds */
  durationMs: number;
}

/**
 * Request logger instance for capturing and asserting on HTTP calls
 */
export interface RequestLogger {
  /** Array of captured request/response pairs */
  requests: ResponseLogEntry[];
  /** Clear all captured requests */
  clear: () => void;
  /** Get requests matching a URL pattern */
  getByUrl: (urlPattern: string | RegExp) => ResponseLogEntry[];
  /** Get requests matching a method */
  getByMethod: (method: string) => ResponseLogEntry[];
  /** MSW handlers to register with server */
  handlers: HttpHandler[];
}

/**
 * Console log levels for debug output
 */
type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'silent';

/**
 * Configuration options for MSW logging
 */
interface MSWLoggingOptions {
  /** Log level (default: 'info') */
  level?: LogLevel;
  /** Include request body in logs (default: true) */
  includeBody?: boolean;
  /** Include response body in logs (default: true) */
  includeResponse?: boolean;
  /** Include headers in logs (default: false) */
  includeHeaders?: boolean;
  /** Custom log prefix (default: '[MSW]') */
  prefix?: string;
  /** Filter to specific URL patterns */
  urlFilter?: (url: string) => boolean;
}

const LOG_COLORS = {
  method: '\x1b[36m', // Cyan
  url: '\x1b[33m', // Yellow
  status: {
    success: '\x1b[32m', // Green
    error: '\x1b[31m', // Red
    redirect: '\x1b[35m', // Magenta
  },
  reset: '\x1b[0m',
} as const;

function formatMethod(method: string): string {
  return `${LOG_COLORS.method}${method.padEnd(6)}${LOG_COLORS.reset}`;
}

/**
 * Formats an HTTP status code with color coding.
 * Used internally for console output.
 */
export function formatStatus(status: number): string {
  const color =
    status >= 500
      ? LOG_COLORS.status.error
      : status >= 400
        ? LOG_COLORS.status.error
        : status >= 300
          ? LOG_COLORS.status.redirect
          : LOG_COLORS.status.success;
  return `${color}${status}${LOG_COLORS.reset}`;
}

function formatUrl(url: string): string {
  return `${LOG_COLORS.url}${url}${LOG_COLORS.reset}`;
}

/**
 * Creates MSW handlers that log all HTTP requests/responses.
 *
 * Useful for debugging tests when you need to see what HTTP calls are being made.
 *
 * @param options - Logging configuration options
 * @returns Array of MSW handlers to register with server.use()
 *
 * @example
 * ```typescript
 * // Enable logging for a specific test
 * it('makes the right API calls', async () => {
 *   server.use(...enableMSWLogging({ level: 'debug' }));
 *   // ... test code
 * });
 * ```
 */
export function enableMSWLogging(options: MSWLoggingOptions = {}): HttpHandler[] {
  const {
    level = 'info',
    includeBody = true,
    includeResponse: _includeResponse = true,
    includeHeaders = false,
    prefix = '[MSW]',
    urlFilter,
  } = options;

  // Note: includeResponse is available for future response logging enhancements
  void _includeResponse;

  if (level === 'silent') {
    return [];
  }

  return [
    http.all('*', async ({ request }) => {
      const url = request.url;

      // Apply URL filter if provided
      if (urlFilter && !urlFilter(url)) {
        return undefined; // Pass through to next handler
      }

      const method = request.method;

      // Log request

      console.log(`${prefix} ${formatMethod(method)} ${formatUrl(url)}`);

      if (includeHeaders) {
        const headers: Record<string, string> = {};
        request.headers.forEach((value, key) => {
          headers[key] = value;
        });

        console.log(`${prefix}   Headers:`, headers);
      }

      if (includeBody && request.body) {
        try {
          const clonedRequest = request.clone();
          const body = await clonedRequest.json();

          console.log(`${prefix}   Body:`, JSON.stringify(body, null, 2));
        } catch {
          // Body is not JSON, skip logging
        }
      }

      // Return undefined to let the request pass through to actual handlers
      return undefined;
    }),
  ];
}

/**
 * Creates a request logger that captures all HTTP calls for assertions.
 *
 * Unlike enableMSWLogging which just logs to console, this captures
 * request data that you can assert on in your tests.
 *
 * @returns RequestLogger instance with captured requests and helper methods
 *
 * @example
 * ```typescript
 * const logger = createRequestLogger();
 * server.use(...logger.handlers);
 *
 * // Run test actions
 * fireEvent.press(submitButton);
 *
 * // Assert on captured requests
 * expect(logger.requests).toHaveLength(1);
 * expect(logger.requests[0].method).toBe('POST');
 * expect(logger.requests[0].url).toContain('/auth/v1/token');
 *
 * // Clean up
 * logger.clear();
 * ```
 */
export function createRequestLogger(): RequestLogger {
  const requests: ResponseLogEntry[] = [];

  const handlers: HttpHandler[] = [
    http.all('*', async ({ request }) => {
      const startTime = Date.now();
      const url = request.url;
      const method = request.method;

      // Capture headers
      const headers: Record<string, string> = {};
      request.headers.forEach((value, key) => {
        headers[key] = value;
      });

      // Capture body
      let body: unknown = undefined;
      if (request.body) {
        try {
          const clonedRequest = request.clone();
          body = await clonedRequest.json();
        } catch {
          // Body is not JSON
        }
      }

      // Create log entry (response fields will be filled later by actual handlers)
      const entry: ResponseLogEntry = {
        method,
        url,
        headers,
        body,
        timestamp: new Date(),
        status: 0, // Will be updated by actual handler
        responseBody: undefined,
        durationMs: Date.now() - startTime,
      };

      requests.push(entry);

      // Return undefined to pass through to actual handlers
      return undefined;
    }),
  ];

  return {
    requests,
    clear: () => {
      requests.length = 0;
    },
    getByUrl: (urlPattern: string | RegExp) => {
      return requests.filter(r => {
        if (typeof urlPattern === 'string') {
          return r.url.includes(urlPattern);
        }
        return urlPattern.test(r.url);
      });
    },
    getByMethod: (method: string) => {
      return requests.filter(r => r.method.toUpperCase() === method.toUpperCase());
    },
    handlers,
  };
}

/**
 * Creates a handler that delays all requests by a specified amount.
 *
 * Useful for testing loading states and timeout behaviour.
 *
 * @param delayMs - Delay in milliseconds
 * @returns MSW handler array
 *
 * @example
 * ```typescript
 * // Add 500ms delay to all requests
 * server.use(...createDelayHandler(500));
 * ```
 */
export function createDelayHandler(delayMs: number): HttpHandler[] {
  return [
    http.all('*', async () => {
      await new Promise(resolve => setTimeout(resolve, delayMs));
      return undefined; // Pass through to actual handlers
    }),
  ];
}

/**
 * Creates a handler that intercepts and counts requests to a specific URL.
 *
 * Useful for verifying request deduplication and caching.
 *
 * @param urlPattern - URL pattern to match
 * @returns Object with count getter and MSW handlers
 *
 * @example
 * ```typescript
 * const counter = createRequestCounter('/api/profile');
 * server.use(...counter.handlers);
 *
 * // Run test
 * await loadProfile();
 * await loadProfile(); // Should be cached
 *
 * expect(counter.count).toBe(1); // Only one request made
 * ```
 */
export function createRequestCounter(urlPattern: string | RegExp): {
  count: number;
  reset: () => void;
  handlers: HttpHandler[];
} {
  let count = 0;

  const handlers: HttpHandler[] = [
    http.all('*', ({ request }) => {
      const url = request.url;
      const matches =
        typeof urlPattern === 'string' ? url.includes(urlPattern) : urlPattern.test(url);

      if (matches) {
        count++;
      }

      return undefined; // Pass through
    }),
  ];

  return {
    get count() {
      return count;
    },
    reset: () => {
      count = 0;
    },
    handlers,
  };
}

/**
 * Creates a handler that simulates network flakiness.
 *
 * Randomly fails requests based on a failure rate.
 *
 * @param failureRate - Probability of failure (0-1)
 * @returns MSW handler array
 *
 * @example
 * ```typescript
 * // 30% of requests will fail
 * server.use(...createFlakyHandler(0.3));
 * ```
 */
export function createFlakyHandler(failureRate: number): HttpHandler[] {
  return [
    http.all('*', () => {
      if (Math.random() < failureRate) {
        return HttpResponse.error();
      }
      return undefined; // Pass through
    }),
  ];
}
