import Link from "next/link";
import { getKnowledgeStats, getProject, listProjects } from "@/lib/api";
import { buildProjectActivity, formatCurrency, getInvoiceDisplayStatus, getProposalDisplayStatus } from "@/lib/document-workflow";
import { getSession, getSessionToken } from "@/lib/session";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { StatusBadge } from "@/components/shared/status-badge";
import { SummaryMetricCard } from "@/components/shared/summary-metric-card";
import {
  NeedsAttentionCard,
  type AttentionEstimateRow,
  type AttentionInvoiceRow,
  type AttentionProposalRow,
  type AttentionStartRow,
} from "@/components/dashboard/needs-attention-card";

// Proposal money fields come off the wire as Prisma Decimal-serialized
// strings on this endpoint (unlike estimates/invoices, which are normalized
// server-side) - coerce before arithmetic so `sum + amount` doesn't silently
// string-concatenate.
function toProposalAmount(proposal: { finalPrice: number | null; priceHigh: number | null; priceLow: number | null }): number | null {
  const raw = proposal.finalPrice ?? proposal.priceHigh ?? proposal.priceLow;
  if (raw == null) return null;
  const value = Number(raw);
  return Number.isFinite(value) ? value : null;
}

export default async function DashboardPage() {
  const [session, token] = await Promise.all([getSession(), getSessionToken()]);
  const projects = token ? await listProjects(token) : [];
  const [projectDetails, knowledgeStats] = token
    ? await Promise.all([
        Promise.all(projects.slice(0, 8).map((project) => getProject(token, project.id))),
        getKnowledgeStats(token),
      ])
    : [[], null];

  const activeJobs = projectDetails.filter((project) => project.status === "active").length;
  const jobsWithFieldActivity = projectDetails.filter((project) => project.siteVisits.length > 0 || project.tasks.length > 0).length;
  const pendingContracts = projectDetails.flatMap((project) => project.contracts).filter((contract) => ["sent", "viewed"].includes(contract.status)).length;
  const pendingInvoices = projectDetails
    .flatMap((project) => project.invoices)
    .filter((invoice) => ["sent", "overdue", "partially_paid"].includes(getInvoiceDisplayStatus(invoice))).length;
  const revenuePipeline = projectDetails
    .flatMap((project) => project.proposals)
    .filter((proposal) => ["sent", "viewed", "accepted"].includes(getProposalDisplayStatus(proposal)))
    .reduce((sum, proposal) => sum + (toProposalAmount(proposal) ?? 0), 0);
  const openChangeOrders = projectDetails.flatMap((project) => project.changeOrders).filter((changeOrder) => changeOrder.status !== "rejected").length;
  const estimateLeadTimes = projectDetails
    .filter((project) => project.estimates[0])
    .map((project) => {
      const firstEstimate = [...project.estimates].sort((a, b) => a.version - b.version)[0];
      return (new Date(firstEstimate.createdAt ?? project.createdAt).getTime() - new Date(project.createdAt).getTime()) / (1000 * 60 * 60);
    })
    .filter((hours) => Number.isFinite(hours) && hours >= 0);
  const averageEstimateLeadTime = estimateLeadTimes.length
    ? `${Math.round(estimateLeadTimes.reduce((sum, hours) => sum + hours, 0) / estimateLeadTimes.length)}h`
    : "N/A";
  const recentActivity = projectDetails.flatMap((project) => buildProjectActivity(project)).slice(0, 6);
  const aiAcceptanceRate = "Not logged";

  const attentionEstimates: AttentionEstimateRow[] = projectDetails.flatMap((project) =>
    project.estimates
      .filter((estimate) => estimate.status === "draft" || estimate.status === "ready")
      .map((estimate) => ({
        projectId: project.id,
        projectName: project.name,
        customerName: project.customer?.name ?? "No customer linked",
        estimateId: estimate.id,
        version: estimate.version,
        status: estimate.status,
        totalPrice: estimate.totalPrice,
      }))
  );

  const attentionProposals: AttentionProposalRow[] = projectDetails.flatMap((project) =>
    project.proposals
      .filter((proposal) => ["sent", "viewed"].includes(getProposalDisplayStatus(proposal)))
      .map((proposal) => ({
        projectId: project.id,
        projectName: project.name,
        customerName: project.customer?.name ?? "No customer linked",
        proposalId: proposal.id,
        status: getProposalDisplayStatus(proposal),
        amount: toProposalAmount(proposal),
      }))
  );

  const attentionInvoices: AttentionInvoiceRow[] = projectDetails.flatMap((project) =>
    project.invoices
      .filter((invoice) => ["sent", "overdue", "partially_paid"].includes(getInvoiceDisplayStatus(invoice)))
      .map((invoice) => ({
        projectId: project.id,
        projectName: project.name,
        customerName: project.customer?.name ?? "No customer linked",
        invoiceId: invoice.id,
        status: getInvoiceDisplayStatus(invoice),
        amount: invoice.amount,
        dueDate: invoice.dueDate,
      }))
  );

  const attentionReadyToStart: AttentionStartRow[] = projectDetails
    .filter((project) => project.estimates.length === 0)
    .map((project) => ({
      projectId: project.id,
      projectName: project.name,
      customerName: project.customer?.name ?? "No customer linked",
    }));

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Signed in as {session?.email}. Track the full project lifecycle from lead through estimating, active work, and completion.
        </p>
      </div>

      <NeedsAttentionCard
        estimates={attentionEstimates}
        proposals={attentionProposals}
        invoices={attentionInvoices}
        readyToStart={attentionReadyToStart}
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <SummaryMetricCard label="Active jobs" value={String(activeJobs)} />
        <SummaryMetricCard label="Jobs with field activity" value={String(jobsWithFieldActivity)} />
        <SummaryMetricCard label="Revenue pipeline" value={formatCurrency(revenuePipeline)} />
        <SummaryMetricCard label="Pending contracts" value={String(pendingContracts)} />
        <SummaryMetricCard label="Pending invoices" value={String(pendingInvoices)} />
        <SummaryMetricCard label="Open change orders" value={String(openChangeOrders)} />
        <SummaryMetricCard
          label="Knowledge coverage"
          value={knowledgeStats ? `${knowledgeStats.tradesCount} trades / ${knowledgeStats.assembliesCount} assemblies` : "Unavailable"}
        />
        <SummaryMetricCard label="Avg estimate lead time" value={averageEstimateLeadTime} />
        <SummaryMetricCard label="AI suggestion acceptance" value={aiAcceptanceRate} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Customers</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-sm text-muted-foreground">Save the homeowners, property managers, or builders you send bids and invoices to.</p>
            <Link href="/customers" className={buttonVariants({ variant: "outline" })}>
              Open customers
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Projects</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-sm text-muted-foreground">Track each job from site visit notes through estimate, proposal, contract, and invoicing.</p>
            <p className="mb-4 text-sm text-muted-foreground">Each project now acts as its own operational workspace for field execution, documents, tasks, and change orders.</p>
            <Link href="/projects" className={buttonVariants({ variant: "outline" })}>
              Open projects
            </Link>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <Card className="border-border/70">
          <CardHeader>
            <CardTitle>Quick actions</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3">
            <Link href="/projects" className={buttonVariants()}>
              Open project workspace
            </Link>
            <Link href="/customers/new" className={buttonVariants({ variant: "outline" })}>
              Add customer
            </Link>
            <Link href="/projects/new" className={buttonVariants({ variant: "outline" })}>
              Create project
            </Link>
          </CardContent>
        </Card>

        <Card className="border-border/70">
          <CardHeader>
            <CardTitle>Recent activity</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentActivity.length === 0 ? (
              <p className="text-sm text-muted-foreground">Create a project to start the operational timeline.</p>
            ) : (
              recentActivity.map((item) => (
                <div key={item.id} className="rounded-xl border border-border/60 bg-muted/20 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="font-medium text-foreground">{item.title}</div>
                    <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">{item.category}</div>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{item.description}</p>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="border-border/70">
        <CardHeader>
          <CardTitle>Operational queues</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {projectDetails.length === 0 ? (
            <p className="text-sm text-muted-foreground">No projects yet.</p>
          ) : (
            projectDetails.map((project) => {
              const latestProposal = project.proposals[0] ?? null;
              const latestContract = project.contracts[0] ?? null;
              const latestInvoice = project.invoices[0] ?? null;

              return (
                <div key={project.id} className="rounded-xl border border-border/60 bg-muted/20 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <div className="font-medium text-foreground">{project.name}</div>
                      <div className="text-sm text-muted-foreground">{project.customer?.name ?? "No customer linked"}</div>
                    </div>
                    <Link href={`/projects/${project.id}`} className={buttonVariants({ variant: "outline" })}>
                      Open project
                    </Link>
                  </div>
                  <div className="mt-4 grid gap-3 md:grid-cols-3">
                    <div className="rounded-lg border border-border/60 bg-background/80 p-3">
                      <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Proposal</div>
                      <div className="mt-2">{latestProposal ? <StatusBadge status={getProposalDisplayStatus(latestProposal)} /> : "No proposal"}</div>
                    </div>
                    <div className="rounded-lg border border-border/60 bg-background/80 p-3">
                      <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Contract</div>
                      <div className="mt-2">{latestContract ? <StatusBadge status={latestContract.status} /> : "No contract"}</div>
                    </div>
                    <div className="rounded-lg border border-border/60 bg-background/80 p-3">
                      <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Invoice</div>
                      <div className="mt-2">{latestInvoice ? <StatusBadge status={getInvoiceDisplayStatus(latestInvoice)} /> : "No invoice"}</div>
                    </div>
                    <div className="rounded-lg border border-border/60 bg-background/80 p-3">
                      <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Change orders</div>
                      <div className="mt-2">{project.changeOrders.length > 0 ? <StatusBadge status={project.changeOrders[0].status} /> : "No change order"}</div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </CardContent>
      </Card>
    </div>
  );
}
