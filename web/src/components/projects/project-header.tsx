import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { StatusBadge } from "@/components/shared/status-badge";
import { cn } from "@/lib/utils";
import type { Project } from "@/lib/api";

interface ProjectHeaderProps {
  project: Project;
  subtitle: string;
  actions: Array<{ href: string; label: string; variant?: "default" | "secondary" | "outline" }>;
  className?: string;
}

export function ProjectHeader({ project, subtitle, actions, className }: ProjectHeaderProps) {
  return (
    <div className={cn("rounded-3xl border border-border/70 bg-gradient-to-br from-slate-950 via-slate-900 to-stone-900 p-6 text-white shadow-sm", className)}>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-3">
          <StatusBadge status={project.status} className="border-white/20 bg-white/10 text-white" />
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">{project.name}</h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-300">{subtitle}</p>
          </div>
          <div className="flex flex-wrap gap-6 text-sm text-slate-300">
          <Meta label="Customer" value={project.customerId ? "Customer linked" : "Not linked yet"} />
          <Meta label="Work type" value={project.jobType ?? "Not set"} />
          <Meta label="Site address" value={project.siteAddress ?? "Not added yet"} />
          </div>
        </div>
        <div className="grid min-w-64 gap-3">
          {actions.map((action) => (
            <Link key={action.href} href={action.href} className={buttonVariants({ variant: action.variant })}>
              {action.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs uppercase tracking-[0.2em] text-slate-400">{label}</div>
      <div className="mt-1">{value}</div>
    </div>
  );
}
