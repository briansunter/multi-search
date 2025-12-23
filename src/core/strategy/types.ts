/**
 * Strategy interface and types for search execution patterns
 */

import type { CreditManager } from "../credits";
import type { ProviderRegistry } from "../provider";
import type { EngineId, SearchQuery, SearchResultItem } from "../types";

/**
 * Context passed to search strategies containing dependencies
 */
export interface StrategyContext {
  /** Provider registry for accessing search providers */
  registry: ProviderRegistry;
  /** Credit manager for checking and charging credits */
  credits: CreditManager;
}

/**
 * Result from a search strategy execution
 */
export interface StrategyResult {
  /** Search results from successful providers */
  results: SearchResultItem[];
  /** Metadata about engine attempts */
  attempts: EngineAttempt[];
}

/**
 * Engine attempt metadata
 */
export interface EngineAttempt {
  engineId: EngineId;
  success: boolean;
  reason?: string;
}

/**
 * Interface for implementing different search execution strategies
 */
export interface ISearchStrategy {
  /**
   * Execute search using this strategy
   * @param query - The search query
   * @param engineIds - Ordered list of engine IDs to try
   * @param options - Search options (limit, includeRaw, etc.)
   * @param context - Strategy context with dependencies
   * @returns Promise resolving to strategy result
   */
  execute(
    query: string,
    engineIds: EngineId[],
    options: SearchQuery,
    context: StrategyContext,
  ): Promise<StrategyResult>;
}
