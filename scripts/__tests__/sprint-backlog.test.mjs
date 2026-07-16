import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const repoRoot = process.cwd();
const backlogPath = path.join(repoRoot, "docs", "SPRINT_BACKLOG.md");
const backlog = fs.readFileSync(backlogPath, "utf8");

const validStatuses = new Set(["DONE", "IN_REVIEW", "READY", "BLOCKED", "PLANNED", "DEFERRED", "CANCELLED"]);
const mergedPrs = new Set(["20", "21", "22", "23", "24", "25", "26", "27", "28", "29"]);
const openPrMarkers = ["PR #30", "fix/brand-studio-asset-upload-persistence"];

function sprintBlocks() {
  const matches = [...backlog.matchAll(/^### (S\d{3}) — .+$/gm)];
  return matches.map((match, index) => {
    const start = match.index;
    const end = matches[index + 1]?.index ?? backlog.length;
    return { id: match[1], body: backlog.slice(start, end) };
  });
}

function field(block, name) {
  const match = block.body.match(new RegExp(`^${name}:\\s*(.*)$`, "m"));
  assert.ok(match, `${block.id} is missing ${name}`);
  return match[1].trim();
}

function fieldList(block, name) {
  return field(block, name)
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

const requiredFields = [
  "Status",
  "Priority",
  "Phase",
  "Dependencies",
  "Blocked by",
  "Target branch prefix",
  "Recommended worktree type",
  "Primary owner",
  "Parallel-safe with",
  "Conflicts with",
  "Objective",
  "Why this matters",
  "Verified current state",
  "Allowed paths",
  "Forbidden paths",
  "Explicit exclusions",
];

test("sprint backlog has exactly S001 through S050 once", () => {
  const blocks = sprintBlocks();
  assert.equal(blocks.length, 50);
  const ids = blocks.map((block) => block.id);
  const expected = Array.from({ length: 50 }, (_, index) => `S${String(index + 1).padStart(3, "0")}`);
  assert.deepEqual(ids, expected);
  assert.equal(new Set(ids).size, 50);
});

test("each sprint uses the required structure and valid status vocabulary", () => {
  for (const block of sprintBlocks()) {
    for (const name of requiredFields) field(block, name);
    const status = field(block, "Status");
    assert.ok(validStatuses.has(status), `${block.id} has invalid status ${status}`);
    assert.match(block.body, /^Implementation tasks:\n1\. .+/m, `${block.id} is missing numbered implementation tasks`);
    assert.match(block.body, /^Required tests:\n- .+/m, `${block.id} is missing required tests`);
    assert.match(block.body, /^Acceptance criteria:\n- .+/m, `${block.id} is missing acceptance criteria`);
    assert.match(block.body, /^Documentation updates:\n- .+/m, `${block.id} is missing documentation updates`);
    assert.match(block.body, /^Stop conditions:\n- .+/m, `${block.id} is missing stop conditions`);
    assert.match(block.body, /^Founder decision required:\n- (YES|NO)\n- .+/m, `${block.id} is missing founder decision structure`);
    assert.match(block.body, /^Completion evidence:\n- PR:\s*.*\n- Merge commit:\s*.*\n- Tests:\s*.*\n- Notes:\s*.*/m, `${block.id} is missing completion evidence fields`);
  }
});

test("dependencies reference valid sprint ids or merged PRs", () => {
  const ids = new Set(sprintBlocks().map((block) => block.id));
  for (const block of sprintBlocks()) {
    const dependencies = field(block, "Dependencies");
    for (const sprintId of dependencies.match(/S\d{3}/g) ?? []) {
      assert.ok(ids.has(sprintId), `${block.id} references unknown dependency ${sprintId}`);
      assert.ok(Number(sprintId.slice(1)) < Number(block.id.slice(1)), `${block.id} depends on non-earlier ${sprintId}`);
    }
    for (const pr of dependencies.match(/PR #(\d+)/g) ?? []) {
      const prNumber = pr.match(/\d+/)[0];
      assert.ok(mergedPrs.has(prNumber), `${block.id} dependency ${pr} is not in the merged-PR evidence set`);
    }
  }
});

test("DONE sprints require merge evidence", () => {
  for (const block of sprintBlocks()) {
    if (field(block, "Status") !== "DONE") continue;
    const mergeCommit = block.body.match(/^- Merge commit:\s*(.*)$/m)?.[1]?.trim() ?? "";
    assert.ok(/[a-f0-9]{7,40}/.test(mergeCommit), `${block.id} is DONE without merge commit evidence`);
  }
});

test("READY sprints do not conflict with known open PR markers", () => {
  const statuses = new Map(sprintBlocks().map((block) => [block.id, field(block, "Status")]));
  for (const block of sprintBlocks()) {
    if (field(block, "Status") !== "READY") continue;
    const blockedBy = field(block, "Blocked by");
    const conflictsWith = field(block, "Conflicts with");
    const allowedPaths = field(block, "Allowed paths");
    assert.equal(blockedBy, "none", `${block.id} is READY but blocked by ${blockedBy}`);
    for (const sprintId of field(block, "Dependencies").match(/S\d{3}/g) ?? []) {
      assert.equal(statuses.get(sprintId), "DONE", `${block.id} is READY but dependency ${sprintId} is not DONE`);
    }
    for (const marker of openPrMarkers) {
      assert.equal(conflictsWith.includes(marker), false, `${block.id} is READY but conflicts with open PR marker ${marker}`);
      assert.equal(allowedPaths.includes(marker), false, `${block.id} is READY but allows open PR marker ${marker}`);
    }
  }
});

test("referenced explicit paths exist unless they are globs or future evidence fields", () => {
  const explicitPathPattern = /^(AGENTS\.md|README\.md|docs\/[^,*]+\.md|docs\/[^,*]+|scripts\/__tests__|app|web|packages|\.github)$/;
  for (const block of sprintBlocks()) {
    for (const item of [...fieldList(block, "Allowed paths"), ...fieldList(block, "Forbidden paths")]) {
      const normalized = item.replace(/\/\*\*.*$/, "").replace(/\/[^/]*\*.*$/, "");
      if (!explicitPathPattern.test(normalized)) continue;
      assert.ok(fs.existsSync(path.join(repoRoot, normalized)), `${block.id} references missing path ${normalized}`);
    }
  }
});

test("next eligible sprint is mechanically determinable", () => {
  const ready = sprintBlocks().filter((block) => field(block, "Status") === "READY");
  assert.ok(ready.length >= 1, "expected at least one READY sprint");
  assert.equal(ready[0].id, "S002");
  assert.equal(field(ready[0], "Founder decision required").startsWith("NO"), false, "field helper should read only first-line fields");
  assert.match(ready[0].body, /^Founder decision required:\n- NO\n-/m);
});
