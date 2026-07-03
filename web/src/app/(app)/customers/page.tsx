import Link from "next/link";
import { listCustomers } from "@/lib/api";
import { getSessionToken } from "@/lib/session";
import { buttonVariants } from "@/components/ui/button";

export default async function CustomersPage() {
  const token = await getSessionToken();
  const customers = token ? await listCustomers(token) : [];

  return (
    <div className="flex flex-col gap-6">
      <div className="space-y-2">
        <div className="flex items-center justify-between gap-4">
          <h1 className="text-2xl font-semibold">Customers</h1>
          <Link href="/customers/new" className={buttonVariants()}>
            Add customer
          </Link>
        </div>
        <p className="text-sm text-muted-foreground">Keep the people and companies you work for in one place so estimates and invoices stay tied to the right job.</p>
      </div>

      {customers.length === 0 ? (
        <p className="text-sm text-muted-foreground">No customers yet. Add the first homeowner, builder, or property manager you want to track.</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {customers.map((customer) => (
            <li key={customer.id}>
              <Link href={`/customers/${customer.id}`} className="flex flex-col rounded-md border p-3 text-sm hover:bg-muted">
                <span className="font-medium">{customer.name}</span>
                {customer.email && <span className="text-muted-foreground">{customer.email}</span>}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
