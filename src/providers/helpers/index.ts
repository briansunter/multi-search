/**
 * Provider Helper Functions
 *
 * Reusable utilities for building search providers with less boilerplate.
 */

// Lifecycle helpers for Docker-managed providers
export {
  addLifecycleMethods,
  createDockerLifecycle,
  createLifecycleMethods,
  type DockerConfigurable,
  type DockerDefaults,
} from "./lifecycleHelpers";

// Result mapping helpers
export {
  DEFAULT_FIELD_MAPPINGS,
  type FieldMappings,
  getFirstMatch,
  mapSearchResult,
  mapSearchResults,
  PROVIDER_MAPPINGS,
} from "./resultMappers";
