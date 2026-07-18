import Link from "next/link";
import { listCustomers } from "@/lib/api";
import { getSessionToken } from "@/lib/session";
import { buttonVariants } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { ListRowLink } from "@/components/shared/list-row-link";

export default async function CustomersPage() {
  const token = await getSessionToken();
  const customers = token ? await listCustomers(token) : [];

  return (
    <div className="flex flex-col gap-6">
      <div className="space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-2xl font-semibold">Customers</h1>
          <Link href="/customers/new" className={buttonVariants()}>
            Add customer
          </Link>
        </div>
        <p className="text-sm text-muted-foreground">Keep the people and companies you work for in one place so estimates and invoices stay tied to the right job.</p>
      </div>

      {customers.length === 0 ? (
        <EmptyState
          title="No customers yet"
          description="Add the first homeowner, builder, or property manager so future projects, proposals, and invoices stay tied to the right account."
          action={
            <Link href="/customers/new" className={buttonVariants()}>
              Add first customer
            </Link>
          }
        />
      ) : (
        <ul className="flex flex-col gap-2">
          {customers.map((customer) => (
            <li key={customer.id}>
              <ListRowLink href={`/customers/${customer.id}`} title={customer.name} subtitle={customer.email ?? undefined} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
