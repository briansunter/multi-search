import { AllProvidersStrategy } from "./AllProvidersStrategy";
import { FirstSuccessStrategy } from "./FirstSuccessStrategy";
import type { ISearchStrategy } from "./ISearchStrategy";

/**
 * Configuration options for search strategies
 * @interface StrategyOptions
 */
export interface StrategyOptions {
  /**
   * Timeout in milliseconds for individual provider requests
   * @default 30000
   */
  timeout?: number;

  /**
   * Maximum number of concurrent requests
   * @default 5
   */
  maxConcurrent?: number;

  /**
   * Retry configuration
   */
  retry?: {
    /**
     * Number of retry attempts
     * @default 2
     */
    attempts?: number;
    /**
     * Delay between retries in milliseconds
     * @default 1000
     */
    delay?: number;
  };

  /**
   * Additional strategy-specific options
   */
  [key: string]: unknown;
}

/**
 * Maps strategy names to their implementing classes
 * @interface StrategyMap
 */
interface StrategyMap {
  [strategyName: string]: new (options?: StrategyOptions) => ISearchStrategy;
}

/**
 * Factory for creating search strategy instances.
 * Implements the Factory pattern to enable Open/Closed Principle -
 * new strategies can be added without modifying existing code.
 *
 * @class StrategyFactory
 * @example
 * ```typescript
 * // Create an all-providers strategy
 * const allStrategy = StrategyFactory.createStrategy('all', {
 *   timeout: 30000,
 *   maxConcurrent: 3
 * });
 *
 * // Create a first-success strategy
 * const firstSuccessStrategy = StrategyFactory.createStrategy('first-success', {
 *   timeout: 15000
 * });
 *
 * // Register a custom strategy
 * StrategyFactory.registerStrategy('custom', CustomStrategy);
 * ```
 */
let strategies: StrategyMap = {
  all: AllProvidersStrategy,
  "first-success": FirstSuccessStrategy,
};

/**
 * Creates a search strategy instance based on the provided name and options.
 *
 * @param {string} strategyName - The name of the strategy to create
 * @param {StrategyOptions} [options] - Optional configuration for the strategy
 * @returns {ISearchStrategy} An instance of the requested strategy
 * @throws {Error} If the strategy name is not recognized
 *
 * @example
 * ```typescript
 * const strategy = StrategyFactory.createStrategy('all', {
 *   timeout: 20000,
 *   maxConcurrent: 5,
 *   retry: { attempts: 3, delay: 500 }
 * });
 * ```
 */
function createStrategy(strategyName: string, options?: StrategyOptions): ISearchStrategy {
  const StrategyClass = strategies[strategyName];

  if (!StrategyClass) {
    const availableStrategies = Object.keys(strategies).join(", ");
    throw new Error(
      `Unknown strategy: "${strategyName}". Available strategies: [${availableStrategies}]`,
    );
  }

  return new StrategyClass(options);
}

/**
 * Registers a new strategy in the factory.
 * Enables the Open/Closed Principle by allowing new strategies to be added
 * without modifying the factory code itself.
 *
 * @param {string} name - The name to register the strategy under
 * @param strategyClass - The strategy class constructor
 * @throws {Error} If a strategy with the same name already exists
 *
 * @example
 * ```typescript
 * class WeightedStrategy implements ISearchStrategy {
 *   constructor(private options?: StrategyOptions) {}
 *
 *   async search(
 *     query: string,
 *     providers: ISearchProvider[],
 *     options?: SearchOptions
 *   ): Promise<SearchResult[]> {
 *     // Implementation
 *   }
 * }
 *
 * StrategyFactory.registerStrategy('weighted', WeightedStrategy);
 * ```
 */
function registerStrategy(
  name: string,
  strategyClass: new (options?: StrategyOptions) => ISearchStrategy,
): void {
  if (strategies[name]) {
    throw new Error(`Strategy "${name}" is already registered`);
  }

  strategies[name] = strategyClass;
}

/**
 * Gets a list of all available strategy names.
 *
 * @returns {string[]} Array of available strategy names
 *
 * @example
 * ```typescript
 * const availableStrategies = StrategyFactory.getAvailableStrategies();
 * console.log(availableStrategies); // ['all', 'first-success', 'custom']
 * ```
 */
function getAvailableStrategies(): string[] {
  return Object.keys(strategies);
}

/**
 * Checks if a strategy is registered.
 *
 * @param {string} strategyName - The name of the strategy to check
 * @returns {boolean} True if the strategy is registered, false otherwise
 *
 * @example
 * ```typescript
 * if (StrategyFactory.hasStrategy('all')) {
 *   console.log('All providers strategy is available');
 * }
 * ```
 */
function hasStrategy(strategyName: string): boolean {
  return strategyName in strategies;
}

/**
 * Resets the factory to its default state.
 * This is primarily useful for testing to ensure test isolation.
 *
 * @example
 * ```typescript
 * // In test setup/teardown
 * afterEach(() => {
 *   StrategyFactory.reset();
 * });
 * ```
 */
function reset(): void {
  strategies = {
    all: AllProvidersStrategy,
    "first-success": FirstSuccessStrategy,
  };
}

export const StrategyFactory = {
  createStrategy,
  registerStrategy,
  getAvailableStrategies,
  hasStrategy,
  reset,
};
