"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
} from "framer-motion";
import {
  ArrowRight,
  Building2,
  Calculator,
  Check,
  CheckCircle2,
  ChevronRight,
  FileText,
  Home,
  Layers3,
  Lightbulb,
  LineChart,
  Package,
  Pencil,
  Plus,
  Search,
  ShieldAlert,
  Sparkles,
  TreePine,
  Users,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type Stage = "dashboard" | "describe" | "pipeline" | "suggestions" | "builder" | "proposal" | "knowledge" | "architecture";
type SuggestionState = "pending" | "accepted" | "rejected";

interface Suggestion {
  id: string;
  type: "Assembly" | "Cost Item";
  title: string;
  confidence: number;
  quantity: number;
  unit: string;
  reason: string;
  price: number;
  state: SuggestionState;
}

const examples = [
  "Replace 250 SF concrete driveway with 4-inch broom finish including demo and haul-away.",
  "Remove a 60 foot oak tree, grind stump, haul debris.",
  "Build a 12x16 composite deck with railings and stairs.",
];

const knowledgeNodes = [
  { label: "Trade", value: "Tree Service", color: "text-cyan-300" },
  { label: "Category", value: "Removal", color: "text-emerald-300" },
  { label: "Subcategory", value: "Large Tree", color: "text-sky-300" },
  { label: "Assembly", value: "Tree Service Package", color: "text-amber-300" },
  { label: "Cost Items", value: "Removal, stump, haul-away", color: "text-white" },
];

const pipelineSteps = [
  { label: "Project Intake", detail: "Trade / category / risk / confidence", icon: Sparkles },
  { label: "Knowledge Engine", detail: "Assemblies, cost items, labor, materials, equipment", icon: Layers3 },
  { label: "Assembly Matcher", detail: "Rank the closest reusable package", icon: Package },
  { label: "Estimate Builder", detail: "Live totals, markup, profit, tax", icon: Calculator },
];

const dashboardCards = [
  { label: "New Estimate", value: "Create draft in 30 seconds", icon: Plus },
  { label: "Customers", value: "146 active relationships", icon: Users },
  { label: "Projects", value: "23 jobs in review", icon: Building2 },
  { label: "Knowledge Engine", value: "1,795 cost items · 40 assemblies", icon: Layers3 },
];

const suggestionSeed: Suggestion[] = [
  {
    id: "tree-package",
    type: "Assembly",
    title: "Tree Service Package",
    confidence: 96,
    quantity: 1,
    unit: "job",
    reason: "Matches removal, stump grinding, access risk, and haul-away requirements.",
    price: 2125,
    state: "pending",
  },
  {
    id: "stump-grinding",
    type: "Cost Item",
    title: "Stump Grinding - 12 To 24 Inch",
    confidence: 89,
    quantity: 1,
    unit: "EA",
    reason: "Direct stump-grinding phrase match from the local cost book.",
    price: 380,
    state: "pending",
  },
  {
    id: "haul-away",
    type: "Cost Item",
    title: "Tree Disposal - 12 Inch Trunk EA",
    confidence: 84,
    quantity: 1,
    unit: "Load",
    reason: "Debris removal and disposal are explicitly requested.",
    price: 215,
    state: "pending",
  },
];

const concreteSuggestionSeed: Suggestion[] = [
  {
    id: "driveway-demo",
    type: "Assembly",
    title: "Driveway Demo + Replacement Package",
    confidence: 93,
    quantity: 250,
    unit: "SF",
    reason: "Matches concrete removal, 4-inch slab, broom finish, and haul-away.",
    price: 31.2,
    state: "pending",
  },
  {
    id: "concrete-pour",
    type: "Cost Item",
    title: "4-Inch Broom Finish Placement",
    confidence: 88,
    quantity: 250,
    unit: "SF",
    reason: "Finish selection is explicit and quantities are directly measurable.",
    price: 4.9,
    state: "pending",
  },
  {
    id: "haul-away-concrete",
    type: "Cost Item",
    title: "Concrete Haul Away - Per Yard",
    confidence: 84,
    quantity: 2,
    unit: "CY",
    reason: "Demo and disposal are part of the request.",
    price: 145,
    state: "pending",
  },
];

export function TraininglessDemoApp() {
  const [stage, setStage] = useState<Stage>("dashboard");
  const [scope, setScope] = useState(examples[1]);
  const [typedIndex, setTypedIndex] = useState(0);
  const [, setShowConcreteExample] = useState(false);
  const [typedCursor, setTypedCursor] = useState(0);
  const [suggestions, setSuggestions] = useState<Suggestion[]>(suggestionSeed);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (stage !== "describe") return;
    const interval = window.setInterval(() => {
      setTypedIndex((current) => (current + 1) % examples.length);
    }, 2600);
    return () => window.clearInterval(interval);
  }, [stage]);

  useEffect(() => {
    if (stage !== "describe") return;
    let timer: number | undefined;
    const text = examples[typedIndex];
    const tick = () => {
      setTypedCursor((cursor) => {
        const next = Math.min(text.length, cursor + 1);
        if (next < text.length) timer = window.setTimeout(tick, 18);
        return next;
      });
    };
    timer = window.setTimeout(() => {
      setTypedCursor(0);
      timer = window.setTimeout(tick, 140);
    }, 0);
    return () => {
      if (timer) window.clearTimeout(timer);
    };
  }, [stage, typedIndex]);

  const typedPreview = useMemo(() => examples[typedIndex].slice(0, typedCursor), [typedCursor, typedIndex]);

  const totals = useMemo(() => {
    const accepted = suggestions.filter((item) => item.state === "accepted");
    const subtotal = accepted.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const markup = stage === "builder" ? subtotal * 0.22 : subtotal * 0.18;
    const profit = subtotal * 0.28;
    const tax = subtotal * 0.07;
    return {
      subtotal,
      markup,
      profit,
      tax,
      grandTotal: subtotal + markup + tax,
      acceptedCount: accepted.length,
    };
  }, [suggestions, stage]);

  const current = (() => {
    switch (stage) {
      case "dashboard":
        return <DashboardView onStart={() => setStage("describe")} onRoute={setStage} />;
      case "describe":
        return (
          <DescribeView
            typedPreview={typedPreview}
            scope={scope}
            onChange={setScope}
            onGenerate={() => setStage("pipeline")}
          />
        );
      case "pipeline":
        return <PipelineView onDone={() => setStage("suggestions")} />;
      case "suggestions":
        return (
          <SuggestionsView
            scope={scope}
            suggestions={suggestions}
            onAccept={(id) => setSuggestions((current) => current.map((item) => (item.id === id ? { ...item, state: "accepted" } : item)))}
            onReject={(id) => setSuggestions((current) => current.map((item) => (item.id === id ? { ...item, state: "rejected" } : item)))}
            onEdit={(id, quantity) =>
              setSuggestions((current) => current.map((item) => (item.id === id ? { ...item, quantity } : item)))
            }
            onContinue={() => setStage("builder")}
            onToggleExample={() =>
              setShowConcreteExample((current) => {
                const next = !current;
                setSuggestions(next ? concreteSuggestionSeed : suggestionSeed);
                return next;
              })
            }
          />
        );
      case "builder":
        return <EstimateBuilderView suggestions={suggestions} totals={totals} onRoute={setStage} />;
      case "proposal":
        return <ProposalPreviewView onRoute={setStage} />;
      case "knowledge":
        return <KnowledgeExplorerView />;
      case "architecture":
        return <ArchitectureView />;
    }
  })();

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(34,211,238,0.18),_transparent_26%),radial-gradient(circle_at_top_right,_rgba(245,158,11,0.10),_transparent_28%),linear-gradient(180deg,_#04070b_0%,_#0a0f16_38%,_#080c12_100%)] text-white">
      <div className="mx-auto flex min-h-screen max-w-[1720px] flex-col px-4 py-4 sm:px-6 lg:px-8">
        <TopShell stage={stage} onNavigate={setStage} />
        <div className="mt-4 grid flex-1 gap-4 xl:grid-cols-[280px_minmax(0,1fr)]">
          <Sidebar stage={stage} onNavigate={setStage} />
          <main className="relative overflow-hidden rounded-[28px] border border-white/10 bg-white/5 shadow-[0_24px_90px_rgba(0,0,0,0.4)] backdrop-blur-2xl">
            <AnimatePresence mode="wait">
              <motion.div
                key={stage}
                initial={reduceMotion ? { opacity: 1 } : { opacity: 0, y: 18, filter: "blur(8px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -10, filter: "blur(10px)" }}
                transition={{ duration: 0.35, ease: "easeOut" }}
                className="p-4 sm:p-6 lg:p-8"
              >
                {current}
              </motion.div>
            </AnimatePresence>
          </main>
        </div>
      </div>
    </div>
  );
}

function TopShell({ stage, onNavigate }: { stage: Stage; onNavigate: (stage: Stage) => void }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4 rounded-[24px] border border-white/10 bg-white/5 px-5 py-4 backdrop-blur-xl">
      <div className="flex items-center gap-3">
        <div className="flex size-11 items-center justify-center rounded-2xl bg-cyan-400/15 ring-1 ring-cyan-300/20">
          <TreePine className="size-5 text-cyan-300" />
        </div>
        <div>
          <div className="text-xs uppercase tracking-[0.32em] text-cyan-200/70">TradeOS</div>
          <div className="text-lg font-semibold">Trainingless AI Estimating Demo</div>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Badge className="border-cyan-400/20 bg-cyan-400/10 text-cyan-100">Local demo</Badge>
        <Badge className="border-white/10 bg-white/5 text-white/70">No backend</Badge>
        <Button
          variant="outline"
          onClick={() => onNavigate("dashboard")}
          className={cn(
            "border-white/15 bg-white/5 text-white hover:bg-white/10",
            stage === "dashboard" && "border-cyan-400/30 bg-cyan-400/10"
          )}
        >
          Restart demo
        </Button>
      </div>
    </div>
  );
}

