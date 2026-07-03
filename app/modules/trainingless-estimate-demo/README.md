# Trainingless Estimate Demo

This module powers the local TradeOS demo for a "trainingless" AI estimating flow.

## What it does

- Parses a plain-English scope deterministically.
- Classifies the trade using the existing taxonomy.
- Loads the local Knowledge Engine export from `packages/knowledge-engine/exports/json/costbook.json`.
- Matches assemblies and cost items with rule-based scoring.
- Produces a reviewable estimate draft with confidence, rationale, missing inputs, assumptions, exclusions, and safety notes.

## How to run

```bash
npm run demo:trainingless-estimate
```

## Design constraints

- No model training.
- No fine-tuning.
- No embeddings.
- No pgvector.
- No external API calls.
- No Prisma writes.

## Demo input

The default demo scope is:

```text
Remove a 60 foot oak tree, grind the stump, and haul away debris.
```

## Output

The command prints both readable console output and JSON so the demo can be inspected by humans or other scripts.
