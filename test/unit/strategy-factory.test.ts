/**
 * Unit Tests for StrategyFactory
 *
 * Tests the factory pattern implementation for creating strategy instances
 */

import { describe, expect, test } from "bun:test";
import { AllProvidersStrategy } from "../../src/core/strategy/AllProvidersStrategy";
import { FirstSuccessStrategy } from "../../src/core/strategy/FirstSuccessStrategy";
import { StrategyFactory } from "../../src/core/strategy/StrategyFactory";

describe("StrategyFactory - Unit Tests", () => {
  test("should create AllProvidersStrategy instance", () => {
    const strategy = StrategyFactory.createStrategy("all");
    expect(strategy).toBeDefined();
    expect(strategy).toBeInstanceOf(AllProvidersStrategy);
  });

  test("should create FirstSuccessStrategy instance", () => {
    const strategy = StrategyFactory.createStrategy("first-success");
    expect(strategy).toBeDefined();
    expect(strategy).toBeInstanceOf(FirstSuccessStrategy);
  });

  test("should create strategies with options", () => {
    const allStrategy = StrategyFactory.createStrategy("all", { timeout: 5000 });
    const firstSuccessStrategy = StrategyFactory.createStrategy("first-success", { timeout: 3000 });

    expect(allStrategy).toBeInstanceOf(AllProvidersStrategy);
    expect(firstSuccessStrategy).toBeInstanceOf(FirstSuccessStrategy);
  });

  test("should throw error for unknown strategy", () => {
    expect(() => {
      StrategyFactory.createStrategy("unknown");
    }).toThrow();
  });

  test("should list available strategies", () => {
    const strategies = StrategyFactory.getAvailableStrategies();
    expect(strategies).toContain("all");
    expect(strategies).toContain("first-success");
  });

  test("should check if strategy exists", () => {
    expect(StrategyFactory.hasStrategy("all")).toBe(true);
    expect(StrategyFactory.hasStrategy("first-success")).toBe(true);
    expect(StrategyFactory.hasStrategy("unknown")).toBe(false);
  });
});
