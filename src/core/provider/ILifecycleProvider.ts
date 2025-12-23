/**
 * Lifecycle Provider Interface
 *
 * Separates lifecycle concerns (init, healthcheck, shutdown, validation) from search provider contract.
 * Implemented by providers that manage their own infrastructure (Docker containers, local services).
 * NOT implemented by external API providers (Tavily, Brave) that don't require lifecycle management.
 *
 * This interface follows the Interface Segregation Principle (ISP) by providing
 * a focused contract for lifecycle-aware providers, separate from the core SearchProvider interface.
 *
 * @example
 * ```typescript
 * class DockerSearchProvider implements SearchProvider, ILifecycleProvider {
 *   // SearchProvider methods
 *   search(query: SearchQuery): Promise<SearchResponse> { ... }
 *
 *   // ILifecycleProvider methods
 *   async init(): Promise<void> { ... }
 *   async healthcheck(): Promise<boolean> { ... }
 *   async shutdown(): Promise<void> { ... }
 *   async validateConfig(): Promise<ValidationResult> { ... }
 *   isLifecycleManaged(): boolean { return true; }
 * }
 * ```
 */

/**
 * Validation result for provider configuration
 */
export interface ValidationResult {
  /** Whether the configuration is valid */
  valid: boolean;
  /** List of validation errors (empty if valid) */
  errors: string[];
  /** List of validation warnings (informational) */
  warnings: string[];
}

/**
 * Interface for providers that manage their own lifecycle (Docker containers, local services)
 *
 * Separates lifecycle management from search functionality, allowing:
 * - Clean separation of concerns (Single Responsibility Principle)
 * - LSP compliance - SearchProvider contract remains pure
 * - Flexibility - can use providers with or without lifecycle management
 * - Better testability - lifecycle can be mocked/stubbed separately
 */
export interface ILifecycleProvider {
  /**
   * Initialize the provider
   *
   * Performs initialization tasks such as:
   * - Starting Docker containers (if autoStart is enabled)
   * - Establishing connections to external services
   * - Performing health checks
   * - Setting up required infrastructure
   *
   * Should be idempotent - safe to call multiple times.
   * Should handle concurrent calls gracefully.
   *
   * @throws Error if initialization fails critically
   */
  init(): Promise<void>;

  /**
   * Check if the provider is healthy and ready to serve requests
   *
   * Performs health checks such as:
   * - Container running status (for Docker providers)
   * - Health endpoint responsiveness
   * - Service availability checks
   * - Resource availability validation
   *
   * @returns true if provider is healthy and ready, false otherwise
   */
  healthcheck(): Promise<boolean>;

  /**
   * Shutdown the provider cleanly
   *
   * Performs cleanup tasks such as:
   * - Stopping Docker containers (if autoStop is enabled)
   * - Closing connections
   * - Releasing resources
   * - Cleanup of temporary files/state
   *
   * Should be graceful - avoid throwing errors unless absolutely necessary.
   * Should handle cases where provider is not running.
   *
   * @throws Error only for critical shutdown failures that need attention
   */
  shutdown(): Promise<void>;

  /**
   * Validate provider configuration
   *
   * Checks configuration for issues such as:
   * - Docker availability and permissions
   * - Compose file validity and existence
   * - Container name validation
   * - Health endpoint URL validity
   * - Required environment variables
   * - Port availability and conflicts
   *
   * @returns Validation result with errors and warnings
   */
  validateConfig(): Promise<ValidationResult>;

  /**
   * Check if this provider requires lifecycle management
   *
   * Returns true for providers that manage infrastructure (Docker containers, local services).
   * Returns false for external API providers that don't require lifecycle management.
   *
   * This method allows consumers to determine whether lifecycle methods should be called.
   *
   * @returns true if provider manages its own lifecycle, false for external APIs
   */
  isLifecycleManaged(): boolean;
}
