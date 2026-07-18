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
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold">Customers</h1>
        <Link href="/customers/new" className={buttonVariants()}>
          New customer
        </Link>
      </div>

      {customers.length === 0 ? (
        <EmptyState
          title="No customers yet."
          description="Add your first customer to start tracking projects and estimates for them."
          action={
            <Link href="/customers/new" className={buttonVariants({ variant: "outline" })}>
              New customer
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
