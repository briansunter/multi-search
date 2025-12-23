// Public API surface for consumers importing the library (non-CLI).

export { bootstrapContainer } from "../bootstrap/container";
// Config helpers
export {
  createConfig,
  defineBrave,
  defineConfig,
  defineEngine,
  defineLinkup,
  definePlugin,
  defineSearchxng,
  defineTavily,
} from "../config/defineConfig";
export type {
  BraveConfig,
  EngineConfig,
  LinkupConfig,
  MultiSearchConfig,
  SearchxngConfig,
  TavilyConfig,
} from "../config/types";
export type { EngineId, SearchQuery, SearchResponse, SearchResultItem } from "../core/types";
// Types
export type { MultiSearchInput, MultiSearchOutput, MultiSearchOutputItem } from "../tool/interface";
export type {
  GetCreditStatusOptions,
  MultiSearchOptions as ToolMultiSearchOptions,
} from "../tool/multiSearchTool";
export { getCreditStatus, multiSearch } from "../tool/multiSearchTool";
