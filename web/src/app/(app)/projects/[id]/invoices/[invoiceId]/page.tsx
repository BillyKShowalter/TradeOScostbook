import Link from "next/link";
import { markInvoicePaidAction, sendInvoiceAction, voidInvoiceAction } from "@/app/actions/invoices";
import { StatusBadge } from "@/components/shared/status-badge";
import { LineItemRow } from "@/components/shared/line-item-row";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getInvoice } from "@/lib/api";
import { getSessionToken } from "@/lib/session";

export default async function InvoiceDetailPage({ params }: { params: Promise<{ id: string; invoiceId: string }> }) {
  const { id: projectId, invoiceId } = await params;
  const token = await getSessionToken();
  const invoice = await getInvoice(token ?? "", invoiceId);

  return (
    <div className="flex flex-col gap-6">
      <Link href={`/projects/${projectId}`} className="text-sm text-muted-foreground underline">
        ← Back to project
      </Link>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Invoice #{invoice.invoiceNumber}</h1>
        <StatusBadge status={invoice.status} />
      </div>

      <Card className="max-w-md">
        <CardHeader>
          <CardTitle>Line items</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          {invoice.lineItems.map((li) => (
            <LineItemRow key={li.id} description={li.description} amount={`$${li.lineCost.toFixed(2)}`} className="border-none p-0" />
          ))}
          <div className="flex items-center justify-between gap-3 border-t pt-2 text-base font-semibold">
            <span className="min-w-0 truncate">Total</span>
            <span className="shrink-0">${invoice.amount.toFixed(2)}</span>
          </div>
        </CardContent>
      </Card>

      <Card className="max-w-md">
        <CardContent className="flex flex-col gap-4 pt-6">
          <a
            href={`/api/documents/invoices/${invoice.id}/pdf`}
            target="_blank"
            rel="noreferrer"
            className={buttonVariants({ variant: "outline" })}
          >
            Download PDF
          </a>

          {invoice.status === "draft" && (
            <form action={sendInvoiceAction}>
              <input type="hidden" name="invoiceId" value={invoice.id} />
              <input type="hidden" name="projectId" value={projectId} />
              <Button type="submit">Send invoice</Button>
            </form>
          )}

          {(invoice.status === "sent" || invoice.status === "overdue") && (
            <form action={markInvoicePaidAction}>
              <input type="hidden" name="invoiceId" value={invoice.id} />
              <input type="hidden" name="projectId" value={projectId} />
              <Button type="submit">Mark paid</Button>
            </form>
          )}

          {invoice.status !== "paid" && invoice.status !== "void" && (
            <form action={voidInvoiceAction}>
              <input type="hidden" name="invoiceId" value={invoice.id} />
              <input type="hidden" name="projectId" value={projectId} />
              <Button type="submit" variant="destructive">
                Void invoice
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
