/**
 * Provider Constants
 *
 * Shared constants for provider configuration and behavior
 */

export const PROVIDER_DEFAULTS = {
  SEARXNG_INIT_TIMEOUT_MS: 60000,
  SEARXNG_STARTUP_DELAY_MS: 3000,
  LINKUP_INIT_TIMEOUT_MS: 30000,
  DEFAULT_TIMEOUT_MS: 30000,
  DEFAULT_RESULT_LIMIT: 10,
} as const;
