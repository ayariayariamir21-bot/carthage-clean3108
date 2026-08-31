import Link from "next/link";
import { notFound } from "next/navigation";
import { requireRolePage } from "@/lib/auth/guard";
import { dbAssignmentRepository } from "@/lib/zones/assignments";
import { AppShell } from "@/components/layout/AppShell";
import { AssignmentAddForm } from "./assignment-add-form";
import { removeAction } from "./actions";

const ROLE_LABELS: Record<string, string> = {
  admin: "Admin",
  supervisor: "Superviseur",
  agent: "Agent",
};

export default async function ZoneAssignmentsPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireRolePage("admin");
  const { id: zoneId } = await params;

  const zone = await dbAssignmentRepository.findZone(zoneId);
  if (!zone) {
    notFound();
  }

  const assignments = await dbAssignmentRepository.listAssignments(zoneId);

  return (
    <AppShell user={user}>
      <Link href="/admin/zones" className="link">
        ← Retour aux zones
      </Link>
      <h1 className="mb-4 mt-2 text-2xl font-bold text-slate-800">Responsables de la zone</h1>

      <AssignmentAddForm zoneId={zoneId} />

      <h2 className="mb-3 text-lg font-semibold text-slate-800">
        Responsables actifs ({assignments.length})
      </h2>
      {assignments.length === 0 ? (
        <div className="alert alert-info">Aucun responsable assigné pour le moment.</div>
      ) : (
        <ul className="grid gap-3">
          {assignments.map((assignment) => (
            <li
              key={assignment.id}
              className="card card-body flex flex-wrap items-center justify-between gap-3"
            >
              <div>
                <strong>{assignment.user.name ?? "(sans nom)"}</strong> — {assignment.user.email}
                {assignment.user.matricule ? ` — matricule ${assignment.user.matricule}` : null}
                {" — "}
                <span className="muted">
                  {ROLE_LABELS[assignment.user.role] ?? assignment.user.role}
                </span>
              </div>
              <form action={removeAction}>
                <input type="hidden" name="id" value={assignment.id} />
                <input type="hidden" name="zoneId" value={zoneId} />
                <button type="submit" className="btn btn-danger btn-sm">
                  Retirer
                </button>
              </form>
            </li>
          ))}
        </ul>
      )}
    </AppShell>
  );
}
