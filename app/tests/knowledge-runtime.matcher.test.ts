import { matchScopeDeterministically } from "../modules/knowledge-runtime/matcher";
import { resetKnowledgeRepositoryCache } from "../modules/knowledge-runtime/repository";

describe("knowledge runtime matcher", () => {
  beforeEach(() => {
    resetKnowledgeRepositoryCache();
  });

  it("returns assumptions, missing information, and review warnings for incomplete scopes", () => {
    const result = matchScopeDeterministically({
      scopeText: "Replace damaged roof shingles over the back porch.",
      limit: 3,
    });

    expect(result.detectedTrade).toBe("Roofing");
    expect(result.assumptions.length).toBeGreaterThan(0);
    expect(result.missingInformation.length).toBeGreaterThan(0);
    expect(result.reviewWarnings.length).toBeGreaterThan(0);
  });

  it("preserves legacy warning aliases for compatibility", () => {
    const result = matchScopeDeterministically({
      scopeText: "Install a new 12x16 treated deck with rails.",
      limit: 3,
    });

    expect(result.missingInputs).toEqual(result.missingInformation);
    expect(result.humanReviewWarnings).toEqual(result.reviewWarnings);
  });

  it("matches the tree-removal sample scope exactly as given", () => {
    const result = matchScopeDeterministically({
      scopeText: "Remove a 60 foot oak tree, grind stump, haul debris.",
      limit: 5,
    });

    expect(result.detectedTrade).toBe("Tree Service");
    expect(result.matchedAssemblies.some((item) => item.name.toLowerCase().includes("tree"))).toBe(true);
    expect(
      result.matchedCostItems.some((item) => item.name.toLowerCase().includes("stump") || item.name.toLowerCase().includes("tree"))
    ).toBe(true);
  });

  it("matches the concrete driveway sample scope exactly as given", () => {
    const result = matchScopeDeterministically({
      scopeText: "Replace 250 SF concrete driveway with 4 inch broom finish and haul away.",
      limit: 5,
    });

    expect(result.detectedTrade).toBe("Concrete");
    expect(result.matchedAssemblies.some((item) => item.name.toLowerCase().includes("driveway"))).toBe(true);
  });

  it("is deterministic: repeated calls with the same scope text return identical output", () => {
    const scopeText = "Replace 250 SF concrete driveway with 4 inch broom finish and haul away.";
    const runs = Array.from({ length: 5 }, () => JSON.stringify(matchScopeDeterministically({ scopeText, limit: 5 })));

    expect(new Set(runs).size).toBe(1);
  });

  it("never surfaces generic function words (e.g. 'and', 'the', 'with') as matched keywords", () => {
    const result = matchScopeDeterministically({
      scopeText: "Replace 250 SF concrete driveway with 4 inch broom finish and haul away.",
      limit: 5,
    });

    const stopwords = ["and", "the", "with", "for", "from"];
    const allMatchedKeywords = [...result.matchedAssemblies, ...result.matchedCostItems].flatMap((item) => item.matchedKeywords);

    for (const stopword of stopwords) {
      expect(allMatchedKeywords).not.toContain(stopword);
    }
  });
});
