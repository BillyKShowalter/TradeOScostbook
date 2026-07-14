import test from "node:test";
import assert from "node:assert/strict";
import {
  evaluateOwnership,
  formatReport,
  getChangedFiles,
  loadOwnershipConfig,
  parseArgs,
  pathMatches,
  resolveBaseRef,
} from "../docs-check-lib.mjs";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

function writeTempConfig(contents) {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), "tradeos-docs-check-"));
  const filePath = path.join(directory, "DOC_OWNERSHIP.yml");
  fs.writeFileSync(filePath, contents);
  return filePath;
}

const config = {
  rules: [
    { paths: ["app/prisma/schema.prisma"], requires: ["docs/DOMAIN_MODEL.md"], explanation: "schema" },
    { paths: ["app/modules/jobs/**"], requires: ["docs/modules/jobs-and-scheduling.md"], explanation: "jobs" },
    { paths: ["app/domain/contracts.ts"], requires: ["docs/RBAC_MATRIX.md", "docs/WORKFLOW_LIFECYCLES.md"], explanation: "contracts" },
  ],
  exemptions: [{ paths: ["app/tests/**"], reason: "tests only" }],
};

test("exact-path matching works", () => {
  const result = evaluateOwnership({
    changedFiles: ["app/prisma/schema.prisma", "docs/DOMAIN_MODEL.md"],
    config,
  });
  assert.deepEqual(result.requiredDocs, ["docs/DOMAIN_MODEL.md"]);
  assert.deepEqual(result.missingDocs, []);
});

test("glob matching works", () => {
  const result = evaluateOwnership({
    changedFiles: ["app/modules/jobs/service.ts"],
    config,
  });
  assert.deepEqual(result.requiredDocs, ["docs/modules/jobs-and-scheduling.md"]);
  assert.deepEqual(result.missingDocs, ["docs/modules/jobs-and-scheduling.md"]);
});

test("multiple matching rules union required docs", () => {
  const result = evaluateOwnership({
    changedFiles: ["app/modules/jobs/service.ts", "app/domain/contracts.ts", "docs/modules/jobs-and-scheduling.md"],
    config,
  });
  assert.deepEqual(result.requiredDocs, [
    "docs/RBAC_MATRIX.md",
    "docs/WORKFLOW_LIFECYCLES.md",
    "docs/modules/jobs-and-scheduling.md",
  ]);
  assert.deepEqual(result.missingDocs, ["docs/RBAC_MATRIX.md", "docs/WORKFLOW_LIFECYCLES.md"]);
});

test("no required docs when no rules match", () => {
  const result = evaluateOwnership({
    changedFiles: ["web/public/logo.svg"],
    config,
  });
  assert.deepEqual(result.requiredDocs, []);
  assert.deepEqual(result.missingDocs, []);
});

test("all required docs changed passes", () => {
  const result = evaluateOwnership({
    changedFiles: ["app/domain/contracts.ts", "docs/RBAC_MATRIX.md", "docs/WORKFLOW_LIFECYCLES.md"],
    config,
  });
  assert.deepEqual(result.missingDocs, []);
});

test("malformed YAML config throws", () => {
  const filePath = writeTempConfig("rules: nope");
  assert.throws(() => loadOwnershipConfig(filePath), /must be an array/);
});

test("base-ref resolution respects explicit and CI base refs", () => {
  assert.equal(resolveBaseRef({ argsBase: "feature/base", env: {}, git: () => "" }), "feature/base");
  assert.equal(resolveBaseRef({ env: { GITHUB_BASE_REF: "main" }, git: () => "" }), "origin/main");
});

test("path matcher supports exact and glob", () => {
  assert.equal(pathMatches("app/modules/jobs/service.ts", "app/modules/jobs/**"), true);
  assert.equal(pathMatches("docs/README.md", "docs/README.md"), true);
  assert.equal(pathMatches("web/src/app/page.tsx", "app/modules/jobs/**"), false);
});

test("help parser handles help flag", () => {
  assert.deepEqual(parseArgs(["--help"]), { help: true, base: null });
});

test("report marks failures clearly", () => {
  const report = formatReport({
    baseRef: "origin/main",
    result: evaluateOwnership({
      changedFiles: ["app/modules/jobs/service.ts"],
      config,
    }),
  });
  assert.match(report, /Missing documentation updates/);
  assert.match(report, /Result: FAIL/);
});

test("changed files include committed, staged, unstaged, and untracked paths", () => {
  const responses = new Map([
    ["diff --name-only origin/main...HEAD", "app/domain/contracts.ts\n"],
    ["diff --name-only --cached", "docs/RBAC_MATRIX.md\n"],
    ["diff --name-only", "docs/WORKFLOW_LIFECYCLES.md\n"],
    ["ls-files --others --exclude-standard", "docs/new-file.md\n"],
  ]);
  const git = (args) => responses.get(args.join(" ")) ?? "";
  assert.deepEqual(getChangedFiles("origin/main", git), [
    "app/domain/contracts.ts",
    "docs/RBAC_MATRIX.md",
    "docs/WORKFLOW_LIFECYCLES.md",
    "docs/new-file.md",
  ]);
});
