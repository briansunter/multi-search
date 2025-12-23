/**
 * Configuration loader with multi-path resolution and validation
 *
 * Supports multiple config formats:
 * - JSON: multi-search.config.json
 * - TypeScript: multi-search.config.ts (with defineConfig helper)
 *
 * Config resolution order:
 * 1. Explicit path (if provided)
 * 2. Local directory (./multi-search.config.{ts,json})
 * 3. XDG config ($XDG_CONFIG_HOME/multi-search/config.{ts,json})
 */

import { existsSync, readFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import { PluginRegistry, registerBuiltInPlugins } from "../plugin";
import type { ConfigFactory, ExtendedSearchConfig } from "./defineConfig";
import type { MultiSearchConfig } from "./types";
import { formatValidationErrors, validateConfigSafe } from "./validation";

/** Supported config file extensions */
const CONFIG_EXTENSIONS = [".ts", ".json"] as const;

/** Config file base names */
const CONFIG_BASENAMES = {
  local: "multi-search.config",
  xdg: "config",
} as const;

/**
 * Get local config paths (current directory)
 * Returns paths for both .ts and .json variants
 */
function getLocalConfigPaths(): string[] {
  const base = join(process.cwd(), CONFIG_BASENAMES.local);
  return CONFIG_EXTENSIONS.map((ext) => `${base}${ext}`);
}

/**
 * Get XDG config paths ($XDG_CONFIG_HOME/multi-search/config.{ts,json})
 */
function getXdgConfigPaths(): string[] {
  const xdg = process.env.XDG_CONFIG_HOME;
  const baseDir = xdg ?? join(homedir(), ".config");
  const base = join(baseDir, "multi-search", CONFIG_BASENAMES.xdg);
  return CONFIG_EXTENSIONS.map((ext) => `${base}${ext}`);
}

/**
 * Get all possible config file paths in order of preference
 * TypeScript files are preferred over JSON when both exist
 */
export function getConfigPaths(explicitPath?: string): string[] {
  const paths: string[] = [];

  // Explicit path first (if provided)
  if (explicitPath) {
    paths.push(explicitPath);
  }

  // Local directory (prefer .ts over .json)
  paths.push(...getLocalConfigPaths());

  // XDG config (prefer .ts over .json)
  paths.push(...getXdgConfigPaths());

  return paths;
}

/**
 * Check if a path is a TypeScript config
 */
function isTypeScriptConfig(path: string): boolean {
  return path.endsWith(".ts");
}

/**
 * Load a TypeScript config file
 * Uses Bun's native TS support for importing
 */
async function loadTypeScriptConfig(path: string): Promise<ExtendedSearchConfig> {
  try {
    // Use dynamic import for TS files
    // Bun natively supports importing .ts files
    const module = await import(path);

    // Config can be default export or named 'config'
    const configOrFactory = module.default ?? module.config;

    if (!configOrFactory) {
      throw new Error(`Config file must export a default configuration or named 'config' export`);
    }

    // Handle factory functions (async config)
    if (typeof configOrFactory === "function") {
      return await (configOrFactory as ConfigFactory)();
    }

    return configOrFactory as ExtendedSearchConfig;
  } catch (error) {
    throw new Error(
      `Failed to load TypeScript config from ${path}: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}

/**
 * Load a JSON config file
 */
function loadJsonConfig(path: string): ExtendedSearchConfig {
  const raw = readFileSync(path, "utf8");
  return JSON.parse(raw);
}

/**
 * Options for loading configuration
 */
export interface LoadConfigOptions {
  /** Skip config validation */
  skipValidation?: boolean;
  /** Custom plugin registry (defaults to singleton) */
  registry?: PluginRegistry;
  /** Skip registering built-in plugins */
  skipBuiltInPlugins?: boolean;
}

/**
 * Load configuration from the first available config file
 * Supports both JSON and TypeScript configurations
 *
 * @param explicitPath Optional explicit path to config file
 * @param options Optional loading options
 * @returns Parsed and validated configuration
 * @throws Error if no config file is found or validation fails
 *
 * @example
 * ```typescript
 * // Load from default locations
 * const config = await loadConfig();
 *
 * // Load from specific path
 * const config = await loadConfig('./my-config.ts');
 *
 * // Load with options
 * const config = await loadConfig(undefined, { skipValidation: true });
 * ```
 */
export async function loadConfig(
  explicitPath?: string,
  options: LoadConfigOptions = {},
): Promise<ExtendedSearchConfig> {
  const { skipValidation = false, registry, skipBuiltInPlugins = false } = options;
  const paths = getConfigPaths(explicitPath);

  for (const path of paths) {
    if (existsSync(path)) {
      let rawConfig: ExtendedSearchConfig;

      try {
        if (isTypeScriptConfig(path)) {
          rawConfig = await loadTypeScriptConfig(path);
        } else {
          rawConfig = loadJsonConfig(path);
        }
      } catch (error) {
        throw new Error(
          `Failed to load config file at ${path}: ${error instanceof Error ? error.message : String(error)}`,
        );
      }

      // Skip validation if explicitly requested (useful for testing)
      if (!skipValidation) {
        // Validate configuration against schema
        const result = validateConfigSafe(rawConfig);
        if (!result.success) {
          const errors = formatValidationErrors(result.error);
          throw new Error(
            `Invalid configuration in ${path}:\n${errors.map((e) => `  - ${e}`).join("\n")}`,
          );
        }
        rawConfig = result.data as ExtendedSearchConfig;
      }

      // Register plugins
      const pluginRegistry = registry ?? PluginRegistry.getInstance();

      // Register built-in plugins first (unless skipped)
      if (!skipBuiltInPlugins) {
        await registerBuiltInPlugins(pluginRegistry);
      }

      // Register any custom plugins from config
      if (rawConfig.plugins) {
        for (const plugin of rawConfig.plugins) {
          await pluginRegistry.register(plugin);
        }
      }

      return rawConfig;
    }
  }

  // Build helpful error message with example paths
  const localPaths = getLocalConfigPaths();
  const xdgPaths = getXdgConfigPaths();

  throw new Error(
    `No config file found. Looked in: ${paths.join(", ")}\n\n` +
      `Create a config file at one of these locations:\n` +
      `  TypeScript (recommended):\n` +
      `    - ${localPaths[0]}\n` +
      `    - ${xdgPaths[0]}\n` +
      `  JSON:\n` +
      `    - ${localPaths[1]}\n` +
      `    - ${xdgPaths[1]}\n` +
      `\nExample TypeScript config (multi-search.config.ts):\n` +
      `import { defineConfig, defineTavily } from 'multi-search';\n\n` +
      `export default defineConfig({\n` +
      `  defaultEngineOrder: ['tavily'],\n` +
      `  engines: [\n` +
      `    defineTavily({\n` +
      `      id: 'tavily',\n` +
      `      enabled: true,\n` +
      `      displayName: 'Tavily Search',\n` +
      `      apiKeyEnv: 'TAVILY_API_KEY',\n` +
      `      endpoint: 'https://api.tavily.com/search',\n` +
      `      searchDepth: 'basic',\n` +
      `      monthlyQuota: 1000,\n` +
      `      creditCostPerSearch: 1,\n` +
      `      lowCreditThresholdPercent: 80,\n` +
      `    }),\n` +
      `  ],\n` +
      `});\n`,
  );
}

/**
 * Synchronous version of loadConfig for JSON files only
 * @deprecated Use loadConfig() for full TypeScript support
 */
export function loadConfigSync(
  explicitPath?: string,
  options: { skipValidation?: boolean } = {},
): ExtendedSearchConfig {
  const paths = getConfigPaths(explicitPath);

  for (const path of paths) {
    if (existsSync(path)) {
      // Skip TypeScript files in sync mode
      if (isTypeScriptConfig(path)) {
        continue;
      }

      let rawConfig: unknown;

      try {
        rawConfig = loadJsonConfig(path);
      } catch (error) {
        throw new Error(
          `Failed to parse config file at ${path}: ${error instanceof Error ? error.message : String(error)}`,
        );
      }

      if (options.skipValidation) {
        return rawConfig as ExtendedSearchConfig;
      }

      const result = validateConfigSafe(rawConfig);
      if (!result.success) {
        const errors = formatValidationErrors(result.error);
        throw new Error(
          `Invalid configuration in ${path}:\n${errors.map((e) => `  - ${e}`).join("\n")}`,
        );
      }

      return result.data as ExtendedSearchConfig;
    }
  }

  throw new Error(`No JSON config file found. Use loadConfig() for TypeScript support.`);
}

/**
 * Check if a config file exists at any of the standard locations
 */
export function configExists(): boolean {
  const paths = getConfigPaths();
  return paths.some((path) => existsSync(path));
}
