/**
 * Provider Factory
 *
 * Factory for creating search provider instances based on configuration.
 * Delegates to PluginRegistry for provider creation, enabling new providers
 * to be added without modifying this code.
 */

import type { EngineConfig } from "../../config/types";
import { areBuiltInPluginsRegistered, PluginRegistry, registerBuiltInPlugins } from "../../plugin";
import type { Container } from "../container";
import type { SearchProvider } from "../provider";

/**
 * Factory for creating provider instances based on configuration
 *
 * Uses the PluginRegistry to create providers, allowing new provider types
 * to be added by registering plugins rather than modifying factory code.
 *
 * @class ProviderFactory
 * @example
 * ```typescript
 * // Ensure plugins are registered first
 * await ProviderFactory.ensurePluginsRegistered();
 *
 * // Create a provider
 * const provider = ProviderFactory.createProvider(config, container);
 * ```
 */
let initialized = false;

/**
 * Ensure built-in plugins are registered
 * Call this before creating providers if not loading via loadConfig()
 */
async function ensurePluginsRegistered(): Promise<void> {
  if (!initialized) {
    const registry = PluginRegistry.getInstance();
    if (!areBuiltInPluginsRegistered(registry)) {
      await registerBuiltInPlugins(registry);
    }
    initialized = true;
  }
}

/**
 * Synchronously ensure built-in plugins are registered
 * Uses sync registration (no lifecycle hooks called)
 */
function ensurePluginsRegisteredSync(): void {
  if (!initialized) {
    const registry = PluginRegistry.getInstance();
    if (!areBuiltInPluginsRegistered(registry)) {
      registerBuiltInPlugins(registry);
    }
    initialized = true;
  }
}

/**
 * Creates a search provider instance based on the provided configuration
 *
 * @param {EngineConfig} config - The engine configuration (must include 'type' field)
 * @param {Container} container - DI container for dependency injection
 * @returns {SearchProvider} An instance of the requested provider
 * @throws {Error} If the provider type is not registered
 *
 * @example
 * ```typescript
 * const provider = ProviderFactory.createProvider(config, container);
 * ```
 */
function createProvider(config: EngineConfig, container: Container): SearchProvider {
  // Ensure built-in plugins are registered (sync)
  ensurePluginsRegisteredSync();

  const registry = PluginRegistry.getInstance();

  return registry.createProvider(config, { container });
}

/**
 * Create multiple providers from an array of configs
 */
function createProviders(configs: EngineConfig[], container: Container): SearchProvider[] {
  return configs.map((config) => createProvider(config, container));
}

/**
 * Check if a provider type is supported
 */
function isTypeSupported(type: string): boolean {
  ensurePluginsRegisteredSync();
  return PluginRegistry.getInstance().has(type);
}

/**
 * Get all supported provider types
 */
function getSupportedTypes(): string[] {
  ensurePluginsRegisteredSync();
  return PluginRegistry.getInstance().getTypes();
}

/**
 * Reset initialization state (for testing)
 */
function reset(): void {
  initialized = false;
}

export const ProviderFactory = {
  ensurePluginsRegistered,
  ensurePluginsRegisteredSync,
  createProvider,
  createProviders,
  isTypeSupported,
  getSupportedTypes,
  reset,
};
