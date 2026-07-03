import { resetKnowledgeRepositoryCache } from "../modules/knowledge-runtime/repository";
import { KnowledgeRuntimeService } from "../modules/knowledge-runtime/service";

describe("knowledge runtime service", () => {
  const service = new KnowledgeRuntimeService();

  beforeEach(() => {
    resetKnowledgeRepositoryCache();
  });

  it("returns read-only stats for the migrated Knowledge Engine", () => {
    const stats = service.getStats();

    expect(stats.readOnly).toBe(true);
    expect(stats.assembliesCount).toBeGreaterThan(0);
    expect(stats.costItemsCount).toBeGreaterThan(0);
    expect(stats.tradesCount).toBeGreaterThan(0);
    expect(stats.sourceFileCount).toBeGreaterThan(0);
  });

  it("reports stats that match the raw source data exactly", () => {
    const stats = service.getStats();
    const trades = service.listTrades();

    // costbook.json has 289 assemblies + assembly-index.json has 4 group
    // entries = 293; costbook.json has 1795 cost items; 25 trade-progress
    // rows; 9 schema files under packages/knowledge-engine/schemas.
    expect(stats.assembliesCount).toBe(293);
    expect(stats.costItemsCount).toBe(1795);
    expect(stats.tradesCount).toBe(25);
    expect(stats.schemaCount).toBe(9);
    expect(trades.length).toBe(stats.tradesCount);
    expect(stats.loadWarnings).toEqual([]);
  });

  it("counts nested per-trade knowledge files toward sourceFileCount, not just top-level files", () => {
    const stats = service.getStats();

    // schemaCount(9) + knowledgeAssemblyFiles + knowledgeCostItemFiles + 4
    // fixed top-level files (costbook, assembly-index, trade-progress,
    // taxonomy). The assemblies/cost-items directories both contain
    // per-trade subfolders (roofing/, tree-service/), so this must be well
    // above the flat top-level-only count of 15.
    expect(stats.sourceFileCount).toBeGreaterThan(15);
  });

  it("is deterministic: repeated stats/search calls return identical output", () => {
    const statsRuns = Array.from({ length: 3 }, () => JSON.stringify(service.getStats()));
    expect(new Set(statsRuns).size).toBe(1);

    const searchRuns = Array.from({ length: 3 }, () => JSON.stringify(service.search({ query: "concrete driveway", type: "all", limit: 5 })));
    expect(new Set(searchRuns).size).toBe(1);
  });

  it("honestly returns no results for an empty or nonsense query instead of guessing", () => {
    expect(service.search({ query: "", type: "all", limit: 5 })).toEqual([]);
    expect(service.search({ query: "zzzznonexistentqueryxyz", type: "all", limit: 5 })).toEqual([]);
  });

  it("returns unified search results for driveway scopes", () => {
    const results = service.search({ query: "concrete driveway", type: "all", limit: 5 });

    expect(results.length).toBeGreaterThan(0);
    expect(results.some((result) => result.name.toLowerCase().includes("driveway"))).toBe(true);
  });

  it("returns assembly-only search results when requested", () => {
    const results = service.searchAssemblies("concrete driveway", 5);

    expect(results.length).toBeGreaterThan(0);
    expect(results.every((result) => result.type === "assembly")).toBe(true);
  });

  it("matches the tree service sample when supporting data exists", () => {
    const result = service.matchScope("Remove a 60 foot oak tree, grind the stump, and haul away debris.", 5);

    expect(result.detectedTrade).toBe("Tree Service");
    expect(
      result.matchedCostItems.some((item) => {
        const name = item.name.toLowerCase();
        return name.includes("tree") || name.includes("haul away") || name.includes("disposal");
      })
    ).toBe(true);
    expect(result.assumptions.length).toBeGreaterThan(0);
    expect(result.missingInformation.length).toBeGreaterThan(0);
    expect(result.reviewWarnings.length).toBeGreaterThan(0);
  });

  it("matches the concrete driveway sample when supporting data exists", () => {
    const result = service.matchScope(
      "Tear out and replace 250 sq ft of cracked concrete driveway, 4 inch slab, broom finish, include sawcut edges, haul-off, and final cleanup.",
      5
    );

    expect(result.detectedTrade).toBe("Concrete");
    expect(result.matchedAssemblies.some((item) => item.name.toLowerCase().includes("driveway"))).toBe(true);
    expect(
      result.matchedCostItems.some((item) => {
        const name = item.name.toLowerCase();
        return name.includes("concrete") || name.includes("haul away") || name.includes("slab");
      })
    ).toBe(true);
  });

  it("matches the roofing replacement sample when supporting data exists", () => {
    const result = service.matchScope(
      "Replace 28 squares of architectural shingles, synthetic underlayment, ridge vent, and chimney flashing on a two-story house.",
      5
    );

    expect(result.detectedTrade).toBe("Roofing");
    expect(result.matchedAssemblies.length + result.matchedCostItems.length).toBeGreaterThan(0);
    expect(result.reviewWarnings.length).toBeGreaterThan(0);
  });

  it("matches the deck build sample when supporting data exists", () => {
    const result = service.matchScope("Build a 12x16 pressure-treated deck with stairs, guard rails, and concrete footings.", 5);

    expect(result.detectedTrade).toBe("Deck");
    expect(result.matchedAssemblies.length + result.matchedCostItems.length).toBeGreaterThan(0);
    expect(result.assumptions.length).toBeGreaterThan(0);
  });
});
