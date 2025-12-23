/**
 * Linkup Search Provider Implementation
 * https://www.linkup.ai/
 */

import type { LinkupConfig } from "../config/types";
import { DockerLifecycleManager } from "../core/docker/dockerLifecycleManager";
import type { ILifecycleProvider } from "../core/provider";
import type { SearchQuery, SearchResponse } from "../core/types";
import { BaseProvider } from "./BaseProvider";
import { PROVIDER_DEFAULTS } from "./constants";
import type { LinkupApiResponse, LinkupSearchResult } from "./types";
import { fetchWithErrorHandling } from "./utils";

export class LinkupProvider extends BaseProvider<LinkupConfig> implements ILifecycleProvider {
  private lifecycleManager: DockerLifecycleManager;

  constructor(config: LinkupConfig) {
    super(config);

    const autoStart = config.autoStart ?? false;
    const autoStop = config.autoStop ?? false;
    const initTimeoutMs = config.initTimeoutMs ?? 30000;

    this.lifecycleManager = new DockerLifecycleManager({
      containerName: config.containerName,
      composeFile: config.composeFile,
      healthEndpoint: config.healthEndpoint,
      autoStart,
      autoStop,
      initTimeoutMs,
    });
  }

  protected getDocsUrl(): string {
    return "https://docs.linkup.ai/";
  }

  protected getApiKeyEnv(): string {
    return this.config.apiKeyEnv;
  }

  async search(query: SearchQuery): Promise<SearchResponse> {
    const apiKey = this.getApiKey();

    const requestBody = {
      q: query.query,
      depth: "standard",
      outputType: "searchResults",
      maxResults: query.limit ?? 5,
    };

    const { data: json, tookMs } = await fetchWithErrorHandling<LinkupApiResponse>(
      this.id,
      this.config.endpoint,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
        timeoutMs: PROVIDER_DEFAULTS.DEFAULT_TIMEOUT_MS,
      },
      "Linkup",
    );

    const results: LinkupSearchResult[] = json.results ?? [];

    this.validateResults(results, "Linkup");

    // Map to normalized format
    // Linkup results have url, name/title, content/snippet
    const items = results.map((r: LinkupSearchResult) => ({
      title: r.name ?? r.title ?? r.url,
      url: r.url,
      snippet: r.content ?? r.snippet ?? r.description ?? "",
      score: r.score ?? r.relevance,
      sourceEngine: this.id,
    }));

    return {
      engineId: this.id,
      items,
      raw: query.includeRaw ? json : undefined,
      tookMs,
    };
  }

  // ILifecycleProvider implementation
  async init(): Promise<void> {
    await this.lifecycleManager.init();
  }

  async healthcheck(): Promise<boolean> {
    return await this.lifecycleManager.healthcheck();
  }

  async shutdown(): Promise<void> {
    await this.lifecycleManager.shutdown();
  }

  async validateConfig(): Promise<{
    valid: boolean;
    errors: string[];
    warnings: string[];
  }> {
    return await this.lifecycleManager.validateDockerConfig();
  }

  isLifecycleManaged(): boolean {
    return true; // This provider manages lifecycle
  }
}
