import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { StatusBadge } from "@/components/shared/status-badge";

interface RecentDocumentsCardProps {
  documents: Array<{ id: string; href: string; label: string; status?: string }>;
}

export function RecentDocumentsCard({ documents }: RecentDocumentsCardProps) {
  return (
    <Card className="border-border/70">
      <CardHeader>
        <CardTitle>Quotes and documents</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {documents.length === 0 ? (
          <EmptyState title="No documents yet." description="Proposals, invoices, and contracts will appear here once you create them." />
        ) : (
          documents.map((document) => (
            <Link key={document.id} href={document.href} className="flex items-center justify-between rounded-lg border border-border/60 p-3 text-sm hover:bg-muted/40">
              <span>{document.label}</span>
              {document.status ? <StatusBadge status={document.status} /> : null}
            </Link>
          ))
        )}
      </CardContent>
    </Card>
  );
}
