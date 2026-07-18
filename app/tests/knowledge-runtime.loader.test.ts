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
});
