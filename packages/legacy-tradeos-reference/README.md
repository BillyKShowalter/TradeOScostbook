# Knowledge Engine Transfer Package (transfer docs only)

> **Current status:** the actual payload described below (`knowledge/`, `schemas/`, `scripts/`, `runtime/`, `review/`, `exports/`, `prompts/`, `pipelines/`, `docs/`, `agent-skills/`, `legacy-archive/`) was copied to **`packages/knowledge-engine/`**, a sibling directory, not here. This folder (`packages/legacy-tradeos-reference/`) now holds only the five transfer-planning docs listed below, kept for historical/planning reference. See `docs/KNOWLEDGE_ENGINE_STATUS.md` and `docs/LEGACY_ASSET_MIGRATION_STATUS.md` at the repo root for the current, accurate picture of what's integrated vs. still pending.

This package contains the fully extracted and structured legacy Costbook / Knowledge Engine. It has been prepared for a clean integration into the main TradeOS repository.

## Overview
This folder (`knowledge-engine`) contains all valid data, schemas, normalization scripts, generation rules, and agent logic needed to rebuild the Costbook/Assemblies in TradeOS.

*(The paragraph above describes the original transfer package as prepared outside this repo — see the status note at the top of this file for where that content actually landed.)*

Obsolete UI (SwiftUI, Desktop) and experiments have been safely moved to `legacy-archive` to preserve their history without polluting the new codebase.

## Contents
- **knowledge/**: Contains raw JSON data for cost items and assemblies.
- **schemas/**: Contains JSON and validation schemas.
- **scripts/**: Core processing and orchestration scripts.
- **runtime/**: Queue and state configuration for the pipeline.
- **review/**: Quality assurance and review workflows.
- **exports/**: Platform and SQL export scripts/data.
- **prompts/**: LLM prompts for generating and validating data.
- **pipelines/**: Logic for generating and importing data.
- **docs/**: Core documentation on how the knowledge engine operates.
- **agent-skills/**: AI agent configurations for automated processing.
- **legacy-archive/**: Old apps, SwiftUI experiments, and scratch files.

## Documentation Index
1. **[TRANSFER_MANIFEST.md](./TRANSFER_MANIFEST.md)**: A complete list of what is included in this package.
2. **[COPY_INSTRUCTIONS.md](./COPY_INSTRUCTIONS.md)**: Exact steps and terminal commands to move this into TradeOS.
3. **[POST_COPY_CHECKLIST.md](./POST_COPY_CHECKLIST.md)**: Validation steps to ensure the copy was successful.
4. **[INTEGRATION_PLAN.md](./INTEGRATION_PLAN.md)**: A high-level guide for safely integrating this engine into the TradeOS backend.
