/**
 * Lifecycle Helper Functions for Docker-Managed Providers
 *
 * Provides reusable functions for creating Docker lifecycle managers
 * and implementing ILifecycleProvider methods via composition.
 */

import type { DockerConfigurable } from "../../config/types";
import { DockerLifecycleManager } from "../../core/docker/dockerLifecycleManager";
import type { ILifecycleProvider } from "../../core/provider";

// Re-export for convenience
export type { DockerConfigurable };

/**
 * Default values for Docker lifecycle configuration
 */
export interface DockerDefaults {
  /** Default for autoStart (default: false) */
  autoStart?: boolean;
  /** Default for autoStop (default: false) */
  autoStop?: boolean;
  /** Default initialization timeout in ms (default: 30000) */
  initTimeoutMs?: number;
  /** Optional project root directory for Docker commands */
  projectRoot?: string;
}

/**
 * Create a DockerLifecycleManager from config with sensible defaults
 *
 * @param config - Engine config containing Docker settings
 * @param defaults - Default values to use when config values are undefined
 * @returns Configured DockerLifecycleManager instance
 *
 * @example
 * ```typescript
 * const manager = createDockerLifecycle(config, {
 *   autoStart: true,
 *   autoStop: true,
 *   initTimeoutMs: 60000,
 * });
 * ```
 */
export function createDockerLifecycle(
  config: DockerConfigurable,
  defaults: DockerDefaults = {},
): DockerLifecycleManager {
  return new DockerLifecycleManager({
    containerName: config.containerName,
    composeFile: config.composeFile,
    healthEndpoint: config.healthEndpoint,
    autoStart: config.autoStart ?? defaults.autoStart ?? false,
    autoStop: config.autoStop ?? defaults.autoStop ?? false,
    initTimeoutMs: config.initTimeoutMs ?? defaults.initTimeoutMs ?? 30000,
    projectRoot: defaults.projectRoot,
  });
}

/**
 * Create ILifecycleProvider methods that delegate to a DockerLifecycleManager
 *
 * This implements the composition pattern - rather than inheritance,
 * we create an object with lifecycle methods that delegate to the manager.
 *
 * @param manager - The DockerLifecycleManager to delegate to
 * @returns Object implementing ILifecycleProvider interface
 *
 * @example
 * ```typescript
 * const lifecycleMethods = createLifecycleMethods(this.lifecycleManager);
 * // Now spread or assign these methods to your provider
 * ```
 */
export function createLifecycleMethods(manager: DockerLifecycleManager): ILifecycleProvider {
  return {
    init: () => manager.init(),
    healthcheck: () => manager.healthcheck(),
    shutdown: () => manager.shutdown(),
    validateConfig: () => manager.validateDockerConfig(),
    isLifecycleManaged: () => true,
  };
}

/**
 * Mixin function to add lifecycle methods to a provider class instance
 *
 * @param target - The provider instance to add methods to
 * @param manager - The DockerLifecycleManager to delegate to
 * @returns The target with lifecycle methods added
 *
 * @example
 * ```typescript
 * class MyProvider {
 *   private lifecycleManager: DockerLifecycleManager;
 *
 *   constructor(config: MyConfig) {
 *     this.lifecycleManager = createDockerLifecycle(config, { autoStart: true });
 *     addLifecycleMethods(this, this.lifecycleManager);
 *   }
 * }
 * ```
 */
export function addLifecycleMethods<T extends object>(
  target: T,
  manager: DockerLifecycleManager,
): T & ILifecycleProvider {
  const methods = createLifecycleMethods(manager);
  return Object.assign(target, methods);
}
