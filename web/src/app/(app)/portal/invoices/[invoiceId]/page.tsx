import Link from "next/link";
import { ActivityTimeline } from "@/components/shared/activity-timeline";
import { StatusBadge } from "@/components/shared/status-badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getInvoice, getProject } from "@/lib/api";
import { buildInvoiceTimeline, formatCurrency, formatDate, getInvoiceDisplayStatus, getInvoiceRunningBalance } from "@/lib/document-workflow";
import { getSessionToken } from "@/lib/session";

export default async function CustomerPortalInvoicePage({ params }: { params: Promise<{ invoiceId: string }> }) {
  const { invoiceId } = await params;
  const token = await getSessionToken();
  const invoice = await getInvoice(token ?? "", invoiceId);
  const project = await getProject(token ?? "", invoice.projectId);
  const timeline = buildInvoiceTimeline(invoice);
  const displayStatus = getInvoiceDisplayStatus(invoice);

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-2">
          <Link href={`/portal/projects/${project.id}`} className="text-sm text-muted-foreground underline">
            ← Back to project portal
          </Link>
          <h1 className="text-3xl font-semibold tracking-tight">Invoice #{invoice.invoiceNumber}</h1>
          <p className="max-w-2xl text-sm text-muted-foreground">Review your billing summary, invoice PDF, and current payment status.</p>
        </div>
        <StatusBadge status={displayStatus} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <Card className="border-border/70">
          <CardHeader>
            <CardTitle>Invoice summary</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2 text-sm">
            <div className="rounded-xl border border-border/60 bg-muted/20 p-4">
              <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Customer</div>
              <div className="mt-2 font-medium">{project.customer?.name ?? "Customer"}</div>
            </div>
            <div className="rounded-xl border border-border/60 bg-muted/20 p-4">
              <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Due date</div>
              <div className="mt-2 font-medium">{formatDate(invoice.dueDate)}</div>
            </div>
            <div className="rounded-xl border border-border/60 bg-muted/20 p-4">
              <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Amount</div>
              <div className="mt-2 font-medium">{formatCurrency(invoice.amount)}</div>
            </div>
            <div className="rounded-xl border border-border/60 bg-muted/20 p-4">
              <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Balance</div>
              <div className="mt-2 font-medium">{formatCurrency(getInvoiceRunningBalance(invoice))}</div>
            </div>
          </CardContent>
        </Card>

        <ActivityTimeline title="Invoice timeline" items={timeline} />
      </div>

      <Card className="border-border/70">
        <CardHeader>
          <CardTitle>Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <a href={`/api/documents/invoices/${invoice.id}/pdf`} target="_blank" rel="noreferrer" className={buttonVariants({ variant: "outline" })}>
            Download invoice PDF
          </a>
        </CardContent>
      </Card>
    </div>
  );
}