function Sidebar({ stage, onNavigate }: { stage: Stage; onNavigate: (stage: Stage) => void }) {
  return (
    <aside className="rounded-[28px] border border-white/10 bg-white/5 p-4 backdrop-blur-xl">
      <div className="space-y-2">
        {[
          { stage: "dashboard", label: "Home Dashboard", icon: Home },
          { stage: "describe", label: "Describe Project", icon: Pencil },
          { stage: "pipeline", label: "Processing Pipeline", icon: Sparkles },
          { stage: "suggestions", label: "AI Suggestions", icon: CheckCircle2 },
          { stage: "builder", label: "Estimate Builder", icon: Calculator },
          { stage: "proposal", label: "Proposal Preview", icon: FileText },
          { stage: "knowledge", label: "Knowledge Engine", icon: Layers3 },
          { stage: "architecture", label: "System Architecture", icon: LineChart },
        ].map((item) => {
          const Icon = item.icon;
          const active = stage === item.stage;
          return (
            <button
              key={item.stage}
              onClick={() => onNavigate(item.stage as Stage)}
              className={cn(
                "flex w-full items-center gap-3 rounded-2xl border px-3 py-3 text-left transition",
                active
                  ? "border-cyan-400/30 bg-cyan-400/10 text-white shadow-[0_0_0_1px_rgba(34,211,238,0.12)]"
                  : "border-transparent bg-white/0 text-white/70 hover:border-white/10 hover:bg-white/5 hover:text-white"
              )}
            >
              <Icon className={cn("size-4", active ? "text-cyan-300" : "text-white/60")} />
              <span className="text-sm font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>
      <div className="mt-4 rounded-3xl border border-white/10 bg-black/20 p-4">
        <div className="text-xs uppercase tracking-[0.25em] text-white/40">Demo mode</div>
        <div className="mt-3 space-y-3">
          <DemoMetric label="Trade signals" value="Deterministic" />
          <DemoMetric label="Knowledge source" value="Local export" />
          <DemoMetric label="Human review" value="Required" />
        </div>
      </div>
    </aside>
  );
}

function DashboardView({ onStart, onRoute }: { onStart: () => void; onRoute: (stage: Stage) => void }) {
  return (
    <div className="space-y-6">
      <section className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <Card className="border-white/10 bg-gradient-to-br from-white/10 via-white/5 to-cyan-400/5 text-white">
          <CardHeader className="space-y-4">
            <div className="max-w-2xl space-y-4">
              <div className="flex items-center gap-2">
                <Badge className="border-cyan-400/20 bg-cyan-400/10 text-cyan-100">Finished demo surface</Badge>
              </div>
              <CardTitle className="text-4xl leading-tight sm:text-5xl">Build estimates from knowledge, not guesses.</CardTitle>
              <CardDescription className="max-w-xl text-base text-white/70">
                A polished local walkthrough of TradeOS showing intake, knowledge matching, human review, proposal preview, and the system architecture behind it.
              </CardDescription>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button size="lg" onClick={onStart} className="bg-cyan-400 text-slate-950 hover:bg-cyan-300">
                New Estimate
                <ArrowRight className="size-4" />
              </Button>
              <Button size="lg" variant="outline" onClick={() => onRoute("knowledge")} className="border-white/15 bg-white/5 text-white hover:bg-white/10">
                Knowledge Engine
              </Button>
            </div>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {dashboardCards.map((card) => {
              const Icon = card.icon;
              return (
                <div key={card.label} className="rounded-3xl border border-white/10 bg-black/20 p-4">
                  <Icon className="size-5 text-cyan-300" />
                  <div className="mt-6 text-sm text-white/55">{card.label}</div>
                  <div className="mt-1 text-base font-medium">{card.value}</div>
                </div>
              );
            })}
          </CardContent>
        </Card>
        <div className="grid gap-4">
          <Card className="border-white/10 bg-white/5 text-white">
            <CardHeader>
              <CardTitle className="text-xl">Recent Estimates</CardTitle>
              <CardDescription className="text-white/60">Live history, previewed as contractor work in progress.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                ["Oak Tree Removal", "$3,450", "Review"],
                ["Concrete Driveway", "$12,980", "Draft"],
                ["Composite Deck", "$18,620", "Sent"],
              ].map(([name, price, status]) => (
                <div key={name} className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
                  <div>
                    <div className="font-medium">{name}</div>
                    <div className="text-sm text-white/55">Customer-approved draft</div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">{price}</div>
                    <div className="text-xs uppercase tracking-[0.25em] text-cyan-200/60">{status}</div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
          <Card className="border-white/10 bg-white/5 text-white">
            <CardHeader>
              <CardTitle className="text-xl">AI Estimate Assist</CardTitle>
              <CardDescription className="text-white/60">Reviewable suggestions from the cost book.</CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={onStart} className="w-full bg-white text-slate-950 hover:bg-slate-200">
                Open workflow
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {["Customers", "Projects", "Knowledge Engine"].map((label, index) => (
          <Card key={label} className="border-white/10 bg-white/5 text-white">
            <CardHeader>
              <CardTitle className="text-xl">{label}</CardTitle>
              <CardDescription className="text-white/60">
                {index === 0
                  ? "Fast lookup into active contractor accounts."
                  : index === 1
                    ? "Project intake, estimates, proposals, and contracts."
                    : "Trade taxonomy, assemblies, and cost items."}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 text-sm text-cyan-200/80">
                <Check className="size-4" /> Clickable entry point
              </div>
            </CardContent>
          </Card>
        ))}
      </section>
    </div>
  );
}

function DescribeView({
  typedPreview,
  scope,
  onChange,
  onGenerate,
}: {
  typedPreview: string;
  scope: string;
  onChange: (value: string) => void;
  onGenerate: () => void;
}) {
  return (
    <div className="grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
      <Card className="border-white/10 bg-white/5 text-white">
        <CardHeader className="space-y-4">
          <CardTitle className="text-3xl">Describe Your Project</CardTitle>
          <CardDescription className="text-white/65">
            Type the scope once. TradeOS turns it into a structured estimate draft with no model training required.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            value={scope}
            onChange={(e) => onChange(e.target.value)}
            className="min-h-[220px] rounded-3xl border-white/10 bg-black/30 text-lg text-white placeholder:text-white/25"
          />
          <div className="rounded-3xl border border-white/10 bg-black/20 p-4">
            <div className="text-xs uppercase tracking-[0.28em] text-cyan-200/50">Animated example</div>
            <div className="mt-2 min-h-12 text-xl text-white/90">{typedPreview}</div>
          </div>
          <div className="flex flex-wrap gap-2">
            {examples.map((example) => (
              <button
                key={example}
                onClick={() => onChange(example)}
                className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/75 transition hover:bg-white/10 hover:text-white"
              >
                {example}
              </button>
            ))}
          </div>
          <Button onClick={onGenerate} size="lg" className="bg-cyan-400 text-slate-950 hover:bg-cyan-300">
            Generate Estimate
            <ArrowRight className="size-4" />
          </Button>
        </CardContent>
      </Card>
      <Card className="border-white/10 bg-gradient-to-br from-white/8 to-white/4 text-white">
        <CardHeader>
          <CardTitle className="text-xl">What TradeOS reads</CardTitle>
          <CardDescription className="text-white/60">A good scope becomes structured inputs instantly.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {[
            ["Trade", "Tree Service"],
            ["Scope", "Removal + stump grinding + haul-away"],
            ["Risk", "Rigging / access / utility clearance"],
            ["Confidence", "High"],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
              <span className="text-white/55">{label}</span>
              <span className="font-medium">{value}</span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

function PipelineView({ onDone }: { onDone: () => void }) {
  return (
    <div className="space-y-6">
      <Card className="border-white/10 bg-white/5 text-white">
        <CardHeader className="space-y-3">
          <CardTitle className="text-3xl">Visual Processing Pipeline</CardTitle>
          <CardDescription className="text-white/60">
            Each stage is deterministic, locally explainable, and ready for human review.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 lg:grid-cols-4">
          {pipelineSteps.map((step, index) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={step.label}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.12 }}
                className="rounded-3xl border border-white/10 bg-black/20 p-4"
              >
                <Icon className="size-5 text-cyan-300" />
                <div className="mt-6 text-lg font-medium">{step.label}</div>
                <div className="mt-2 text-sm text-white/60">{step.detail}</div>
                <div className="mt-4 h-1 overflow-hidden rounded-full bg-white/10">
                  <motion.div
                    initial={{ width: "12%" }}
                    animate={{ width: `${70 + index * 6}%` }}
                    transition={{ duration: 0.8, delay: index * 0.15 }}
                    className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-emerald-300"
                  />
                </div>
              </motion.div>
            );
          })}
        </CardContent>
      </Card>
      <Button onClick={onDone} className="bg-white text-slate-950 hover:bg-slate-200">
        Continue to AI Suggestions
      </Button>
    </div>
  );
}

function SuggestionsView({
  scope,
  suggestions,
  onAccept,
  onReject,
  onEdit,
  onContinue,
  onToggleExample,
}: {
  scope: string;
  suggestions: Suggestion[];
  onAccept: (id: string) => void;
  onReject: (id: string) => void;
  onEdit: (id: string, quantity: number) => void;
  onContinue: () => void;
  onToggleExample: () => void;
}) {
  const acceptedTotal = suggestions.filter((item) => item.state === "accepted").reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <div className="space-y-6">
      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Card className="border-white/10 bg-white/5 text-white">
          <CardHeader>
            <CardTitle className="text-3xl">AI Suggestions</CardTitle>
            <CardDescription className="text-white/60">
              Review each suggestion. Nothing is committed until a human accepts it.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-3xl border border-white/10 bg-black/20 p-4 text-sm text-white/65">
              Scope: {scope}
            </div>
            <div className="grid gap-4">
              {suggestions.map((item) => (
                <motion.div
                  layout
                  key={item.id}
                  className={cn(
                    "rounded-[26px] border p-5",
                    item.state === "accepted"
                      ? "border-emerald-400/25 bg-emerald-400/10"
                      : item.state === "rejected"
                        ? "border-rose-400/25 bg-rose-400/10"
                        : "border-white/10 bg-black/20"
                  )}
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge className="border-white/10 bg-white/5 text-white">{item.type}</Badge>
                        <Badge className="border-cyan-400/20 bg-cyan-400/10 text-cyan-100">{item.confidence}% confidence</Badge>
                      </div>
                      <div className="text-lg font-semibold">{item.title}</div>
                      <p className="max-w-2xl text-sm text-white/60">{item.reason}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-white/55">Estimated impact</div>
                      <div className="text-2xl font-semibold">${Math.round(item.price * item.quantity).toLocaleString()}</div>
                    </div>
                  </div>
                  <div className="mt-4 grid gap-3 md:grid-cols-[1fr_auto] md:items-end">
                    <div className="flex items-center gap-3">
                      <Button variant="outline" size="icon" className="border-white/10 bg-white/5 text-white hover:bg-white/10" onClick={() => onEdit(item.id, Math.max(1, item.quantity - 1))}>
                        <X className="size-4" />
                      </Button>
                      <Input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => onEdit(item.id, Number(e.target.value || 1))}
                        className="w-28 border-white/10 bg-black/20 text-white"
                      />
                      <Button variant="outline" size="icon" className="border-white/10 bg-white/5 text-white hover:bg-white/10" onClick={() => onEdit(item.id, item.quantity + 1)}>
                        <Plus className="size-4" />
                      </Button>
                      <span className="text-sm text-white/55">{item.unit}</span>
                    </div>
                    <div className="flex flex-wrap justify-end gap-2">
                      <Button variant="outline" className="border-emerald-400/25 bg-emerald-400/10 text-emerald-100 hover:bg-emerald-400/20" onClick={() => onAccept(item.id)}>
                        Accept
                      </Button>
                      <Button variant="outline" className="border-rose-400/25 bg-rose-400/10 text-rose-100 hover:bg-rose-400/20" onClick={() => onReject(item.id)}>
                        Reject
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
        <Card className="border-white/10 bg-gradient-to-br from-white/8 to-white/4 text-white">
          <CardHeader>
            <CardTitle className="text-xl">Running Estimate</CardTitle>
            <CardDescription className="text-white/60">Live updates as suggestions are accepted.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Metric label="Accepted value" value={`$${acceptedTotal.toLocaleString()}`} />
            <Metric label="Suggestions accepted" value={suggestions.filter((item) => item.state === "accepted").length.toString()} />
            <Metric label="Signals" value="Trade / assembly / quantity / review" />
            <div className="rounded-3xl border border-white/10 bg-black/20 p-4">
              <div className="text-xs uppercase tracking-[0.25em] text-white/40">Review status</div>
              <div className="mt-3 flex items-center gap-2 text-sm text-white/70">
                <ShieldAlert className="size-4 text-amber-300" />
                Human approval required before any line item is committed.
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={onToggleExample} variant="outline" className="border-white/10 bg-white/5 text-white hover:bg-white/10">
                Toggle concrete example
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
      <Button onClick={onContinue} className="bg-cyan-400 text-slate-950 hover:bg-cyan-300">
        Open Estimate Builder
      </Button>
    </div>
  );
}

function EstimateBuilderView({
  suggestions,
  totals,
  onRoute,
}: {
  suggestions: Suggestion[];
  totals: { subtotal: number; markup: number; profit: number; tax: number; grandTotal: number; acceptedCount: number };
  onRoute: (stage: Stage) => void;
}) {
  const accepted = suggestions.filter((item) => item.state === "accepted");
  return (
    <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
      <Card className="border-white/10 bg-white/5 text-white">
        <CardHeader>
          <CardTitle className="text-3xl">Estimate Builder</CardTitle>
          <CardDescription className="text-white/60">A professional contractor estimating workspace with live totals.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {[
            ["Labor", "$3,420"],
            ["Material", "$1,980"],
            ["Equipment", "$620"],
            ["Assemblies", `$${Math.round(totals.subtotal).toLocaleString()}`],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
              <span className="text-white/60">{label}</span>
              <span className="font-medium">{value}</span>
            </div>
          ))}
          <div className="grid gap-3 md:grid-cols-2">
            <Metric label="Totals" value={`$${Math.round(totals.subtotal).toLocaleString()}`} />
            <Metric label="Markup" value={`$${Math.round(totals.markup).toLocaleString()}`} />
            <Metric label="Profit" value={`$${Math.round(totals.profit).toLocaleString()}`} />
            <Metric label="Sales Tax" value={`$${Math.round(totals.tax).toLocaleString()}`} />
          </div>
        </CardContent>
      </Card>
      <Card className="border-white/10 bg-gradient-to-br from-white/8 to-white/4 text-white">
        <CardHeader>
          <CardTitle className="text-xl">Grand Total</CardTitle>
          <CardDescription className="text-white/60">All pricing remains editable before proposal generation.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-[28px] border border-white/10 bg-black/25 p-5">
            <div className="text-xs uppercase tracking-[0.28em] text-white/40">Grand total</div>
            <div className="mt-3 text-4xl font-semibold">${Math.round(totals.grandTotal).toLocaleString()}</div>
            <div className="mt-2 text-sm text-white/60">{accepted.length} accepted suggestions feeding the draft</div>
          </div>
          <div className="space-y-3">
            {accepted.map((item) => (
              <div key={item.id} className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
                <div className="flex items-center justify-between">
                  <div className="font-medium">{item.title}</div>
                  <div className="text-sm text-cyan-200">{item.quantity} {item.unit}</div>
                </div>
                <div className="mt-1 text-sm text-white/55">{item.reason}</div>
              </div>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            <Button onClick={() => onRoute("proposal")} className="bg-white text-slate-950 hover:bg-slate-200">
              Preview Proposal
            </Button>
            <Button variant="outline" onClick={() => onRoute("knowledge")} className="border-white/10 bg-white/5 text-white hover:bg-white/10">
              Inspect Knowledge
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function ProposalPreviewView({ onRoute }: { onRoute: (stage: Stage) => void }) {
  return (
    <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
      <Card className="border-white/10 bg-white/5 text-white">
        <CardHeader>
          <CardTitle className="text-3xl">Proposal Preview</CardTitle>
          <CardDescription className="text-white/60">Looks like a polished PDF before it ever leaves the browser.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-hidden rounded-[28px] border border-white/10 bg-[#eef2ff] p-6 text-slate-950 shadow-[0_16px_60px_rgba(0,0,0,0.35)]">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-semibold">TradeOS Contractors</div>
                <div className="text-sm text-slate-600">Precision estimating for tree service and concrete trades</div>
              </div>
              <div className="rounded-2xl bg-slate-950 px-4 py-2 text-white">Proposal</div>
            </div>
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <InfoBlock title="Customer" value="Miller Residence" />
              <InfoBlock title="Project" value="Oak tree removal + stump grind" />
              <InfoBlock title="Scope" value="Remove, grind, haul debris, and clear site." />
              <InfoBlock title="Pricing" value="$3,620 estimate with review gates" />
            </div>
            <div className="mt-6 rounded-3xl border border-slate-200 bg-white p-5">
              <div className="flex items-center gap-2 text-slate-800">
                <CheckCircle2 className="size-4 text-emerald-600" />
                Customer signature block
              </div>
              <div className="mt-6 h-24 rounded-2xl border border-dashed border-slate-300 bg-slate-50" />
            </div>
          </div>
        </CardContent>
      </Card>
      <Card className="border-white/10 bg-gradient-to-br from-white/8 to-white/4 text-white">
        <CardHeader>
          <CardTitle className="text-xl">Document Actions</CardTitle>
          <CardDescription className="text-white/60">Generate the next document without leaving the flow.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button className="w-full bg-cyan-400 text-slate-950 hover:bg-cyan-300">Generate Proposal</Button>
          <Button className="w-full border-white/10 bg-white/5 text-white hover:bg-white/10" variant="outline">Create Contract</Button>
          <Button className="w-full border-white/10 bg-white/5 text-white hover:bg-white/10" variant="outline">Generate Invoice</Button>
          <div className="rounded-3xl border border-white/10 bg-black/20 p-4 text-sm text-white/65">
            Proposal, contract, and invoice are shown as connected reviewable deliverables.
          </div>
          <Button variant="ghost" className="w-full text-white/80 hover:bg-white/5" onClick={() => onRoute("dashboard")}>
            Return to dashboard
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

function KnowledgeExplorerView() {
  return (
    <div className="space-y-6">
      <Card className="border-white/10 bg-white/5 text-white">
        <CardHeader>
          <CardTitle className="text-3xl">Knowledge Engine Explorer</CardTitle>
          <CardDescription className="text-white/60">See how taxonomy rolls into assemblies and cost items.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
          <div className="space-y-4">
            <div className="relative">
              <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-white/35" />
              <Input className="h-12 rounded-2xl border-white/10 bg-black/20 pl-10 text-white placeholder:text-white/30" placeholder="Search tree removal, stump grinding, haul-away..." />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Stat label="Trades" value="24" />
              <Stat label="Assemblies" value="40" />
              <Stat label="Cost items" value="1,795" />
              <Stat label="Coverage" value="93%" />
            </div>
          </div>
          <div className="grid gap-3">
            {knowledgeNodes.map((node, index) => (
              <div key={node.label} className="rounded-3xl border border-white/10 bg-black/20 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs uppercase tracking-[0.28em] text-white/35">{node.label}</div>
                    <div className={cn("mt-1 text-lg font-medium", node.color)}>{node.value}</div>
                  </div>
                  {index < knowledgeNodes.length - 1 && <ChevronRight className="size-4 text-white/35" />}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      <Card className="border-white/10 bg-white/5 text-white">
        <CardHeader>
          <CardTitle className="text-xl">Coverage snapshot</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-4">
          {[
            ["Tree Service", "10 assemblies"],
            ["Concrete", "18 assemblies"],
            ["Deck", "7 assemblies"],
            ["Landscaping", "5 assemblies"],
          ].map(([label, value]) => (
            <div key={label} className="rounded-3xl border border-white/10 bg-black/20 p-4">
              <div className="text-sm text-white/55">{label}</div>
              <div className="mt-2 text-lg font-medium">{value}</div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

function ArchitectureView() {
  const nodes = [
    ["Customer Scope", "Project Intake"],
    ["Project Intake", "Knowledge Engine"],
    ["Knowledge Engine", "Assembly Matching"],
    ["Assembly Matching", "Estimate Engine"],
    ["Estimate Engine", "Human Review"],
    ["Human Review", "Proposal"],
    ["Proposal", "Contract"],
    ["Contract", "Invoice"],
  ];
  return (
    <Card className="border-white/10 bg-white/5 text-white">
      <CardHeader>
        <CardTitle className="text-3xl">System Architecture</CardTitle>
        <CardDescription className="text-white/60">A clean pathway from scope to reviewed documents.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {nodes.map(([from, to]) => (
            <div key={`${from}-${to}`} className="rounded-3xl border border-white/10 bg-black/20 p-4">
              <div className="text-sm text-white/55">{from}</div>
              <div className="mt-3 flex items-center gap-3">
                <ArrowRight className="size-4 text-cyan-300" />
                <div className="font-medium">{to}</div>
              </div>
            </div>
          ))}
        </div>
        <div className="rounded-[28px] border border-white/10 bg-gradient-to-br from-cyan-400/10 via-white/5 to-amber-400/10 p-6">
          <div className="flex items-center gap-2 text-white/70">
            <Lightbulb className="size-4 text-amber-300" />
            Trainingless AI estimating means deterministic intake, local knowledge, and human review every step of the way.
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
      <div className="text-xs uppercase tracking-[0.25em] text-white/35">{label}</div>
      <div className="mt-1 text-lg font-medium">{value}</div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-black/20 p-4">
      <div className="text-xs uppercase tracking-[0.25em] text-white/35">{label}</div>
      <div className="mt-3 text-2xl font-semibold">{value}</div>
    </div>
  );
}

function DemoMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm">
      <span className="text-white/55">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}

function InfoBlock({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <div className="text-xs uppercase tracking-[0.2em] text-slate-500">{title}</div>
      <div className="mt-2 font-medium text-slate-900">{value}</div>
    </div>
  );
}
