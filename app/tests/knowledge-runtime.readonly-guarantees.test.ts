import fs from "node:fs";
import path from "node:path";

const MODULE_DIR = path.join(__dirname, "..", "modules", "knowledge-runtime");

function listModuleSourceFiles(): string[] {
  return fs
    .readdirSync(MODULE_DIR)
    .filter((file) => file.endsWith(".ts"))
    .map((file) => path.join(MODULE_DIR, file));
}

const FORBIDDEN_NETWORK_PATTERNS = [
  /\bfetch\s*\(/,
  /\baxios\b/,
  /\bhttp\.request\b/,
  /\bhttps\.request\b/,
  /\bopenai\b/i,
  /\banthropic\b/i,
  /require\(\s*["']child_process["']\s*\)/,
];

const FORBIDDEN_DATABASE_PATTERNS = [
  /\bPrismaClient\b/,
  /\bprisma\./,
  /from\s+["'].*db\/client["']/,
  /from\s+["'].*db\/requestSession["']/,
];

const FORBIDDEN_FS_WRITE_PATTERNS = [
  /fs\.writeFileSync\b/,
  /fs\.writeFile\b/,
  /fs\.appendFileSync\b/,
  /fs\.appendFile\b/,
  /fs\.unlinkSync\b/,
  /fs\.unlink\b/,
  /fs\.rmSync\b/,
  /fs\.rm\b/,
  /fs\.mkdirSync\b/,
  /fs\.mkdir\b/,
];

describe("knowledge runtime read-only guarantees", () => {
  const sourceFiles = listModuleSourceFiles();

  it("has source files to check (sanity guard against an empty/misconfigured glob)", () => {
    expect(sourceFiles.length).toBeGreaterThan(0);
  });

  it("makes no outbound network or external AI API calls anywhere in the module", () => {
    for (const filePath of sourceFiles) {
      const contents = fs.readFileSync(filePath, "utf8");
      for (const pattern of FORBIDDEN_NETWORK_PATTERNS) {
        expect({ filePath, pattern: pattern.toString(), matched: pattern.test(contents) }).toEqual({
          filePath,
          pattern: pattern.toString(),
          matched: false,
        });
      }
    }
  });

  it("never imports or calls Prisma / the app database client", () => {
    for (const filePath of sourceFiles) {
      const contents = fs.readFileSync(filePath, "utf8");
      for (const pattern of FORBIDDEN_DATABASE_PATTERNS) {
        expect({ filePath, pattern: pattern.toString(), matched: pattern.test(contents) }).toEqual({
          filePath,
          pattern: pattern.toString(),
          matched: false,
        });
      }
    }
  });

  it("never writes, deletes, or creates files/directories on disk (read-only fs access only)", () => {
    for (const filePath of sourceFiles) {
      const contents = fs.readFileSync(filePath, "utf8");
      for (const pattern of FORBIDDEN_FS_WRITE_PATTERNS) {
        expect({ filePath, pattern: pattern.toString(), matched: pattern.test(contents) }).toEqual({
          filePath,
          pattern: pattern.toString(),
          matched: false,
        });
      }
    }
  });
});
