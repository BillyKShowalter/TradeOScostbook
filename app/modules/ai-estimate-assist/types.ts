export type AIEstimateSuggestionKind = "assembly" | "costItem";
export type AIEstimateSuggestionStatus = "pending" | "accepted" | "rejected";

export interface AIEstimateSuggestionTarget {
  id: string;
  kind: AIEstimateSuggestionKind;
  code: string;
  name: string;
  unitOfMeasure: string;
  matchMethod: "id" | "exact-name" | "contains-name";
  matchScore: number;
}

export interface AIEstimateSuggestionResolution {
  status: "resolved" | "unresolved";
  reason: string;
  target: AIEstimateSuggestionTarget | null;
}

export interface AIEstimateSuggestion {
  id: string;
  kind: AIEstimateSuggestionKind;
  code: string;
  title: string;
  rationale: string;
  quantity: number;
  unit: string;
  confidence: number;
  resolution: AIEstimateSuggestionResolution;
}

export interface GenerateAIEstimateSuggestionsInput {
  estimateId: string;
  orgId: string;
  scopeOfWork: string;
}

export interface ReviewedAIEstimateSuggestionInput {
  id: string;
  kind: AIEstimateSuggestionKind;
  title: string;
  quantity: number;
  status: AIEstimateSuggestionStatus;
  description?: string;
  targetId?: string;
  targetKind?: AIEstimateSuggestionKind;
}

export interface ApplyAIEstimateSuggestionsInput {
  estimateId: string;
  orgId: string;
  suggestions: ReviewedAIEstimateSuggestionInput[];
}

export interface AppliedAIEstimateSuggestion {
  suggestionId: string;
  lineItemId: string;
  title: string;
  quantity: number;
}

export interface SkippedAIEstimateSuggestion {
  suggestionId: string;
  title: string;
  status: AIEstimateSuggestionStatus;
  reason: string;
}
