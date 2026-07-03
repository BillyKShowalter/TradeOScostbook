import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { buildKnowledgeSourceFiles, loadKnowledgeEngineSnapshot, resolveKnowledgeEnginePaths } from "../modules/knowledge-runtime/loader";

describe("knowledge runtime loader", () => {
  it("finds the migrated Knowledge Engine directories", () => {
    const paths = resolveKnowledgeEnginePaths();
    const sourceFiles = buildKnowledgeSourceFiles(paths);

    expect(fs.existsSync(path.join(paths.exportsDir, "json", "costbook.json"))).toBe(true);
    expect(fs.existsSync(sourceFiles.assemblyIndexPath)).toBe(true);
    expect(fs.existsSync(paths.schemasDir)).toBe(true);
  });

  it("loads assemblies, cost items, trades, and schemas from disk", () => {
    const snapshot = loadKnowledgeEngineSnapshot();

    expect(snapshot.assemblies.length).toBeGreaterThan(0);
    expect(snapshot.costItems.length).toBeGreaterThan(0);
    expect(snapshot.tradeProgress.length).toBeGreaterThan(0);
    expect(snapshot.schemaFiles.length).toBeGreaterThan(0);
    expect(snapshot.taxonomyText.length).toBeGreaterThan(0);
  });

  it("gracefully handles missing optional knowledge files", () => {
    const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), "knowledge-runtime-loader-"));
    const exportsDir = path.join(tempRoot, "exports");
    const schemasDir = path.join(tempRoot, "schemas");
    const knowledgeDir = path.join(tempRoot, "knowledge");

    fs.mkdirSync(path.join(exportsDir, "json"), { recursive: true });
    fs.mkdirSync(schemasDir, { recursive: true });
    fs.mkdirSync(knowledgeDir, { recursive: true });

    fs.writeFileSync(
      path.join(exportsDir, "json", "costbook.json"),
      JSON.stringify({ assemblies: [{ id: "assembly-1", name: "Test Assembly", category: "Test" }], items: [{ id: "item-1", name: "Test Item", category: "Test" }] })
    );
    fs.writeFileSync(path.join(schemasDir, "cost-item.schema.json"), JSON.stringify({ title: "cost-item" }));

    const snapshot = loadKnowledgeEngineSnapshot({
      repoRoot: tempRoot,
      exportsDir,
      knowledgeDir,
      schemasDir,
    });

    expect(snapshot.assemblies).toHaveLength(1);
    expect(snapshot.costItems).toHaveLength(1);
    expect(snapshot.tradeProgress).toHaveLength(0);
    expect(snapshot.assemblyIndex).toHaveLength(0);
    expect(snapshot.taxonomyText).toBe("");
    expect(snapshot.loadWarnings.length).toBeGreaterThan(0);

    fs.rmSync(tempRoot, { recursive: true, force: true });
  });

  it("throws a clear error when none of the candidate repo roots contain the marker files", () => {
    // resolveKnowledgeEnginePaths checks candidates derived from both cwd()
    // and __dirname, so it's robust to being invoked from an unrelated cwd.
    // To actually exercise the "not found" path, no candidate's markers may
    // exist, which requires stubbing fs.existsSync rather than just cwd.
    const existsSyncSpy = jest.spyOn(fs, "existsSync").mockReturnValue(false);

    try {
      expect(() => resolveKnowledgeEnginePaths()).toThrow(/Unable to locate the TradeOS repository root/);
    } finally {
      existsSyncSpy.mockRestore();
    }
  });

  it("fails instead of silently returning empty data when the required costbook file is missing", () => {
    const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), "knowledge-runtime-missing-required-"));
    const exportsDir = path.join(tempRoot, "exports");
    const schemasDir = path.join(tempRoot, "schemas");
    const knowledgeDir = path.join(tempRoot, "knowledge");

    // costbook.json (the one required file) is deliberately never written.
    fs.mkdirSync(path.join(exportsDir, "json"), { recursive: true });
    fs.mkdirSync(schemasDir, { recursive: true });
    fs.mkdirSync(knowledgeDir, { recursive: true });

    expect(() =>
      loadKnowledgeEngineSnapshot({ repoRoot: tempRoot, exportsDir, knowledgeDir, schemasDir })
    ).toThrow();

    fs.rmSync(tempRoot, { recursive: true, force: true });
  });

  it("recursively discovers per-trade knowledge files nested in subdirectories", () => {
    const paths = resolveKnowledgeEnginePaths();
    const sourceFiles = buildKnowledgeSourceFiles(paths);
    const snapshot = loadKnowledgeEngineSnapshot(paths);

    // These files live under knowledge/assemblies/tree-service/ and
    // knowledge/cost-items/tree-service/, not directly in the parent
    // directory, so a non-recursive directory listing would miss them.
    expect(fs.existsSync(path.join(sourceFiles.knowledgeAssembliesDir, "tree-service", "stump-grinding.json"))).toBe(true);
    expect(snapshot.knowledgeAssemblyFiles).toContain("tree-service/stump-grinding.json");
    expect(snapshot.knowledgeCostItemFiles.some((file) => file.startsWith("tree-service/"))).toBe(true);
  });

  it("recurses into nested subdirectories when listing knowledge files (regression)", () => {
    const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), "knowledge-runtime-nested-"));
    const exportsDir = path.join(tempRoot, "exports");
    const schemasDir = path.join(tempRoot, "schemas");
    const knowledgeDir = path.join(tempRoot, "knowledge");
    const nestedAssembliesDir = path.join(knowledgeDir, "knowledge", "assemblies", "some-trade");
    const nestedCostItemsDir = path.join(knowledgeDir, "knowledge", "cost-items", "some-trade");

    fs.mkdirSync(path.join(exportsDir, "json"), { recursive: true });
    fs.mkdirSync(schemasDir, { recursive: true });
    fs.mkdirSync(nestedAssembliesDir, { recursive: true });
    fs.mkdirSync(nestedCostItemsDir, { recursive: true });

    fs.writeFileSync(
      path.join(exportsDir, "json", "costbook.json"),
      JSON.stringify({ assemblies: [], items: [] })
    );
    fs.writeFileSync(path.join(nestedAssembliesDir, "nested-assembly.json"), JSON.stringify({ id: "a1" }));
    fs.writeFileSync(path.join(nestedCostItemsDir, "nested-cost-item.json"), JSON.stringify({ id: "c1" }));

    const snapshot = loadKnowledgeEngineSnapshot({ repoRoot: tempRoot, exportsDir, knowledgeDir, schemasDir });

    expect(snapshot.knowledgeAssemblyFiles).toContain("some-trade/nested-assembly.json");
    expect(snapshot.knowledgeCostItemFiles).toContain("some-trade/nested-cost-item.json");

    fs.rmSync(tempRoot, { recursive: true, force: true });
  });
});
