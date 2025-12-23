/**
 * Provider abstraction layer
 */

import type { EngineId, SearchQuery, SearchResponse } from "./types";

export interface ProviderMetadata {
  id: EngineId;
  displayName: string;
  docsUrl?: string;
}

/**
 * Abstract interface that all search providers must implement
 */
export interface SearchProvider {
  readonly id: EngineId;
  getMetadata(): ProviderMetadata;
  search(query: SearchQuery): Promise<SearchResponse>;
}

/**
 * Interface for providers that manage lifecycle (init, healthcheck, shutdown)
 */
export interface ILifecycleProvider {
  init(): Promise<void>;
  healthcheck(): Promise<boolean>;
  shutdown(): Promise<void>;
  validateConfig(): Promise<{
    valid: boolean;
    errors: string[];
    warnings: string[];
  }>;
  isLifecycleManaged(): boolean;
}

/**
 * Registry to manage all available providers
 */
export class ProviderRegistry {
  private providers = new Map<EngineId, SearchProvider>();

  register(provider: SearchProvider): void {
    if (this.providers.has(provider.id)) {
      throw new Error(`Provider already registered: ${provider.id}`);
    }
    this.providers.set(provider.id, provider);
  }

  get(id: EngineId): SearchProvider | undefined {
    return this.providers.get(id);
  }

  list(): SearchProvider[] {
    return Array.from(this.providers.values());
  }

  has(id: EngineId): boolean {
    return this.providers.has(id);
  }
}
