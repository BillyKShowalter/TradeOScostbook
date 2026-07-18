"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { clientFetch } from "@/lib/clientApi";
import { StatusBadge } from "@/components/shared/status-badge";
import { LineItemRow } from "@/components/shared/line-item-row";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Estimate } from "@/lib/api";

interface LineItem {
  id: string;
  description: string;
  quantity: number;
  unitOfMeasure: string;
  unitCost: number;
  lineCost: number;
}

interface EstimateDetail extends Estimate {
  lineItems: LineItem[];
}

interface PickerResult {
  id: string;
  name: string;
  code: string;
  unitOfMeasure: string;
  kind: "costItem" | "assembly";
}

export function EstimateBuilder({ projectId, estimateId }: { projectId: string; estimateId: string }) {
  const queryClient = useQueryClient();
  const estimateKey = ["estimate", estimateId];

  const { data: estimate, isLoading } = useQuery({
    queryKey: estimateKey,
    queryFn: () => clientFetch<EstimateDetail>(`/estimates/${estimateId}`),
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: estimateKey });

  const removeLineItem = useMutation({
    mutationFn: (lineItemId: string) => clientFetch(`/estimates/${estimateId}/line-items/${lineItemId}`, { method: "DELETE" }),
    onSuccess: invalidate,
  });

  const finalize = useMutation({
    mutationFn: () => clientFetch(`/estimates/${estimateId}/finalize`, { method: "POST" }),
    onSuccess: invalidate,
  });

  if (isLoading || !estimate) return <p className="text-sm text-muted-foreground">Loading estimate…</p>;

  const isDraft = estimate.status === "draft";

  return (
    <div className="flex flex-col gap-6">
      <Link href={`/projects/${projectId}`} className="text-sm text-muted-foreground underline">
        ← Back to project
      </Link>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Estimate v{estimate.version}</h1>
        <StatusBadge status={estimate.status} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Line items</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {estimate.lineItems.length === 0 ? (
            <p className="text-sm text-muted-foreground">No line items yet.</p>
          ) : (
            <ul className="flex flex-col gap-2">
              {estimate.lineItems.map((li) => (
                <li key={li.id}>
                  <LineItemRow
                    description={li.description}
                    meta={`${li.quantity} ${li.unitOfMeasure} × $${li.unitCost.toFixed(2)}`}
                    amount={`$${li.lineCost.toFixed(2)}`}
                    action={
                      isDraft && (
                        <Button variant="ghost" size="sm" onClick={() => removeLineItem.mutate(li.id)} disabled={removeLineItem.isPending}>
                          Remove
                        </Button>
                      )
                    }
                  />
                </li>
              ))}
            </ul>
          )}

          {isDraft && <LineItemPicker estimateId={estimateId} onAdded={invalidate} />}
        </CardContent>
      </Card>

      {isDraft && <PricingPanel estimateId={estimateId} estimate={estimate} onUpdated={invalidate} />}

      <Card>
        <CardHeader>
          <CardTitle>Summary</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-1 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Job cost</span>
            <span>${estimate.subtotalCost.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Overhead</span>
            <span>{estimate.overheadPct}%</span>
          </div>
          <div className="flex justify-between text-base font-semibold">
            <span>Total price</span>
            <span>${estimate.totalPrice.toFixed(2)}</span>
          </div>
        </CardContent>
      </Card>

      {isDraft && (
        <div>
          <Button onClick={() => finalize.mutate()} disabled={finalize.isPending || estimate.lineItems.length === 0}>
            {finalize.isPending ? "Finalizing…" : "Finalize estimate"}
          </Button>
        </div>
      )}
    </div>
  );
}

function LineItemPicker({ estimateId, onAdded }: { estimateId: string; onAdded: () => void }) {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [selected, setSelected] = useState<PickerResult | null>(null);
  const [quantity, setQuantity] = useState("1");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const timeout = setTimeout(() => setDebouncedQuery(query), 300);
    return () => clearTimeout(timeout);
  }, [query]);

  const { data: results } = useQuery({
    queryKey: ["item-search", debouncedQuery],
    queryFn: async (): Promise<PickerResult[]> => {
      if (!debouncedQuery) return [];
      const [costItems, assemblies] = await Promise.all([
        clientFetch<{ id: string; name: string; code: string; unitOfMeasure: string }[]>(
          `/cost-database/cost-items/search?q=${encodeURIComponent(debouncedQuery)}`
        ),
        clientFetch<{ id: string; name: string; code: string; unitOfMeasure: string }[]>(
          `/assemblies/search?q=${encodeURIComponent(debouncedQuery)}`
        ),
      ]);
      return [
        ...costItems.map((c) => ({ ...c, kind: "costItem" as const })),
        ...assemblies.map((a) => ({ ...a, kind: "assembly" as const })),
      ];
    },
    enabled: debouncedQuery.length > 0,
  });

  const addLineItem = useMutation({
    mutationFn: () => {
      if (!selected) throw new Error("Select an item first");
      const qty = Number(quantity);
      if (!Number.isFinite(qty) || qty <= 0) throw new Error("Quantity must be a positive number");
      return clientFetch(`/estimates/${estimateId}/line-items`, {
        method: "POST",
        body: JSON.stringify({
          [selected.kind === "costItem" ? "costItemId" : "assemblyId"]: selected.id,
          quantity: qty,
        }),
      });
    },
    onSuccess: () => {
      setSelected(null);
      setQuery("");
      setQuantity("1");
      setError(null);
      onAdded();
    },
    onError: (err) => setError(err instanceof Error ? err.message : "Failed to add line item"),
  });

  return (
    <div className="flex flex-col gap-2 rounded-md border p-3">
      <Label htmlFor="item-search">Add line item</Label>
      <Input
        id="item-search"
        placeholder="Search cost items or assemblies…"
        value={selected ? selected.name : query}
        onChange={(e) => {
          setSelected(null);
          setQuery(e.target.value);
        }}
      />
      {!selected && results && results.length > 0 && (
        <ul className="flex flex-col gap-1">
          {results.map((result) => (
            <li key={`${result.kind}-${result.id}`}>
              <button
                type="button"
                className="w-full rounded-md border p-2 text-left text-sm hover:bg-muted"
                onClick={() => setSelected(result)}
              >
                <span className="font-medium">{result.name}</span>{" "}
                <span className="text-muted-foreground">
                  ({result.code} · {result.unitOfMeasure} · {result.kind === "costItem" ? "cost item" : "assembly"})
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
      {selected && (
        <div className="flex items-center gap-2">
          <Label htmlFor="quantity" className="shrink-0">
            Quantity ({selected.unitOfMeasure})
          </Label>
          <Input id="quantity" type="number" min="0" step="any" value={quantity} onChange={(e) => setQuantity(e.target.value)} className="w-28" />
          <Button type="button" onClick={() => addLineItem.mutate()} disabled={addLineItem.isPending}>
            {addLineItem.isPending ? "Adding…" : "Add"}
          </Button>
        </div>
      )}
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}

function PricingPanel({ estimateId, estimate, onUpdated }: { estimateId: string; estimate: Estimate; onUpdated: () => void }) {
  const [mode, setMode] = useState<"markup" | "targetMargin">(estimate.targetMarginPct != null ? "targetMargin" : "markup");
  const [value, setValue] = useState(String(estimate.targetMarginPct ?? estimate.profitPct ?? 0));
  const [error, setError] = useState<string | null>(null);

  const setPricingMode = useMutation({
    mutationFn: () => {
      const numericValue = Number(value);
      if (!Number.isFinite(numericValue) || numericValue < 0) throw new Error("Enter a valid percentage");
      return clientFetch(`/estimates/${estimateId}/pricing-mode`, {
        method: "POST",
        body: JSON.stringify({
          mode,
          markupPct: mode === "markup" ? numericValue : undefined,
          targetMarginPct: mode === "targetMargin" ? numericValue : undefined,
        }),
      });
    },
    onSuccess: () => {
      setError(null);
      onUpdated();
    },
    onError: (err) => setError(err instanceof Error ? err.message : "Failed to update pricing"),
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pricing</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <div className="flex items-center gap-4 text-sm">
          <label className="flex items-center gap-1">
            <input type="radio" checked={mode === "markup"} onChange={() => setMode("markup")} /> Markup %
          </label>
          <label className="flex items-center gap-1">
            <input type="radio" checked={mode === "targetMargin"} onChange={() => setMode("targetMargin")} /> Target margin %
          </label>
        </div>
        <div className="flex items-center gap-2">
          <Input type="number" min="0" step="any" value={value} onChange={(e) => setValue(e.target.value)} className="w-28" />
          <Button type="button" variant="outline" onClick={() => setPricingMode.mutate()} disabled={setPricingMode.isPending}>
            {setPricingMode.isPending ? "Applying…" : "Apply"}
          </Button>
        </div>
        {error && <p className="text-sm text-destructive">{error}</p>}
      </CardContent>
    </Card>
  );
}
