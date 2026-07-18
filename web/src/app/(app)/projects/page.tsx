import Link from "next/link";
import { listProjects } from "@/lib/api";
import { getSessionToken } from "@/lib/session";
import { buttonVariants } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { ListRowLink } from "@/components/shared/list-row-link";
import { StatusBadge } from "@/components/shared/status-badge";

export default async function ProjectsPage() {
  const token = await getSessionToken();
  const projects = token ? await listProjects(token) : [];

  return (
    <div className="flex flex-col gap-6">
      <div className="space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-2xl font-semibold">Projects</h1>
          <Link href="/projects/new" className={buttonVariants()}>
            Add project
          </Link>
        </div>
        <p className="text-sm text-muted-foreground">Each project keeps the site visit, estimate, proposal, contract, and invoice work tied to one job.</p>
      </div>

      {projects.length === 0 ? (
        <EmptyState
          title="No projects yet"
          description="Create the first job so TradeOS can carry the work from field intake through estimating, proposal, contract, invoicing, and closeout."
          action={
            <Link href="/projects/new" className={buttonVariants()}>
              Add first project
            </Link>
          }
        />
      ) : (
        <ul className="flex flex-col gap-2">
          {projects.map((project) => (
            <li key={project.id}>
              <ListRowLink
                href={`/projects/${project.id}`}
                title={project.name}
                trailing={<StatusBadge status={project.status} />}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
