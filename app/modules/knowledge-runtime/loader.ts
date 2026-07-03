import fs from "node:fs";
import path from "node:path";
import { KnowledgeEnginePaths, KnowledgeRuntimeSourceFiles, KnowledgeSourceSnapshot, RawAssemblyIndexEntry, RawKnowledgeAssembly, RawKnowledgeCostItem, RawKnowledgeTradeProgressEntry } from "./types";

const REPO_MARKERS = ["packages/knowledge-engine/exports/json/costbook.json", "app/package.json"];

export function resolveKnowledgeEnginePaths(): KnowledgeEnginePaths {
  const candidates = new Set<string>([
    process.cwd(),
    path.resolve(process.cwd(), ".."),
    path.resolve(__dirname, "../../.."),
    path.resolve(__dirname, "../../../.."),
  ]);

  for (const candidate of candidates) {
    if (hasRepoMarkers(candidate)) {
      return {
        repoRoot: candidate,
        exportsDir: path.join(candidate, "packages", "knowledge-engine", "exports"),
        knowledgeDir: path.join(candidate, "packages", "knowledge-engine", "knowledge"),
        schemasDir: path.join(candidate, "packages", "knowledge-engine", "schemas"),
      };
    }
  }

  throw new Error("Unable to locate the TradeOS repository root for Knowledge Engine loading.");
}

export function buildKnowledgeSourceFiles(paths: KnowledgeEnginePaths): KnowledgeRuntimeSourceFiles {
  return {
    costbookPath: path.join(paths.exportsDir, "json", "costbook.json"),
    assemblyIndexPath: path.join(paths.knowledgeDir, "knowledge", "assembly-index.json"),
    tradeProgressPath: path.join(paths.knowledgeDir, "knowledge", "trade-progress.json"),
    taxonomyPath: path.join(paths.knowledgeDir, "knowledge", "trade-taxonomy", "taxonomy.md"),
    knowledgeAssembliesDir: path.join(paths.knowledgeDir, "knowledge", "assemblies"),
    knowledgeCostItemsDir: path.join(paths.knowledgeDir, "knowledge", "cost-items"),
  };
}

export function loadKnowledgeEngineSnapshot(paths = resolveKnowledgeEnginePaths()): KnowledgeSourceSnapshot {
  const sourceFiles = buildKnowledgeSourceFiles(paths);
  const loadWarnings: string[] = [];

  const costbook = readRequiredJsonFile<{ assemblies?: RawKnowledgeAssembly[]; items?: RawKnowledgeCostItem[] }>(sourceFiles.costbookPath);
  const assemblyIndex = readOptionalJsonFile<{ assemblies?: RawAssemblyIndexEntry[] }>(sourceFiles.assemblyIndexPath, loadWarnings, "assembly index");
  const tradeProgress = readOptionalJsonFile<{ trades?: RawKnowledgeTradeProgressEntry[] }>(sourceFiles.tradeProgressPath, loadWarnings, "trade progress");
  const taxonomyText = readOptionalTextFile(sourceFiles.taxonomyPath, loadWarnings, "taxonomy");

  return {
    paths,
    sourceFiles,
    assemblies: Array.isArray(costbook.assemblies) ? costbook.assemblies : [],
    costItems: Array.isArray(costbook.items) ? costbook.items : [],
    tradeProgress: Array.isArray(tradeProgress?.trades) ? tradeProgress.trades : [],
    assemblyIndex: Array.isArray(assemblyIndex?.assemblies) ? assemblyIndex.assemblies : [],
    schemaFiles: listJsonFiles(paths.schemasDir),
    taxonomyText,
    knowledgeAssemblyFiles: listJsonFiles(sourceFiles.knowledgeAssembliesDir),
    knowledgeCostItemFiles: listJsonFiles(sourceFiles.knowledgeCostItemsDir),
    loadWarnings,
  };
}

function hasRepoMarkers(candidate: string) {
  return REPO_MARKERS.every((marker) => fs.existsSync(path.join(candidate, marker)));
}

function readRequiredJsonFile<T>(filePath: string): T {
  return JSON.parse(fs.readFileSync(filePath, "utf8")) as T;
}

function readOptionalJsonFile<T>(filePath: string, loadWarnings: string[], label: string): T | null {
  if (!fs.existsSync(filePath)) {
    loadWarnings.push(`Missing ${label} file at ${filePath}.`);
    return null;
  }

  return readRequiredJsonFile<T>(filePath);
}

function readOptionalTextFile(filePath: string, loadWarnings: string[], label: string): string {
  if (!fs.existsSync(filePath)) {
    loadWarnings.push(`Missing ${label} file at ${filePath}.`);
    return "";
  }

  return fs.readFileSync(filePath, "utf8");
}

function listJsonFiles(directoryPath: string): string[] {
  if (!fs.existsSync(directoryPath)) {
    return [];
  }

  const results: string[] = [];

  const walk = (currentDir: string, relativePrefix: string) => {
    for (const entry of fs.readdirSync(currentDir, { withFileTypes: true })) {
      const relativePath = relativePrefix ? `${relativePrefix}/${entry.name}` : entry.name;

      if (entry.isDirectory()) {
        walk(path.join(currentDir, entry.name), relativePath);
      } else if (entry.isFile() && entry.name.endsWith(".json")) {
        results.push(relativePath);
      }
    }
  };

  walk(directoryPath, "");
  return results.sort();
}
