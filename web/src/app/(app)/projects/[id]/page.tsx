import { createEstimateAction, updateProjectStatusAction } from "@/app/actions/projects";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { ListRowLink } from "@/components/shared/list-row-link";
import { getProject, PROJECT_STATUSES } from "@/lib/api";
import { getSessionToken } from "@/lib/session";
import { EditProjectForm } from "./edit-form";
import { ProjectHeader } from "@/components/projects/project-header";
import { ProjectStatusTimeline } from "@/components/projects/project-status-timeline";
import { ProjectSidebar } from "@/components/projects/project-sidebar";

export default async function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const token = await getSessionToken();
  const project = await getProject(token ?? "", id);
  const latestVisit = project.siteVisits[0] ?? null;
  const latestProposal = project.proposals[0] ?? null;

  return (
    <div className="flex flex-col gap-6">
      <ProjectHeader
        project={project}
        subtitle={project.simpleScope ?? "Add a simple scope to help AI assemble a stronger proposal draft."}
        actions={[
          { href: `/projects/${project.id}/intake`, label: "Continue intake" },
          { href: `/projects/${project.id}/proposals/new`, label: "Build proposal draft", variant: "secondary" },
        ]}
      />

      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <ProjectStatusTimeline project={project} hasIntake={Boolean(latestVisit)} hasProposal={Boolean(latestProposal)} />
        <Card className="border-border/70">
          <CardHeader>
            <CardTitle>Status</CardTitle>
          </CardHeader>
          <CardContent>
            <form action={updateProjectStatusAction} className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <input type="hidden" name="projectId" value={project.id} />
              <select
                name="status"
                defaultValue={project.status}
                className="h-9 rounded-md border border-input bg-transparent px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                {PROJECT_STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
              <Button type="submit" variant="outline">
                Update status
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Card className="border-border/70">
          <CardHeader>
            <CardTitle>Edit project</CardTitle>
          </CardHeader>
          <CardContent>
            <EditProjectForm project={project} />
          </CardContent>
        </Card>

        <ProjectSidebar
          project={project}
          customer={project.customer}
          siteVisits={project.siteVisits}
          proposals={project.proposals}
          estimates={project.estimates}
          projectFiles={project.projectFiles}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="border-border/70">
          <CardHeader>
            <CardTitle>Estimates</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            {project.estimates.length === 0 ? (
              <EmptyState title="No estimates yet." description="Build an estimate to price this project's line items." />
            ) : (
              <ul className="space-y-2">
                {project.estimates.map((estimate) => (
                  <li key={estimate.id}>
                    <ListRowLink
                      href={`/projects/${project.id}/estimates/${estimate.id}`}
                      title={`v${estimate.version}`}
                      trailing={<span className="font-medium">${estimate.totalPrice.toFixed(2)}</span>}
                    />
                  </li>
                ))}
              </ul>
            )}
            <form action={createEstimateAction}>
              <input type="hidden" name="projectId" value={project.id} />
              <Button type="submit" variant="outline">
                New estimate
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
