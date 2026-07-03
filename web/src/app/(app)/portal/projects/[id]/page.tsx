import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/shared/status-badge";
import { buttonVariants } from "@/components/ui/button";
import { getProject } from "@/lib/api";
import { formatCurrency, getInvoiceDisplayStatus, getProposalDisplayStatus } from "@/lib/document-workflow";
import { getSessionToken } from "@/lib/session";

export default async function CustomerPortalProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const token = await getSessionToken();
  const project = await getProject(token ?? "", id);
  const latestProposal = project.proposals[0] ?? null;
  const latestContract = project.contracts[0] ?? null;
  const latestInvoice = project.invoices[0] ?? null;

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
      <div className="space-y-3">
        <div className="text-sm uppercase tracking-[0.24em] text-muted-foreground">Customer portal</div>
        <h1 className="text-3xl font-semibold tracking-tight">{project.name}</h1>
        <p className="max-w-2xl text-sm text-muted-foreground">
          Review the current proposal, contract, invoices, and project progress in one simple customer-facing workspace.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-border/70">
          <CardHeader>
            <CardTitle>Proposal</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div>{latestProposal ? <StatusBadge status={getProposalDisplayStatus(latestProposal)} /> : "Not issued yet"}</div>
            <div className="text-muted-foreground">{latestProposal ? formatCurrency(latestProposal.finalPrice ?? latestProposal.priceHigh ?? latestProposal.priceLow) : "Waiting on pricing"}</div>
            {latestProposal && (
              <Link href={`/portal/proposals/${latestProposal.id}`} className={buttonVariants()}>
                Review proposal
              </Link>
            )}
          </CardContent>
        </Card>

        <Card className="border-border/70">
          <CardHeader>
            <CardTitle>Contract</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div>{latestContract ? <StatusBadge status={latestContract.status} /> : "Not created yet"}</div>
            <div className="text-muted-foreground">{latestContract ? "Ready for signature review." : "Contract appears after proposal acceptance."}</div>
            {latestContract && (
              <Link href={`/portal/contracts/${latestContract.id}`} className={buttonVariants()}>
                Review contract
              </Link>
            )}
          </CardContent>
        </Card>

        <Card className="border-border/70">
          <CardHeader>
            <CardTitle>Invoices</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div>{latestInvoice ? <StatusBadge status={getInvoiceDisplayStatus(latestInvoice)} /> : "No invoice yet"}</div>
            <div className="text-muted-foreground">{latestInvoice ? formatCurrency(latestInvoice.amount) : "Billing begins after contract execution."}</div>
            {latestInvoice && (
              <Link href={`/portal/invoices/${latestInvoice.id}`} className={buttonVariants()}>
                View invoice
              </Link>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
