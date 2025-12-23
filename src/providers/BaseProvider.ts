/**
 * Base Provider Class
 *
 * Shared functionality for all search providers to reduce duplication
 */

import type { EngineConfigBase } from "../config/types";
import type { ProviderMetadata, SearchProvider } from "../core/provider";
import type { SearchQuery, SearchResponse } from "../core/types";
import { SearchError } from "../core/types";
import { getApiKey, validateResults } from "./utils";

export abstract class BaseProvider<T extends EngineConfigBase> implements SearchProvider {
  readonly id: string;
  protected config: T;

  constructor(config: T) {
    this.id = config.id;
    this.config = config;
  }

  getMetadata(): ProviderMetadata {
    return {
      id: this.id,
      displayName: this.config.displayName,
      docsUrl: this.getDocsUrl(),
    };
  }

  abstract search(query: SearchQuery): Promise<SearchResponse>;
  protected abstract getDocsUrl(): string;
  protected abstract getApiKeyEnv(): string;

  protected getApiKey(): string {
    return getApiKey(this.id, this.getApiKeyEnv());
  }

  protected validateResults(results: unknown, providerName: string): void {
    validateResults(this.id, results, providerName);
  }

  protected throwSearchError(
    type: "config_error" | "network_error" | "api_error" | "no_results" | "provider_unavailable",
    message: string,
    statusCode?: number,
  ): never {
    throw new SearchError(this.id, type, message, statusCode);
  }
}
