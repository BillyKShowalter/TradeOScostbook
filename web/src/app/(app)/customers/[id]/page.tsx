import Link from "next/link";
import { deleteCustomerAction } from "@/app/actions/customers";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { ListRowLink } from "@/components/shared/list-row-link";
import { getCustomer } from "@/lib/api";
import { getSessionToken } from "@/lib/session";
import { EditCustomerForm } from "./edit-form";

export default async function CustomerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const token = await getSessionToken();
  const customer = await getCustomer(token ?? "", id);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold">{customer.name}</h1>

      <Card className="max-w-md">
        <CardHeader>
          <CardTitle>Edit customer</CardTitle>
        </CardHeader>
        <CardContent>
          <EditCustomerForm customer={customer} />
        </CardContent>
      </Card>

      <Card className="max-w-md">
        <CardHeader>
          <CardTitle>Projects</CardTitle>
        </CardHeader>
        <CardContent>
          {customer.projects.length === 0 ? (
            <EmptyState
              title="No projects for this customer yet."
              description="New projects linked to this customer will show up here."
              action={
                <Link href="/projects/new" className={buttonVariants({ variant: "outline" })}>
                  New project
                </Link>
              }
            />
          ) : (
            <ul className="flex flex-col gap-2">
              {customer.projects.map((project) => (
                <li key={project.id}>
                  <ListRowLink href={`/projects/${project.id}`} title={project.name} />
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <form action={deleteCustomerAction} className="max-w-md">
        <input type="hidden" name="customerId" value={customer.id} />
        <Button type="submit" variant="destructive">
          Delete customer
        </Button>
      </form>
    </div>
  );
}
